import ApiClient from './ApiClient';

/**
 * Notifications Service
 * Handles all notification-related API calls
 */
class NotificationsService {
  static getNotifications(params) {
    return ApiClient.get('/notifications', params);
  }

  static markAsRead(id) {
    return ApiClient.put(`/notifications/${id}/read`);
  }

  static markAllAsRead() {
    return ApiClient.put('/notifications/read-all');
  }

  static clearAll() {
    return ApiClient.delete('/notifications/clear-all');
  }

  static getUnreadCount() {
    return ApiClient.get('/notifications/unread-count');
  }
}

export default NotificationsService;

