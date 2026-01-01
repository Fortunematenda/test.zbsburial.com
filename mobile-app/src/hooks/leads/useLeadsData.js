import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { UserService, LeadsService } from '../../services/api/index';
import { formatDistance } from '../../utils/leadsHelpers';
import logger from '../../utils/logger';

/**
 * Custom hook for managing leads data fetching
 */
export const useLeadsData = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [userCredits, setUserCredits] = useState(0);

  // Load user data from SecureStore
  const loadUserData = useCallback(async () => {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setUserCredits(parsedUser.credits_balance || 0);
      }
    } catch (error) {
      // Silently handle user data loading errors
    }
  }, []);

  // Get credits from dashboard
  const loadUserCredits = useCallback(async () => {
    try {
      const response = await UserService.getDashboard();
      if (response.status === 'success' && response.data?.credits !== undefined) {
        setUserCredits(response.data.credits);
      }
    } catch (error) {
      // Silently handle credit loading errors (401 errors are expected when logged out)
    }
  }, []);

  // Load leads based on user role
  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'Customer') {
        // For customers, show their own leads/requests
        try {
          const response = await UserService.getUserRequests();
          if (response.status === 'success' && response.data) {
            setLeads(response.data);
          } else {
            setLeads([]);
          }
        } catch (apiError) {
          // Silently handle API errors (401 errors are expected when logged out)
          setLeads([]);
        }
      } else {
        // For providers, show available leads
        try {
          const response = await LeadsService.getAvailableLeads();
          if (response.status === 'success' && response.data?.leads) {
            // Transform the desktop data format to mobile format
            const transformedLeads = response.data.leads.map(lead => ({
              id: lead.lead_id,
              title: lead.service_name,
              description: lead.description || 'No description provided',
              category: lead.service_name,
              budget: `${lead.credits} credits`,
              credits: lead.credits || 10, // Store credits as number for unlock
              location: lead.location,
              urgency: lead.urgent ? 'Urgent' : 'Normal',
              date: lead.time,
              distance: formatDistance(lead.distance),
              contacted: lead.contacted || 0,
              remender: lead.remender || 0,
              frequent: lead.frequent || 0,
              is_phone_verified: lead.is_phone_verified || 0,
              additional_details: lead.additional_details || 0,
              hiring_decision: lead.hiring_decision || 0,
              user: {
                name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown User',
                initial: lead.first_letter || 'U',
                rating: lead.customer_rating || 0,
                completedJobs: lead.hired_jobs || 0,
                hiredRate: lead.hired_rate || 0
              }
            }));
            setLeads(transformedLeads);
          } else {
            setLeads([]);
          }
        } catch (apiError) {
          // Silently handle API errors (401 errors are expected when logged out)
          setLeads([]);
        }
      }
    } catch (error) {
      // Silently handle errors (401 errors are expected when logged out)
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user) {
      await loadLeads();
      await loadUserCredits();
    }
    setRefreshing(false);
  }, [user, loadLeads, loadUserCredits]);

  // Initial load
  useEffect(() => {
    loadUserData();
    loadUserCredits();
  }, [loadUserData, loadUserCredits]);

  // Load leads when user is available
  useEffect(() => {
    if (user) {
      loadLeads();
      loadUserCredits();
    }
  }, [user, loadLeads, loadUserCredits]);

  // Refresh leads and credits when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadLeads();
        loadUserCredits(); // Refresh credits in case user bought credits
      }
    }, [user, loadLeads, loadUserCredits])
  );

  return {
    leads,
    loading,
    refreshing,
    user,
    userCredits,
    setUser,
    setUserCredits,
    onRefresh,
    loadLeads,
  };
};

