import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../services/ApiService';
import logger from '../../utils/logger';

/**
 * Custom hook for managing dashboard modals and related state
 * Extracted from Dashboard.js
 */
export const useDashboardModals = (refreshDashboardData, loadUserRequests) => {
  const navigation = useNavigation();
  const [showHiredModal, setShowHiredModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [experts, setExperts] = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Handle "hired someone" action - opens modal and loads experts
  const handleHiredSomeone = useCallback(async (leadId) => {
    setSelectedLeadId(leadId);
    setLoadingExperts(true);
    setShowHiredModal(true);
    
    try {
      const response = await ApiService.leads.getLeadExperts(leadId);
      if (response.status === 'success') {
        setExperts(response.data || []);
      }
    } catch (error) {
      logger.error('Error loading experts:', error);
      // Continue to show modal even if experts fail to load
      setExperts([]);
    } finally {
      setLoadingExperts(false);
    }
  }, []);

  // Update lead status
  const updateLeadStatus = useCallback(async (leadId, status, hiredExpertId = null) => {
    try {
      setUpdatingStatus(true);
      const statusData = {
        status: status,
      };
      
      if (status === 'hired' && hiredExpertId !== null) {
        statusData.hired_expert_id = hiredExpertId;
      }

      const response = await ApiService.leads.updateLeadStatus(leadId, statusData);
      
      if (response.status === 'success') {
        Alert.alert('Success', response.message || 'Request updated successfully');
        setShowHiredModal(false);
        // Refresh requests list and dashboard
        await loadUserRequests();
        await refreshDashboardData();
      } else {
        Alert.alert('Error', response.message || 'Failed to update request');
      }
    } catch (error) {
      logger.error('Error updating lead status:', error);
      Alert.alert('Error', error.message || 'Failed to update request. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  }, [refreshDashboardData, loadUserRequests]);

  // Handle expert selection
  const handleSelectExpert = useCallback((expertId) => {
    if (selectedLeadId) {
      updateLeadStatus(selectedLeadId, 'hired', expertId);
    }
  }, [selectedLeadId, updateLeadStatus]);

  // Handle close request
  const handleCloseRequest = useCallback((leadId) => {
    Alert.alert(
      'Close Request',
      'Are you sure you want to close this request? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Close',
          style: 'destructive',
          onPress: () => updateLeadStatus(leadId, 'unavailable'),
        },
      ]
    );
  }, [updateLeadStatus]);

  // Perform global search
  const performSearch = useCallback(async () => {
    if (!globalSearchQuery.trim()) {
      return;
    }

    try {
      setSearching(true);
      setSearchResults(null); // Clear previous results
      
      const response = await ApiService.search.globalSearch(globalSearchQuery.trim());
      
      logger.log('Search response:', JSON.stringify(response, null, 2));
      
      if (response && response.status === 'success') {
        // Backend returns: { status: 'success', total_results: X, data: { requests: [], chats: [], services: [], leads: [], users: [] } }
        const results = response.data || {};
        results.total_results = response.total_results || 0;
        
        // Ensure all arrays exist
        if (!results.requests) results.requests = [];
        if (!results.chats) results.chats = [];
        if (!results.services) results.services = [];
        if (!results.leads) results.leads = [];
        if (!results.users) results.users = [];
        
        logger.log('Processed results:', JSON.stringify(results, null, 2));
        setSearchResults(results);
      } else if (response && response.data) {
        // Handle case where response has data but no status
        const results = response.data;
        results.total_results = response.total_results || 0;
        setSearchResults(results);
      } else {
        // No results found
        setSearchResults({ 
          total_results: 0, 
          requests: [], 
          chats: [], 
          services: [],
          leads: [],
          users: []
        });
      }
    } catch (error) {
      logger.error('Search error:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = 'Failed to perform search. Please try again.';
      
      if (error.status === 0 || error.status === -1) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.status === 500) {
        errorMessage = 'Search is temporarily unavailable. Please try again later.';
      } else if (error.message && !error.message.includes('SQLSTATE')) {
        errorMessage = error.message;
      } else if (error.data?.message && !error.data.message.includes('SQLSTATE')) {
        errorMessage = error.data.message;
      } else if (error.response?.data?.message && !error.response.data.message.includes('SQLSTATE')) {
        errorMessage = error.response.data.message;
      }
      
      // Don't show alert for technical SQL errors, just log them
      if (errorMessage.includes('SQLSTATE') || errorMessage.includes('Unknown column')) {
        logger.error('Database error in search:', error.message || error.data?.message);
        errorMessage = 'Search is temporarily unavailable. Please try again later.';
      }
      
      Alert.alert('Search Error', errorMessage);
      setSearchResults(null);
    } finally {
      setSearching(false);
    }
  }, [globalSearchQuery]);

  // Navigate to search result
  const navigateToResult = useCallback((item) => {
    setShowSearchModal(false);
    setGlobalSearchQuery('');
    setSearchResults(null);
    if (item.type === 'request') {
      // Navigate to request details
      navigation.navigate('CustomerLeadsDetails', { leadId: item.id });
    } else if (item.type === 'lead') {
      // Navigate to lead details (for providers viewing available leads)
      const parent = navigation.getParent();
      if (parent && typeof parent.navigate === 'function') {
        parent.navigate('Leads');
      } else {
        navigation.navigate('Leads');
      }
    } else if (item.type === 'chat') {
      // Navigate to chat details
      navigation.navigate('ChatDetails', {
        leadId: item.lead_id,
        providerId: item.provider_id,
        serviceName: item.service_name,
        providerName: item.provider_name
      });
    } else if (item.type === 'service') {
      // Navigate to service or filter leads by service
      const parent = navigation.getParent();
      if (parent && typeof parent.navigate === 'function') {
        parent.navigate('Leads', { serviceFilter: item.id });
      } else {
        navigation.navigate('Leads', { serviceFilter: item.id });
      }
    } else if (item.type === 'user') {
      // Navigate to user/profile view
      const parent = navigation.getParent();
      if (parent && typeof parent.navigate === 'function') {
        parent.navigate('Profile');
      } else {
        navigation.navigate('Profile');
      }
    }
  }, [navigation]);

  // Clear search when modal closes
  const handleCloseSearchModal = useCallback(() => {
    setShowSearchModal(false);
    setGlobalSearchQuery('');
    setSearchResults(null);
  }, []);

  return {
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
    
    // Modal actions
    setShowHiredModal,
    setShowSearchModal,
    setGlobalSearchQuery,
    handleHiredSomeone,
    handleSelectExpert,
    handleCloseRequest,
    performSearch,
    handleCloseSearchModal,
    navigateToResult,
  };
};

