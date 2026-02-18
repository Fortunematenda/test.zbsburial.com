import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const PrivacyPolicyScreen = ({ navigation }) => {
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
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.lastUpdated, dynamicStyles.textSecondary]}>Last updated: February 15, 2025</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
          </Text>

          <Text style={[styles.paragraph, dynamicStyles.text]}>
            We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Interpretation and Definitions</Text>
          
          <Text style={[styles.subheading, dynamicStyles.subheading]}>Definitions</Text>
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            For the purposes of this Privacy Policy:
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • <Text style={{ fontWeight: 'bold' }}>Account</Text> means a unique account created for You to access our Service or parts of our Service.
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • <Text style={{ fontWeight: 'bold' }}>Application</Text> refers to Fortai, the software program provided by the Company.
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • <Text style={{ fontWeight: 'bold' }}>Company</Text> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Fortai, Fish Hoek, Cape Town.
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • <Text style={{ fontWeight: 'bold' }}>Personal Data</Text> is any information that relates to an identified or identifiable individual.
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • <Text style={{ fontWeight: 'bold' }}>Service</Text> refers to the Application or the Website or both.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Collecting and Using Your Personal Data</Text>
          
          <Text style={[styles.subheading, dynamicStyles.subheading]}>Types of Data Collected</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>• Email address</Text>
          <Text style={[styles.bulletText, dynamicStyles.text]}>• First name and last name</Text>
          <Text style={[styles.bulletText, dynamicStyles.text]}>• Phone number</Text>
          <Text style={[styles.bulletText, dynamicStyles.text]}>• Address, State, Province, ZIP/Postal code, City</Text>
          <Text style={[styles.bulletText, dynamicStyles.text]}>• Usage Data</Text>

          <Text style={[styles.subheading, dynamicStyles.subheading]}>Use of Your Personal Data</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            The Company may use Personal Data for the following purposes:
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • To provide and maintain our Service, including to monitor the usage of our Service.
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • To manage Your Account: to manage Your registration as a user of the Service.
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • To contact You: To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication.
          </Text>

          <Text style={[styles.bulletText, dynamicStyles.text]}>
            • To manage Your requests: To attend and manage Your requests to Us.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Security of Your Personal Data</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Children's Privacy</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Links to Other Websites</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Changes to this Privacy Policy</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.
          </Text>

          <Text style={[styles.paragraph, dynamicStyles.text]}>
            We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.
          </Text>

          <Text style={[styles.heading, dynamicStyles.heading]}>Contact Us</Text>
          
          <Text style={[styles.paragraph, dynamicStyles.text]}>
            If you have any questions about this Privacy Policy, You can contact us:
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

export default PrivacyPolicyScreen;

