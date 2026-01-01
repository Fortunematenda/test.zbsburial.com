import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import logger from '../utils/logger';

// Smart API URL detection for Expo
function getApiBaseUrl() {
  try {
    // First check if explicitly set in environment
    const envApiUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;
    if (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.trim()) {
      return envApiUrl;
    }

    // In production builds, require explicit API URL to avoid accidental HTTP usage
    if (typeof __DEV__ !== 'undefined' && !__DEV__) {
      // Safe production default to your test host if env is missing
      return 'https://test.zbsburial.com/api';
    }

    // If running on physical device, use the development server's IP
    if (Device.isDevice) {
      // Use the Metro bundler's host (development machine IP)
      const debuggerHost = Constants.expoConfig?.hostUri || Constants.debuggerHost;
      if (debuggerHost && typeof debuggerHost === 'string') {
        // Extract IP from host URI (e.g., "192.168.1.90:8081" -> "192.168.1.90")
        const ip = debuggerHost.split(':')[0];
        if (ip && ip.length > 0) {
          // Try common Laravel ports: 80 (default), 8000 (artisan serve), 8080
          // First check if user explicitly set a port in env
          const customPort = process.env.EXPO_PUBLIC_API_PORT || null;
          if (customPort) {
            return `http://${ip}:${customPort}/api`;
          }
          // Default to 80 for WAMP/XAMPP Laravel installations
          return `http://${ip}/api`;
        }
      }
      // Final device fallback: use production API URL if available, otherwise require env
      logger.warn('No API URL found. Set EXPO_PUBLIC_API_URL for production builds.');
      // For development, try production API URL as fallback
      return 'https://test.zbsburial.com/api';
    }

    // Emulator/Simulator
    if (Platform.OS === 'android') {
      // Android emulator uses special IP (WAMP/XAMPP typically on port 80)
      return 'http://10.0.2.2/api';
    } else if (Platform.OS === 'ios') {
      // iOS simulator can use localhost (WAMP/XAMPP typically on port 80)
      return 'http://localhost/api';
    }

    // Default fallback - use production API URL
    return 'https://test.zbsburial.com/api';
  } catch (error) {
    logger.error('Error getting API base URL:', error);
    // Safe fallback - use production API URL
    return 'https://test.zbsburial.com/api';
  }
}

const API_BASE_URL = getApiBaseUrl();

// Log the detected API URL for debugging (ensure it's a string)
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  logger.log('📱 API Base URL:', String(API_BASE_URL));
  logger.log('📱 Platform:', Platform.OS);
  logger.log('📱 Is Device:', Device.isDevice);
  const debugHost = Constants.debuggerHost || Constants.expoConfig?.hostUri || 'N/A';
  logger.log('📱 Debugger Host:', typeof debugHost === 'string' ? debugHost : JSON.stringify(debugHost));
}

// Flag to track if we're currently logging out (prevents 401 interceptor from running)
let isLoggingOut = false;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Export function to set logout flag
export const setLoggingOut = (value) => {
  isLoggingOut = value;
};

// Test server connectivity on initialization (silent by default in dev only)
const testServerConnectivity = async () => {
  try {
    // Use the API_BASE_URL directly since it already includes /api
    const testUrl = `${API_BASE_URL}/test-connection`;
    // Increase timeout to 10 seconds for slower networks
    const response = await axios.get(testUrl, { timeout: 10000 });
    // Only log on success to reduce noise
    logger.log('✅ Server connectivity test:', response.data);
    return true;
  } catch (error) {
    // Silently fail - don't log timeout errors as they're common during development
    // Only log if it's a clear connection refusal (server definitely not running)
    if (error.code === 'ECONNREFUSED') {
      logger.warn('⚠️ Server not reachable. Please start Laravel server:');
      logger.warn('   Run: php artisan serve --host=0.0.0.0 --port=8080');
      logger.warn('   Or use: start-server.bat');
    }
    // Suppress timeout and other network errors - they're expected if server is slow/offline
    return false;
  }
};

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  // Test connectivity after a short delay (non-blocking, silent failures)
  setTimeout(() => {
    testServerConnectivity().catch(() => {
      // Silently handle any errors in the test itself
    });
  }, 2000);
}

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from SecureStore
      const token = await SecureStore.getItemAsync('auth_token');
      
      // Guard against bad token values
      if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
    } catch (error) {
      delete config.headers.Authorization;
    }
    
    // If data is FormData or is being uploaded (has file attachments), remove Content-Type header
    // In React Native, FormData might not be instanceof FormData, so check for _parts property
    // Also check if it has the FormData structure (React Native's FormData)
    const isFormData = config.data && (
      config.data instanceof FormData || 
      config.data._parts || 
      config.data._blob ||
      (typeof config.data.append === 'function')
    );
    
    if (isFormData) {
      delete config.headers['Content-Type'];
      logger.log('FormData detected, removed Content-Type header');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check for timeout errors specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject({
        message: 'Request timeout. The server took too long to respond.',
        status: 408,
        data: error.response?.data
      });
    }
    
    // Handle 401 Unauthorized - try to refresh token
    // Skip token refresh if we're logging out (to prevent infinite error loops)
    if (error.response?.status === 401 && !originalRequest._retry && !isLoggingOut) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const token = await SecureStore.getItemAsync('auth_token');
        if (!token) {
          throw new Error('No token available');
        }

        // Try refresh token endpoint first, then fallback to profile endpoint
        let refreshResponse;
        try {
          // Call refresh token endpoint
          refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`
              },
              timeout: 10000
            }
          );
        } catch (refreshError) {
          // If refresh endpoint doesn't exist, try getting profile to validate token
          // If profile succeeds, token is still valid (maybe server was temporarily down)
          try {
            const profileResponse = await axios.get(
              `${API_BASE_URL}/user/profile`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                },
                timeout: 10000
              }
            );
            // Profile request succeeded, token is valid - retry original request
            originalRequest.headers.Authorization = `Bearer ${token}`;
            isRefreshing = false;
            return api(originalRequest);
          } catch (profileError) {
            throw refreshError; // Use original refresh error
          }
        }
        
        // Handle refresh response
        if (refreshResponse && refreshResponse.data) {
          const newToken = refreshResponse.data.token || refreshResponse.data.data?.token;
          if (newToken) {
            await SecureStore.setItemAsync('auth_token', newToken);
            
            // Process queued requests
            processQueue(null, newToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            isRefreshing = false;
            return api(originalRequest);
          }
        }
        
        throw new Error('Token refresh failed - invalid response');
      } catch (refreshError) {
        // Refresh failed - clear auth and reject
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear stored token on authentication failure
        try {
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('user_data');
        } catch (e) {
          // Ignore cleanup errors
        }
        
        // Return a more user-friendly error
        return Promise.reject({
          ...error,
          message: 'Your session has expired. Please log in again.',
          needsReauth: true
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// API Service class
class ApiService {
  // Generic request methods
  static async get(endpoint, params = {}) {
    try {
      const response = await api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async post(endpoint, data = {}, config = {}) {
    try {
      // The request interceptor already handles FormData and removes Content-Type
      // Allow custom timeout per request (defaults to instance timeout)
      const requestConfig = {
        ...config,
        timeout: config.timeout || api.defaults.timeout,
      };
      const response = await api.post(endpoint, data, requestConfig);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async put(endpoint, data = {}) {
    try {
      const response = await api.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async delete(endpoint) {
    try {
      const response = await api.delete(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Test connection method
  static async testConnection() {
    try {
      logger.log('Testing connection to:', API_BASE_URL + '/test-connection');
      const response = await api.get('/test-connection');
      logger.log('Connection test successful:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Connection test failed:', error);
      throw this.handleError(error);
    }
  }

  // Debug token method
  static async debugToken() {
    try {
      logger.log('Testing token authentication...');
      const response = await api.get('/debug-token');
      logger.log('Token debug successful:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Token debug failed:', error);
      throw this.handleError(error);
    }
  }

  // Refresh session method
  static async refreshSession() {
    try {
      const response = await api.post('/mobile/session/refresh');
      logger.log('Session refreshed successfully');
      return response.data;
    } catch (error) {
      logger.error('Session refresh failed:', error);
      throw this.handleError(error);
    }
  }

  // Start periodic session refresh
  static startSessionRefresh() {
    // Refresh session every 30 minutes to keep it alive
    setInterval(async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          await this.refreshSession();
        }
      } catch (error) {
        logger.log('Periodic session refresh failed:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  static async upload(endpoint, formData, onProgress = null) {
    try {
      logger.log('Upload method called:', {
        endpoint,
        baseURL: API_BASE_URL,
        fullURL: API_BASE_URL + endpoint,
        hasFormData: !!formData,
        formDataType: typeof formData,
      });
      
      // The request interceptor already handles FormData and removes Content-Type
      // Just pass onUploadProgress config
      // Increase timeout for file uploads (60 seconds)
      const response = await api.post(endpoint, formData, {
        onUploadProgress: onProgress,
        timeout: 60000, // 60 seconds timeout for uploads
        transformRequest: (data, headers) => {
          // For FormData, don't transform - let axios handle it
          if (data instanceof FormData || data._parts || data._blob || (typeof data.append === 'function')) {
            // Remove Content-Type so axios can set it with boundary
            delete headers['Content-Type'];
            return data;
          }
          return data;
        },
        headers: {
          // Don't set Content-Type, let axios handle it for FormData
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      logger.error('Upload error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          headers: error.config?.headers,
        },
        request: error.request ? 'Request object exists' : 'No request object'
      });
      throw this.handleError(error);
    }
  }

  // Error handling
  static handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection and ensure the server is running at ' + API_BASE_URL,
        status: 0,
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1,
      };
    }
  }

  // Auth endpoints
  static auth = {
    login: (credentials) => this.post('/simple-login', credentials, { timeout: 10000 }), // Using simple login endpoint with 10s timeout
    register: (userData) => this.post('/simple-register', userData), // Using simple registration endpoint
    logout: () => this.post('/mobile/session/logout'),
    verifyOtp: (otpData) => this.post('/verify-otp', otpData),
    resendOtp: (phone) => this.post('/auth/resend-otp', { phone }),
    forgotPassword: (email) => this.post('/auth/forgot-password', { email }),
    resetPassword: (resetData) => this.post('/auth/reset-password', resetData),
    refreshToken: () => this.post('/auth/refresh'),
  };

  // User endpoints
  static user = {
    getProfile: () => ApiService.get('/user/profile'),
    updateProfile: (userData) => ApiService.put('/user/profile', userData),
    uploadAvatar: (imageData) => ApiService.upload('/user/avatar', imageData),
    changePassword: (passwordData) => ApiService.put('/user/password', passwordData),
  };

  // Leads endpoints
  static leads = {
    getLeads: (params) => this.get('/leads', params),
    getLead: (id) => this.get(`/leads/${id}`),
    createLead: (leadData) => this.post('/leads', leadData),
    updateLead: (id, leadData) => this.put(`/leads/${id}`, leadData),
    deleteLead: (id) => this.delete(`/leads/${id}`),
    contactLead: (id, message) => this.post(`/leads/${id}/contact`, { message }),
    getMyLeads: (params) => this.get('/leads/my', params),
    getAvailableLeads: (params) => this.get('/leads/available', params),
    getLeadExperts: (id) => this.get(`/mobile/lead/${id}/experts`),
    updateLeadStatus: (id, statusData) => this.post(`/mobile/lead/${id}/update-status`, statusData),
  };

  // Responses endpoints (replaced services)
  static responses = {
    getUserResponses: (params) => this.get('/user-responses', params),
    getResponseDetails: (id) => this.get(`/response-details/${id}`),
    updateResponseStatus: (id, statusData) => this.put(`/responses/${id}/status`, statusData),
    markAsInterested: (id) => this.post(`/responses/${id}/interested`),
    markAsNotInterested: (id) => this.post(`/responses/${id}/not-interested`),
    updateContactStatus: (leadId, status) => this.post('/update-contact-status', { lead_id: leadId, status }),
  };

  // Contact Lead endpoint
  static contactLead = (leadId, credits) => this.post('/contact-lead', { lead_id: leadId, credits });

  // Unlock Contact Details endpoint
  static unlockContactDetails = (leadId, credits) => this.post('/unlock-customer-info', { lead_id: leadId, credits });

  // Messaging endpoints
  static sendMessage = (leadId, description, contactedUserId = null) => this.post('/send-message', { 
    lead_id: leadId, 
    description, 
    contacted_user_id: contactedUserId 
  });
  
  static getChatMessages = (leadId) => this.get(`/chat-messages/${leadId}`);

  // Messages/Chat endpoints
  static messages = {
    getConversations: () => this.get('/messages/conversations'),
    getMessages: (conversationId) => this.get(`/messages/${conversationId}`),
    sendMessage: (messageData) => this.post('/messages', messageData),
    markAsRead: (conversationId) => this.put(`/messages/${conversationId}/read`),
  };

  // Notifications endpoints
  static notifications = {
    getNotifications: (params) => this.get('/notifications', params),
    markAsRead: (id) => this.put(`/notifications/${id}/read`),
    markAllAsRead: () => this.put('/notifications/read-all'),
    clearAll: () => this.delete('/notifications/clear-all'),
    getUnreadCount: () => this.get('/notifications/unread-count'),
  };

  // Payments endpoints
  static payments = {
    purchaseCredits: (amount) => this.post('/payments/purchase-credits', { amount }),
    getTransactions: (params) => this.get('/payments/transactions', params),
    getPaymentMethods: () => this.get('/payments/methods'),
    addPaymentMethod: (methodData) => this.post('/payments/methods', methodData),
    getPackages: () => this.get('/mobile/packages'),
    createCheckoutSession: (productId) => this.post('/mobile/create-checkout-session', { product_id: productId }),
    getCreditsHistory: (userId) => this.get(`/credits-history/${userId}`),
  };

  // Ratings endpoints
  static ratings = {
    getRatings: (userId) => this.get(`/ratings/${userId}`),
    submitRating: (ratingData) => this.post('/ratings', ratingData),
    updateRating: (id, ratingData) => this.put(`/ratings/${id}`, ratingData),
  };

  // Location endpoints
  static location = {
    getNearbyServices: (params) => this.get('/location/nearby-services', params),
    updateLocation: (locationData) => this.post('/location/update', locationData),
  };

  // File upload endpoints
  static files = {
    uploadImage: (imageData) => ApiService.upload('/files/upload-image', imageData),
    uploadDocument: (documentData) => ApiService.upload('/files/upload-document', documentData),
    deleteFile: (fileId) => ApiService.delete(`/files/${fileId}`),
  };

  // Services management endpoints
  static services = {
    getServices: () => this.get('/all-services'),
    getUserServices: () => this.get('/user/services'),
    updateUserServices: (services) => this.post('/user/services', { services }),
  };

  // Location management endpoints
  static location = {
    updateUserLocation: (location) => this.post('/user/location', location),
  };

  // Portfolio management endpoints
  static portfolio = {
    getUserPortfolio: () => ApiService.get('/user/portfolio'),
    addToPortfolio: (portfolioData) => ApiService.upload('/user/portfolio', portfolioData),
    deleteFromPortfolio: (imageId) => ApiService.delete(`/user/portfolio/${imageId}`),
  };

  // Global search endpoint
  static search = {
    globalSearch: (query) => ApiService.get('/mobile/search', { q: query }),
  };
}

export default ApiService;
export { API_BASE_URL };
