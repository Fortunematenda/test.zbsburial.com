import ApiClient from './ApiClient';

/**
 * User Service
 * Handles all user/profile-related API calls
 */
class UserService {
  static getProfile() {
    return ApiClient.get('/user/profile');
  }

  static updateProfile(userData) {
    return ApiClient.put('/user/profile', userData);
  }

  static uploadAvatar(imageData) {
    return ApiClient.upload('/user/avatar', imageData);
  }

  static changePassword(passwordData) {
    return ApiClient.put('/user/password', passwordData);
  }

  static getDashboard() {
    return ApiClient.get('/dashboard');
  }

  static getUserRequests() {
    return ApiClient.get('/user-requests');
  }
}

export default UserService;

