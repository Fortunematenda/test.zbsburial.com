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
  Easing,
  Dimensions,
  ActivityIndicator,
  Alert,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
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
  // Animated text state - matching web landing page exactly
  const phrases = ['High-Quality Leads', 'Unlock Growth', 'Boost Your Business'];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const charIndexRef = useRef(0);

  // Company logos for marquee
  const companyLogos = [
    require('../../../assets/bluedoglogo.png'),
    require('../../../assets/Genius.png'),
    require('../../../assets/LevelUp.png'),
    require('../../../assets/Scoutbird.png'),
  ];

  // Service category images
  const serviceImages = [
    { source: require('../../../assets/electrician.jpg'), title: 'Electrician' },
    { source: require('../../../assets/handyman.jpg'), title: 'Handyman' },
    { source: require('../../../assets/wifitech.jpg'), title: 'WiFi Tech' },
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

  // Animated text effect - matching web landing page exactly
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

  // Stars animation - exactly matching web CSS: sparkle 20s ease-in-out infinite
  // 0%, 100%: translate(0, 0); 50%: translate(-50px, -50px)
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Using bezier curve to match CSS ease-in-out: cubic-bezier(0.42, 0, 0.58, 1)
    const easingFunction = Easing.bezier(0.42, 0, 0.58, 1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 0.5, // 50% keyframe - translate(-50px, -50px)
          duration: 10000, // 10s to reach 50%
          easing: easingFunction,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0, // Back to 0% - translate(0, 0)
          duration: 10000, // 10s to return (20s total)
          easing: easingFunction,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Stars exactly matching web CSS radial-gradient positions and sizes
  const stars = [
    { id: 1, x: '20%', y: '30%', size: 2, opacity: 0.7 }, // radial-gradient(2px 2px at 20% 30%)
    { id: 2, x: '60%', y: '70%', size: 2, opacity: 0.7 }, // radial-gradient(2px 2px at 60% 70%)
    { id: 3, x: '50%', y: '50%', size: 1, opacity: 0.7 }, // radial-gradient(1px 1px at 50% 50%)
    { id: 4, x: '80%', y: '10%', size: 1, opacity: 0.7 }, // radial-gradient(1px 1px at 80% 10%)
    { id: 5, x: '90%', y: '60%', size: 2, opacity: 0.7 }, // radial-gradient(2px 2px at 90% 60%)
    { id: 6, x: '33%', y: '80%', size: 1, opacity: 0.7 }, // radial-gradient(1px 1px at 33% 80%)
  ];

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
        {/* Stars Background - exactly matching web CSS .stars class */}
        <Animated.View 
          style={[
            styles.starsContainer,
            {
              transform: [
                {
                  translateX: sparkleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, -50, 0], // 0%:0, 50%:-50px, 100%:0 (matching web CSS)
                  }),
                },
                {
                  translateY: sparkleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, -50, 0], // 0%:0, 50%:-50px, 100%:0 (matching web CSS)
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          {stars.map((star, index) => (
            <View
              key={`star-${star.id}-${index}`}
              style={[
                styles.star,
                {
                  left: star.x,
                  top: star.y,
                  width: star.size,
                  height: star.size,
                  opacity: star.opacity,
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Top Navigation - Logo and Menu */}
        <View style={styles.topNav}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/fortailogoo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          
          {/* Menu Button */}
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
          style={styles.scrollView}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.mainTitle}>
              Secure jobs and grow your business
            </Text>
            
            <View style={styles.animatedTextContainer}>
              <MaskedView
                style={styles.maskedViewContainer}
                maskElement={
                  <View style={styles.maskContainer}>
                    <Text style={styles.animatedTextMask}>
                      {displayText}
                    </Text>
                  </View>
                }
              >
                <LinearGradient
                  colors={['#F87AFF', '#FB93D0', '#FFDD99', '#C3F0B2', '#2FD8FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientFill}
                >
                  <Text style={styles.animatedTextGradient}>
                    {displayText}
                  </Text>
                </LinearGradient>
              </MaskedView>
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
                          activeOpacity={0.8}
                          delayPressIn={0}
                          delayPressOut={0}
                        >
                          <View style={styles.suggestionIconContainer}>
                            <Ionicons name="search" size={18} color="rgba(255, 255, 255, 0.6)" />
                          </View>
                          <Text style={styles.suggestionText}>
                            {service.service_name || service.name || 'Unknown Service'}
                          </Text>
                          {isSelected && (
                            <View style={styles.checkmarkContainer}>
                              <Ionicons name="checkmark-circle" size={22} color="#8B5CF6" />
                            </View>
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
              {[...serviceImages, ...serviceImages].map((item, index) => (
                <Image
                  key={index}
                  source={item.source}
                  style={styles.serviceCategoryLogo}
                  resizeMode="cover"
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
            
            {/* Service Category Images Grid */}
            <View style={styles.serviceImagesGrid}>
              {serviceImages.map((item, index) => (
                <View key={index} style={styles.serviceImageCard}>
                  <Image
                    source={item.source}
                    style={styles.serviceGridImage}
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
    position: 'relative',
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH * 2, // 200% width matching web background-size: 200% 200%
    height: 900, // Matching web height: 900px
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
  },
  topNav: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
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
  scrollView: {
    position: 'relative',
    zIndex: 1,
  },
  scrollContent: {
    paddingVertical: 40,
    paddingTop: 100,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 80,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
    letterSpacing: -0.4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  animatedTextContainer: {
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskedViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskContainer: {
    backgroundColor: 'transparent',
  },
  animatedTextMask: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    backgroundColor: 'transparent',
    color: '#FFFFFF', // White for mask - defines the text shape
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },
  gradientFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 200,
    minHeight: 30,
  },
  animatedTextGradient: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    color: 'transparent', // Transparent so gradient fills the text
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
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
    fontWeight: '400',
    padding: 0,
    letterSpacing: 0.1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loadingIndicator: {
    marginLeft: 10,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 65,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    maxHeight: 240,
    zIndex: 1000,
    marginTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  suggestionsScrollView: {
    maxHeight: 240,
  },
  suggestionItem: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    minHeight: 56,
  },
  suggestionItemSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  suggestionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  checkmarkContainer: {
    marginLeft: 8,
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
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
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
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
  serviceCategoryLogo: {
    height: 48,
    width: 'auto',
    marginRight: 48,
    borderRadius: 8,
  },
  serviceImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 40,
    paddingHorizontal: 20,
  },
  serviceImageCard: {
    width: 300,
    height: 300,
    borderWidth: 4,
    borderColor: '#A855F7',
    borderRadius: 20,
    overflow: 'hidden',
  },
  serviceGridImage: {
    width: '100%',
    height: '100%',
  },
  featuresSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  featuresSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
    letterSpacing: 0.1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  beyondSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  beyondTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  beyondSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default ProviderLandingPageScreen;

