import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import ApiService from '../../services/ApiService';
import logger from '../../utils/logger';
import Toast from 'react-native-toast-message';

const EditServicesScreen = ({ navigation, onRefreshUserData }) => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [userServices, setUserServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    loadUserData();
    loadServices();
  }, []);

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

  const loadServices = async () => {
    try {
      setLoading(true);
      
      // Load all available services
      const response = await ApiService.get('/all-services');
      if (response.success && response.data) {
        setServices(response.data);
      } else {
        logger.error('Unexpected response format:', response);
        Alert.alert('Error', 'Failed to load services');
        return;
      }
      
      // Always load user's current services directly from database
      try {
        const profileResponse = await ApiService.user.getProfile();
        if (profileResponse.success && profileResponse.data) {
          // Set services from database
          if (profileResponse.data.services && Array.isArray(profileResponse.data.services)) {
            setUserServices(profileResponse.data.services);
          }
          
          // Update SecureStore with fresh data from database
          await SecureStore.setItemAsync('user_data', JSON.stringify(profileResponse.data));
        }
      } catch (err) {
        logger.error('Error loading user services from database:', err);
      }
    } catch (error) {
      logger.error('Error loading services:', error);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (serviceId) => {
    setUserServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const addService = (serviceId) => {
    if (userServices.length >= 5) {
      Alert.alert('Limit Reached', 'You can only select up to 5 services');
      return;
    }
    setUserServices(prev => [...prev, serviceId]);
    setDropdownVisible(false);
  };

  const removeService = (serviceId) => {
    setUserServices(prev => prev.filter(id => id !== serviceId));
  };

  // Get available services (services not already selected)
  const getAvailableServices = () => {
    return services.filter(service => !userServices.includes(service.id));
  };

  // Get selected services with full details
  const getSelectedServices = () => {
    return services.filter(service => userServices.includes(service.id));
  };

  const saveServices = async () => {
    try {
      setSaving(true);
      const response = await ApiService.services.updateUserServices(userServices);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: '',
          text2: 'Services updated successfully',
          position: 'top',
          topOffset: 100,
          visibilityTime: 1500,
        });
        
        // Update user data with the saved services immediately
        if (user) {
          const updatedUser = {
            ...user,
            services: userServices
          };
          await SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
        }
        
        // Don't refresh from server - the upload response is sufficient
        // Refresh would overwrite the services array if server omits it
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: '',
          text2: response.message || 'Failed to update services',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      logger.error('Error saving services:', error);
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Failed to update services',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Services</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveServices}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Services ({userServices.length}/5)</Text>
          <Text style={styles.sectionSubtitle}>
            Add services you offer to customers. This helps match you with relevant leads.
          </Text>
          
          {/* Selected Services */}
          {getSelectedServices().map((service) => (
            <View key={service.id} style={styles.selectedServiceItem}>
              <View style={styles.serviceContent}>
                <View style={styles.serviceIcon}>
                  <Ionicons name="briefcase" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.serviceText}>
                  <Text style={styles.serviceNameSelected}>
                    {service.service_name}
                  </Text>
                  {service.description && (
                    <Text style={styles.serviceDescription}>
                      {service.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeService(service.id)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Add Service Button / Dropdown */}
          {userServices.length < 5 && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setDropdownVisible(true)}
            >
              <Ionicons name="add-circle" size={24} color="#8B5CF6" />
              <Text style={styles.addButtonText}>Add Service</Text>
            </TouchableOpacity>
          )}

          {userServices.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No services selected</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap "Add Service" to get started
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Service</Text>
              <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={getAvailableServices()}
              keyExtractor={(item, index) => `service-${item.id}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalServiceItem}
                  onPress={() => addService(item.id)}
                >
                  <View style={styles.serviceIcon}>
                    <Ionicons name="briefcase" size={24} color="#666" />
                  </View>
                  <View style={styles.serviceText}>
                    <Text style={styles.serviceName}>{item.service_name}</Text>
                    {item.description && (
                      <Text style={styles.serviceDescription}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="add" size={20} color="#8B5CF6" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.modalEmptyState}>
                  <Text style={styles.modalEmptyText}>No more services available</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 20,
    lineHeight: 20,
  },
  selectedServiceItem: {
    backgroundColor: '#F3F0FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0FF',
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceText: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  serviceNameSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  removeButton: {
    marginLeft: 16,
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalServiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalEmptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EditServicesScreen;
