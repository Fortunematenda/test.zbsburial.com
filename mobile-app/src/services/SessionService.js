import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import logger from '../utils/logger';

class SessionService {
  constructor() {
    this.SESSION_KEY = 'user_session';
    this.TOKEN_KEY = 'auth_token';
    this.LAST_ACTIVITY_KEY = 'last_activity';
  }

  // Store session data
  async storeSession(sessionData) {
    try {
      await SecureStore.setItemAsync(this.SESSION_KEY, JSON.stringify(sessionData));
      await SecureStore.setItemAsync(this.TOKEN_KEY, sessionData.token);
      await SecureStore.setItemAsync(this.LAST_ACTIVITY_KEY, new Date().toISOString());
      return true;
    } catch (error) {
      logger.error('Error storing session:', error);
      return false;
    }
  }

  // Get stored session
  async getSession() {
    try {
      const sessionData = await SecureStore.getItemAsync(this.SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      logger.error('Error getting session:', error);
      return null;
    }
  }

  // Get stored token
  async getToken() {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch (error) {
      logger.error('Error getting token:', error);
      return null;
    }
  }

  // Get API base URL (same logic as ApiService)
  getApiBaseUrl() {
    if (Constants.expoConfig?.extra?.apiUrl) {
      return Constants.expoConfig.extra.apiUrl;
    }
    if (Device.isDevice) {
      const debuggerHost = Constants.expoConfig?.hostUri || Constants.debuggerHost;
      if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:8080/api`;
      }
      return 'http://192.168.1.90:8080/api';
    }
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080/api';
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:8080/api';
    }
    return 'http://10.0.2.2:8080/api';
  }

  // Validate session with server
  async validateSession() {
    try {
      const token = await this.getToken();
      if (!token) {
        return { valid: false, reason: 'No token found' };
      }

      const API_BASE_URL = this.getApiBaseUrl();
      const response = await axios.post(`${API_BASE_URL}/mobile/session/validate`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.data.status === 'success') {
        // Update last activity
        await SecureStore.setItemAsync(this.LAST_ACTIVITY_KEY, new Date().toISOString());
        return { valid: true, user: response.data.user };
      } else {
        return { valid: false, reason: response.data.message };
      }
    } catch (error) {
      logger.error('Session validation error:', error);
      return { valid: false, reason: 'Network error' };
    }
  }

  // Clear session (logout)
  async clearSession() {
    try {
      const token = await this.getToken();
      
      // Notify server about logout
      if (token) {
        try {
          const API_BASE_URL = this.getApiBaseUrl();
          await axios.post(`${API_BASE_URL}/mobile/session/logout`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          });
        } catch (error) {
          logger.error('Error notifying server about logout:', error);
        }
      }

      // Clear local storage
      await SecureStore.deleteItemAsync(this.SESSION_KEY);
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
      await SecureStore.deleteItemAsync(this.LAST_ACTIVITY_KEY);

      return true;
    } catch (error) {
      logger.error('Error clearing session:', error);
      return false;
    }
  }

  // Check if session is expired locally
  async isSessionExpired() {
    try {
      const lastActivity = await SecureStore.getItemAsync(this.LAST_ACTIVITY_KEY);
      if (!lastActivity) {
        return true;
      }

      const lastActivityTime = new Date(lastActivity).getTime();
      const currentTime = new Date().getTime();
      const sessionTimeout = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

      return (currentTime - lastActivityTime) > sessionTimeout;
    } catch (error) {
      logger.error('Error checking session expiry:', error);
      return true;
    }
  }

  // Update last activity
  async updateLastActivity() {
    try {
      await SecureStore.setItemAsync(this.LAST_ACTIVITY_KEY, new Date().toISOString());
      return true;
    } catch (error) {
      logger.error('Error updating last activity:', error);
      return false;
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const session = await this.getSession();
      const token = await this.getToken();
      const isExpired = await this.isSessionExpired();
      
      return !!(session && token && !isExpired);
    } catch (error) {
      logger.error('Error checking login status:', error);
      return false;
    }
  }

  // Handle app state changes (for detecting uninstall)
  async handleAppStateChange(nextAppState) {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App is going to background, update last activity
      await this.updateLastActivity();
    }
  }

  // Initialize session monitoring
  async initializeSessionMonitoring() {
    try {
      // Check if session is expired on app start
      const isExpired = await this.isSessionExpired();
      if (isExpired) {
        await this.clearSession();
        return false;
      }

      // Validate session with server
      const validation = await this.validateSession();
      if (!validation.valid) {
        await this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error initializing session monitoring:', error);
      await this.clearSession();
      return false;
    }
  }
}

export default new SessionService();
