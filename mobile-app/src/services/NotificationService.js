import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import ApiService from './ApiService';
import logger from '../utils/logger';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  static isInitialized = false;
  static lastRegisteredToken = null;
  static isLoggingOut = false; // Flag to prevent initialization during/after logout
  static permissionCheckAttempted = false; // Track if we've already checked permissions
  static permissionDeniedLogged = false; // Track if we've already logged permission denial

  static async initialize() {
    // Don't initialize if we're logging out
    if (this.isLoggingOut) {
      return false;
    }
    try {
      // Skip notifications on development
      if (!Device.isDevice) {
        // Only log once
        if (!this.permissionCheckAttempted) {
          logger.log('Notifications disabled on simulator');
          this.permissionCheckAttempted = true;
        }
        return false;
      }

      // Get push token first
      const token = await this.getPushToken();
      if (!token) {
        return false;
      }

      // If already initialized with the same token, skip
      if (this.isInitialized && this.lastRegisteredToken === token) {
        return true;
      }

      // Request permissions with error handling
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      // If permission was already denied and we've checked, skip early
      if (this.permissionCheckAttempted && existingStatus !== 'granted') {
        // Silently return - we've already logged the denial
        return false;
      }
      
      if (existingStatus !== 'granted') {
        // Only request permission once per session
        if (!this.permissionCheckAttempted) {
          this.permissionCheckAttempted = true;
          try {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          } catch (permissionError) {
            logger.log('Notification permission request failed:', permissionError);
            return false;
          }
        } else {
          // Already checked, use existing status
          finalStatus = existingStatus;
        }
      } else {
        this.permissionCheckAttempted = true;
      }
      
      if (finalStatus !== 'granted') {
        // Only log permission denial once to reduce console spam
        if (!this.permissionDeniedLogged) {
          logger.log('Notification permission not granted');
          this.permissionDeniedLogged = true;
        }
        return false;
      }

      // Send token to server
      const success = await this.sendTokenToServer(token);
      if (success) {
        this.isInitialized = true;
        this.lastRegisteredToken = token;
        this.isLoggingOut = false; // Clear logout flag on successful initialization
      }

      return success;
    } catch (error) {
      logger.error('Notification initialization error:', error);
      return false;
    }
  }

  static async getPushToken() {
    try {
      if (!Device.isDevice) {
        logger.log('Must use physical device for push notifications');
        return null;
      }

      // Check for valid projectId - check multiple locations
      const projectId = Constants.expoConfig?.projectId || 
                        Constants.expoConfig?.extra?.eas?.projectId ||
                        Constants.manifest?.extra?.eas?.projectId ||
                        Constants.manifest2?.extra?.eas?.projectId;
      
      if (!projectId) {
        logger.error('Push notifications disabled - no project ID found. Please configure projectId in app.json or app.config.js');
        return null;
      }

      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        });

        if (!token || !token.data) {
          logger.error('Error getting push token: Token data is empty');
          return null;
        }

        return token.data;
      } catch (tokenError) {
        // More specific error handling
        if (tokenError.message?.includes('projectId')) {
          logger.error('Error getting push token: Invalid projectId configuration. Please check your app.json or app.config.js');
        } else if (tokenError.message?.includes('network') || tokenError.message?.includes('fetch')) {
          logger.error('Error getting push token: Network error. Please check your internet connection');
        } else {
          logger.error('Error getting push token:', tokenError.message || tokenError);
        }
        return null;
      }
    } catch (error) {
      logger.error('Error getting push token:', error.message || error);
      return null;
    }
  }

  static async sendTokenToServer(token) {
    try {
      // Don't send token if we're logging out
      if (this.isLoggingOut) {
        return false;
      }
      
      // Check if user is authenticated before sending token
      const authToken = await SecureStore.getItemAsync('auth_token');
      if (!authToken) {
        // Silently skip - user is not logged in (don't spam console)
        return false;
      }

      // Skip if this is the same token we just registered
      if (this.lastRegisteredToken === token) {
        return true;
      }

      await ApiService.post('/notifications/register-token', {
        token,
        platform: Platform.OS,
      });
      
      return true;
    } catch (error) {
      // Silently handle authentication errors (user logged out)
      // Check both status code and message content
      const isAuthError = error.response?.status === 401 || 
                         error.response?.status === 403 ||
                         error.message?.includes('Unauthenticated') ||
                         error.response?.data?.message?.includes('Unauthenticated');
      
      if (isAuthError) {
        // Silently skip - user is not authenticated (don't spam console)
        return false;
      }
      
      // Only log non-authentication errors
      logger.error('Error sending token to server:', error.response?.data || error.message);
      return false;
    }
  }

  // Reset initialization state (useful for testing or logout)
  static reset() {
    this.isInitialized = false;
    this.lastRegisteredToken = null;
    this.isLoggingOut = true; // Set flag to prevent re-initialization
    this.permissionCheckAttempted = false; // Reset permission check flag
    this.permissionDeniedLogged = false; // Reset permission denied log flag
    
    // Reset the flag after a delay to allow normal initialization after new login
    setTimeout(() => {
      this.isLoggingOut = false;
    }, 2000);
  }

  static async scheduleLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      logger.error('Error scheduling notification:', error);
    }
  }

  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      logger.error('Error canceling notifications:', error);
    }
  }

  static async getNotificationSettings() {
    try {
      return await Notifications.getPermissionsAsync();
    } catch (error) {
      logger.error('Error getting notification settings:', error);
      return null;
    }
  }

  static async updateNotificationSettings(settings) {
    try {
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: settings.showAlert,
          shouldPlaySound: settings.playSound,
          shouldSetBadge: settings.setBadge,
        }),
      });
    } catch (error) {
      logger.error('Error updating notification settings:', error);
    }
  }

  // Listen for notifications
  static addNotificationListener(listener) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Listen for notification responses (when user taps notification)
  static addNotificationResponseListener(listener) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Remove listeners
  static removeNotificationSubscription(subscription) {
    Notifications.removeNotificationSubscription(subscription);
  }

  // Get notification count
  static async getNotificationCount() {
    try {
      const response = await ApiService.notifications.getUnreadCount();
      return response.data?.count || 0;
    } catch (error) {
      logger.error('Error getting notification count:', error);
      return 0;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      await ApiService.notifications.markAsRead(notificationId);
    } catch (error) {
      logger.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  static async markAllAsRead() {
    try {
      await ApiService.notifications.markAllAsRead();
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
    }
  }

  // Get notifications
  static async getNotifications(params = {}) {
    try {
      const response = await ApiService.notifications.getNotifications(params);
      return response.data;
    } catch (error) {
      logger.error('Error getting notifications:', error);
      return [];
    }
  }
}

export { NotificationService };
