import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Toast from 'react-native-toast-message';
import ApiService from '../../services/ApiService';
import logger from '../../utils/logger';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

const CreditsScreen = ({ navigation }) => {
  const { isDarkMode, colors } = useTheme();
  const dynamicStyles = getDynamicStyles(colors);
  
  const [userCredits, setUserCredits] = useState(0);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);

  useEffect(() => {
    loadUserCredits();
    loadPackages();
  }, []);

  // Refresh credits when screen comes into focus (e.g., after returning from payment)
  useFocusEffect(
    React.useCallback(() => {
      loadUserCredits();
    }, [])
  );

  const loadUserCredits = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setUserCredits(user.credits_balance || 0);
      }
    } catch (error) {
      logger.error('Error loading user credits:', error);
    }
  };

  const loadPackages = async (isRefresh = false) => {
    if (!isRefresh) {
      setLoadingPackages(true);
    }
    try {
      const response = await ApiService.payments.getPackages();
      if (response.success && response.packages) {
        // Convert price and credits to numbers
        const formattedPackages = response.packages.map(pkg => ({
          ...pkg,
          price: parseFloat(pkg.price),
          credits: parseInt(pkg.credits)
        }));
        setPackages(formattedPackages);
      }
    } catch (error) {
      logger.error('Error loading packages:', error);
      // Fallback to default packages if API fails
      setPackages([
        { id: 1, name: '25 Credits', credits: 25, price: 100.00 },
        { id: 2, name: '50 Credits', credits: 50, price: 180.00 },
        { id: 3, name: '100 Credits', credits: 100, price: 350.00 },
      ]);
    } finally {
      if (!isRefresh) {
        setLoadingPackages(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserCredits(), loadPackages(true)]);
    setRefreshing(false);
  };

  const handlePurchase = (pkg) => {
    setSelectedPackage(pkg);
    setShowPurchaseConfirm(true);
  };

  const confirmPurchase = async () => {
    if (!selectedPackage) return;

    setLoading(true);
    try {
      const response = await ApiService.payments.createCheckoutSession(selectedPackage.id);
      
      if (response.success && response.checkout_url) {
        // Open Stripe checkout in browser
        const canOpen = await Linking.canOpenURL(response.checkout_url);
        if (canOpen) {
          await Linking.openURL(response.checkout_url);
          Toast.show({
            type: 'success',
            text1: '',
            text2: 'Please complete the payment in your browser',
            position: 'top',
            topOffset: 100,
            visibilityTime: 2000,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: '',
            text2: 'Cannot open payment link',
            position: 'top',
            topOffset: 100,
            visibilityTime: 2500,
          });
        }
        
        setShowPurchaseConfirm(false);
        setSelectedPackage(null);
      } else {
        Toast.show({
          type: 'error',
          text1: '',
          text2: response.message || 'Failed to create checkout session',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: error.message || 'Failed to process purchase',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.header} />
      
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Purchase Credits</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Current Credits Balance */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Ionicons name="wallet" size={32} color="#ffffff" />
          <Text style={styles.balanceTitle}>Your Current Credits</Text>
          <Text style={styles.balanceAmount}>{userCredits}</Text>
        </View>

        {/* Credit Packages */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Choose a Package</Text>
          
          {loadingPackages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={[styles.loadingText, dynamicStyles.textSecondary]}>Loading packages...</Text>
            </View>
          ) : (
            packages.map((pkg, index) => {
            const percentageOff = index === 0 ? 5 : index === 1 ? 15 : 20;
            const isPopular = index === 1;
            
            return (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  dynamicStyles.packageCard,
                  isPopular && styles.popularPackage
                ]}
                onPress={() => handlePurchase(pkg)}
                activeOpacity={0.9}
              >
                {isPopular && (
                  <View style={styles.popularBadge}>
                    <Ionicons name="star" size={12} color="#ffffff" />
                    <Text style={styles.popularBadgeText}>Most Popular</Text>
                  </View>
                )}
                
                {/* Header Section */}
                <View style={styles.packageHeader}>
                  <View style={styles.packageHeaderLeft}>
                    <Text style={[styles.packageName, dynamicStyles.text]}>{pkg.name}</Text>
                    {percentageOff > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>Save {percentageOff}%</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Credits Display Section */}
                <View style={styles.creditsDisplaySection}>
                  <View style={styles.creditsIconContainer}>
                    <Ionicons name="star" size={32} color="#8B5CF6" />
                  </View>
                  <View style={styles.creditsAmountContainer}>
                    <Text style={styles.creditsAmount}>{pkg.credits}</Text>
                    <Text style={[styles.creditsLabel, dynamicStyles.textSecondary]}>CREDITS</Text>
                  </View>
                </View>
                
                {/* Divider */}
                <View style={styles.packageDivider} />
                
                {/* Price Section */}
                <View style={styles.priceSection}>
                  <View style={styles.priceMainRow}>
                    <Text style={styles.priceCurrency}>R</Text>
                    <Text style={styles.priceAmount}>{pkg.price.toFixed(2)}</Text>
                  </View>
                  <Text style={[styles.pricePerCredit, dynamicStyles.textSecondary]}>
                    R{(pkg.price / pkg.credits).toFixed(2)} per credit
                  </Text>
                </View>

                {/* Features Section */}
                <View style={styles.packageFeatures}>
                  <View style={styles.featureItem}>
                    <View style={styles.featureIconContainer}>
                      <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    </View>
                    <Text style={[styles.featureText, dynamicStyles.textSecondary]}>
                      Unlock up to {Math.floor(pkg.credits / 5)} leads
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={styles.featureIconContainer}>
                      <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    </View>
                    <Text style={[styles.featureText, dynamicStyles.textSecondary]}>
                      Instant credit delivery
                    </Text>
                  </View>
                </View>

                {/* Purchase Button */}
                <TouchableOpacity
                  style={[
                    styles.purchaseButton,
                    isPopular && styles.purchaseButtonPopular,
                    { backgroundColor: isPopular ? '#8B5CF6' : '#8B5CF6' }
                  ]}
                  onPress={() => handlePurchase(pkg)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="card" size={20} color="#ffffff" style={styles.purchaseButtonIcon} />
                  <Text style={styles.purchaseButtonText}>Purchase Now</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" style={styles.purchaseButtonIcon} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }))
          }
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, dynamicStyles.infoBox]}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={[styles.infoText, dynamicStyles.text]}>
            Credits are used to unlock contact details of leads. Each lead costs 5 credits.
          </Text>
        </View>

        {/* Credits History Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Credits History</Text>
          <TouchableOpacity
            style={[styles.historyButton, dynamicStyles.packageCard]}
            onPress={() => navigation.navigate('CreditsHistory')}
          >
            <View style={styles.historyButtonContent}>
              <Ionicons name="time" size={24} color="#8B5CF6" />
              <View style={styles.historyButtonText}>
                <Text style={[styles.historyButtonTitle, dynamicStyles.text]}>View Credits History</Text>
                <Text style={[styles.historyButtonSubtitle, dynamicStyles.textSecondary]}>
                  See your credits usage and purchases
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Purchase Confirmation Modal */}
      <Modal
        visible={showPurchaseConfirm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPurchaseConfirm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, dynamicStyles.modalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Confirm Purchase</Text>
              <TouchableOpacity onPress={() => setShowPurchaseConfirm(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedPackage && (
              <View style={styles.modalBody}>
                <View style={styles.confirmPackageCard}>
                  <View style={styles.packagePrice}>
                    <Text style={styles.confirmCreditsAmount}>{selectedPackage.credits}</Text>
                    <Text style={styles.confirmCreditsLabel}>Credits</Text>
                  </View>
                  <Text style={[styles.confirmPackageName, dynamicStyles.text]}>
                    {selectedPackage.name}
                  </Text>
                  <Text style={[styles.confirmPrice, dynamicStyles.text]}>
                    R{selectedPackage.price.toFixed(2)}
                  </Text>
                </View>

                <View style={[styles.totalRow, dynamicStyles.totalRow]}>
                  <Text style={[styles.totalLabel, dynamicStyles.text]}>Total</Text>
                  <Text style={[styles.totalAmount, dynamicStyles.text]}>
                    R{selectedPackage.price.toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: '#8B5CF6' }, loading && styles.confirmButtonDisabled]}
                  onPress={confirmPurchase}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="card" size={20} color="#ffffff" />
                      <Text style={styles.confirmButtonText}>Pay R{selectedPackage.price.toFixed(2)}</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowPurchaseConfirm(false)}
                >
                  <Text style={[styles.cancelButtonText, dynamicStyles.text]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getDynamicStyles = (colors) => StyleSheet.create({
  container: { backgroundColor: colors.background },
  header: { backgroundColor: colors.header, borderBottomColor: colors.border },
  headerTitle: { color: colors.text },
  packageCard: { backgroundColor: colors.card },
  totalRow: { borderTopColor: colors.border },
  modalContent: { backgroundColor: colors.card },
  modalTitle: { color: colors.text },
  text: { color: colors.text },
  textSecondary: { color: colors.textSecondary },
  infoBox: { backgroundColor: colors.surface },
});

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
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 12,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  packageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
    overflow: 'visible',
  },
  popularPackage: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 24,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  packageHeader: {
    marginBottom: 20,
  },
  packageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  packageName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  discountBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  creditsDisplaySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9ff',
    borderRadius: 16,
  },
  creditsIconContainer: {
    marginRight: 16,
  },
  creditsAmountContainer: {
    alignItems: 'flex-start',
  },
  creditsAmount: {
    fontSize: 52,
    fontWeight: '800',
    color: '#8B5CF6',
    lineHeight: 60,
    letterSpacing: -1,
  },
  creditsLabel: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  packageDivider: {
    height: 1,
    backgroundColor: '#e8e8e8',
    marginVertical: 20,
  },
  priceSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  priceMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 6,
  },
  priceCurrency: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
    marginRight: 2,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -1,
  },
  pricePerCredit: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  packageFeatures: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIconContainer: {
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  purchaseButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  purchaseButtonPopular: {
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  purchaseButtonIcon: {
    marginHorizontal: 6,
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  historyButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyButtonText: {
    marginLeft: 16,
    flex: 1,
  },
  historyButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  historyButtonSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  modalContainer: {
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  confirmPackageCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmCreditsAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  confirmCreditsLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  confirmPackageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  confirmPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    flexDirection: 'row',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default CreditsScreen;

