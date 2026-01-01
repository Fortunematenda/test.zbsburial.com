import { useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import ApiService from '../../services/ApiService';
import logger from '../../utils/logger';

/**
 * Custom hook for managing dashboard data fetching
 * Extracted from Dashboard.js
 */
export const useDashboardData = (user) => {
  const [dashboardData, setDashboardData] = useState({
    leads: 0,
    unreadLeads: 0,
    responses: 0,
    completedJobs: 0,
    credits: 0,
  });
  const [userRequests, setUserRequests] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Load dashboard stats
  const loadDashboardData = useCallback(async () => {
    try {
      const response = await ApiService.get('/dashboard');
      if (response.status === 'success') {
        setDashboardData(response.data);
      } else {
        // Set default values if API fails
        setDashboardData({
          leads: 0,
          unreadLeads: 0,
          responses: 0,
          completedJobs: 0,
          credits: 0,
        });
      }
    } catch (error) {
      // Only log non-authentication errors
      if (error.response?.status !== 401 && error.status !== -1) {
        logger.error('Error loading dashboard data:', error);
      }
      // Don't set fallback data on auth errors
      if (error.response?.status === 401 || error.status === -1) {
        setDashboardData({
          leads: 0,
          unreadLeads: 0,
          responses: 0,
          completedJobs: 0,
          credits: 0,
        });
      }
    }
  }, []);

  // Load user requests (for customers)
  const loadUserRequests = useCallback(async () => {
    try {
      // Load only active (non-completed) requests for dashboard
      const response = await ApiService.get('/user-requests', { active_only: true });
      if (response.status === 'success') {
        // Filter out completed/closed requests client-side as well for safety
        const activeRequests = response.data.filter(request => 
          request.status !== 'completed' && 
          request.status !== 'Closed' && 
          request.status !== 'Bought' && 
          request.status !== 'Unavailable'
        );
        setUserRequests(activeRequests);
      } else {
        setUserRequests([]);
      }
    } catch (error) {
      // Don't log 401 errors (user is logged out) as errors
      if (error.status === 401 || error.response?.status === 401) {
        // User is not authenticated, set empty requests
        setUserRequests([]);
        return;
      }
      logger.error('Error loading user requests:', error);
      // Fallback to empty array if API fails
      setUserRequests([]);
    }
  }, []);

  // Load unread notification count
  const loadUnreadNotificationCount = useCallback(async () => {
    try {
      // Check if user is authenticated before making API call
      const authToken = await SecureStore.getItemAsync('auth_token');
      if (!authToken) {
        setUnreadNotificationCount(0);
        return;
      }

      const response = await ApiService.notifications.getUnreadCount();
      if (response && response.success !== false) {
        const count = response.count ?? response.data?.count ?? 0;
        setUnreadNotificationCount(count);
      }
    } catch (error) {
      // Only log non-authentication errors
      if (error.response?.status !== 401 && error.status !== -1) {
        logger.error('Error loading unread notification count:', error);
      }
      // Silently fail - don't show error to user
      setUnreadNotificationCount(0);
    }
  }, []);

  // Refresh dashboard data
  const refreshDashboardData = useCallback(async () => {
    // Refresh dashboard data silently
    try {
      const response = await ApiService.get('/dashboard');
      if (response.status === 'success') {
        setDashboardData(response.data);
      }
    } catch (error) {
      logger.error('Error refreshing dashboard data:', error);
    }
    
    // Refresh user requests if customer (only active ones for dashboard)
    if (user?.role === 'Customer') {
      try {
        const response = await ApiService.get('/user-requests', { active_only: true });
        if (response.status === 'success') {
          // Filter out completed/closed requests
          const activeRequests = response.data.filter(request => 
            request.status !== 'completed' && 
            request.status !== 'Closed' && 
            request.status !== 'Bought' && 
            request.status !== 'Unavailable'
          );
          setUserRequests(activeRequests);
        }
      } catch (error) {
        logger.error('Error refreshing user requests:', error);
      }
    }
  }, [user?.role, loadUserRequests]);

  return {
    dashboardData,
    userRequests,
    unreadNotificationCount,
    loadDashboardData,
    loadUserRequests,
    loadUnreadNotificationCount,
    refreshDashboardData,
    setDashboardData,
    setUserRequests,
  };
};

