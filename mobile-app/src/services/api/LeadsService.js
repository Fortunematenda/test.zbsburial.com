import ApiClient from './ApiClient';

/**
 * Leads Service
 * Handles all lead-related API calls
 */
class LeadsService {
  static getLeads(params) {
    return ApiClient.get('/leads', params);
  }

  static getLead(id) {
    return ApiClient.get(`/leads/${id}`);
  }

  static createLead(leadData) {
    return ApiClient.post('/leads', leadData);
  }

  static updateLead(id, leadData) {
    return ApiClient.put(`/leads/${id}`, leadData);
  }

  static deleteLead(id) {
    return ApiClient.delete(`/leads/${id}`);
  }

  static contactLeadById(id, message) {
    return ApiClient.post(`/leads/${id}/contact`, { message });
  }

  static getMyLeads(params) {
    return ApiClient.get('/leads/my', params);
  }

  static getAvailableLeads(params) {
    return ApiClient.get('/available-leads', params);
  }

  static getLeadExperts(id) {
    return ApiClient.get(`/mobile/lead/${id}/experts`);
  }

  static updateLeadStatus(id, statusData) {
    return ApiClient.post(`/mobile/lead/${id}/update-status`, statusData);
  }

  static contactLead(leadId, credits) {
    return ApiClient.post('/contact-lead', { lead_id: leadId, credits });
  }

  static unlockContactDetails(leadId, credits) {
    return ApiClient.post('/unlock-customer-info', { lead_id: leadId, credits });
  }
}

export default LeadsService;

