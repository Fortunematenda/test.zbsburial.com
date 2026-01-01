import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * FICA Verification Prompt Component
 * Shown when Expert user is not FICA verified
 */
const FICAVerificationPrompt = ({ onVerify }) => {
  return (
    <View style={styles.disabledContainer}>
      <Ionicons name="shield-checkmark-outline" size={80} color="#FF6B6B" />
      <Text style={styles.disabledTitle}>FICA Verification Required</Text>
      <Text style={styles.disabledText}>
        In order for you to view leads, you need to submit the necessary documents for verification.
      </Text>
      <TouchableOpacity 
        style={styles.verifyButton}
        onPress={onVerify}
      >
        <Text style={styles.verifyButtonText}>Verify Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFF',
  },
  disabledTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  disabledText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  verifyButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default FICAVerificationPrompt;

