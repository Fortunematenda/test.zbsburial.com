import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Title, Paragraph, Avatar, Badge } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import ApiService from '../../services/ApiService';
import Toast from 'react-native-toast-message';
import logger from '../../utils/logger';

const TAB_BAR_HEIGHT = 60;

const ChatScreen = ({ navigation, route }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const leadId = route?.params?.leadId; // Get leadId from route params if provided (only used for filtering, not auto-navigation)
  const isNavigatingFromNotification = useRef(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadInitialData();
  }, [leadId]);
  
  // Reset navigation params when screen comes into focus (if not from notification)
  // This ensures that when user manually opens the Chats tab, it shows the list, not a specific chat
  useFocusEffect(
    React.useCallback(() => {
      // If we're coming into focus and there are params that suggest we should navigate to a chat,
      // but we haven't explicitly navigated from a notification, clear them
      if (route?.params?.leadId && !isNavigatingFromNotification.current) {
        // Clear params to prevent auto-navigation
        navigation.setParams({ leadId: undefined });
      }
      isNavigatingFromNotification.current = false;
      
      // When this screen (list) comes into focus, ensure we pop any ChatDetails screens
      // This handles the case where a notification opened a chat and user navigated back
      const parentNavigation = navigation.getParent();
      if (parentNavigation) {
        const state = parentNavigation.getState();
        if (state && state.routes) {
          const responsesTab = state.routes.find(r => r.name === 'Responses');
          if (responsesTab && responsesTab.state && responsesTab.state.routes.length > 1) {
            // If there are more screens in the stack (ChatDetails is pushed), pop to this screen
            if (navigation.canGoBack()) {
              // We're already on the list, but if ChatDetails is in the stack, pop it
              const currentIndex = responsesTab.state.index;
              const currentRoute = responsesTab.state.routes[currentIndex];
              if (currentRoute.name !== 'CustomerResponses') {
                // We're not on the list screen, navigate to it
                parentNavigation.navigate('Responses', {
                  screen: 'CustomerResponses',
                  params: {},
                });
              }
            }
          }
        }
      }
    }, [navigation, route?.params?.leadId])
  );

  const loadInitialData = async () => {
    try {
      const userDataJson = await SecureStore.getItemAsync('user');
      if (userDataJson) {
        const userData = JSON.parse(userDataJson);
        setUser(userData);
      }
    } catch (error) {
      logger.error('Error loading user data:', error);
    }
    
    // Load chats after getting user data
    await loadChats();
  };

  const loadChats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.get('/customer-conversations');
      
      if (response && response.status === 'success' && response.data) {
        // Group chats by lead_id
        const groupedChats = groupChatsByRequest(response.data);
        setChats(groupedChats);
      } else {
        setChats([]);
      }
    } catch (error) {
      // Don't log 401 errors (user is logged out) as errors
      if (error.status === 401 || error.response?.status === 401) {
        // User is not authenticated, set empty chats
        setChats([]);
        setError(null);
        return;
      }
      logger.error('Error loading chats:', error);
      setError('Failed to load chats');
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Failed to load chats',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  const groupChatsByRequest = (chats) => {
    // If leadId is provided, filter chats for that specific lead
    let filteredChats = chats;
    if (leadId) {
      filteredChats = chats.filter(chat => chat.lead_id === parseInt(leadId));
    }
    
    const grouped = {};
    const result = [];
    
    // Group chats by lead_id
    filteredChats.forEach(chat => {
      const chatLeadId = chat.lead_id;
      if (!grouped[chatLeadId]) {
        grouped[chatLeadId] = [];
      }
      grouped[chatLeadId].push(chat);
    });
    
    // If filtering by leadId, don't add separators
    if (leadId) {
      return Object.values(grouped).flat();
    }
    
    // Add separator items between different requests (only when not filtering)
    let firstGroup = true;
    Object.values(grouped).forEach((group, index) => {
      if (!firstGroup) {
        // Add a separator before this group (except for the first)
        result.push({ type: 'separator', id: `separator-${index}` });
      }
      result.push(...group);
      firstGroup = false;
    });
    
    return result;
  };

  // Filter chats when searching (hide separators during search)
  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return chats;
    return (chats || []).filter((item) => {
      if (item.type === 'separator') return false;
      const provider = (item.provider_name || '').toLowerCase();
      const service = (item.service_name || '').toLowerCase();
      const lastMsg = (item.last_message || '').toLowerCase();
      return (
        provider.includes(query) ||
        service.includes(query) ||
        lastMsg.includes(query)
      );
    });
  }, [chats, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const formatTime = (timeString) => {
    // Format time display (e.g., "2 hours ago", "Just now")
    return timeString || 'Just now';
  };

  const renderChatItem = ({ item }) => {
    // If this is a separator, render it
    if (item.type === 'separator') {
      return (
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>New Request</Text>
          <View style={styles.separatorLine} />
        </View>
      );
    }
    
    // Otherwise, render a normal chat item
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => {
          navigation.navigate('ChatDetails', { 
            leadId: item.lead_id, 
            providerId: item.provider_id,
            serviceName: item.service_name,
            providerName: item.provider_name
          });
        }}
      >
        <View style={styles.chatContent}>
          {item.provider_avatar ? (
            <Avatar.Image 
              size={50} 
              source={{ uri: item.provider_avatar }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text 
              size={50} 
              label={item.provider_name ? item.provider_name.charAt(0).toUpperCase() : '?'}
              style={styles.avatar}
            />
          )}
          
          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Text style={styles.providerName} numberOfLines={1}>
                {item.provider_name || 'Unknown Provider'}
              </Text>
              <Text style={styles.time}>{formatTime(item.last_message_time || item.contacted_date)}</Text>
            </View>
            
            <View style={styles.chatBottom}>
              <Text style={styles.serviceName} numberOfLines={1}>
                {item.service_name || 'Service'}
              </Text>
              {item.unread_count > 0 && (
                <Badge style={styles.unreadBadge}>{item.unread_count}</Badge>
              )}
            </View>
            
            <Text style={styles.lastMessage} numberOfLines={2}>
              {item.last_message || 'Tap to start chatting'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const listBottomPadding = Math.max(insets.bottom, 12) + TAB_BAR_HEIGHT;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {leadId ? 'Experts' : 'Chats'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by provider, service, or message"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF5350" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadChats}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={[styles.listContainer, { paddingBottom: listBottomPadding }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#8B5CF6']}
              tintColor="#8B5CF6"
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={80} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>No Chats Yet</Text>
              <Text style={styles.emptyText}>
                When providers respond to your requests, you'll see their messages here.
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('Leads')}
              >
                <Text style={styles.browseButtonText}>View My Requests</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    color: '#EF5350',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 10,
  },
  chatItem: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  chatContent: {
    flexDirection: 'row',
    padding: 15,
  },
  avatar: {
    backgroundColor: '#8B5CF6',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  chatBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#8B5CF6',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#EF5350',
    marginLeft: 10,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  separatorText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
});

export default ChatScreen;
