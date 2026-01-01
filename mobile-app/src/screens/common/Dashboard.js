import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDashboard } from '../../hooks/dashboard/useDashboard';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardStats from '../../components/dashboard/DashboardStats';
import DashboardUserRequests from '../../components/dashboard/DashboardUserRequests';
import DashboardHiredModal from '../../components/dashboard/DashboardHiredModal';
import DashboardSearchModal from '../../components/dashboard/DashboardSearchModal';
import logger from '../../utils/logger';

/**
 * Dashboard Component
 * Main dashboard screen for both Customer and Provider roles
 * Refactored to use extracted hooks and components
 */
const Dashboard = ({ navigation: propNavigation, route }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  // Use custom hook for all state management and business logic
  const {
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
  } = useDashboard();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDashboard();
    setRefreshing(false);
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <DashboardHeader
        user={user}
        unreadNotificationCount={unreadNotificationCount}
        onRefresh={refreshDashboard}
        onSearchPress={() => setShowSearchModal(true)}
        onNotificationsPress={() => navigation.navigate('Notifications')}
        onSettingsPress={() => navigation.navigate('Settings')}
        onProfilePress={() => navigation.navigate('Profile')}
        styles={styles}
      />

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* FICA Verification Banner - Show for unverified Expert users */}
        {user?.role === 'Expert' && (!user?.fica_verified || !user?.verified_by) && (
          <View style={styles.ficaBanner}>
            <View style={styles.ficaBannerHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#FF6B6B" />
              <Text style={styles.ficaBannerTitle}>
                {user?.id_upload && user?.self_upload ? 'Verification Pending' : 'Verify Your FICA'}
              </Text>
            </View>
            <Text style={styles.ficaBannerText}>
              {user?.id_upload && user?.self_upload 
                ? 'Your documents have been submitted and are pending admin verification. You will be able to view leads once verified.' 
                : 'In order for you to view leads, you need to submit the necessary documents for verification.'}
            </Text>
            {!user?.id_upload || !user?.self_upload ? (
              <TouchableOpacity 
                style={styles.ficaButton}
                onPress={() => navigation.navigate('FICAVerification')}
              >
                <Text style={styles.ficaButtonText}>Verify Now</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {user?.role === 'Customer' ? (
          // Customer Dashboard
          <>
            <DashboardUserRequests
              userRequests={userRequests}
              onCloseRequest={handleCloseRequest}
              onHiredSomeone={handleHiredSomeone}
              onCreateLead={() => navigation.navigate('CustomerCreateLead')}
              navigation={navigation}
              styles={styles}
            />
          </>
        ) : (
          // Provider Dashboard
          <>
            {/* Greeting Section */}
            <View style={styles.greetingSection}>
              <Text style={styles.greetingText}>
                {getGreeting()}, {user?.first_name || 'User'}!
              </Text>
              <Text style={styles.dateText}>{getCurrentDateTime()}</Text>
            </View>

            {/* Credits Balance */}
            <TouchableOpacity style={styles.creditsButton}>
              <Text style={styles.creditsText}>
                Balance: {dashboardData.credits} Credits
              </Text>
            </TouchableOpacity>

            {/* Dashboard Stats Cards */}
            <DashboardStats
              user={user}
              dashboardData={dashboardData}
              navigation={navigation}
              styles={styles}
            />
          </>
        )}
      </ScrollView>

      {/* Hired Someone Modal */}
      <DashboardHiredModal
        visible={showHiredModal}
        experts={experts}
        loadingExperts={loadingExperts}
        updatingStatus={updatingStatus}
        onClose={() => setShowHiredModal(false)}
        onSelectExpert={handleSelectExpert}
        styles={styles}
      />

      {/* Global Search Modal */}
      <DashboardSearchModal
        visible={showSearchModal}
        globalSearchQuery={globalSearchQuery}
        searchResults={searchResults}
        searching={searching}
        onClose={handleCloseSearchModal}
        onQueryChange={setGlobalSearchQuery}
        onSearch={performSearch}
        onNavigateToResult={navigateToResult}
        styles={styles}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    padding: 8,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 4,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profilePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8E2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  menuButton: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  // FICA Banner
  ficaBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  ficaBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ficaBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginLeft: 8,
  },
  ficaBannerText: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 12,
    lineHeight: 20,
  },
  ficaButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  ficaButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Customer Dashboard Styles
  createLeadButton: {
    backgroundColor: '#E8E2FF',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  createLeadButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  requestCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  requestDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  infoColumn: {
    flexDirection: 'column',
    marginBottom: 12,
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    flex: 1,
    flexWrap: 'wrap',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIconWrapper: {
    alignItems: 'center',
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIconBlue: {
    backgroundColor: '#42A5F5',
  },
  statusMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  statusTag: {
    backgroundColor: '#E8E2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 12,
  },
  statusTagBlue: {
    backgroundColor: '#E3F2FD',
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  statusTagTextBlue: {
    color: '#42A5F5',
  },
  actionLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  actionLink: {
    flex: 1,
  },
  actionLinkText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 12,
  },
  closedBadge: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  closedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // Provider Dashboard Styles
  greetingSection: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  creditsButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  creditsText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardsContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardLink: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  disabledCardMessage: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  disabledCardText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  modalFooterText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  expertOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  expertOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  expertDivider: {
    marginVertical: 12,
  },
  expertDividerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  noExpertsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  // Search Modal Styles
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  searchModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  searchModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    marginTop: 100,
    flex: 1,
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  searchModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchModalBody: {
    padding: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  searchSubmitButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchSubmitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  searchSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchResultsContainer: {
    maxHeight: 400,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  searchSection: {
    marginBottom: 24,
  },
  searchSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  searchResultContent: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  searchResultDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  searchResultMeta: {
    fontSize: 12,
    color: '#999',
  },
});

export default Dashboard;
