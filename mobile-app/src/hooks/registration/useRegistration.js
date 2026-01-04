import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import ApiService from '../../services/ApiService';
import { AuthService } from '../../services/AuthService';
import Toast from 'react-native-toast-message';
import logger from '../../utils/logger';

/**
 * Custom hook for managing registration state and logic
 * Extracted from RegisterScreen.js to improve maintainability
 */
export const useRegistration = (route, navigation, onLogin) => {
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // User type and step management
  const [userType, setUserType] = useState('customer');
  const [currentStep, setCurrentStep] = useState(2); // Start at step 2 (location)

  // Services
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Location
  const [location, setLocation] = useState({
    address: '',
    latitude: '',
    longitude: '',
    distance: '50', // Default distance for providers
    zipCode: '',
  });

  // Service questions (for customers)
  const [serviceQuestions, setServiceQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});

  // Lead data (for customers)
  const [leadDescription, setLeadDescription] = useState('');
  const [leadBudget, setLeadBudget] = useState('');
  const [leadUrgent, setLeadUrgent] = useState(false);
  const [leadHiringDecision, setLeadHiringDecision] = useState(false);

  // Load services on mount
  useEffect(() => {
    if (services.length === 0) {
      loadServices();
    }
  }, []);

  // Load service questions when a service is selected (for customers)
  useEffect(() => {
    if (userType === 'customer' && selectedServices.length > 0) {
      const serviceId = selectedServices[0];
      loadServiceQuestions(serviceId);
    }
  }, [userType, selectedServices]);

  // Handle prefillData from landing page and set initial step
  useEffect(() => {
    logger.log('🔍 RegisterScreen route params:', JSON.stringify(route?.params || {}, null, 2));
    
    // PRIORITY 1: Set user type from route params FIRST
    const routeUserType = route?.params?.userType;
    if (routeUserType) {
      logger.log('✅ Setting userType from route params:', routeUserType);
      setUserType(routeUserType);
    } else {
      logger.log('⚠️ No userType in route params, keeping default:', userType);
    }

    // PRIORITY 2: Set initial step if provided
    if (route?.params?.initialStep !== undefined) {
      setCurrentStep(route.params.initialStep);
      logger.log('✅ Starting at step:', route.params.initialStep);
    } else {
      setCurrentStep(2);
    }

    // PRIORITY 3: Handle prefillData
    const prefillData = route?.params?.prefillData;
    if (prefillData) {
      // Pre-fill service selection
      if (prefillData.serviceId && services.length > 0) {
        const service = services.find(s => s.id === prefillData.serviceId);
        if (service) {
          setSelectedServices([service.id]);
          logger.log('✅ Pre-filled service:', service.service_name);
        }
      }
      
      // Pre-fill location
      if (prefillData.location) {
        setLocation(prev => ({
          ...prev,
          address: prefillData.location,
          latitude: prefillData.latitude?.toString() || prev.latitude,
          longitude: prefillData.longitude?.toString() || prev.longitude,
        }));
        logger.log('✅ Pre-filled location:', prefillData.location);
      }
      
      // Auto-set user type to customer if service is selected and no explicit userType
      if (prefillData.serviceId && !routeUserType) {
        setUserType('customer');
        logger.log('✅ Auto-set user type to customer (no explicit userType in route)');
      } else if (prefillData.serviceId && routeUserType === 'provider') {
        logger.log('✅ Keeping user type as provider (explicitly set in route)');
      }
      
      // Pre-fill question answers
      if (prefillData.questionAnswers && Object.keys(prefillData.questionAnswers).length > 0) {
        setQuestionAnswers(prefillData.questionAnswers);
        logger.log('✅ Pre-filled question answers:', prefillData.questionAnswers);
        
        // Load questions for display
        if (prefillData.serviceId) {
          loadServiceQuestions(prefillData.serviceId).then((hasQuestions) => {
            if (hasQuestions) {
              logger.log('✅ Loaded service questions for display');
            }
          });
        }
      }
    }
    
    logger.log('🎯 Final userType state will be:', routeUserType || userType);
  }, [route?.params, services]);

  /**
   * Load all available services
   */
  const loadServices = useCallback(async () => {
    try {
      const response = await ApiService.get('/all-services');
      if (response.success) {
        setServices(response.data);
      }
    } catch (error) {
      logger.error('Error loading services:', error);
      // Set default services if API fails
      setServices([
        { id: 1, service_name: 'General Services' },
        { id: 2, service_name: 'Home Services' },
        { id: 3, service_name: 'Business Services' },
      ]);
    }
  }, []);

  /**
   * Load service-specific questions for customers
   */
  const loadServiceQuestions = useCallback(async (serviceId) => {
    try {
      setLoadingQuestions(true);
      const response = await ApiService.post('/service-questions', { service_id: serviceId });
      if (response.success && response.questions) {
        setServiceQuestions(response.questions);
        return response.questions.length > 0;
      }
      return false;
    } catch (error) {
      logger.error('Error loading service questions:', error);
      setServiceQuestions([]);
      return false;
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  /**
   * Get current location using device GPS
   */
  const getCurrentLocation = useCallback(async () => {
    try {
      setGettingLocation(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied', 
          'Location permission is required to get your current location. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        setGettingLocation(false);
        return;
      }

      // Get current location with better accuracy
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = currentLocation.coords;

      logger.log('📍 Got location coordinates:', { latitude, longitude });

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
        
        setLocation({
          address: fullAddress || '',
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          zipCode: address.postalCode || '',
        });
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
      setGettingLocation(false);
    }
  }, []);

  /**
   * Navigate to next step
   */
  const nextStep = useCallback(async (data = {}) => {
    // Steps: 2 (location) -> 3 (questions/company) -> 4 (description/personal) -> 5 (personal/password) -> 6 (password for customers)
    let maxSteps = userType === 'customer' ? 6 : 5;
    
    // For customers: if at step 2 and no questions, skip to step 4
    if (userType === 'customer' && currentStep === 2 && serviceQuestions.length === 0) {
      setCurrentStep(4);
      return;
    }
    
    // For customers at step 4, adjust max steps based on questions
    if (userType === 'customer' && currentStep === 4 && serviceQuestions.length === 0) {
      maxSteps = 5;
    }
    
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    }
  }, [userType, currentStep, serviceQuestions.length]);

  /**
   * Navigate to previous step
   */
  const prevStep = useCallback(() => {
    const minStep = route?.params?.initialStep || 2;
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1);
    } else if (currentStep === 2) {
      // At step 2, allow going back to landing page
      navigation.goBack();
    }
  }, [currentStep, route?.params?.initialStep, navigation]);

  /**
   * Submit registration
   */
  const submitRegistration = useCallback(async (formData) => {
    setIsLoading(true);
    try {
      const registrationData = {
        ...formData,
        role: userType === 'customer' ? 'Customer' : 'Expert',
        location: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        distance: userType === 'provider' ? location.distance : '0',
        zip_code: location.zipCode || '',
        services: selectedServices || [],
        // Provider company information
        ...(userType === 'provider' ? {
          company_name: formData.company_name || '',
          is_company_website: formData.is_company_website || '0',
          company_size: formData.company_size || '',
          is_company_sales_team: formData.is_company_sales_team || '0',
          is_company_social_media: formData.is_company_social_media || '0',
        } : {}),
        // Customer lead data
        ...(userType === 'customer' && selectedServices.length > 0 ? {
          service_question_answers: questionAnswers,
        } : {}),
      };

      const result = await AuthService.register(registrationData);
      
      if (result.success) {
        if (result.requiresOtp) {
          Toast.show({
            type: 'success',
            text1: '',
            text2: 'Please verify your email with the OTP sent',
            position: 'top',
            topOffset: 100,
            visibilityTime: 2000,
          });
          navigation.navigate('OTP', { 
            userId: result.user_id || result.user?.id,
            email: formData.email,
            ...(userType === 'customer' && selectedServices.length > 0 ? {
              leadData: {
                service_id: selectedServices[0],
                questions: questionAnswers,
                description: leadDescription || 'N/A',
                estimate_quote: leadBudget ? parseFloat(leadBudget.replace(/[^0-9.]/g, '')) : 0,
                urgent: leadUrgent ? 1 : 0,
                hiring_decision: leadHiringDecision ? 1 : 0,
              }
            } : {})
          });
        } else {
          Toast.show({
            type: 'success',
            text1: '',
            text2: 'Welcome! You are now logged in',
            position: 'top',
            topOffset: 100,
            visibilityTime: 1500,
          });
          onLogin(result.user);
        }
      } else {
        // Show professional, user-friendly error messages
        let errorTitle = 'Registration Failed';
        let errorMessage = result.message || 'Unable to create your account. Please try again.';
        
        // Map common error messages to user-friendly ones
        if (errorMessage.toLowerCase().includes('email') && 
            (errorMessage.toLowerCase().includes('already') || 
             errorMessage.toLowerCase().includes('taken') ||
             errorMessage.toLowerCase().includes('exists'))) {
          errorTitle = 'Email Already Registered';
          errorMessage = 'This email address is already in use. Please sign in or use a different email.';
        } else if (errorMessage.toLowerCase().includes('password')) {
          errorTitle = 'Password Error';
          if (errorMessage.toLowerCase().includes('match')) {
            errorMessage = 'Passwords do not match. Please ensure both password fields are identical.';
          } else if (errorMessage.toLowerCase().includes('length') || errorMessage.toLowerCase().includes('short')) {
            errorMessage = 'Password must be at least 8 characters long. Please choose a stronger password.';
          } else {
            errorMessage = 'Please check your password and try again.';
          }
        } else if (errorMessage.toLowerCase().includes('validation') || 
                   errorMessage.toLowerCase().includes('required')) {
          errorTitle = 'Missing Information';
          errorMessage = 'Please fill in all required fields and try again.';
        } else if (errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          errorTitle = 'Connection Error';
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (errorMessage.toLowerCase().includes('network')) {
          errorTitle = 'Network Error';
          errorMessage = 'Please check your internet connection and try again.';
        }
        
        Toast.show({
          type: 'error',
          text1: errorTitle,
          text2: errorMessage,
          position: 'top',
          topOffset: 100,
          visibilityTime: 4000,
        });
      }
    } catch (error) {
      // Handle unexpected errors with professional messages
      let errorTitle = 'Registration Error';
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message && error.message.includes('timeout')) {
        errorTitle = 'Connection Timeout';
        errorMessage = 'The request took too long. Please check your connection and try again.';
      } else if (error.message && error.message.includes('Network')) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect. Please check your internet connection.';
      }
      
      Toast.show({
        type: 'error',
        text1: errorTitle,
        text2: errorMessage,
        position: 'top',
        topOffset: 100,
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    userType,
    location,
    selectedServices,
    questionAnswers,
    leadDescription,
    leadBudget,
    leadUrgent,
    leadHiringDecision,
    navigation,
    onLogin,
  ]);

  return {
    // State
    isLoading,
    gettingLocation,
    loadingQuestions,
    userType,
    setUserType,
    currentStep,
    services,
    selectedServices,
    setSelectedServices,
    showServiceModal,
    setShowServiceModal,
    location,
    setLocation,
    serviceQuestions,
    questionAnswers,
    setQuestionAnswers,
    leadDescription,
    setLeadDescription,
    leadBudget,
    setLeadBudget,
    leadUrgent,
    setLeadUrgent,
    leadHiringDecision,
    setLeadHiringDecision,
    
    // Actions
    loadServices,
    loadServiceQuestions,
    getCurrentLocation,
    nextStep,
    prevStep,
    submitRegistration,
  };
};

