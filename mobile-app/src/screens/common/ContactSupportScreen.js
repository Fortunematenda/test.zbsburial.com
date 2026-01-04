import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const ContactSupportScreen = ({ navigation }) => {
  const { isDarkMode, colors } = useTheme();
  const dynamicStyles = getDynamicStyles(colors);

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
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Contact Support</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.title, dynamicStyles.title]}>Get in Touch</Text>
          <Text style={[styles.description, dynamicStyles.description]}>
            Our support team is here to help you. Choose your preferred method of contact.
          </Text>

          <View style={styles.contactSection}>
            <TouchableOpacity 
              style={[styles.contactButton, { backgroundColor: colors.primary }]}
              onPress={() => Linking.openURL('mailto:support@fortai.com')}
            >
              <Ionicons name="mail" size={24} color="#ffffff" />
              <Text style={styles.contactButtonText}>Email Us</Text>
              <Text style={styles.contactButtonSubtext}>support@fortai.com</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.hoursBox, dynamicStyles.hoursBox]}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <View style={styles.hoursContent}>
              <Text style={[styles.hoursTitle, dynamicStyles.text]}>Support Hours</Text>
              <Text style={[styles.hoursText, dynamicStyles.textSecondary]}>
                Monday-Friday, 8:30am-5:30pm
              </Text>
            </View>
          </View>

          <View style={[styles.infoBox, dynamicStyles.infoBox]}>
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
            <Text style={[styles.infoText, dynamicStyles.text]}>
              Email responses typically take 24-48 hours. We'll get back to you as soon as possible.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getDynamicStyles = (colors) => StyleSheet.create({
  container: { backgroundColor: colors.background },
  header: { backgroundColor: colors.header, borderBottomColor: colors.border },
  headerTitle: { color: colors.text },
  card: { backgroundColor: colors.card },
  title: { color: colors.text },
  description: { color: colors.textSecondary },
  hoursBox: { backgroundColor: colors.surface },
  infoBox: { backgroundColor: colors.surface },
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
  },
  card: {
    margin: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
  },
  contactSection: {
    marginTop: 8,
  },
  contactButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#8B5CF6',
  },
  contactButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
  },
  contactButtonSubtext: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  hoursBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
  },
  hoursContent: {
    marginLeft: 12,
    flex: 1,
  },
  hoursTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  hoursText: {
    fontSize: 13,
    color: '#666',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff8e1',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
});

export default ContactSupportScreen;

