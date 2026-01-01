import { useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { LeadsService } from '../../services/api/index';
import Toast from 'react-native-toast-message';

/**
 * Custom hook for managing lead actions (unlock, etc.)
 */
export const useLeadsActions = (navigation, user, setUser, setUserCredits) => {
  const [unlockingLeadId, setUnlockingLeadId] = useState(null);

  /**
   * Handle quick unlock of a lead
   * @param {Object} lead - Lead object to unlock
   */
  const handleQuickUnlock = useCallback(async (lead) => {
    // Extract credits from lead (could be in budget string like "10 credits" or as credits property)
    let creditsRequired = 10; // Default
    if (lead.budget) {
      const creditsMatch = lead.budget.toString().match(/(\d+)\s*credits?/i);
      if (creditsMatch) {
        creditsRequired = parseInt(creditsMatch[1]);
      }
    }
    // Also check if lead has direct credits property from original data
    if (lead.credits && typeof lead.credits === 'number') {
      creditsRequired = lead.credits;
    }

    // Unlock directly without any warnings or confirmations
    try {
      setUnlockingLeadId(lead.id);
      
      const response = await LeadsService.unlockContactDetails(lead.id, creditsRequired);
      
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
        
        // Update user credits silently
        if (response.data?.remaining_credits !== undefined) {
          setUserCredits(response.data.remaining_credits);
          // Update user data in SecureStore
          if (user) {
            const updatedUser = { ...user, credits_balance: response.data.remaining_credits };
            await SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        }

        // Navigate to lead details immediately
        navigation.navigate('ProviderLeadDetails', { 
          leadId: lead.id,
          unlocked: true
        });
      } else {
        throw new Error(response.message || 'Failed to unlock lead');
      }
    } catch (error) {
      // Extract user-friendly error message
      let errorMessage = 'Failed to unlock lead. Please try again.';
      
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
      
      if (isInsufficientCredits) {
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
    } finally {
      setUnlockingLeadId(null);
    }
  }, [navigation, user, setUser, setUserCredits]);

  return {
    unlockingLeadId,
    handleQuickUnlock,
  };
};

