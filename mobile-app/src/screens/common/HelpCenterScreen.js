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

const HelpCenterScreen = ({ navigation }) => {
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
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Help Center</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.title, dynamicStyles.title]}>How can we assist you?</Text>
          <Text style={[styles.description, dynamicStyles.description]}>
            If you have any questions or need assistance, feel free to contact us using the details below.  
            Our support team will respond as soon as possible.
          </Text>

          <View style={styles.contactSection}>
            <TouchableOpacity 
              style={[styles.contactItem, dynamicStyles.contactItem]}
              onPress={() => Linking.openURL('mailto:support@fortai.com')}
            >
              <Ionicons name="mail" size={24} color="#8B5CF6" />
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, dynamicStyles.textSecondary]}>Email</Text>
                <Text style={[styles.contactValue, dynamicStyles.text]}>support@fortai.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.contactItem, dynamicStyles.contactItem]}>
              <Ionicons name="time" size={24} color="#8B5CF6" />
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, dynamicStyles.textSecondary]}>Hours</Text>
                <Text style={[styles.contactValue, dynamicStyles.text]}>Monday-Friday, 8:30am-5:30pm</Text>
              </View>
            </View>
          </View>

          <View style={[styles.infoBox, dynamicStyles.infoBox]}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={[styles.infoText, dynamicStyles.text]}>
              Explore our Help Centre for guidance and expert tips
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
  contactItem: { borderBottomColor: colors.border },
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});

export default HelpCenterScreen;

