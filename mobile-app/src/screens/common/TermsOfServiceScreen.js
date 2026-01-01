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

const TermsOfServiceScreen = ({ navigation }) => {
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
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Terms of Service</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.lastUpdated, dynamicStyles.textSecondary]}>Last updated: February 15, 2025</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            Please read these terms and conditions carefully before using Our Service.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Interpretation and Definitions</Text>
          
          <Text style={[styles.subheading, dynamicStyles.subheading]}>Interpretation</Text>
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
          </Text>

          <Text style={[styles.subheading, dynamicStyles.subheading]}>Definitions</Text>
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            For the purposes of these Terms and Conditions:
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • <Text style={{ fontWeight: 'bold' }}>Application</Text> means the software program provided by the Company downloaded by You on any electronic device, named Fortai
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • <Text style={{ fontWeight: 'bold' }}>Company</Text> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Fortai, Fish Hoek, Cape Town.
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • <Text style={{ fontWeight: 'bold' }}>Country</Text> refers to: South Africa
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • <Text style={{ fontWeight: 'bold' }}>Website</Text> refers to Fortai, accessible from <Text style={{ color: '#8B5CF6' }} onPress={() => Linking.openURL('http://www.fortai.com')}>http://www.fortai.com</Text>
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • <Text style={{ fontWeight: 'bold' }}>You</Text> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Acknowledgment</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
          </Text>

          <Text style={[styles.paragraph, dynamicStyles.text]}>
            Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.
          </Text>

          <Text style={[styles.paragraph, dynamicStyles.text]}>
            By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.
          </Text>

          <Text style={[styles.paragraph, dynamicStyles.text]}>
            You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Links to Other Websites</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company.
          </Text>

          <Text style={[styles.paragraph, dynamicStyles.text]}>
            The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Termination</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.
          </Text>

          <Text style={[styles.paragraph, dynamicStyles.text]}>
            Upon termination, Your right to use the Service will cease immediately.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Limitation of Liability</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of this Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or R100 if You haven't purchased anything through the Service.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Changes to These Terms and Conditions</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.
          </Text>

          <Text style={[styles.paragraph, dynamicStyles.text]}>
            By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the website and the Service.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Contact Us</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            If you have any questions about these Terms and Conditions, You can contact us:
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • By email: <Text style={{ color: '#8B5CF6' }} onPress={() => Linking.openURL('mailto:support@fortai.com')}>support@fortai.com</Text>
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • By visiting this page on our website: <Text style={{ color: '#8B5CF6' }} onPress={() => Linking.openURL('http://www.fortai.com')}>http://www.fortai.com</Text>
          </Text>
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
  heading: { color: colors.text },
  subheading: { color: colors.text },
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
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
    paddingLeft: 8,
  },
});

export default TermsOfServiceScreen;

