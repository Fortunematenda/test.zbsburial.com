import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Title, Paragraph, Chip, Button, ActivityIndicator } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import ApiService from '../../services/ApiService';
import logger from '../../utils/logger';
import Toast from 'react-native-toast-message';

// Helper function to format datetime for list view (relative if today, actual date if older)
const formatDateTimeForList = (dateString, relativeTime) => {
  if (!dateString) return relativeTime || 'N/A';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const leadDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // If posted today, show relative time
    if (leadDate.getTime() === today.getTime()) {
      return relativeTime || 'Today';
    }
    
    // If older than today, show actual date
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return relativeTime || dateString;
  }
};

// Helper function to format datetime for details view (always show actual time)
const formatDateTime = (dateString) => {
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
};

const ResponsesScreen = ({ navigation, route }) => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState(0); // 0 = all, 1 = pending, 2 = hired
  const [counts, setCounts] = useState({
    pending_count: 0,
    hired_count: 0,
    total_count: 0
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user && user.role === 'Expert' && user.fica_verified && user.verified_by) {
      loadResponses();
    }
  }, [filter, user]);

  const loadUserData = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      logger.error('Error loading user data:', error);
    }
  };

  // Handle navigation from lead contact - automatically open lead details
  // Only navigate if explicitly requested (e.g., from notification or deep link)
  useEffect(() => {
    if (route?.params?.leadId && route?.params?.autoNavigate === true) {
      // Navigate to lead details after a short delay to ensure responses are loaded
      const timer = setTimeout(() => {
        navigation.navigate('LeadDetails', { 
          leadId: route.params.leadId,
          customerName: route.params.customerName,
          customerEmail: route.params.customerEmail,
          customerPhone: route.params.customerPhone
        });
        // Clear the params after navigation to prevent re-navigation
        navigation.setParams({ leadId: undefined, autoNavigate: false });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [route?.params?.leadId, route?.params?.autoNavigate, navigation]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.responses.getUserResponses({
        page: 1,
        perPage: 20,
        filter: filter
      });
      
      // Handle desktop format response
      if (response.message === 'Successful' && response.leads) {
        const leadsArr = response.leads.leadsArr || [];
        setResponses(leadsArr);
        setCounts({
          pending_count: response.leads.pending_count || 0,
          hired_count: response.leads.hired_count || 0,
          total_count: response.leads.leads_count || 0
        });
      } else {
        setError(response.message || 'Failed to load responses');
      }
    } catch (error) {
      // Don't log 401 errors (user is logged out) as errors
      if (error.status === 401 || error.response?.status === 401) {
        // User is not authenticated, set empty responses
        setResponses([]);
        setError(null);
        return;
      }
      logger.error('Error loading responses:', error);
      setError(error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResponses();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#F59E0B';
      case 'Hired':
        return '#10B981';
      case 'Not Interested':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  // Filter responses based on search query
  const filteredResponses = useMemo(() => {
    if (!searchQuery.trim()) {
      return responses;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return responses.filter(response => {
      const firstName = (response.first_name || '').toLowerCase();
      const lastName = (response.last_name || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const serviceName = (response.service_name || '').toLowerCase();
      const description = (response.description || '').toLowerCase();
      const location = (response.location || '').toLowerCase();
      const status = (response.contacted_status || '').toLowerCase();
      
      return fullName.includes(query) || 
             firstName.includes(query) ||
             lastName.includes(query) ||
             serviceName.includes(query) || 
             description.includes(query) || 
             location.includes(query) ||
             status.includes(query);
    });
  }, [responses, searchQuery]);

  const handleStatusChange = (lead) => {
    setSelectedLead(lead);
    setShowStatusModal(true);
  };

  const updateStatus = async (newStatus) => {
    if (!selectedLead) return;
    
    try {
      setUpdatingStatus(true);
      const response = await ApiService.responses.updateContactStatus(
        selectedLead.lead_id,
        newStatus
      );
      
      if (response.status === 'success') {
        // Update local state
        const updatedResponses = responses.map(r => 
          r.lead_id === selectedLead.lead_id 
            ? { ...r, contacted_status: newStatus }
            : r
        );
        setResponses(updatedResponses);
        
        // Refresh counts
        await loadResponses();
        
        setShowStatusModal(false);
        setSelectedLead(null);
        
        Toast.show({
          type: 'success',
          text1: '',
          text2: 'Status updated successfully',
          position: 'top',
          topOffset: 100,
          visibilityTime: 1500,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: '',
          text2: response.message || 'Failed to update status',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      logger.error('Error updating status:', error);
      Toast.show({
        type: 'error',
        text1: '',
        text2: error.message || 'Failed to update status',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const renderResponseItem = ({ item }) => {
    // Ensure all values are strings or have fallbacks
    const firstName = item.first_name || 'Unknown';
    const lastName = item.last_name || 'User';
    const serviceName = item.service_name || 'Service';
    const description = item.description || 'No description available';
    const location = item.location || 'Unknown location';
    const credits = item.credits || 0;
    const time = item.time || 'Unknown time';
    const status = item.contacted_status || 'Unknown';
    const firstLetter = item.first_letter || 'U';

    return (
      <Card style={styles.responseCard}>
        <Card.Content>
          <View style={styles.responseHeader}>
            <View style={styles.customerInfo}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerAvatarText}>{firstLetter}</Text>
              </View>
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>
                  {firstName} {lastName}
                </Text>
                <Text style={styles.serviceName}>{serviceName}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => handleStatusChange(item)}
              style={[styles.statusChip, { backgroundColor: getStatusColor(status) }]}
            >
              <Text style={styles.statusText}>{status}</Text>
              <Ionicons name="chevron-down" size={16} color="white" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.description}>{description}</Text>
          
          <View style={styles.responseFooter}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color="#8B5CF6" />
              <Text style={styles.infoText}>{location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cash" size={16} color="#8B5CF6" />
              <Text style={styles.infoText}>{credits} Credits</Text>
            </View>
            {item.budget && (
              <View style={styles.infoRow}>
                <Ionicons name="wallet" size={16} color="#8B5CF6" />
                <Text style={styles.infoText}>
                  Budget: {item.budget.toString().replace(/\$/g, 'R')}
                </Text>
              </View>
            )}
            {item.contacted_datetime && (
              <View style={styles.infoRow}>
                <Ionicons name="person-add" size={16} color="#8B5CF6" />
                <Text style={styles.infoText}>Contacted: {formatDateTimeForList(item.contacted_datetime, item.contacted_time)}</Text>
              </View>
            )}
            {item.posted_datetime && (
              <View style={styles.infoRow}>
                <Ionicons name="time" size={16} color="#8B5CF6" />
                <Text style={styles.infoText}>Posted: {formatDateTimeForList(item.posted_datetime, item.time)}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.actionButtons}>
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('LeadDetails', { leadId: item.lead_id })}
              style={styles.viewButton}
              labelStyle={styles.viewButtonLabel}
            >
              <Text style={styles.viewButtonLabel}>View Details</Text>
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity 
        style={[styles.filterButton, filter === 0 && styles.activeFilter]}
        onPress={() => setFilter(0)}
      >
        <Text style={[styles.filterText, filter === 0 && styles.activeFilterText]}>
          All ({counts.total_count})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.filterButton, filter === 1 && styles.activeFilter]}
        onPress={() => setFilter(1)}
      >
        <Text style={[styles.filterText, filter === 1 && styles.activeFilterText]}>
          Pending ({counts.pending_count})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.filterButton, filter === 2 && styles.activeFilter]}
        onPress={() => setFilter(2)}
      >
        <Text style={[styles.filterText, filter === 2 && styles.activeFilterText]}>
          Hired ({counts.hired_count})
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
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
          <Text style={styles.headerTitle}>My Responses</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading responses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
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
          <Text style={styles.headerTitle}>My Responses</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ccc" />
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={loadResponses} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Check if user is Expert and not FICA verified (must be verified by admin)
  const isUnverifiedExpert = user?.role === 'Expert' && (!user?.fica_verified || !user?.verified_by);

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
        <Text style={styles.headerTitle}>My Responses</Text>
        <View style={styles.placeholder} />
      </View>

      {isUnverifiedExpert ? (
        <View style={styles.disabledContainer}>
          <Ionicons name="shield-checkmark-outline" size={80} color="#FF6B6B" />
          <Text style={styles.disabledTitle}>FICA Verification Required</Text>
          <Text style={styles.disabledText}>
            In order for you to view responses, you need to submit the necessary documents for verification.
          </Text>
          <TouchableOpacity 
            style={styles.verifyButton}
            onPress={() => navigation.navigate('FICAVerification')}
          >
            <Text style={styles.verifyButtonText}>Verify Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by customer name, service, location..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            {searchQuery.length > 0 && (
              <Text style={styles.searchResultsText}>
                {filteredResponses.length} result{filteredResponses.length !== 1 ? 's' : ''} found
              </Text>
            )}
          </View>

          {renderFilterButtons()}

      <FlatList
        data={filteredResponses}
        renderItem={renderResponseItem}
        keyExtractor={(item) => item.lead_id ? item.lead_id.toString() : Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={searchQuery ? "search-outline" : "chatbubbles-outline"} 
              size={64} 
              color="#ccc" 
            />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching responses found' : 'No responses found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? 'Try a different search term' 
                : 'You haven\'t contacted any leads yet. Start browsing available leads to send responses.'}
            </Text>
            {searchQuery ? (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            ) : (
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('Leads')}
                style={styles.browseLeadsButton}
                labelStyle={styles.browseLeadsButtonLabel}
              >
                <Text style={styles.browseLeadsButtonLabel}>Browse Available Leads</Text>
              </Button>
            )}
          </View>
        )}
      />
        </>
      )}

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Lead Status</Text>
            
            <TouchableOpacity
              style={[styles.statusOption, { backgroundColor: '#F59E0B' }]}
              onPress={() => updateStatus('Pending')}
              disabled={updatingStatus}
            >
              <Text style={styles.statusOptionText}>Pending</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusOption, { backgroundColor: '#10B981' }]}
              onPress={() => updateStatus('Hired')}
              disabled={updatingStatus}
            >
              <Text style={styles.statusOptionText}>Hired</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusOption, { backgroundColor: '#EF4444' }]}
              onPress={() => updateStatus('Not Interested')}
              disabled={updatingStatus}
            >
              <Text style={styles.statusOptionText}>Not Interested</Text>
            </TouchableOpacity>

            {updatingStatus && (
              <ActivityIndicator size="small" color="#8B5CF6" style={{ marginTop: 20 }} />
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowStatusModal(false)}
              disabled={updatingStatus}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchResultsText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginLeft: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#8B5CF6',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  responseCard: {
    marginBottom: 16,
    elevation: 2,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  responseFooter: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#8B5CF6',
    borderWidth: 1,
  },
  viewButtonLabel: {
    color: '#8B5CF6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
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
    color: 'red',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
  },
  retryButtonText: {
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  browseLeadsButton: {
    marginTop: 20,
    borderColor: '#8B5CF6',
    borderWidth: 1,
  },
  browseLeadsButtonLabel: {
    color: '#8B5CF6',
  },
  clearSearchButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  clearSearchText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFF',
  },
  disabledTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  disabledText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  verifyButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  statusOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResponsesScreen;