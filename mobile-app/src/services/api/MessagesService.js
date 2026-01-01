import ApiClient from './ApiClient';

/**
 * Messages/Chat Service
 * Handles all messaging-related API calls
 */
class MessagesService {
  static getConversations() {
    return ApiClient.get('/messages/conversations');
  }

  static getMessages(conversationId) {
    return ApiClient.get(`/messages/${conversationId}`);
  }

  static sendMessage(messageData) {
    return ApiClient.post('/messages', messageData);
  }

  static markAsRead(conversationId) {
    return ApiClient.put(`/messages/${conversationId}/read`);
  }

  static sendMessageToLead(leadId, description, contactedUserId = null) {
    return ApiClient.post('/send-message', { 
      lead_id: leadId, 
      description, 
      contacted_user_id: contactedUserId 
    });
  }

  static getChatMessages(leadId) {
    return ApiClient.get(`/chat-messages/${leadId}`);
  }
}

export default MessagesService;

