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
import ApiService from '../../services/ApiService';
import logger from '../../utils/logger';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ProviderLandingPageScreen = ({ navigation }) => {
  const [serviceText, setServiceText] = useState('');
  const [allServices, setAllServices] = useState([]);
  const [serviceSuggestions, setServiceSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceId, setServiceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const isSelectingRef = useRef(false);
  const serviceInputRef = useRef(null);
  const [isServiceInputFocused, setIsServiceInputFocused] = useState(false);
  
  // Animated text state
  const phrases = ['Get High-Quality Leads, Fast!', 'Secure Jobs Instantly', 'Grow Your Business'];
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
  ];

  // Load all services on mount
  useEffect(() => {
    let isMounted = true;
    const loadServices = async () => {
      try {
        setLoadingServices(true);
        const response = await ApiService.get('/all-services');
        if (isMounted && response.success && response.data) {
          setAllServices(response.data);
        }
      } catch (error) {
        logger.error('Error loading services:', error);
        if (isMounted) {
          setAllServices([]);
        }
      } finally {
        if (isMounted) {
          setLoadingServices(false);
        }
      }
    };
    loadServices();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter services as user types (client-side filtering)
  useEffect(() => {
    if (selectedService) {
      setServiceSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    if (serviceText.trim().length > 0 && allServices.length > 0) {
      const filtered = allServices
        .filter((service) => {
          const serviceName = service.service_name || service.name || '';
          return serviceName
            .toLowerCase()
            .includes(serviceText.toLowerCase());
        })
        .slice(0, 10);
      
      setServiceSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setServiceSuggestions([]);
      setShowSuggestions(false);
    }
  }, [serviceText, allServices, selectedService]);

  // Animated text effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (isDeleting) {
        if (charIndexRef.current > 0) {
          setDisplayText(phrases[currentPhraseIndex].substring(0, charIndexRef.current - 1));
          charIndexRef.current--;
        } else {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      } else {
        if (charIndexRef.current < phrases[currentPhraseIndex].length) {
          setDisplayText(phrases[currentPhraseIndex].substring(0, charIndexRef.current + 1));
          charIndexRef.current++;
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, [currentPhraseIndex, isDeleting, phrases]);

  // Handle service selection
  const handleServiceSelect = (service) => {
    isSelectingRef.current = true;
    
    const serviceId = service.id;
    const serviceName = service.service_name || service.name || '';
    
    setServiceText(serviceName);
    setServiceId(serviceId);
    setSelectedService(service);
    
    setServiceSuggestions([]);
    setShowSuggestions(false);
    
    if (isServiceInputFocused && serviceInputRef.current) {
      setTimeout(() => {
        serviceInputRef.current.blur();
        setTimeout(() => {
          isSelectingRef.current = false;
        }, 300);
      }, 150);
    } else {
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 400);
    }
  };

  // Handle get started button
  const handleGetStarted = () => {
    if (!selectedService || !serviceId) {
      Alert.alert(
        'Service Required',
        'Please select a service to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Navigate to register screen starting at step 2 (location)
    navigation.navigate('Register', {
      userType: 'provider',
      initialStep: 2, // Start at step 2 (location) - step 0 and step 1 removed
      prefillData: {
        serviceId: serviceId,
        serviceName: selectedService.service_name || selectedService.name || serviceText,
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
        {/* Hamburger Menu - Top Right */}
        <View style={styles.topNav}>
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

          {showMenu && (
            <>
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
                    navigation.navigate('Landing');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuItemText}>Looking for Services</Text>
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
              Secure jobs and grow your business
            </Text>
            
            <View style={styles.animatedTextContainer}>
              <Text style={styles.animatedText}>
                {displayText}
              </Text>
            </View>
          </View>

          {/* Service Search Section */}
          <View style={styles.searchSection}>
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
                  placeholder="Enter your service"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  value={serviceText}
                  onChangeText={(text) => {
                    setServiceText(text);
                    if (selectedService) {
                      setSelectedService(null);
                      setServiceId(null);
                    }
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
                    if (allServices.length > 0 && serviceText.length > 0 && !selectedService) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    setIsServiceInputFocused(false);
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
                            isSelectingRef.current = true;
                          }}
                          onPress={() => {
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
            </View>

            {/* Get Started Button */}
            <TouchableOpacity
              style={[styles.getStartedButton, (!selectedService || loading) && styles.getStartedButtonDisabled]}
              onPress={handleGetStarted}
              disabled={!selectedService || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#4F21A1" />
              ) : (
                <>
                  <Ionicons name="search" size={20} color="#4F21A1" />
                  <Text style={styles.getStartedButtonText}>Get Started</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Image Section */}
          <View style={styles.imageSection}>
            <Image
              source={require('../../../assets/333.png')}
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
              style={styles.logoScroll}
              contentContainerStyle={styles.logoScrollContent}
            >
              {companyLogos.map((logo, index) => (
                <Image
                  key={index}
                  source={logo}
                  style={styles.logo}
                  resizeMode="contain"
                />
              ))}
            </ScrollView>
          </View>

          {/* Everything You Need Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Everything You Need</Text>
            <Text style={styles.featuresSubtitle}>
              Whether you're a small business or a large enterprise, we provide all the essential tools to help you get hired.
            </Text>
          </View>

          {/* Beyond Expectations Section */}
          <View style={styles.beyondSection}>
            <Text style={styles.beyondTitle}>Beyond Expectations</Text>
            <Text style={styles.beyondSubtitle}>
              Professional solutions designed to connect you with the right clients
            </Text>
          </View>
        </ScrollView>
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
    marginTop: 60,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  animatedTextContainer: {
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    textAlign: 'center',
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
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  getStartedButton: {
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
  getStartedButtonDisabled: {
    opacity: 0.5,
  },
  getStartedButtonText: {
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
    alignItems: 'center',
    marginBottom: 40,
  },
  trustedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  logoScroll: {
    width: '100%',
  },
  logoScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 60,
  },
  featuresSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  beyondSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  beyondTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  beyondSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 26,
  },
});

export default ProviderLandingPageScreen;

