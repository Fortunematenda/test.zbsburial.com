import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={styles.successContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.titleText}>{text1}</Text>}
        {text2 && <Text style={styles.messageText}>{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={styles.errorContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="close-circle" size={24} color="#EF4444" />
      </View>
      <View style={styles.textContainer}>
        {text1 && text1.trim() && <Text style={styles.titleText}>{text1}</Text>}
        {text2 && <Text style={[styles.messageText, !text1 || !text1.trim() ? styles.messageTextNoTitle : null]}>{text2}</Text>}
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View style={styles.infoContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="information-circle" size={24} color="#3B82F6" />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.titleText}>{text1}</Text>}
        {text2 && <Text style={styles.messageText}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  messageText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    flexWrap: 'wrap',
    letterSpacing: -0.1,
  },
  messageTextNoTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
});

