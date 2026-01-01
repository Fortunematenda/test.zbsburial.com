import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RadioButton } from 'react-native-paper';
import { Modal } from 'react-native';
import ApiService from '../../services/ApiService';
import * as Location from 'expo-location';
import logger from '../../utils/logger';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LandingPageScreen = ({ navigation }) => {
  const [serviceText, setServiceText] = useState('');
  const [locationText, setLocationText] = useState('');
  const [allServices, setAllServices] = useState([]);
  const [serviceSuggestions, setServiceSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceId, setServiceId] = useState(null); // Store service ID separately like desktop
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [showMenu, setShowMenu] = useState(false); // Hamburger menu state
  const [showQuestions, setShowQuestions] = useState(false); // Show questions modal
  const [serviceQuestions, setServiceQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  // Location autocomplete state
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [loadingLocationSuggestions, setLoadingLocationSuggestions] = useState(false);
  const isSelectingRef = useRef(false); // Track service selection to prevent blur interference
  const serviceInputRef = useRef(null); // Reference to service TextInput
  const [isServiceInputFocused, setIsServiceInputFocused] = useState(false); // Track if input is focused
  
  // Animated text state
  const phrases = ['Find Trusted Experts Instantly!', 'Get Instant Quotes', 'Hire with Confidence'];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState(phrases[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const charIndexRef = useRef(0);

  // Company logos for marquee
  const companyLogos = [
    require('../../../assets/bluedoglogo.png'),
    require('../../../assets/Genius.png'),
    require('../../../assets/LevelUp.png'),
    require('../../../assets/Scoutbird.png'),
    require('../../../assets/Mobiosoft.png'),
    require('../../../assets/RocketDigital.png'),
    require('../../../assets/Shopido.png'),
  ];

  // Service category images
  const serviceImages = [
    { source: require('../../../assets/electrician.jpg'), title: 'Electrician' },
    { source: require('../../../assets/handyman.jpg'), title: 'Handyman' },
    { source: require('../../../assets/wifitech.jpg'), title: 'WiFi Tech' },
  ];

  // Animated text effect
  useEffect(() => {
    const typeEffect = () => {
      const currentPhrase = phrases[currentPhraseIndex];
      
      if (isDeleting) {
        charIndexRef.current--;
        if (charIndexRef.current < 0) {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          charIndexRef.current = 0;
          return;
        }
      } else {
        charIndexRef.current++;
        if (charIndexRef.current > currentPhrase.length) {
          setTimeout(() => setIsDeleting(true), 2000);
          return;
        }
      }
      
      setDisplayText(currentPhrase.substring(0, charIndexRef.current));
    };

    const interval = setInterval(typeEffect, isDeleting ? 50 : 100);
    return () => clearInterval(interval);
  }, [currentPhraseIndex, isDeleting]);

  // Load all services on mount with retry logic (non-blocking)
  useEffect(() => {
    let isMounted = true;
    
    const loadAllServices = async (retryCount = 0) => {
      const MAX_RETRIES = 1; // Reduced to 1 retry (2 total attempts)
      const RETRY_DELAY = 2000; // 2 second delay
      const TIMEOUT = 8000; // 8 seconds timeout

      try {
        if (retryCount === 0) {
          setLoadingServices(true);
          // Log API URL for debugging (only on first attempt)
          logger.log('🔍 Attempting to load services from:', '/all-services');
        }
        
        // Use a shorter timeout for services endpoint
        const apiCall = ApiService.get('/all-services');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Service request timeout')), TIMEOUT)
        );
        
        const response = await Promise.race([apiCall, timeoutPromise]);
        
        if (retryCount === 0) {
          logger.log('✅ Services loaded successfully');
        }
        
        // Check if component is still mounted before updating state
        if (!isMounted) return;
        
        // Handle different response structures
        if (response && Array.isArray(response)) {
          setAllServices(response);
        } else if (response && response.success && Array.isArray(response.data)) {
          setAllServices(response.data);
        } else if (response && Array.isArray(response.data)) {
          setAllServices(response.data);
        } else {
          setAllServices([]);
        }
        
        setLoadingServices(false);
      } catch (error) {
        // Log the actual error for debugging
        if (retryCount === 0) {
          logger.error('❌ Service load error:', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url || '/all-services'
          });
        }
        
        // Retry if we haven't exceeded max retries
        if (retryCount < MAX_RETRIES && isMounted) {
          logger.log(`Retrying service load (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
          setTimeout(() => {
            if (isMounted) {
              loadAllServices(retryCount + 1);
            }
          }, RETRY_DELAY);
          return;
        } else {
          // Max retries exceeded, log final error
          if (isMounted) {
            logger.error('Failed to load services after all retries:', error.message);
            setAllServices([]);
            setLoadingServices(false);
            // Silently continue - service autocomplete is optional
          }
        }
      }
    };

    // Start loading services in background (non-blocking)
    loadAllServices();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter services as user types (client-side filtering)
  useEffect(() => {
    // Don't show suggestions if a service is already selected
    if (selectedService) {
      setServiceSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    if (serviceText.trim().length > 0 && allServices.length > 0) {
      const filtered = allServices
        .filter((service) => {
          // Handle both service_name and name fields
          const serviceName = service.service_name || service.name || '';
          return serviceName
            .toLowerCase()
            .includes(serviceText.toLowerCase());
        })
        .slice(0, 10); // Limit to 10 results
      
      setServiceSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setServiceSuggestions([]);
      setShowSuggestions(false);
    }
  }, [serviceText, allServices, selectedService]);

  // Get user location
  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use your current location. Please enable it in settings.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      
      // Reverse geocode to get address
      let address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (address.length > 0) {
        const addr = address[0];
        const locationString = `${addr.street || ''} ${addr.city || ''} ${addr.region || ''} ${addr.country || ''}`.trim();
        // Fill location when user explicitly clicks location button (like desktop)
        setLocationText(locationString || 'South Africa');
      }
    } catch (error) {
      logger.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Failed to get your current location. Please enter it manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Don't auto-fill location on mount - let user choose or click button

  // Handle service selection - match desktop behavior
  const handleServiceSelect = (service) => {
    // Ensure flag is set (in case onPressIn didn't fire)
    isSelectingRef.current = true;
    
    // Immediately update state like desktop - no delays or refs needed
    const serviceId = service.id;
    const serviceName = service.service_name || service.name || '';
    
    // Set both service text and ID (like desktop #serviceTxt and #serviceID)
    setServiceText(serviceName);
    setServiceId(serviceId);
    setSelectedService(service);
    
    // Clear suggestions immediately (like desktop #inner-service.empty())
    setServiceSuggestions([]);
    setShowSuggestions(false);
    
    // Don't blur if keyboard is already dismissed - this causes the issue
    // Only blur if keyboard is visible (input is focused)
    if (isServiceInputFocused && serviceInputRef.current) {
      // Delay blur slightly to ensure onPress completes
      setTimeout(() => {
        serviceInputRef.current.blur();
        // Reset flag after blur completes
        setTimeout(() => {
          isSelectingRef.current = false;
        }, 300);
      }, 150);
    } else {
      // Keyboard already dismissed, just reset flag after a moment
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 400);
    }
  };

  // Fetch location autocomplete suggestions
  const fetchLocationSuggestions = async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    try {
      setLoadingLocationSuggestions(true);
      const apiKey = 'AIzaSyA_Qd54wgjWo4t-Klmi3m_pz8HbHz0GQto';
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:za&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.predictions) {
        setLocationSuggestions(data.predictions);
        setShowLocationSuggestions(true);
      } else {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    } catch (error) {
      logger.error('Error fetching location suggestions:', error);
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    } finally {
      setLoadingLocationSuggestions(false);
    }
  };

  // Select location from autocomplete
  const selectLocation = async (prediction) => {
    try {
      setLoadingLocationSuggestions(true);
      const apiKey = 'AIzaSyA_Qd54wgjWo4t-Klmi3m_pz8HbHz0GQto';
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.result && data.result.geometry) {
        setLocationText(prediction.description);
        setLatitude(data.result.geometry.location.lat);
        setLongitude(data.result.geometry.location.lng);
        setShowLocationSuggestions(false);
        setLocationSuggestions([]);
      }
    } catch (error) {
      logger.error('Error getting place details:', error);
      // Fallback: still set the address text
      setLocationText(prediction.description);
      setShowLocationSuggestions(false);
      setLocationSuggestions([]);
    } finally {
      setLoadingLocationSuggestions(false);
    }
  };

  // Load service questions
  const loadServiceQuestions = async (serviceId) => {
    setLoadingQuestions(true);
    try {
      const response = await ApiService.post('/service-questions', { service_id: serviceId });
      if (response.success && response.questions) {
        const questions = response.questions;
        setServiceQuestions(questions);
        setLoadingQuestions(false);
        return questions.length > 0;
      }
      setServiceQuestions([]);
      setLoadingQuestions(false);
      return false;
    } catch (error) {
      logger.error('Error loading service questions:', error);
      setServiceQuestions([]);
      setLoadingQuestions(false);
      return false;
    }
  };

  // Handle search button press
  const handleSearch = async () => {
    // Require service selection (check both selectedService and serviceId like desktop checks #serviceID)
    if (!selectedService || !serviceId) {
      Alert.alert(
        'Service Required',
        'Please select a service from the suggestions list. Type a few letters to see available services.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!locationText || locationText.trim().length === 0) {
      Alert.alert(
        'Location Required',
        'Please enter a location or use the location button to get your current location.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      // Load questions for the selected service (use serviceId like desktop uses #serviceID)
      const hasQuestions = await loadServiceQuestions(serviceId);
      
      if (hasQuestions) {
        // Show questions modal
        setShowQuestions(true);
      } else {
        // No questions, navigate directly to register at step 4
        navigateToRegister();
      }
    } catch (error) {
      logger.error('Error loading questions:', error);
      // If questions fail to load, proceed anyway
      navigateToRegister();
    } finally {
      setLoading(false);
    }
  };

  // Handle questions completion and navigate to register
  const handleQuestionsComplete = () => {
    // Validate all questions are answered
    if (serviceQuestions.length > 0) {
      const allQuestionsAnswered = serviceQuestions.every(q => {
        return questionAnswers[q.question_id] && questionAnswers[q.question_id].trim() !== '';
      });

      if (!allQuestionsAnswered) {
        Alert.alert(
          'All Questions Required',
          'Please answer all questions before proceeding.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setShowQuestions(false);
    navigateToRegister();
  };

  // Navigate to Register starting at step 4
  const navigateToRegister = () => {
    const serviceName = selectedService?.service_name || selectedService?.name || serviceText;
    
    navigation.navigate('Register', {
      initialStep: 4, // Start at step 4 (description/budget)
      prefillData: {
        serviceId: serviceId || selectedService?.id,
        serviceName: serviceName,
        location: locationText,
        latitude: latitude?.toString() || '',
        longitude: longitude?.toString() || '',
        questionAnswers: questionAnswers, // Pass question answers
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={['#000000', '#200D42', '#4F21A1', '#A46EDB']}
        locations={[0, 0.34, 0.65, 0.82]}
        style={styles.container}
      >
        {/* Top Navigation - Sign In Button and Menu */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          <View style={{ marginLeft: 10 }} />
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenu(!showMenu)}
            activeOpacity={0.7}
          >
            {showMenu ? (
              <Ionicons name="close" size={24} color="#FFFFFF" />
            ) : (
              <Ionicons name="menu" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            {/* Overlay to close menu when clicking outside */}
            <Pressable
              style={styles.menuOverlay}
              onPress={() => setShowMenu(false)}
            />
            <View style={styles.menuDropdown}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  navigation.navigate('Login');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemLast]}
                onPress={() => {
                  setShowMenu(false);
                  navigation.navigate('ProviderLanding');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>Join As Pro</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.mainTitle}>
            Get the Best Services,{'\n'}Hassle-Free!
          </Text>
          
          <View style={styles.animatedTextContainer}>
            <Text style={styles.animatedText}>
              {displayText}
            </Text>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          {/* Service Search */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons 
                name="search" 
                size={24} 
                color="#FFFFFF" 
                style={styles.searchIcon}
              />
              <TextInput
                ref={serviceInputRef}
                style={styles.searchInput}
                placeholder="Service you're looking for?"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={serviceText}
                onChangeText={(text) => {
                  setServiceText(text);
                  // Clear selection and ID when user types (like desktop - resets on keyup)
                  if (selectedService) {
                    setSelectedService(null);
                    setServiceId(null);
                  }
                  // Show suggestions when typing (like desktop keyup on #serviceTxt)
                  // Only show if no service is currently selected
                  if (text.length > 0 && allServices.length > 0 && !selectedService) {
                    setShowSuggestions(true);
                  } else {
                    setShowSuggestions(false);
                    if (!selectedService) {
                      setServiceSuggestions([]);
                    }
                  }
                }}
                onFocus={() => {
                  setIsServiceInputFocused(true);
                  // Show suggestions if there's text and no service is selected (like desktop)
                  if (allServices.length > 0 && serviceText.length > 0 && !selectedService) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setIsServiceInputFocused(false);
                  // Delay check to allow onPress to complete first
                  // Only hide if user didn't just click a suggestion
                  setTimeout(() => {
                    if (!isSelectingRef.current) {
                      setShowSuggestions(false);
                    }
                  }, 300);
                }}
              />
              {loadingServices && (
                <ActivityIndicator 
                  size="small" 
                  color="#FFFFFF" 
                  style={styles.loadingIndicator}
                />
              )}
            </View>
            
            {/* Service Suggestions Dropdown */}
            {showSuggestions && serviceSuggestions.length > 0 && !selectedService && (
              <View style={styles.suggestionsContainer}>
                <ScrollView 
                  nestedScrollEnabled={true}
                  style={styles.suggestionsScrollView}
                  keyboardShouldPersistTaps="handled"
                  bounces={false}
                >
                  {serviceSuggestions.map((service) => {
                    const isSelected = serviceId === service.id;
                    return (
                      <TouchableOpacity
                        key={service.id}
                        style={[
                          styles.suggestionItem,
                          isSelected && styles.suggestionItemSelected,
                        ]}
                        onPressIn={() => {
                          // Set flag immediately on press start to prevent blur interference
                          isSelectingRef.current = true;
                        }}
                        onPress={() => {
                          // Desktop behavior: immediate update, clear list, hide dropdown
                          handleServiceSelect(service);
                        }}
                        activeOpacity={0.7}
                        delayPressIn={0}
                        delayPressOut={0}
                      >
                        <Text style={styles.suggestionText}>
                          {service.service_name || service.name || 'Unknown Service'}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color="#4F21A1" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
            
            {/* Show message if no services loaded */}
            {!loadingServices && allServices.length === 0 && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Services will be available shortly. You can still continue.
                </Text>
              </View>
            )}
          </View>

          {/* Location Search */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons 
                name="location" 
                size={24} 
                color="#FFFFFF" 
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Enter location in SA"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={locationText}
                onChangeText={(text) => {
                  // Allow user to type freely and fetch autocomplete
                  setLocationText(text);
                  fetchLocationSuggestions(text);
                }}
                onFocus={() => {
                  // Show suggestions if there's text
                  if (locationText.length >= 3 && locationSuggestions.length > 0) {
                    setShowLocationSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Hide suggestions after a brief delay
                  setTimeout(() => {
                    setShowLocationSuggestions(false);
                  }, 200);
                }}
                autoComplete="off"
                textContentType="none"
              />
              {loadingLocationSuggestions && (
                <ActivityIndicator 
                  size="small" 
                  color="#FFFFFF" 
                  style={styles.loadingIndicator}
                />
              )}
              <TouchableOpacity 
                onPress={getCurrentLocation}
                style={styles.locationButton}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="locate" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
            
            {/* Location Suggestions Dropdown */}
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <ScrollView 
                  nestedScrollEnabled={true}
                  style={styles.suggestionsScrollView}
                  keyboardShouldPersistTaps="always"
                  bounces={false}
                >
                  {locationSuggestions.map((prediction, index) => (
                    <TouchableOpacity
                      key={prediction.place_id || index}
                      style={styles.suggestionItem}
                      onPress={() => selectLocation(prediction)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="location" size={16} color="#4F21A1" style={{ marginRight: 8 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionText}>
                          {prediction.structured_formatting?.main_text || prediction.description}
                        </Text>
                        {prediction.structured_formatting?.secondary_text && (
                          <Text style={styles.suggestionSecondaryText}>
                            {prediction.structured_formatting.secondary_text}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={[styles.searchButton, (!selectedService || !locationText || loading) && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={!selectedService || !locationText || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#4F21A1" />
            ) : (
              <>
                <Ionicons name="search" size={20} color="#4F21A1" />
                <Text style={styles.searchButtonText}>Search</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Image Section */}
        <View style={styles.imageSection}>
          <Image
            source={require('../../../assets/digital_marketing.png')}
            style={styles.mainImage}
            resizeMode="contain"
          />
        </View>

        {/* Trusted By Section */}
        <View style={styles.trustedSection}>
          <Text style={styles.trustedTitle}>
            Trusted By The Best Organisations in South Africa
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.marqueeContainer}
            contentContainerStyle={styles.marqueeContent}
          >
            {[...companyLogos, ...companyLogos].map((logo, index) => (
              <Image
                key={index}
                source={logo}
                style={styles.companyLogo}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresGrid}>
            {serviceImages.map((item, index) => (
              <View key={index} style={styles.featureImageContainer}>
                <Image
                  source={item.source}
                  style={styles.featureImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Beyond Expectations Section */}
        <View style={styles.beyondSection}>
          <Text style={styles.beyondTitle}>Beyond Expectations</Text>
          <Text style={styles.beyondSubtitle}>
            Professional solutions designed to connect you with the right experts
          </Text>
        </View>

      </ScrollView>

      {/* Questions Modal */}
      <Modal
        visible={showQuestions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuestions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Service Details</Text>
              <TouchableOpacity
                onPress={() => setShowQuestions(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {loadingQuestions ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#8B5CF6" />
                  <Text style={styles.loadingText}>Loading questions...</Text>
                </View>
              ) : serviceQuestions.length > 0 ? (
                <>
                  <Text style={styles.modalSubtitle}>
                    Please answer all questions to proceed
                  </Text>
                  {serviceQuestions.map((q, index) => {
                    const isAnswered = questionAnswers[q.question_id] && questionAnswers[q.question_id].trim() !== '';
                    return (
                      <View 
                        key={q.question_id} 
                        style={[
                          styles.questionCard,
                          !isAnswered && styles.questionCardUnanswered
                        ]}
                      >
                        <Text style={[
                          styles.questionTitle,
                          !isAnswered && styles.questionTitleUnanswered
                        ]}>
                          {q.question} *
                        </Text>
                        <View style={styles.radioContainer}>
                          {q.answers.map((answer) => (
                            <TouchableOpacity
                              key={answer}
                              style={styles.radioItem}
                              onPress={() => setQuestionAnswers(prev => ({ 
                                ...prev, 
                                [q.question_id]: answer 
                              }))}
                              activeOpacity={0.7}
                            >
                              <RadioButton
                                value={answer}
                                status={questionAnswers[q.question_id] === answer ? 'checked' : 'unchecked'}
                                onPress={() => setQuestionAnswers(prev => ({ 
                                  ...prev, 
                                  [q.question_id]: answer 
                                }))}
                                color="#8B5CF6"
                              />
                              <Text style={styles.radioLabel}>{answer}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </>
              ) : (
                <View style={styles.noQuestionsContainer}>
                  <Text style={styles.noQuestionsText}>
                    No questions for this service
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowQuestions(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleQuestionsComplete}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topNav: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  menuOverlay: {
    position: 'absolute',
    top: -50,
    left: -SCREEN_WIDTH,
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT * 2,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  menuDropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 160,
    paddingVertical: 4,
    marginTop: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1001,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 50,
  },
  animatedTextContainer: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    // Using a bright color that stands out - gradient text would require a library
    color: '#FFDD99',
  },
  searchSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  searchContainer: {
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 60,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    padding: 0,
  },
  loadingIndicator: {
    marginLeft: 10,
  },
  locationButton: {
    padding: 5,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 65,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    maxHeight: 200,
    zIndex: 1000,
    marginTop: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  suggestionsScrollView: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionItemSelected: {
    backgroundColor: 'rgba(79, 33, 161, 0.3)',
    borderLeftWidth: 3,
    borderLeftColor: '#4F21A1',
  },
  suggestionItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.8,
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  suggestionSecondaryText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 10,
    gap: 8,
    minWidth: 150,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    color: '#4F21A1',
    fontSize: 18,
    fontWeight: '600',
  },
  imageSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  mainImage: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
  },
  trustedSection: {
    width: '100%',
    marginBottom: 40,
    alignItems: 'center',
  },
  trustedTitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  marqueeContainer: {
    width: '100%',
  },
  marqueeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  companyLogo: {
    width: 100,
    height: 40,
    marginHorizontal: 20,
  },
  featuresSection: {
    width: '100%',
    marginBottom: 40,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  featureImageContainer: {
    width: (SCREEN_WIDTH - 60) / 3,
    height: (SCREEN_WIDTH - 60) / 3,
    borderWidth: 4,
    borderColor: '#A855F7',
    borderRadius: 10,
    overflow: 'hidden',
  },
  featureImage: {
    width: '100%',
    height: '100%',
  },
  beyondSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  beyondTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  beyondSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 26,
  },
  errorContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.9,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  questionCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  questionCardUnanswered: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF9E6',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  questionTitleUnanswered: {
    color: '#FF9800',
  },
  radioContainer: {
    gap: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  noQuestionsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#666666',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LandingPageScreen;

