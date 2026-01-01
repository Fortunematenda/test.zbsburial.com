import ApiClient from './ApiClient';

/**
 * Responses Service
 * Handles all response-related API calls
 */
class ResponsesService {
  static getUserResponses(params) {
    return ApiClient.get('/user-responses', params);
  }

  static getResponseDetails(id) {
    return ApiClient.get(`/response-details/${id}`);
  }

  static updateResponseStatus(id, statusData) {
    return ApiClient.put(`/responses/${id}/status`, statusData);
  }

  static markAsInterested(id) {
    return ApiClient.post(`/responses/${id}/interested`);
  }

  static markAsNotInterested(id) {
    return ApiClient.post(`/responses/${id}/not-interested`);
  }

  static updateContactStatus(leadId, status) {
    return ApiClient.post('/update-contact-status', { lead_id: leadId, status });
  }
}

export default ResponsesService;

