import ApiClient from './ApiClient';

/**
 * Portfolio Service
 * Handles all portfolio-related API calls
 */
class PortfolioService {
  static getUserPortfolio() {
    return ApiClient.get('/user/portfolio');
  }

  static addToPortfolio(portfolioData) {
    return ApiClient.upload('/user/portfolio', portfolioData);
  }

  static deleteFromPortfolio(imageId) {
    return ApiClient.delete(`/user/portfolio/${imageId}`);
  }
}

export default PortfolioService;

