import ApiClient from './ApiClient';

/**
 * Ratings Service
 * Handles all rating-related API calls
 */
class RatingsService {
  static getRatings(userId) {
    return ApiClient.get(`/ratings/${userId}`);
  }

  static submitRating(ratingData) {
    return ApiClient.post('/ratings', ratingData);
  }

  static updateRating(id, ratingData) {
    return ApiClient.put(`/ratings/${id}`, ratingData);
  }
}

export default RatingsService;

