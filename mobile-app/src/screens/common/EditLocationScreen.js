import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import ApiService from '../../services/ApiService';
import logger from '../../utils/logger';
import Toast from 'react-native-toast-message';

const GOOGLE_PLACES_API_KEY = 'AIzaSyA_Qd54wgjWo4t-Klmi3m_pz8HbHz0GQto';

const EditLocationScreen = ({ navigation, onRefreshUserData }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState({
    address: '',
    latitude: '',
    longitude: '',
    distance: '50',
  });
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const distanceOptions = [
    { value: '10', label: '10 km' },
    { value: '20', label: '20 km' },
    { value: '50', label: '50 km' },
    { value: '0', label: 'Unlimited' },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setUser(user);
        setLocation({
          address: user.location || '',
          latitude: user.latitude || '',
          longitude: user.longitude || '',
          zip_code: user.zip_code || '',
          distance: user.distance || '50',
        });
      }
    } catch (error) {
      logger.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddressSuggestions = async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:za&key=${GOOGLE_PLACES_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.predictions) {
        setAddressSuggestions(data.predictions);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      logger.error('Error fetching address suggestions:', error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddressChange = (text) => {
    setLocation(prev => ({ ...prev, address: text }));
    fetchAddressSuggestions(text);
  };

  const selectAddress = async (prediction) => {
    try {
      setLoadingSuggestions(true);
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${GOOGLE_PLACES_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.result && data.result.geometry) {
        // Extract zip code from address components
        let extractedZipCode = '';
        if (data.result.address_components) {
          for (const component of data.result.address_components) {
            if (component.types.includes('postal_code')) {
              extractedZipCode = component.long_name || component.short_name || '';
              break;
            }
          }
        }
        
        setLocation(prev => ({
          ...prev,
          address: prediction.description || prediction.structured_formatting?.main_text || '',
          latitude: data.result.geometry.location.lat.toString(),
          longitude: data.result.geometry.location.lng.toString(),
          zip_code: extractedZipCode,
        }));
        
        setShowSuggestions(false);
        setAddressSuggestions([]);
      }
    } catch (error) {
      logger.error('Error fetching address details:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoadingSuggestions(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied', 
          'Location permission is required to get your current location. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        setLoadingSuggestions(false);
        return;
      }

      // Get current location with better accuracy options
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = currentLocation.coords;

      logger.log('📍 Got location coordinates:', { latitude, longitude });

      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      logger.log('📍 Reverse geocode response:', addressResponse);

      if (addressResponse && addressResponse.length > 0) {
        const address = addressResponse[0];
        // Build a more complete address
        const addressParts = [];
        if (address.street) addressParts.push(address.street);
        if (address.streetNumber) addressParts.push(address.streetNumber);
        if (address.city) addressParts.push(address.city);
        if (address.region) addressParts.push(address.region);
        if (address.postalCode) addressParts.push(address.postalCode);
        if (address.country) addressParts.push(address.country);
        
        const fullAddress = addressParts.length > 0 
          ? addressParts.join(', ')
          : `${address.street || ''} ${address.city || ''} ${address.region || ''} ${address.country || ''}`.trim();
        
        logger.log('📍 Setting location:', { fullAddress, latitude, longitude, postalCode: address.postalCode });
        
        setLocation(prev => ({
          ...prev,
          address: fullAddress || prev.address,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          zip_code: address.postalCode || prev.zip_code || '',
        }));
        
        // Show success feedback
        Alert.alert('Success', 'Your location has been set successfully!');
      } else {
        // If no address found, at least set the coordinates
        logger.warn('📍 No address found, setting coordinates only');
        setLocation(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));
        Alert.alert(
          'Location Set', 
          'Coordinates retrieved but address not found. Please enter your address manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      logger.error('Error getting location:', error);
      Alert.alert(
        'Error', 
        `Failed to get your current location: ${error.message || 'Unknown error'}. Please enter it manually.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const saveLocation = async () => {
    try {
      if (!location.address || !location.latitude || !location.longitude) {
        Alert.alert('Error', 'Please enter your location or use current location.');
        return;
      }

      setSaving(true);
      
      // Prepare location data with correct field names for API
      // Only include zip_code if it has a value (don't send empty string)
      const locationData = {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        distance: location.distance || '50', // Ensure distance is always sent
      };
      
      // Only add zip_code if it's not empty
      if (location.zip_code && location.zip_code.trim() !== '') {
        locationData.zip_code = location.zip_code.trim();
      }
      
      logger.log('📍 Saving location data:', locationData);
      
      const response = await ApiService.location.updateUserLocation(locationData);
      
      if (response.success) {
        // Refresh user data in the app
        if (onRefreshUserData) {
          await onRefreshUserData();
        }
        
        // Reload user data from storage to reflect updates
        loadUserData();
        
        Toast.show({
          type: 'success',
          text1: '',
          text2: `Location and radius (${location.distance === '0' ? 'Unlimited' : location.distance + ' km'}) updated successfully`,
          position: 'top',
          topOffset: 100,
          visibilityTime: 1500,
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to update location',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      logger.error('Error saving location:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update location',
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
          <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.headerTitle}>Location & Radius</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveLocation}
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
        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Location</Text>
          <Text style={styles.sectionSubtitle}>
            This helps customers find you and determines which leads you'll receive.
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={styles.textInput}
                value={location.address}
                onChangeText={handleAddressChange}
                onFocus={() => {
                  if (addressSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Start typing your address..."
                multiline
              />
              
              {loadingSuggestions && (
                <View style={{ position: 'absolute', right: 10, top: 15 }}>
                  <ActivityIndicator size="small" color="#8B5CF6" />
                </View>
              )}

              {showSuggestions && addressSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {addressSuggestions.map((item) => (
                    <TouchableOpacity
                      key={item.place_id}
                      style={styles.suggestionItem}
                      onPress={() => selectAddress(item)}
                    >
                      <Text style={styles.suggestionMainText}>
                        {item.structured_formatting?.main_text || item.description}
                      </Text>
                      {item.structured_formatting?.secondary_text && (
                        <Text style={styles.suggestionSecondaryText}>
                          {item.structured_formatting.secondary_text}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={loadingSuggestions}
          >
            {loadingSuggestions ? (
              <ActivityIndicator size="small" color="#8B5CF6" />
            ) : (
              <Ionicons name="location" size={20} color="#8B5CF6" />
            )}
            <Text style={styles.locationButtonText}>
              {loadingSuggestions ? 'Getting Location...' : 'Use Current Location'}
            </Text>
          </TouchableOpacity>

          <View style={styles.coordinatesContainer}>
            <View style={styles.coordinateInput}>
              <Text style={styles.inputLabel}>Latitude</Text>
              <TextInput
                style={styles.textInput}
                value={location.latitude}
                onChangeText={(text) => setLocation(prev => ({ ...prev, latitude: text }))}
                placeholder="Latitude"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.coordinateInput}>
              <Text style={styles.inputLabel}>Longitude</Text>
              <TextInput
                style={styles.textInput}
                value={location.longitude}
                onChangeText={(text) => setLocation(prev => ({ ...prev, longitude: text }))}
                placeholder="Longitude"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Coverage Radius Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coverage Radius</Text>
          <Text style={styles.sectionSubtitle}>
            How far are you willing to travel for jobs? This determines which leads you'll see.
          </Text>
          
          {user?.role === 'Expert' || user?.role === 'Provider' ? (
            <View style={styles.radiusContainer}>
              {distanceOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.radiusOption,
                    location.distance === option.value && styles.radiusOptionSelected
                  ]}
                  onPress={() => {
                    logger.log('📍 Coverage radius selected:', option.value);
                    setLocation(prev => ({ ...prev, distance: option.value }));
                  }}
                >
                  <View style={styles.radiusContent}>
                    <View style={styles.radiusIcon}>
                      <Ionicons 
                        name={location.distance === option.value ? "radio-button-on" : "radio-button-off"} 
                        size={20} 
                        color={location.distance === option.value ? "#8B5CF6" : "#ccc"} 
                      />
                    </View>
                    <Text style={[
                      styles.radiusText,
                      location.distance === option.value && styles.radiusTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#8B5CF6" />
              <Text style={styles.infoBoxText}>
                Coverage radius is only available for service providers. As a customer, you can see all available providers.
              </Text>
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={20} color="#8B5CF6" />
            <Text style={styles.infoText}>
              Your location helps customers find you in their area
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={20} color="#8B5CF6" />
            <Text style={styles.infoText}>
              Larger radius means more leads but longer travel distances
            </Text>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    minHeight: 48,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F0FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  locationButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '500',
    marginLeft: 8,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  radiusContainer: {
    marginTop: 10,
  },
  radiusOption: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  radiusOptionSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#8B5CF6',
  },
  radiusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  radiusIcon: {
    marginRight: 12,
  },
  radiusText: {
    fontSize: 16,
    color: '#333',
  },
  radiusTextSelected: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionMainText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  suggestionSecondaryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F0FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default EditLocationScreen;
