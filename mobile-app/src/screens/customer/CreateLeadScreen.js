import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { TextInput, Button, Card, RadioButton, Checkbox } from 'react-native-paper';
import { useQueryClient } from 'react-query';
import ApiService from '../../services/ApiService';
import Toast from 'react-native-toast-message';
import logger from '../../utils/logger';

const CreateLeadScreen = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Service Selection
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  
  // Step 2: Location
  const [location, setLocation] = useState({
    address: '',
    latitude: '',
    longitude: '',
    zipCode: '',
  });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Step 3: Service Questions
  const [serviceQuestions, setServiceQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // Step 4: Description & Photos
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  
  // Step 5: Budget & Urgency
  const [budget, setBudget] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [hiringDecision, setHiringDecision] = useState(false);

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await ApiService.get('/all-services');
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      logger.error('Error loading services:', error);
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Failed to load services',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    }
  };

  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: '',
          text2: 'Location permission is required',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      setLocation(prev => ({
        ...prev,
        address: `${geocode.street || ''} ${geocode.city || ''} ${geocode.region || ''} ${geocode.country || ''}`.trim(),
        latitude: loc.coords.latitude.toString(),
        longitude: loc.coords.longitude.toString(),
        zipCode: geocode.postalCode || '',
      }));
      setShowSuggestions(false);
    } catch (error) {
      logger.error('Error getting location:', error);
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Failed to get location',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setGettingLocation(false);
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
      const apiKey = 'AIzaSyA_Qd54wgjWo4t-Klmi3m_pz8HbHz0GQto';
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:za&key=${apiKey}`;
      
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
      const apiKey = 'AIzaSyA_Qd54wgjWo4t-Klmi3m_pz8HbHz0GQto';
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.result && data.result.geometry) {
        // Extract zip code from address components
        let extractedZipCode = '';
        
        if (data.result.address_components) {
          // Try to find postal_code
          const postalCodeComponent = data.result.address_components.find(
            comp => comp.types.includes('postal_code') || comp.types.includes('postal_code_prefix')
          );
          
          if (postalCodeComponent) {
            extractedZipCode = postalCodeComponent.long_name || postalCodeComponent.short_name || '';
          }
        }
        
        // Fallback: Try to extract zip code from secondary text (format: "City, Province ZipCode")
        if (!extractedZipCode && prediction.structured_formatting?.secondary_text) {
          const secondaryText = prediction.structured_formatting.secondary_text;
          // South African zip codes are typically 4 digits
          const zipCodeMatch = secondaryText.match(/\b\d{4}\b/);
          if (zipCodeMatch) {
            extractedZipCode = zipCodeMatch[0];
          }
        }
        
        // Fallback: Try to extract from full description
        if (!extractedZipCode && prediction.description) {
          const zipCodeMatch = prediction.description.match(/\b\d{4}\b/);
          if (zipCodeMatch) {
            extractedZipCode = zipCodeMatch[0];
          }
        }

        setLocation(prev => ({
          ...prev,
          address: prediction.description,
          latitude: data.result.geometry.location.lat.toString(),
          longitude: data.result.geometry.location.lng.toString(),
          zipCode: extractedZipCode || prev.zipCode,
        }));
        setShowSuggestions(false);
        setAddressSuggestions([]);
      }
    } catch (error) {
      logger.error('Error getting place details:', error);
      // Fallback: try to extract zip code from prediction text
      let extractedZipCode = '';
      if (prediction.description) {
        const zipCodeMatch = prediction.description.match(/\b\d{4}\b/);
        if (zipCodeMatch) {
          extractedZipCode = zipCodeMatch[0];
        }
      }
      
      setLocation(prev => ({
        ...prev,
        address: prediction.description,
        zipCode: extractedZipCode || prev.zipCode,
      }));
      setShowSuggestions(false);
      setAddressSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const loadServiceQuestions = async (serviceId) => {
    setLoadingQuestions(true);
    try {
      const response = await ApiService.post('/service-questions', { service_id: serviceId });
      if (response.success && response.questions) {
        setServiceQuestions(response.questions);
      }
    } catch (error) {
      logger.error('Error loading service questions:', error);
      setServiceQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const nextStep = async () => {
    // Step 0 -> 1: Load questions if service selected
    if (currentStep === 0 && selectedService) {
      await loadServiceQuestions(selectedService);
    }
    
    // Validate location on step 1
    if (currentStep === 1) {
      if (!location.address || location.address.trim() === '') {
        Toast.show({
          type: 'error',
          text1: '',
          text2: 'Please enter an address or use your current location',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
        return;
      }
      
      if (!location.zipCode || location.zipCode.trim() === '') {
        Toast.show({
          type: 'error',
          text1: '',
          text2: 'Please enter a zip code',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
        return;
      }
      
      // If no questions, skip step 2 (questions step)
      if (serviceQuestions.length === 0) {
        setCurrentStep(3); // Skip to description step
        return;
      }
    }
    
    // Validate all questions are answered on step 2
    if (currentStep === 2 && serviceQuestions.length > 0) {
      const allQuestionsAnswered = serviceQuestions.every(q => {
        return questionAnswers[q.question_id] && questionAnswers[q.question_id].trim() !== '';
      });
      
      if (!allQuestionsAnswered) {
        Toast.show({
          type: 'error',
          text1: '',
          text2: 'Please answer all questions before proceeding',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
        return;
      }
    }
    
    const maxSteps = serviceQuestions.length > 0 ? 5 : 4;
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0] && result.assets[0].base64) {
        const base64String = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const newImage = {
          uri: result.assets[0].uri,
          base64: base64String,
        };
        setImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      logger.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Failed to pick image',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const submitData = {
        title: services.find(s => s.id === selectedService)?.service_name || 'Service Request',
        description: description || 'N/A',
        category: services.find(s => s.id === selectedService)?.service_name || 'General',
        budget: budget || '0',
        location: location.address || 'Not specified',
        urgency: urgent ? 'Urgent' : 'Normal',
        images: images.map(img => img.base64).filter(img => img), // Filter out any null/undefined
        questionAnswers: questionAnswers, // Add service questions and answers
      };

      const response = await ApiService.post('/leads', submitData);
      
      if (response.status === 'success') {
        // Invalidate and immediately refetch customer leads to show new lead instantly
        queryClient.invalidateQueries('customerLeads');
        queryClient.invalidateQueries('user-requests');
        
        // Immediately refetch to ensure data is fresh
        queryClient.refetchQueries('customerLeads');
        
        Toast.show({
          type: 'success',
          text1: '',
          text2: 'Your service request has been created successfully!',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2000,
        });
        
        // Navigate back to dashboard
        navigation.goBack();
        
        // Small delay to ensure navigation completes, then trigger refresh again
        setTimeout(() => {
          queryClient.invalidateQueries('customerLeads');
          queryClient.refetchQueries('customerLeads');
        }, 500);
      } else {
        Toast.show({
          type: 'error',
          text1: '',
          text2: response.message || 'Failed to create service request',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      logger.error('Error creating lead:', error);
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Failed to create service request. Please try again.',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep0 = () => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.sectionTitle}>What service do you need?</Text>
        <Text style={styles.sectionSubtitle}>Select the type of service you're looking for</Text>
        
        <TouchableOpacity
          style={styles.serviceSelector}
          onPress={() => setShowServiceModal(true)}
        >
          <Text style={styles.serviceSelectorText}>
            {selectedService ? services.find(s => s.id === selectedService)?.service_name : 'Select a service'}
          </Text>
          <Ionicons name="chevron-down" size={24} color="#8B5CF6" />
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backButton}>
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={nextStep} 
            style={styles.nextButton}
            disabled={!selectedService}
          >
            Next
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStep1 = () => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.sectionTitle}>Location</Text>
        
        <View style={styles.addressInputContainer}>
          <TextInput
            label="Address *"
            mode="outlined"
            value={location.address}
            onChangeText={handleAddressChange}
            onFocus={() => {
              if (location.address.length >= 3 && addressSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            style={styles.input}
            required
            right={
              loadingSuggestions && (
                <TextInput.Icon icon="loading" />
              )
            }
          />
          
          {showSuggestions && addressSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <ScrollView style={styles.suggestionsList} keyboardShouldPersistTaps="handled">
                {addressSuggestions.map((prediction, index) => (
                  <TouchableOpacity
                    key={prediction.place_id}
                    style={styles.suggestionItem}
                    onPress={() => selectAddress(prediction)}
                  >
                    <Ionicons name="location" size={20} color="#8B5CF6" style={styles.suggestionIcon} />
                    <View style={styles.suggestionTextContainer}>
                      <Text style={styles.suggestionMainText}>{prediction.structured_formatting.main_text}</Text>
                      <Text style={styles.suggestionSecondaryText}>{prediction.structured_formatting.secondary_text}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <TextInput
          label="Zip Code *"
          mode="outlined"
          value={location.zipCode}
          onChangeText={(text) => setLocation(prev => ({ ...prev, zipCode: text }))}
          style={styles.input}
          required
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
          <Button 
            mode="contained" 
            onPress={nextStep} 
            style={styles.nextButton}
            disabled={!location.address || location.address.trim() === '' || !location.zipCode || location.zipCode.trim() === ''}
          >
            Next
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStep2 = () => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.sectionTitle}>Service Details</Text>
        <Text style={styles.sectionSubtitle}>Please answer all questions to proceed</Text>
        
        {loadingQuestions ? (
          <ActivityIndicator size="large" color="#8B5CF6" style={{ marginVertical: 40 }} />
        ) : serviceQuestions.length > 0 ? (
          <>
            {serviceQuestions.map((q, index) => {
              const isAnswered = questionAnswers[q.question_id] && questionAnswers[q.question_id].trim() !== '';
              return (
                <View key={q.question_id} style={[styles.questionContainer, !isAnswered && styles.questionContainerUnanswered]}>
                  <Text style={[styles.questionTitle, !isAnswered && styles.questionTitleUnanswered]}>{q.question} *</Text>
                  <View style={styles.radioContainer}>
                    {q.answers.map((answer) => (
                      <TouchableOpacity
                        key={answer}
                        style={styles.radioItem}
                        onPress={() => setQuestionAnswers(prev => ({ ...prev, [q.question_id]: answer }))}
                        activeOpacity={0.7}
                      >
                        <RadioButton
                          value={answer}
                          status={questionAnswers[q.question_id] === answer ? 'checked' : 'unchecked'}
                          onPress={() => setQuestionAnswers(prev => ({ ...prev, [q.question_id]: answer }))}
                        />
                        <Text style={styles.radioLabel}>{answer}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
            
            <View style={styles.buttonContainer}>
              <Button mode="outlined" onPress={prevStep} style={styles.backButton}>
                Back
              </Button>
              <Button 
                mode="contained" 
                onPress={nextStep} 
                style={styles.nextButton}
                disabled={serviceQuestions.some(q => !questionAnswers[q.question_id] || questionAnswers[q.question_id].trim() === '')}
              >
                Next
              </Button>
            </View>
          </>
        ) : (
          <Button mode="contained" onPress={nextStep} style={styles.nextButton}>
            Next
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderStep3 = () => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.sectionTitle}>Project Details</Text>
        
        <TextInput
          label="Description"
          mode="outlined"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="Type brief description of the project"
        />

        <Text style={styles.sectionTitle}>Upload Photos (Optional)</Text>
        <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
          <Ionicons name="camera" size={24} color="#8B5CF6" />
          <Text style={styles.addImageText}>Add Photo</Text>
        </TouchableOpacity>

        {images.length > 0 && (
          <View style={styles.imagesContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#8B5CF6" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

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

  const renderStep4 = () => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.sectionTitle}>Budget & Timeline</Text>
        
        <TextInput
          label="Estimated Budget (e.g., R 500.00)"
          mode="outlined"
          value={budget}
          onChangeText={setBudget}
          style={styles.input}
          keyboardType="numeric"
          placeholder="R 0.00"
        />

        <View style={styles.checkboxContainer}>
          <Checkbox
            status={urgent ? 'checked' : 'unchecked'}
            onPress={() => setUrgent(!urgent)}
          />
          <Text style={styles.checkboxLabel}>Is it urgent?</Text>
        </View>

        <View style={styles.checkboxContainer}>
          <Checkbox
            status={hiringDecision ? 'checked' : 'unchecked'}
            onPress={() => setHiringDecision(!hiringDecision)}
          />
          <Text style={styles.checkboxLabel}>Ready to Hire?</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : 'Create Request'}
        </Button>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={prevStep} style={styles.backButton}>
            Back
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCurrentStep = () => {
    const maxSteps = serviceQuestions.length > 0 ? 5 : 4;
    
    switch(currentStep) {
      case 0: return renderStep0();
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep0();
    }
  };

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
        <Text style={styles.headerTitle}>Create Request</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.stepCounter}>
          Step {currentStep + 1} of {serviceQuestions.length > 0 ? '5' : '4'}
        </Text>
        
        {renderCurrentStep()}
      </ScrollView>

      {/* Service Selection Modal */}
      <Modal
        visible={showServiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowServiceModal(false)}
            >
              <Ionicons name="close" size={24} color="#8B5CF6" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Service</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceItem,
                  selectedService === service.id && styles.serviceItemSelected
                ]}
                onPress={() => {
                  setSelectedService(service.id);
                  setShowServiceModal(false);
                }}
              >
                <Text style={styles.serviceText}>{service.service_name}</Text>
                {selectedService === service.id && (
                  <Ionicons name="checkmark" size={24} color="#8B5CF6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
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
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#8B5CF6',
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
  stepCounter: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  serviceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 8,
    marginBottom: 20,
  },
  serviceSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  locationButton: {
    backgroundColor: '#F3F0FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  locationButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '500',
  },
  questionContainer: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  questionContainerUnanswered: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  questionTitleUnanswered: {
    color: '#FF4444',
  },
  radioContainer: {
    marginBottom: 24,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    paddingRight: 12,
    flex: 1,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 16,
  },
  addImageText: {
    marginLeft: 8,
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '500',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageItem: {
    position: 'relative',
    marginBottom: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    marginRight: 10,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    marginTop: 20,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancelButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  serviceItemSelected: {
    backgroundColor: '#F3F0FF',
  },
  serviceText: {
    fontSize: 16,
    color: '#333',
  },
  addressInputContainer: {
    position: 'relative',
    zIndex: 1,
    marginBottom: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
    marginTop: 4,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  suggestionSecondaryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default CreateLeadScreen;
