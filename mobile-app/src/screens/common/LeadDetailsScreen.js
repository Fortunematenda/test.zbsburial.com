import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLeadDetails } from '../../hooks/leadDetails/useLeadDetails';
import LeadInfoSection from '../../components/leadDetails/LeadInfoSection';
import LeadImagesSection from '../../components/leadDetails/LeadImagesSection';
import LeadStatsSection from '../../components/leadDetails/LeadStatsSection';
import LeadTimeInfoSection from '../../components/leadDetails/LeadTimeInfoSection';
import ProviderActionsSection from '../../components/leadDetails/ProviderActionsSection';
import CustomerStatusSection from '../../components/leadDetails/CustomerStatusSection';
import logger from '../../utils/logger';

/**
 * Unified LeadDetailsScreen Component
 * Consolidates LeadDetailsScreen.js (provider) and CustomerLeadDetailsScreen.js (customer)
 * Uses role-based rendering to show appropriate UI for each user type
 */
const LeadDetailsScreen = ({ route, navigation }) => {
  // Safety checks
  if (!route || !route.params) {
    logger.error('LeadDetailsScreen: Invalid route or params');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ccc" />
          <Text style={styles.errorText}>Invalid route parameters</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { leadId } = route.params || {};
  const [refreshing, setRefreshing] = useState(false);
  
  // Use custom hook for all state management and business logic
  const {
    lead,
    loading,
    error,
    isProvider,
    isCustomer,
    selectedImage,
    showImageModal,
    loadLeadDetails,
    unlockCustomerInfo,
    contactLead,
    setSelectedImage,
    setShowImageModal,
    getServiceDetails,
    getStatusColor,
    getStatusText,
    formatImageUrl,
    formatDateTime,
  } = useLeadDetails(leadId);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeadDetails();
    setRefreshing(false);
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>
            {isCustomer ? 'Loading request details...' : 'Loading lead details...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ccc" />
          <Text style={styles.errorText}>
            {isCustomer ? 'Error Loading Request' : 'Error Loading Lead'}
          </Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadLeadDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No lead state
  if (!lead) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ccc" />
          <Text style={styles.errorText}>
            {isCustomer ? 'Request not found' : 'Lead not found'}
          </Text>
          <Text style={styles.errorSubtext}>
            {isCustomer 
              ? 'This request may have been removed.'
              : 'This lead may have been removed or you may not have access to it.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const serviceDetails = getServiceDetails();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isCustomer ? 'Request Details' : 'Lead Details'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Customer Status Section (only for customers) */}
        {isCustomer && (
          <CustomerStatusSection
            lead={lead}
            leadId={leadId}
            navigation={navigation}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            styles={styles}
          />
        )}

        {/* Lead Info Section (shared) */}
        <LeadInfoSection
          lead={lead}
          serviceDetails={serviceDetails}
          styles={styles}
        />

        {/* Provider Actions Section (only for providers) */}
        {isProvider && (
          <ProviderActionsSection
            lead={lead}
            leadId={leadId}
            navigation={navigation}
            unlockCustomerInfo={unlockCustomerInfo}
            contactLead={contactLead}
            styles={styles}
          />
        )}

        {/* Images Section (shared) */}
        <LeadImagesSection
          lead={lead}
          formatImageUrl={formatImageUrl}
          onImagePress={(imageUrl) => {
            setSelectedImage(imageUrl);
            setShowImageModal(true);
          }}
          styles={styles}
        />

        {/* Stats Section (shared) */}
        <LeadStatsSection
          lead={lead}
          styles={styles}
        />

        {/* Time Info Section (shared) */}
        <LeadTimeInfoSection
          lead={lead}
          formatDateTime={formatDateTime}
          styles={styles}
        />
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.previewModalOverlay}>
          <View style={styles.previewModalContent}>
            <TouchableOpacity
              style={styles.previewCloseButton}
              onPress={() => setShowImageModal(false)}
            >
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewModalImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#8B5CF6',
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Status styles (for customers)
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    height: 40,
  },
  statusBadgeClickable: {
    height: 40,
    opacity: 0.9,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Card styles
  card: {
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  serviceName: {
    fontSize: 16,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  detailItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  detailAnswer: {
    fontSize: 14,
    color: '#666',
  },
  // Image styles
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  // Stats styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  // Time info styles
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  // Customer card styles (for providers)
  customerCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  customerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  contactInfo: {
    marginTop: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  verifiedText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  unlockSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  unlockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  unlockText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  unlockButtonText: {
    marginLeft: 8,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactActionsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  contactActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  contactActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  contactActionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E9ECEF',
  },
  contactActionText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  contactButtonText: {
    marginLeft: 8,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noCustomerInfo: {
    alignItems: 'center',
    padding: 20,
  },
  noCustomerText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  // Modal styles
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModalContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  previewModalImage: {
    width: '100%',
    height: '100%',
  },
});

export default LeadDetailsScreen;

