import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { TextInput, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import ApiService from '../../services/ApiService';
import logger from '../../utils/logger';
import Toast from 'react-native-toast-message';

const screenHeight = Dimensions.get('window').height;

// Helper function to strip HTML tags and convert <br> to newlines
const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();
};

const ChatDetailsScreen = ({ route, navigation }) => {
  const { leadId, providerId, serviceName: routeServiceName, providerName: routeProviderName } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [providerInfo, setProviderInfo] = useState(null);
  const [leadServiceName, setLeadServiceName] = useState(routeServiceName || 'Service');
  const scrollViewRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadUserData();
    loadMessages();
    if (leadId && !routeServiceName) {
      loadLeadDetails();
    }
  }, [leadId]);

  // Hide tab bar when this screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Hide tab bar
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' }
      });

      // Show tab bar when leaving
      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          }
        });
      };
    }, [navigation])
  );

  const loadUserData = async () => {
    try {
      const userDataJson = await SecureStore.getItemAsync('user_data');
      if (userDataJson) {
        const userData = JSON.parse(userDataJson);
        setUser(userData);
      }
    } catch (error) {
      logger.error('Error loading user data:', error);
    }
  };

  const loadLeadDetails = async () => {
    try {
      const response = await ApiService.get(`/lead-details/${leadId}`);
      if (response && response.status === 'success' && response.data) {
        setLeadServiceName(response.data.service_name || 'Service');
      }
    } catch (error) {
      logger.error('Error loading lead details:', error);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      if (!leadId || !providerId) {
        setMessages([]);
        setLoading(false);
        return;
      }
      
      const response = await ApiService.get(`/lead-notes/${leadId}/${providerId}`);
      
      if (response && response.status === 'success' && response.data) {
        setMessages(response.data);
        if (response.providerInfo) {
          setProviderInfo(response.providerInfo);
        }
        // Update service name from response or lead if not already set
        if (response.serviceName) {
          setLeadServiceName(response.serviceName);
        } else if (!routeServiceName) {
          loadLeadDetails();
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      logger.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const response = await ApiService.post('/send-message', {
        lead_id: leadId,
        contacted_user_id: providerId,
        description: message,
      });

      if (response && response.message === 'Note Successfully added') {
        setMessage('');
        await loadMessages();
      } else {
        Toast.show({
          type: 'error',
          text1: '',
          text2: 'Failed to send message',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: error.message || 'Failed to send message',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setSending(false);
    }
  };

  const formatTimeOnly = (dateString) => {
    try {
      const date = new Date(dateString);
      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    } catch (e) {
      return '';
    }
  };

  const formatDateHeader = (dateString) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const isToday = date.toDateString() === today.toDateString();
      const isYesterday = date.toDateString() === yesterday.toDateString();

      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const renderMessage = ({ item: msg, index }) => {
    const isMyMessage = msg.user_id === user?.id;
    const prev = messages[index - 1];
    const thisDate = (msg.date_entered || msg.date || '').slice(0, 10);
    const prevDate = prev ? (prev.date_entered || prev.date || '').slice(0, 10) : null;
    const showDate = !prev || thisDate !== prevDate;

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {formatDateHeader(msg.date_entered || msg.date)}
            </Text>
          </View>
        )}
        <View style={[styles.messageContainer, isMyMessage && styles.messageContainerRight]}>
          <View
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.theirMessageText,
              ]}
            >
              {stripHtml(msg.description || msg.message)}
            </Text>
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>
                {formatTimeOnly(msg.date_entered || msg.date)}
              </Text>
              {isMyMessage && (
                <Ionicons name="checkmark-done" size={16} color="#4FC3F7" style={{ marginLeft: 4 }} />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            // Get parent navigators
            const parentNav = navigation.getParent();
            const tabNav = parentNav?.getParent();
            
            // Check if we're in a Responses stack (Chat stack)
            // Both CustomerResponsesStack and ProviderResponsesStack contain ChatDetails
            const stackState = parentNav?.getState();
            const hasCustomerResponses = stackState?.routes?.some(route => route.name === 'CustomerResponses');
            const hasProviderResponses = stackState?.routes?.some(route => route.name === 'ProviderResponses');
            
            // If we're in the Responses/Chat stack, always go back to the chat list
            if ((hasCustomerResponses || hasProviderResponses) && tabNav) {
              // Determine the initial screen name based on which one exists in the stack
              const initialScreenName = hasCustomerResponses ? 'CustomerResponses' : 'ProviderResponses';
              
              // Navigate to Responses tab and reset stack to show chat list
              tabNav.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Responses',
                      state: {
                        routes: [{ name: initialScreenName }],
                        index: 0,
                      },
                    },
                  ],
                })
              );
              
              // Also navigate to the Responses tab if not already there
              tabNav.navigate('Responses');
            } else {
              // Always go back to the list screen (CustomerResponses or ProviderResponses)
              // This ensures we don't stay on a chat when back is pressed
              const userRole = user?.role;
              const listScreenName = userRole === 'Customer' ? 'CustomerResponses' : 'ProviderResponses';
              
              // Navigate to the list screen, which will pop ChatDetails from the stack
              navigation.navigate(listScreenName);
            }
          }}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (providerId) {
              // Navigate to ExpertProfile - now available in both CustomerResponsesStack and ProviderResponsesStack
              navigation.navigate('ExpertProfile', { expertId: providerId, leadId: leadId });
            }
          }}
        >
          {providerInfo && providerInfo.profile_picture ? (
            <Avatar.Image
              size={40}
              source={{ uri: providerInfo.profile_picture }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={40}
              label={
                providerInfo 
                  ? `${providerInfo.first_name || ''} ${providerInfo.last_name || ''}`.trim().charAt(0).toUpperCase() || routeProviderName?.charAt(0).toUpperCase() || '?'
                  : routeProviderName?.charAt(0).toUpperCase() || '?'
              }
              style={styles.avatar}
            />
          )}
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {providerInfo 
              ? `${providerInfo.first_name || ''} ${providerInfo.last_name || ''}`.trim() || routeProviderName || 'User'
              : routeProviderName || 'User'}
          </Text>
          <Text style={styles.headerService}>{leadServiceName}</Text>
        </View>

        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="videocam" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="call" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#075E54" />
        </View>
      ) : (
        <FlatList
          ref={scrollViewRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: 80 }
          ]}
          onContentSizeChange={() => {
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
          }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation</Text>
            </View>
          )}
        />
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputWrapper}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputBox}>
            <TouchableOpacity style={styles.emojiButton}>
              <Ionicons name="happy-outline" size={24} color="#546E7A" />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Message"
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              blurOnSubmit={false}
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach" size={24} color="#546E7A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera-outline" size={24} color="#546E7A" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.micButton]}
            onPress={sendMessage}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : !message.trim() ? (
              <Ionicons name="mic" size={22} color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 8,
    elevation: 3,
  },
  headerButton: {
    padding: 8,
  },
  avatar: {
    marginHorizontal: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerService: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageContainer: {
    marginVertical: 2,
    paddingHorizontal: 4,
    flexDirection: 'row',
  },
  messageContainerRight: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 2,
  },
  theirMessage: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#000',
  },
  theirMessageText: {
    color: '#000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
  },
  inputWrapper: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 1,
    marginRight: 8,
    minHeight: 32,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 116,
    paddingHorizontal: 6,
    paddingVertical: 2,
    paddingTop: 2,
  },
  emojiButton: {
    padding: 4,
  },
  attachButton: {
    padding: 4,
  },
  cameraButton: {
    padding: 4,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    backgroundColor: '#8B5CF6',
  },
});

export default ChatDetailsScreen;
