import ApiClient from './ApiClient';

/**
 * Payments Service
 * Handles all payment and credit-related API calls
 */
class PaymentsService {
  static purchaseCredits(amount) {
    return ApiClient.post('/payments/purchase-credits', { amount });
  }

  static getTransactions(params) {
    return ApiClient.get('/payments/transactions', params);
  }

  static getPaymentMethods() {
    return ApiClient.get('/payments/methods');
  }

  static addPaymentMethod(methodData) {
    return ApiClient.post('/payments/methods', methodData);
  }

  static getPackages() {
    return ApiClient.get('/mobile/packages');
  }

  static createCheckoutSession(productId) {
    return ApiClient.post('/mobile/create-checkout-session', { product_id: productId });
  }

  static getCreditsHistory(userId) {
    return ApiClient.get(`/credits-history/${userId}`);
  }
}

export default PaymentsService;

