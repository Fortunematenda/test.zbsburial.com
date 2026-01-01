import ApiClient from './ApiClient';

/**
 * Search Service
 * Handles all search-related API calls
 */
class SearchService {
  static globalSearch(query) {
    return ApiClient.get('/mobile/search', { q: query });
  }
}

export default SearchService;

