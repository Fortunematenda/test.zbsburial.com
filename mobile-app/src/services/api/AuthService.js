import ApiClient from './ApiClient';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
  static login(credentials) {
    return ApiClient.post('/simple-login', credentials, { timeout: 10000 });
  }

  static register(userData) {
    return ApiClient.post('/simple-register', userData);
  }

  static logout() {
    return ApiClient.post('/mobile/session/logout');
  }

  static verifyOtp(otpData) {
    return ApiClient.post('/verify-otp', otpData);
  }

  static resendOtp(phone) {
    return ApiClient.post('/auth/resend-otp', { phone });
  }

  static forgotPassword(email) {
    return ApiClient.post('/auth/forgot-password', { email });
  }

  static resetPassword(resetData) {
    return ApiClient.post('/auth/reset-password', resetData);
  }

  static refreshToken() {
    return ApiClient.post('/auth/refresh');
  }
}

export default AuthService;

