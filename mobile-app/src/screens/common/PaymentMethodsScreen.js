import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Toast from 'react-native-toast-message';

const PaymentMethodsScreen = ({ navigation }) => {
  const { isDarkMode, colors } = useTheme();
  const dynamicStyles = getDynamicStyles(colors);
  
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2025',
      isDefault: true,
    },
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  
  // Form fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  const handleAddCard = async () => {
    // Validation
    if (!cardNumber || !cardHolder || !expiryMonth || !expiryYear || !cvv) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Please fill in all fields',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
      return;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Card number must be 16 digits',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
      return;
    }

    if (cvv.length !== 3) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'CVV must be 3 digits',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
      return;
    }

    setAddingCard(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newCard = {
        id: Date.now(),
        type: 'card',
        brand: cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Card',
        last4: cardNumber.slice(-4),
        expiryMonth: expiryMonth.padStart(2, '0'),
        expiryYear: expiryYear,
        isDefault: paymentMethods.length === 0,
      };

      setPaymentMethods([...paymentMethods, newCard]);
      setShowAddModal(false);
      
      // Reset form
      setCardNumber('');
      setCardHolder('');
      setExpiryMonth('');
      setExpiryYear('');
      setCvv('');

      Toast.show({
        type: 'success',
        text1: '',
        text2: 'Payment method added successfully',
        position: 'top',
        topOffset: 100,
        visibilityTime: 1500,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Failed to add payment method',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setAddingCard(false);
    }
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id,
    })));
    
    Toast.show({
      type: 'success',
      text1: '',
      text2: 'Default payment method updated',
      position: 'top',
      topOffset: 100,
      visibilityTime: 1500,
    });
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
            Toast.show({
              type: 'success',
              text1: '',
              text2: 'Payment method removed',
              position: 'top',
              topOffset: 100,
              visibilityTime: 1500,
            });
          },
        },
      ]
    );
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
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Payment Methods</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add Payment Method Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle" size={24} color="#8B5CF6" />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>

        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <View style={[styles.emptyContainer, dynamicStyles.emptyContainer]}>
            <Ionicons name="card-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, dynamicStyles.emptyText]}>No payment methods added yet</Text>
            <Text style={[styles.emptySubtext, dynamicStyles.emptySubtext]}>
              Add a payment method to make purchases faster
            </Text>
          </View>
        ) : (
          paymentMethods.map((method) => (
            <View key={method.id} style={[styles.cardContainer, dynamicStyles.cardContainer]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <View style={styles.cardIcon}>
                    {method.brand === 'Visa' && <Text style={styles.cardBrand}>VISA</Text>}
                    {method.brand === 'Mastercard' && <Text style={styles.cardBrand}>MC</Text>}
                    {!['Visa', 'Mastercard'].includes(method.brand) && (
                      <Ionicons name="card" size={32} color="#8B5CF6" />
                    )}
                  </View>
                  <View style={styles.cardDetails}>
                    <Text style={[styles.cardType, dynamicStyles.text]}>
                      {method.brand} •••• {method.last4}
                    </Text>
                    <Text style={[styles.cardExpiry, dynamicStyles.textSecondary]}>
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </Text>
                  </View>
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.cardActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <Ionicons name="star-outline" size={20} color="#8B5CF6" />
                    <Text style={[styles.actionButtonText, { color: '#8B5CF6' }]}>Set as Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(method.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF4444" />
                  <Text style={[styles.actionButtonText, { color: '#FF4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Buy Credits Button */}
        <TouchableOpacity
          style={styles.buyCreditsButton}
          onPress={() => navigation.navigate('Credits')}
        >
          <Ionicons name="wallet" size={24} color="#ffffff" />
          <Text style={styles.buyCreditsButtonText}>Buy Credits</Text>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={[styles.infoBox, dynamicStyles.infoBox]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={[styles.infoText, dynamicStyles.text]}>
            Your payment information is securely stored and encrypted
          </Text>
        </View>
      </ScrollView>

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, dynamicStyles.modalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, dynamicStyles.label]}>Card Number</Text>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, dynamicStyles.label]}>Card Holder Name</Text>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.label, dynamicStyles.label]}>Expiry Month</Text>
                  <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={expiryMonth}
                    onChangeText={setExpiryMonth}
                    placeholder="MM"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.label, dynamicStyles.label]}>Expiry Year</Text>
                  <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={expiryYear}
                    onChangeText={setExpiryYear}
                    placeholder="YYYY"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, dynamicStyles.label]}>CVV</Text>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: '#8B5CF6' }, addingCard && styles.submitButtonDisabled]}
                onPress={handleAddCard}
                disabled={addingCard}
              >
                <Text style={styles.submitButtonText}>
                  {addingCard ? 'Adding...' : 'Add Card'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
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
  cardContainer: { backgroundColor: colors.card },
  emptyContainer: { backgroundColor: colors.card },
  emptyText: { color: colors.text },
  emptySubtext: { color: colors.textSecondary },
  infoBox: { backgroundColor: colors.surface },
  modalContent: { backgroundColor: colors.card },
  modalTitle: { color: colors.text },
  label: { color: colors.text },
  input: { 
    color: colors.text,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  text: { color: colors.text },
  textSecondary: { color: colors.textSecondary },
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f0f4ff',
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 8,
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 50,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBrand: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDetails: {
    flex: 1,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#666',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  buyCreditsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buyCreditsButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f8f8',
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentMethodsScreen;

