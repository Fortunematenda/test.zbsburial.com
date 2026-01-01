import * as SecureStore from 'expo-secure-store';
import ApiService from './ApiService';
import { NotificationService } from './NotificationService';
import logger from '../utils/logger';

class AuthService {
  static async login(credentials, retryCount = 0) {
    const MAX_RETRIES = 1; // Retry once
    const TIMEOUT = 12000; // 12 seconds - shorter timeout
    
    try {
      logger.log(`🔐 Login attempt ${retryCount + 1} for: ${credentials.email}`);
      
      // Shorter timeout for faster failure detection
      const loginPromise = ApiService.auth.login(credentials);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login request timeout')), TIMEOUT)
      );
      
      const response = await Promise.race([loginPromise, timeoutPromise]);
      
      // Handle the response structure - check both possible formats
      if (response && response.status === 'success' && response.data) {
        // Standard API response format
        await SecureStore.setItemAsync('auth_token', response.data.token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data.user));
        
        logger.log('✅ Login successful');
        
        // Register push notification token after successful login
        try {
          await NotificationService.initialize();
        } catch (error) {
          logger.warn('Failed to register push token after login:', error);
          // Don't fail login if notification registration fails
        }
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
        };
      } else if (response && response.token && response.user) {
        // Direct response format (token and user at root level)
        await SecureStore.setItemAsync('auth_token', response.token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.user));
        
        logger.log('✅ Login successful');
        return {
          success: true,
          user: response.user,
          token: response.token,
        };
      }
      
      return {
        success: false,
        message: response?.message || 'Login failed - unexpected response format',
      };
    } catch (error) {
      logger.error(`❌ Login error (attempt ${retryCount + 1}):`, error.message || error);
      
      // Handle timeout specifically
      const isTimeout = error.message && (
        error.message.includes('timeout') || 
        error.message.includes('ECONNABORTED') ||
        error.status === -1 ||
        error.status === 408
      );
      
      // Retry if timeout and haven't exceeded max retries
      if (isTimeout && retryCount < MAX_RETRIES) {
        logger.log(`⏳ Login timeout, retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.login(credentials, retryCount + 1);
      }
      
      // Return error
      if (isTimeout) {
        // Check if it's a connection error (server not running) vs timeout
        const isConnectionError = error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND';
        return {
          success: false,
          message: isConnectionError 
            ? 'Cannot connect to server. Please ensure the Laravel server is running on port 8080.'
            : 'Connection timeout. The server took too long to respond. Please check your internet connection and try again.',
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Network error - please check your connection',
      };
    }
  }

  static async register(userData) {
    try {
      // Transform mobile app data to match API expectations
      const transformedData = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        contact_number: userData.contact_number,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        role: userData.role === 'customer' ? 'Customer' : 'Expert',
        location: userData.location || 'Default Location',
        latitude: userData.latitude || '0.0',
        longitude: userData.longitude || '0.0',
        distance: userData.distance || '0',
        zip_code: userData.zip_code || '',
        company_name: userData.company_name || '',
        is_company_website: userData.is_company_website || false,
        company_size: userData.company_size || 'Self-employed',
        is_company_sales_team: userData.is_company_sales_team || false,
        is_company_social_media: userData.is_company_social_media || false,
        biography: userData.biography || '',
        services: userData.services || [],
      };

      const response = await ApiService.auth.register(transformedData);
      
      // response is already the data object, not wrapped in response.data
      if (response && response.status === 'success_otp') {
        // OTP verification required - don't store token yet
        return {
          success: true,
          message: response.message,
          user: response.data.user,
          requiresOtp: true, // OTP verification required
          user_id: response.data.user.id,
        };
      }
      
      if (response && response.status === 'success') {
        // Auto-login after registration (shouldn't happen with current API but handle it)
        await SecureStore.setItemAsync('auth_token', response.data.token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data.user));
        
        return {
          success: true,
          message: response.message,
          user: response.data.user,
          token: response.data.token,
          requiresOtp: false,
        };
      }
      
      return {
        success: false,
        message: response?.message || 'Registration failed',
      };
    } catch (error) {
      logger.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Network error - please check your connection',
      };
    }
  }

  static async verifyOtp(otpData) {
    try {
      const response = await ApiService.auth.verifyOtp(otpData);
      
      // response is already the data object, not wrapped in response.data
      if (response && response.status === 'success' && response.data) {
        // Store auth token and user data
        await SecureStore.setItemAsync('auth_token', response.data.token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data.user));
        
        // Verify token was stored
        const storedToken = await SecureStore.getItemAsync('auth_token');
        
        // Register push notification token after successful verification
        try {
          await NotificationService.initialize();
        } catch (error) {
          logger.warn('Failed to register push token after OTP verification:', error);
          // Don't fail verification if notification registration fails
        }
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
        };
      }
      
      return {
        success: false,
        message: response?.message || 'OTP verification failed',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'OTP verification failed',
      };
    }
  }

  static async resendOtp(phone) {
    try {
      const response = await ApiService.auth.resendOtp(phone);
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to resend OTP',
      };
    }
  }

  static async forgotPassword(email) {
    try {
      const response = await ApiService.auth.forgotPassword(email);
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send reset email',
      };
    }
  }

  static async resetPassword(resetData) {
    try {
      const response = await ApiService.auth.resetPassword(resetData);
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Password reset failed',
      };
    }
  }

  static async logout() {
    try {
      // Import setLoggingOut to prevent 401 interceptor from running during logout
      const { setLoggingOut } = require('./ApiService');
      
      // Set flag to prevent 401 interceptor from trying to refresh token
      setLoggingOut(true);
      
      // Also reset notification service
      try {
        const { NotificationService } = require('./NotificationService');
        NotificationService.reset();
      } catch (e) {
        // NotificationService might not be available
      }
      
      // Call logout API to revoke token
      try {
        await ApiService.post('/logout');
      } catch (error) {
        // API call failed, but continue with local cleanup
      }
      
      // Clear local storage
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
      
      // Reset logout flag after a short delay to allow pending requests to complete
      setTimeout(() => {
        setLoggingOut(false);
      }, 1000);
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Logout failed',
      };
    }
  }

  static async checkAuthStatus() {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');
      
      // If no token exists, user is definitely logged out (don't use cached data)
      // This prevents logging back in with just cached user_data after logout
      if (!token) {
        // Clear any stale user_data that might be left over
        try {
          await SecureStore.deleteItemAsync('user_data');
        } catch (e) {
          // Ignore cleanup errors
        }
        return {
          isAuthenticated: false,
          user: null,
        };
      }
      
      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Try to verify token with server and get fresh user data
        // If server is unreachable or token refresh fails, use cached data to keep user logged in
        try {
          const response = await ApiService.user.getProfile();
          
          if (response.success && response.data) {
            // Store fresh data directly from database - server returns all fields including profile_picture and services
            await SecureStore.setItemAsync('user_data', JSON.stringify(response.data));
            return {
              isAuthenticated: true,
              user: response.data,
            };
          } else {
            // Invalid response, but keep user logged in with cached data
            logger.warn('Server returned invalid response, using cached user data');
            return {
              isAuthenticated: true,
              user: user,
            };
          }
        } catch (error) {
          // Server error, network issue, or token expired
          // For persistent login: only clear if it's an authentication error (401/403)
          // For network errors or other issues, keep user logged in with cached data
          const isAuthError = error.response?.status === 401 || error.response?.status === 403;
          const isNetworkError = !error.response || error.code === 'ECONNABORTED' || error.message?.includes('timeout');
          
          if (isAuthError && !isNetworkError) {
            // Token is invalid/expired and server is reachable - try to refresh token first
            try {
              const refreshResult = await this.refreshToken();
              if (refreshResult.success) {
                // Token refreshed, try getting profile again
                const response = await ApiService.user.getProfile();
                if (response.success && response.data) {
                  await SecureStore.setItemAsync('user_data', JSON.stringify(response.data));
                  return {
                    isAuthenticated: true,
                    user: response.data,
                  };
                }
              }
              // Refresh failed or profile fetch failed after refresh - clear auth
              logger.warn('Token refresh failed, clearing authentication');
              await this.logout();
              return {
                isAuthenticated: false,
                user: null,
              };
            } catch (refreshError) {
              // Refresh also failed - clear auth
              logger.warn('Token refresh error, clearing authentication:', refreshError);
              await this.logout();
              return {
                isAuthenticated: false,
                user: null,
              };
            }
          } else {
            // Network error or server unreachable - keep user logged in with cached data
            // This ensures app stays open even if server is temporarily unavailable
            // Only log warning if error message is meaningful (not "No token available" which is expected)
            if (error.message && !error.message.includes('No token available') && !error.message.includes('Unauthenticated')) {
              logger.log('📡 Server unreachable, using cached user data');
            }
            return {
              isAuthenticated: true,
              user: user,
            };
          }
        }
      }
      
      // No token or user data stored
      return {
        isAuthenticated: false,
        user: null,
      };
    } catch (error) {
      logger.error('Auth check error:', error);
      // On any error, check if we have cached data to keep user logged in
      // BUT only if we also have a token (don't log in with just cached data and no token)
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        const userData = await SecureStore.getItemAsync('user_data');
        
        // Only use cached data if we have BOTH token and userData
        // This prevents logging in with just cached data after logout
        if (token && userData) {
          const user = JSON.parse(userData);
          // Only log if we actually have cached data (user was previously logged in)
          logger.log('📡 Using cached user data');
          return {
            isAuthenticated: true,
            user: user,
          };
        }
      } catch (e) {
        // Can't read cached data either
      }
      
      return {
        isAuthenticated: false,
        user: null,
      };
    }
  }

  static async refreshToken() {
    try {
      const response = await ApiService.auth.refreshToken();
      
      if (response.success) {
        await SecureStore.setItemAsync('auth_token', response.data.token);
        return {
          success: true,
          token: response.data.token,
        };
      }
      
      return {
        success: false,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Token refresh failed',
      };
    }
  }

  static async updateProfile(userData) {
    try {
      const response = await ApiService.user.updateProfile(userData);
      
      if (response.success) {
        // Update stored user data
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data));
        return {
          success: true,
          user: response.data,
        };
      }
      
      return {
        success: false,
        message: response.message || 'Profile update failed',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Profile update failed',
      };
    }
  }

  static async refreshUserData() {
    try {
      const response = await ApiService.user.getProfile();
      
      if (response.success && response.data) {
        // Store fresh data directly from database - server returns all fields including profile_picture and services
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data));
        
        return {
          success: true,
          user: response.data,
        };
      } else {
        throw new Error('Failed to get user data from server');
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to refresh user data',
      };
    }
  }

  static async changePassword(passwordData) {
    try {
      const response = await ApiService.user.changePassword(passwordData);
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Password change failed',
      };
    }
  }
}

export { AuthService };
