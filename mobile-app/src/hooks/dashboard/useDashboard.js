import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useDashboardData } from './useDashboardData';
import { useDashboardModals } from './useDashboardModals';
import logger from '../../utils/logger';

/**
 * Main dashboard hook - orchestrates all dashboard functionality
 * Extracted from Dashboard.js
 */
export const useDashboard = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initialize dashboard data hook
  const {
    dashboardData,
    userRequests,
    unreadNotificationCount,
    loadDashboardData,
    loadUserRequests,
    loadUnreadNotificationCount,
    refreshDashboardData,
    setUserRequests,
  } = useDashboardData(user);

  // Initialize modals hook
  const {
    showHiredModal,
    showSearchModal,
    selectedLeadId,
    experts,
    loadingExperts,
    updatingStatus,
    searchResults,
    searching,
    globalSearchQuery,
    setShowHiredModal,
    setShowSearchModal,
    setGlobalSearchQuery,
    handleHiredSomeone,
    handleSelectExpert,
    handleCloseRequest,
    performSearch,
    handleCloseSearchModal,
    navigateToResult,
  } = useDashboardModals(refreshDashboardData, loadUserRequests);

  // Load user data
  const loadUserData = useCallback(async () => {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      logger.error('Error loading user data:', error);
    }
  }, []);

  // Initialize dashboard
  useEffect(() => {
    const initialize = async () => {
      await loadUserData();
      // Wait a bit for user state to update, then check auth
      setTimeout(async () => {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (authToken) {
          try {
            await Promise.all([
              loadDashboardData(),
              loadUnreadNotificationCount(),
            ]);
          } catch (error) {
            logger.error('Error initializing dashboard:', error);
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }, 100);
    };
    initialize();
  }, [loadDashboardData, loadUnreadNotificationCount]);

  // Load user requests when user role is Customer
  useEffect(() => {
    if (user?.role === 'Customer') {
      loadUserRequests();
    }
  }, [user, loadUserRequests]);

  // Clear search results when modal is closed
  useEffect(() => {
    if (!showSearchModal) {
      setGlobalSearchQuery('');
      // Note: searchResults is cleared in handleCloseSearchModal
    }
  }, [showSearchModal]);

  // Handle screen focus - refresh data
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      
      // Reload user data from SecureStore when screen comes into focus
      const refreshUserOnly = async () => {
        try {
          const userData = await SecureStore.getItemAsync('user_data');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          }
        } catch (error) {
          logger.error('Error loading user data on focus:', error);
        }
        
        // Refresh notification count when screen is focused (only if authenticated)
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (authToken) {
          await loadUnreadNotificationCount();
        }
      };
      
      refreshUserOnly();
      
      const now = Date.now();
      const shouldRefresh = !lastRefreshTime || (now - lastRefreshTime) > 30000; // 30 seconds
      
      if (shouldRefresh) {
        // Refresh dashboard stats silently
        const refreshData = async () => {
          // Check authentication before refreshing
          const authToken = await SecureStore.getItemAsync('auth_token');
          if (!authToken) {
            return;
          }

          try {
            // Lightweight refresh - only dashboard stats
            await refreshDashboardData();
          } catch (error) {
            // Only log non-authentication errors
            if (error.response?.status !== 401 && error.status !== -1) {
              logger.error('Error refreshing dashboard:', error);
            }
          }
          
          // Refresh user requests if customer (only if needed)
          const currentUser = await SecureStore.getItemAsync('user_data').then(data => data ? JSON.parse(data) : null);
          if (currentUser?.role === 'Customer') {
            try {
              await loadUserRequests();
            } catch (error) {
              if (error.response?.status !== 401 && error.status !== -1) {
                logger.error('Error refreshing user requests:', error);
              }
            }
          }
        };
        
        refreshData().then(() => setLastRefreshTime(Date.now()));
      }
    }, [lastRefreshTime, loadUnreadNotificationCount, refreshDashboardData, loadUserRequests])
  );

  // Refresh dashboard (manual refresh)
  const refreshDashboard = useCallback(async () => {
    await loadUserData();
    const authToken = await SecureStore.getItemAsync('auth_token');
    if (!authToken) {
      return;
    }
    await refreshDashboardData();

    // Refresh user requests if customer
    if (user?.role === 'Customer') {
      await loadUserRequests();
    }
  }, [loadUserData, refreshDashboardData, user?.role, loadUserRequests]);

  // Helper functions
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const getCurrentDateTime = useCallback(() => {
    const now = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    };
    return now.toLocaleDateString('en-US', options);
  }, []);

  return {
    // User state
    user,
    loading,
    
    // Dashboard data
    dashboardData,
    userRequests,
    unreadNotificationCount,
    
    // Modal states
    showHiredModal,
    showSearchModal,
    selectedLeadId,
    experts,
    loadingExperts,
    updatingStatus,
    searchResults,
    searching,
    globalSearchQuery,
    
    // Actions
    refreshDashboard,
    handleHiredSomeone,
    handleSelectExpert,
    handleCloseRequest,
    performSearch,
    navigateToResult,
    setShowHiredModal,
    setShowSearchModal,
    setGlobalSearchQuery,
    handleCloseSearchModal,
    
    // Helpers
    getGreeting,
    getCurrentDateTime,
    
    // Navigation
    navigation,
  };
};

