import SessionService from '../services/SessionService';
import logger from '../utils/logger';

class SessionMiddleware {
  // Intercept API requests to add session validation
  static async interceptRequest(config) {
    try {
      const token = await SessionService.getToken();
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        };
      }
      return config;
    } catch (error) {
      logger.error('Error adding auth token to request:', error);
      return config;
    }
  }

  // Intercept API responses to handle session errors
  static async interceptResponse(response) {
    try {
      // If response indicates session expired
      if (response.status === 401 && response.data?.message?.includes('Session expired')) {
        logger.warn('Session expired, clearing local session');
        await SessionService.clearSession();
        
        // You can dispatch a logout action or navigate to login screen here
        // For now, we'll just log it
        logger.warn('User session expired, please login again');
      }
      
      return response;
    } catch (error) {
      logger.error('Error intercepting response:', error);
      return response;
    }
  }

  // Handle API errors
  static async handleError(error) {
    try {
      if (error.response?.status === 401) {
        logger.warn('Unauthorized request, clearing session');
        await SessionService.clearSession();
      }
      throw error;
    } catch (err) {
      logger.error('Error handling API error:', err);
      throw error;
    }
  }
}

export default SessionMiddleware;
