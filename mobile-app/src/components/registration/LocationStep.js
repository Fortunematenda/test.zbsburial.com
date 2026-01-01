import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator } from 'react-native-paper';
import logger from '../../utils/logger';

/**
 * LocationStep Component
 * Step 2: Location selection for both customers and providers
 */
const LocationStep = ({
  userType,
  location,
  setLocation,
  gettingLocation,
  getCurrentLocation,
  prevStep,
  nextStep,
  styles,
}) => {
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const GOOGLE_PLACES_API_KEY = 'AIzaSyA_Qd54wgjWo4t-Klmi3m_pz8HbHz0GQto';

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
          const postalCodeComponent = data.result.address_components.find(
            comp => comp.types.includes('postal_code') || comp.types.includes('postal_code_prefix')
          );
          
          if (postalCodeComponent) {
            extractedZipCode = postalCodeComponent.long_name || postalCodeComponent.short_name || '';
          }
        }
        
        // Fallback: Try to extract zip code from secondary text
        if (!extractedZipCode && prediction.structured_formatting?.secondary_text) {
          const secondaryText = prediction.structured_formatting.secondary_text;
          const zipCodeMatch = secondaryText.match(/\b\d{4}\b/);
          if (zipCodeMatch) {
            extractedZipCode = zipCodeMatch[0];
          }
        }

        setLocation(prev => ({
          ...prev,
          address: prediction.description || prediction.structured_formatting?.main_text || '',
          latitude: data.result.geometry.location.lat.toString(),
          longitude: data.result.geometry.location.lng.toString(),
          zipCode: extractedZipCode || prev.zipCode,
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

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.sectionSubtitle}>
          {userType === 'provider' ? 'Where do you want to receive leads from?' : 'Where are you located?'}
        </Text>
        
        <View style={{ position: 'relative' }}>
          <TextInput
            label="Address"
            mode="outlined"
            value={location.address}
            onChangeText={handleAddressChange}
            onFocus={() => {
              if (addressSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            style={styles.input}
            multiline
            placeholder="Start typing your address..."
          />
          
          {loadingSuggestions && (
            <View style={{ position: 'absolute', right: 10, top: 15 }}>
              <ActivityIndicator size="small" color="#8B5CF6" />
            </View>
          )}

          {showSuggestions && addressSuggestions.length > 0 && (
            <View style={suggestionStyles.suggestionsContainer}>
              {addressSuggestions.map((item) => (
                <TouchableOpacity
                  key={item.place_id}
                  style={suggestionStyles.suggestionItem}
                  onPress={() => selectAddress(item)}
                >
                  <Text style={suggestionStyles.suggestionMainText}>
                    {item.structured_formatting?.main_text || item.description}
                  </Text>
                  {item.structured_formatting?.secondary_text && (
                    <Text style={suggestionStyles.suggestionSecondaryText}>
                      {item.structured_formatting.secondary_text}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {userType === 'provider' && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceLabel}>Distance (Kilometers)</Text>
            <View style={styles.distanceButtons}>
              {['50', '20', '10', '0'].map((dist) => (
                <TouchableOpacity
                  key={dist}
                  style={[
                    styles.distanceButton,
                    location.distance === dist && styles.distanceButtonSelected,
                  ]}
                  onPress={() => setLocation(prev => ({ ...prev, distance: dist }))}
                >
                  <Text
                    style={[
                      styles.distanceButtonText,
                      location.distance === dist && styles.distanceButtonTextSelected,
                    ]}
                  >
                    {dist === '0' ? 'Any' : `${dist} km`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TextInput
          label="Zip Code (Optional)"
          mode="outlined"
          value={location.zipCode}
          onChangeText={(text) => setLocation(prev => ({ ...prev, zipCode: text }))}
          style={styles.input}
        />

        <TouchableOpacity 
          style={styles.locationButton}
          onPress={getCurrentLocation}
          disabled={gettingLocation}
        >
          {gettingLocation ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : (
            <Text style={styles.locationButtonText}>Use Current Location</Text>
          )}
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={prevStep} style={styles.backButton}>
            Back
          </Button>
          <Button mode="contained" onPress={nextStep} style={styles.nextButton}>
            Next
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const suggestionStyles = StyleSheet.create({
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
});

export default LocationStep;

