import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, CommonActions } from '@react-navigation/native';
import ApiService from '../../services/ApiService';
import * as SecureStore from 'expo-secure-store';
import logger from '../../utils/logger';

const NotificationsScreen = ({ navigation: propNavigation }) => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState(null);

  const loadUserData = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      logger.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleNotificationNavigation = (item) => {
    if (!item || !navigation) return;

    const url = item.url || '';
    const notificationType = item.type || '';
    const leadId = item.lead_id || null;
    
    // Parse data if it's a string (from API)
    let notificationData = item;
    if (typeof item.data === 'string') {
      try {
        notificationData = { ...item, ...JSON.parse(item.data) };
      } catch (e) {
        // Data already parsed or invalid
      }
    }

    try {
      // Determine if it's a chat notification
      const isChatNotification = url.includes('fortai://chat/') || notificationType === 'chat_message';
      
      // Determine if it's a lead notification
      const isLeadNotification = url.includes('fortai://lead/') || 
                                 notificationType === 'new_lead' || 
                                 notificationType === 'lead_response' || 
                                 notificationType === 'lead_unlocked';

      if (isChatNotification) {
        const chatLeadId = leadId || url.match(/chat\/(\d+)/)?.[1];
        const senderId = notificationData.sender_id || null;
        
        if (chatLeadId && senderId) {
          navigation.dispatch(
            CommonActions.navigate({
              name: 'Main',
              params: {
                screen: 'Responses',
                params: {
                  screen: 'ChatDetails',
                  params: {
                    leadId: parseInt(chatLeadId),
                    providerId: parseInt(senderId),
                    serviceName: notificationData.service_name || 'Service',
                    providerName: notificationData.sender_name || 'User',
                  }
                }
              }
            })
          );
        }
      } else if (isLeadNotification) {
        const leadIdFromUrl = leadId || url.match(/lead\/(\d+)/)?.[1];
        if (leadIdFromUrl) {
          const leadDetailsScreen = user?.role === 'Customer' ? 'CustomerLeadDetails' : 'ProviderLeadDetails';
          navigation.dispatch(
            CommonActions.navigate({
              name: 'Main',
              params: {
                screen: 'Leads',
                params: {
                  screen: leadDetailsScreen,
                  params: {
                    leadId: parseInt(leadIdFromUrl),
                  }
                }
              }
            })
          );
        }
      }
    } catch (error) {
      logger.error('Error navigating from notification:', error);
    }
  };

  const loadNotifications = async (pageNum = 1, append = false) => {
    try {
      const response = await ApiService.notifications.getNotifications({
        page: pageNum,
        per_page: 20,
      });

      if (response && response.success !== false) {
        const newNotifications = response.data || [];
        
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }

        setHasMore(response.current_page < response.last_page);
        setPage(pageNum);
      }
    } catch (error) {
      logger.error('Error loading notifications:', error);
      if (!append) {
        Alert.alert('Error', 'Failed to load notifications. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Refresh notifications when screen comes into focus
      loadNotifications(1, false);
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications(1, false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1, true);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await ApiService.notifications.markAsRead(notificationId);
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
    } catch (error) {
      logger.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await ApiService.notifications.markAllAsRead();
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      logger.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.notifications.clearAll();
              // Clear local state
              setNotifications([]);
              setHasMore(false);
              setPage(1);
              Alert.alert('Success', 'All notifications cleared');
            } catch (error) {
              logger.error('Error clearing notifications:', error);
              Alert.alert('Error', 'Failed to clear notifications');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotification = ({ item }) => {
    const isUnread = !item.is_read;
    
    return (
      <TouchableOpacity
        style={[styles.notificationItem, isUnread && styles.unreadNotification]}
        onPress={() => {
          if (!item.is_read) {
            handleMarkAsRead(item.id);
          }
          // Navigate to chat or lead based on notification
          handleNotificationNavigation(item);
        }}
      >
        {isUnread && <View style={styles.unreadIndicator} />}
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationTitle, isUnread && styles.unreadTitle]}>
              {item.title || 'Notification'}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          <Text style={[styles.notificationBody, isUnread && styles.unreadBody]}>
            {item.body || ''}
          </Text>
          <Text style={styles.notificationTime}>{formatDate(item.created_at)}</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isUnread ? "#8B5CF6" : "#999"}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No notifications</Text>
      <Text style={styles.emptySubtext}>You're all caught up!</Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8B5CF6" />
      </View>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {notifications.length > 0 && (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.actionButtonText}>Mark all as read</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearAll}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={[styles.actionButtonText, styles.clearButtonText]}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: '#EF4444',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#f0f0ff',
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#8B5CF6',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#8B5CF6',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  unreadBody: {
    fontWeight: '500',
    color: '#555',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  chevron: {
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default NotificationsScreen;
