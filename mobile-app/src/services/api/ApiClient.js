import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import logger from '../../utils/logger';

// Smart API URL detection for Expo
function getApiBaseUrl() {
  try {
    // First check if explicitly set in environment
    const envApiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.trim()) {
      return envApiUrl;
    }

    // If running on physical device, use the development server's IP
    if (Device.isDevice) {
      // Use the Metro bundler's host (development machine IP)
      const debuggerHost = Constants.expoConfig?.hostUri || Constants.debuggerHost;
      if (debuggerHost && typeof debuggerHost === 'string') {
        // Extract IP from host URI (e.g., "192.168.1.90:8081" -> "192.168.1.90")
        const ip = debuggerHost.split(':')[0];
        if (ip && ip.length > 0) {
          return `http://${ip}:8080/api`;
        }
      }
      // Fallback to common LAN IP (update if needed)
      return 'http://192.168.1.90:8080/api';
    }

    // Emulator/Simulator
    if (Platform.OS === 'android') {
      // Android emulator uses special IP
      return 'http://10.0.2.2:8080/api';
    } else if (Platform.OS === 'ios') {
      // iOS simulator can use localhost
      return 'http://localhost:8080/api';
    }

    // Default fallback
    return 'http://10.0.2.2:8080/api';
  } catch (error) {
    logger.error('Error getting API base URL:', error);
    // Safe fallback
    return 'http://192.168.1.90:8080/api';
  }
}

export const API_BASE_URL = getApiBaseUrl();

// Flag to track if we're currently logging out (prevents 401 interceptor from running)
let isLoggingOut = false;

// Export function to set logout flag
export const setLoggingOut = (value) => {
  isLoggingOut = value;
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

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
    
    // If data is FormData, remove Content-Type header
    const isFormData = config.data && (
      config.data instanceof FormData || 
      config.data._parts || 
      config.data._blob ||
      (typeof config.data.append === 'function')
    );
    
    if (isFormData) {
      delete config.headers['Content-Type'];
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or we're logging out, reject immediately
    if (error.response?.status !== 401 || isLoggingOut) {
      return Promise.reject(error);
    }

    // If request was already retried, reject
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue the request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const token = await SecureStore.getItemAsync('auth_token');
      
      if (!token) {
        throw new Error('No token available');
      }

      // Try refresh token endpoint
      let refreshResponse;
      try {
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
        // If refresh fails, try profile endpoint to validate token
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
          // Token is valid - retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          isRefreshing = false;
          return api(originalRequest);
        } catch (profileError) {
          throw refreshError;
        }
      }
      
      // Handle refresh response
      if (refreshResponse && refreshResponse.data) {
        const newToken = refreshResponse.data.token || refreshResponse.data.data?.token;
        if (newToken) {
          await SecureStore.setItemAsync('auth_token', newToken);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          isRefreshing = false;
          return api(originalRequest);
        }
      }
      
      throw new Error('Token refresh failed - invalid response');
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      
      // Clear stored token on authentication failure
      try {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_data');
      } catch (e) {
        // Ignore cleanup errors
      }
      
      return Promise.reject({
        ...error,
        message: 'Your session has expired. Please log in again.',
        needsReauth: true
      });
    }
  }
);

// Base API client class
class ApiClient {
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

  static async upload(endpoint, formData, onProgress = null) {
    try {
      const response = await api.post(endpoint, formData, {
        onUploadProgress: onProgress,
        timeout: 60000, // 60 seconds timeout for uploads
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static handleError(error) {
    if (error.response) {
      // Server responded with error
      return {
        status: error.response.status,
        message: error.response.data?.message || error.message,
        data: error.response.data,
        response: error.response,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        status: 0,
        message: 'Network error. Please check your connection.',
        request: error.request,
      };
    } else {
      // Error setting up request
      return {
        status: 0,
        message: error.message || 'An unexpected error occurred',
      };
    }
  }
}

export default ApiClient;

