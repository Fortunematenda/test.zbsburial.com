import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { Card, Title, Paragraph, Chip, FAB } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../services/ApiService';
import logger from '../../utils/logger';

const CustomerLeads = ({ navigation }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLeads();
  }, []);

  // Only refresh if data is stale (older than 10 seconds) to prevent excessive API calls
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  
  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now();
      const shouldRefresh = !lastRefreshTime || (now - lastRefreshTime) > 10000; // 10 seconds
      
      if (shouldRefresh) {
        loadLeads().then(() => setLastRefreshTime(Date.now()));
      }
    }, [lastRefreshTime])
  );

  const loadLeads = async () => {
    setLoading(true);
    try {
      // Use real API call to get user's leads
      const response = await ApiService.get('/user-requests');
      if (response.status === 'success' && response.data) {
        setLeads(response.data);
      } else {
        logger.log('No user requests found');
        setLeads([]);
      }
    } catch (error) {
      logger.error('Error loading leads:', error);
      Alert.alert('Error', 'Failed to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeads();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA726';
      case 'in_progress': return '#42A5F5';
      case 'completed': return '#66BB6A';
      case 'cancelled': return '#EF5350';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  // Filter leads based on search query
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) {
      return leads;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return leads.filter(lead => {
      const title = (lead.title || '').toLowerCase();
      const description = (lead.description || '').toLowerCase();
      const category = (lead.category || lead.service_name || '').toLowerCase();
      const location = (lead.location || '').toLowerCase();
      const status = getStatusText(lead.status).toLowerCase();
      
      return title.includes(query) || 
             description.includes(query) || 
             category.includes(query) || 
             location.includes(query) ||
             status.includes(query);
    });
  }, [leads, searchQuery]);

  const renderLead = ({ item }) => (
    <Card style={styles.leadCard}>
      <Card.Content>
        <View style={styles.leadHeader}>
          <Title style={styles.leadTitle}>{item.title}</Title>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusText}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>
        
        <Paragraph style={styles.leadDescription}>
          {item.description}
        </Paragraph>
        
        <View style={styles.leadFooter}>
          <Text style={styles.serviceType}>{item.service_type}</Text>
          <Text style={styles.date}>{item.created_at}</Text>
        </View>
      </Card.Content>
      
      <Card.Actions>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('CustomerLeadsDetails', { leadId: item.id })}
        >
          <Ionicons name="eye" size={16} color="#8B5CF6" />
          <Text style={styles.actionText}>View Details</Text>
        </TouchableOpacity>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Requests</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search requests by title, description, category..."
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
      
      <FlatList
        data={filteredLeads}
        renderItem={renderLead}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={searchQuery ? "search-outline" : "list-outline"} 
              size={64} 
              color="#9E9E9E" 
            />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching requests found' : 'No leads found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? 'Try a different search term' 
                : 'Create your first service request'}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        color="#FFFFFF"
        onPress={() => navigation.navigate('CustomerLeadsCreateLead')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#8B5CF6',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  listContainer: {
    padding: 16,
  },
  leadCard: {
    marginBottom: 16,
    elevation: 2,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leadTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leadDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceType: {
    fontSize: 12,
    color: '#FF2D20',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    marginLeft: 4,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
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
  },
  clearSearchButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#8B5CF6',
  },
});

export default CustomerLeads;
