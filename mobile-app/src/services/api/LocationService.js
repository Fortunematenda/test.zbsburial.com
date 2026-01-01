import ApiClient from './ApiClient';

/**
 * Location Service
 * Handles all location-related API calls
 */
class LocationService {
  static getNearbyServices(params) {
    return ApiClient.get('/location/nearby-services', params);
  }

  static updateLocation(locationData) {
    return ApiClient.post('/location/update', locationData);
  }

  static updateUserLocation(location) {
    return ApiClient.post('/user/location', location);
  }
}

export default LocationService;

