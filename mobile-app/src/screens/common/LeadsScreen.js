import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLeads } from '../../hooks/leads/useLeads';
import LeadCard from '../../components/leads/LeadCard';
import LeadsEmptyState from '../../components/leads/LeadsEmptyState';
import FICAVerificationPrompt from '../../components/leads/FICAVerificationPrompt';

/**
 * LeadsScreen Component
 * Displays available leads for providers or user requests for customers
 * Refactored to use extracted hooks and components
 */
const LeadsScreen = ({ navigation }) => {
  const {
    leads,
    loading,
    refreshing,
    user,
    isUnverifiedExpert,
    onRefresh,
    handleQuickUnlock,
    unlockingLeadId,
  } = useLeads(navigation);

  const [searchQuery, setSearchQuery] = useState('');

  // Determine header title based on user role
  const headerTitle = user?.role === 'Customer' ? 'My Leads' : 'Available Leads';

  // Filter leads based on search query
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) {
      return leads;
    }

    const query = searchQuery.toLowerCase().trim();
    return leads.filter(lead => {
      const title = (lead.title || '').toLowerCase();
      const description = (lead.description || '').toLowerCase();
      const location = (lead.location || '').toLowerCase();
      const serviceName = (lead.category || '').toLowerCase();
      const userName = (lead.user?.name || '').toLowerCase();

      return (
        title.includes(query) ||
        description.includes(query) ||
        location.includes(query) ||
        serviceName.includes(query) ||
        userName.includes(query)
      );
    });
  }, [leads, searchQuery]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading leads...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={styles.placeholder} />
      </View>
      
      {isUnverifiedExpert ? (
        <FICAVerificationPrompt 
          onVerify={() => navigation.navigate('FICAVerification')}
        />
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by service, location, description..."
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
                {filteredLeads.length} result{filteredLeads.length !== 1 ? 's' : ''} found
              </Text>
            )}
          </View>

          <ScrollView 
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead, index) => (
                <LeadCard 
                  key={`lead-${lead.id}-${index}`} 
                  lead={lead}
                  navigation={navigation}
                  unlockingLeadId={unlockingLeadId}
                  onUnlock={handleQuickUnlock}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                {searchQuery ? (
                  <>
                    <Ionicons name="search-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyStateTitle}>No results found</Text>
                    <Text style={styles.emptyStateText}>
                      Try adjusting your search terms
                    </Text>
                  </>
                ) : (
                  <LeadsEmptyState />
                )}
              </View>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LeadsScreen;
