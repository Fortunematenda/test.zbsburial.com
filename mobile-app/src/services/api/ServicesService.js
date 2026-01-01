import ApiClient from './ApiClient';

/**
 * Services Service
 * Handles all service-related API calls
 */
class ServicesService {
  static getServices() {
    return ApiClient.get('/all-services');
  }

  static getUserServices() {
    return ApiClient.get('/user/services');
  }

  static updateUserServices(services) {
    return ApiClient.post('/user/services', { services });
  }
}

export default ServicesService;

