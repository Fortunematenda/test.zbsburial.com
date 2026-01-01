import { useLeadsData } from './useLeadsData';
import { useLeadsActions } from './useLeadsActions';

/**
 * Main orchestrator hook for Leads screen
 * Combines data fetching and actions
 */
export const useLeads = (navigation) => {
  const {
    leads,
    loading,
    refreshing,
    user,
    userCredits,
    setUser,
    setUserCredits,
    onRefresh,
    loadLeads,
  } = useLeadsData();

  const {
    unlockingLeadId,
    handleQuickUnlock,
  } = useLeadsActions(navigation, user, setUser, setUserCredits);

  // Check if user is Expert and not FICA verified
  const isUnverifiedExpert = user?.role === 'Expert' && (!user?.fica_verified || !user?.verified_by);

  return {
    // Data
    leads,
    loading,
    refreshing,
    user,
    userCredits,
    
    // Actions
    onRefresh,
    handleQuickUnlock,
    unlockingLeadId,
    
    // State
    isUnverifiedExpert,
  };
};

