import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import ApiService, { API_BASE_URL } from '../../services/ApiService';
import Toast from 'react-native-toast-message';
import logger from '../../utils/logger';

/**
 * Custom hook for managing lead details state and logic
 * Extracted from LeadDetailsScreen.js and CustomerLeadDetailsScreen.js
 */
export const useLeadDetails = (leadId) => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Load user data to determine role
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await SecureStore.getItemAsync('user_data');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        logger.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  // Load lead details
  const loadLeadDetails = useCallback(async () => {
    if (!leadId) {
      setError('No lead ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      logger.log('Loading lead details for ID:', leadId);
      const response = await ApiService.get(`/lead-details/${leadId}`);
      logger.log('API Response:', response);
      
      if (response && response.status === 'success' && response.data) {
        logger.log('Lead data received:', response.data);
        
        // Determine display status for customers (based on response count)
        const responseCount = response.data.response_count || 0;
        let displayStatus = 'pending';
        if (responseCount > 0) {
          displayStatus = 'in_progress';
        }
        
        // Ensure all required fields have default values
        const leadData = {
          ...response.data,
          title: response.data.title || 'No Title',
          description: response.data.description || 'No description provided',
          location: response.data.location || 'Location not specified',
          service_name: response.data.service_name || 'Service not specified',
          credits: response.data.credits || 0,
          budget: response.data.budget || response.data.service_price || 'Not specified',
          urgent: response.data.urgent || false,
          is_phone_verified: response.data.is_phone_verified || false,
          contacted: response.data.contacted || 0,
          remender: response.data.remender || 0,
          frequent: response.data.frequent || 0,
          time_ago: response.data.time_ago || 'Unknown',
          contacted_time: response.data.contacted_time || null,
          posted_datetime: response.data.posted_datetime || null,
          contacted_datetime: response.data.contacted_datetime || null,
          images: Array.isArray(response.data.images) ? response.data.images : [],
          customer: response.data.customer || null,
          service_details: response.data.service_details || null,
          response_count: responseCount,
          displayStatus: displayStatus,
        };
        
        setLead(leadData);
        setError(null);
      } else {
        logger.log('API call failed or no data:', response);
        setError('Failed to load lead details');
        setLead(null);
      }
    } catch (error) {
      // Don't log 401 errors (user is logged out)
      if (error.status === 401 || error.response?.status === 401) {
        setError('Please log in to view lead details');
        setLead(null);
        return;
      }
      logger.error('Error loading lead details:', error);
      setError('Failed to load lead details: ' + error.message);
      setLead(null);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  // Load lead details on mount
  useEffect(() => {
    if (leadId) {
      loadLeadDetails();
    }
  }, [leadId, loadLeadDetails]);

  // Unlock customer info (Provider only)
  const unlockCustomerInfo = useCallback(async (navigation) => {
    if (!lead || !leadId) return;
    
    try {
      const response = await ApiService.unlockContactDetails(leadId, lead.credits);
      
      if (response.status === 'success') {
        // Show success toast
        Toast.show({
          type: 'success',
          text1: '',
          text2: 'Contact details unlocked successfully',
          position: 'top',
          topOffset: 100,
          visibilityTime: 1500,
        });
        
        // Reload lead details to show unlocked information
        await loadLeadDetails();
      } else {
        // Check if it's an insufficient credits error
        const errorMessage = response.message || 'Failed to unlock contact details';
        const isInsufficientCredits = errorMessage.toLowerCase().includes('insufficient credits') || 
                                      errorMessage.toLowerCase().includes('not enough credits');
        
        if (isInsufficientCredits && navigation) {
          // Show info toast and redirect to Credits page
          Toast.show({
            type: 'info',
            text1: '',
            text2: 'You need more credits to unlock this lead',
            position: 'top',
            topOffset: 100,
            visibilityTime: 2000,
          });
          
          // Navigate to Credits page after a short delay
          setTimeout(() => {
            navigation.navigate('More', { screen: 'Credits' });
          }, 1500);
        } else {
          // Show error toast for other errors
          Toast.show({
            type: 'error',
            text1: '',
            text2: errorMessage,
            position: 'top',
            topOffset: 100,
            visibilityTime: 2500,
          });
        }
      }
    } catch (error) {
      // Extract user-friendly error message
      let errorMessage = 'Failed to unlock contact details. Please try again.';
      
      if (error.message) {
        // If message is a JSON string, try to parse it
        if (typeof error.message === 'string' && error.message.startsWith('{')) {
          try {
            const parsed = JSON.parse(error.message);
            errorMessage = parsed.message || parsed.data?.message || errorMessage;
          } catch (e) {
            // If parsing fails, use the message as is but clean it up
            errorMessage = error.message.replace(/^\{[^}]*\}/, '').trim() || errorMessage;
          }
        } else {
          errorMessage = error.message;
        }
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Check if it's an insufficient credits error
      const isInsufficientCredits = errorMessage.toLowerCase().includes('insufficient credits') || 
                                    errorMessage.toLowerCase().includes('not enough credits');
      
      if (isInsufficientCredits && navigation) {
        // Show info toast and redirect to Credits page
        Toast.show({
          type: 'info',
          text1: '',
          text2: 'You need more credits to unlock this lead',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2000,
        });
        
        // Navigate to Credits page after a short delay
        setTimeout(() => {
          navigation.navigate('More', { screen: 'Credits' });
        }, 1500);
      } else {
        // Show error toast for other errors
        Toast.show({
          type: 'error',
          text1: '',
          text2: errorMessage,
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    }
  }, [lead, leadId, loadLeadDetails]);

  // Contact lead (Provider only)
  const contactLead = useCallback(async () => {
    if (!lead || !leadId) return;
    
    try {
      Alert.alert(
        'Contact Lead',
        `This will cost ${lead.credits} credits to contact this lead and send them your information. Do you want to continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Contact',
            onPress: async () => {
              try {
                const response = await ApiService.contactLead(leadId, lead.credits);
                
                if (response.message === 'Okay') {
                  Alert.alert(
                    'Success', 
                    `Lead contacted successfully! Credits deducted: ${response.credits_deducted}. Remaining credits: ${response.remaining_credits}`,
                    [{ text: 'OK' }]
                  );
                } else if (response.message === 'No credits') {
                  Alert.alert(
                    'Insufficient Credits',
                    response.content || 'You do not have enough credits to contact this lead.',
                    [{ text: 'OK', style: 'default' }]
                  );
                } else if (response.message === 'Not Allowed') {
                  Alert.alert(
                    'Not Available',
                    response.content || 'This lead is no longer available for contact.',
                    [{ text: 'OK', style: 'default' }]
                  );
                } else {
                  Alert.alert('Error', response.message || 'Failed to contact lead');
                }
              } catch (error) {
                logger.error('Error contacting lead:', error);
                Alert.alert('Error', 'Failed to contact lead. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      logger.error('Error showing contact dialog:', error);
    }
  }, [lead, leadId]);

  // Get service details (parsed)
  const getServiceDetails = useCallback(() => {
    if (!lead?.service_details) {
      return [];
    }

    // Case 1: service_details is nested (service_details.service_details)
    if (lead.service_details?.service_details) {
      try {
        const details = typeof lead.service_details.service_details === 'string' 
          ? JSON.parse(lead.service_details.service_details)
          : lead.service_details.service_details;
        return Array.isArray(details) ? details : [];
      } catch (e) {
        logger.error('Error parsing nested service_details:', e);
        return [];
      }
    }

    // Case 2: service_details is a string that needs parsing
    if (typeof lead.service_details === 'string') {
      try {
        const details = JSON.parse(lead.service_details);
        return Array.isArray(details) ? details : [];
      } catch (e) {
        logger.error('Error parsing service_details string:', e);
        return [];
      }
    }

    // Case 3: service_details is already an array
    if (Array.isArray(lead.service_details)) {
      return lead.service_details;
    }

    // Case 4: service_details is an object, try to convert
    if (typeof lead.service_details === 'object' && lead.service_details !== null) {
      if (lead.service_details.service_details) {
        try {
          const details = typeof lead.service_details.service_details === 'string'
            ? JSON.parse(lead.service_details.service_details)
            : lead.service_details.service_details;
          return Array.isArray(details) ? details : [];
        } catch (e) {
          return [];
        }
      }
      // Otherwise, try to convert object to array format
      return Object.keys(lead.service_details).map(key => ({
        question: key,
        answer: lead.service_details[key]
      }));
    }

    return [];
  }, [lead]);

  // Helper functions
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'pending': return '#FFA726';
      case 'in_progress': return '#42A5F5';
      case 'completed': return '#66BB6A';
      case 'cancelled': return '#EF5350';
      default: return '#9E9E9E';
    }
  }, []);

  const getStatusText = useCallback((status) => {
    switch (status) {
      case 'pending': return status === 'pending' && user?.role === 'Customer' ? 'Waiting for Experts' : 'Pending';
      case 'in_progress': return status === 'in_progress' && user?.role === 'Customer' ? 'Experts Responded' : 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  }, [user?.role]);

  // Format datetime helper
  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateString;
    }
  }, []);

  // Format image URL
  const formatImageUrl = useCallback((image) => {
    if (!image || !image.image_url) return null;
    
    let imageUrl = image.image_url;
    if (typeof imageUrl === 'string' && imageUrl.length > 0) {
      if (!imageUrl.startsWith('http')) {
        const baseUrl = (API_BASE_URL && typeof API_BASE_URL === 'string')
          ? API_BASE_URL.replace('/api', '')
          : 'http://192.168.1.90:8080';
        imageUrl = baseUrl + '/' + imageUrl.replace(/^\//, '');
      }
      return imageUrl;
    }
    return null;
  }, []);

  // Determine if user is provider
  const isProvider = user?.role === 'Provider' || user?.role === 'Expert';
  const isCustomer = user?.role === 'Customer';

  return {
    // State
    lead,
    loading,
    error,
    user,
    selectedImage,
    showImageModal,
    isProvider,
    isCustomer,
    
    // Actions
    loadLeadDetails,
    unlockCustomerInfo,
    contactLead,
    setSelectedImage,
    setShowImageModal,
    
    // Helpers
    getServiceDetails,
    getStatusColor,
    getStatusText,
    formatImageUrl,
    formatDateTime,
  };
};

