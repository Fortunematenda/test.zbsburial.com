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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import ApiService from '../../services/ApiService';
import Toast from 'react-native-toast-message';

const PrivacySecurityScreen = ({ navigation }) => {
  const { isDarkMode, colors } = useTheme();
  const dynamicStyles = getDynamicStyles(colors);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
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

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'New passwords do not match',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
      return;
    }

    if (newPassword.length < 8) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Password must be at least 8 characters',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
      return;
    }

    setSaving(true);
    try {
      const response = await ApiService.user.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: '',
          text2: response.message || 'Password updated successfully',
          position: 'top',
          topOffset: 100,
          visibilityTime: 1500,
        });

        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Toast.show({
          type: 'error',
          text1: '',
          text2: response.message || 'Failed to update password',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: error.response?.data?.message || error.message || 'Failed to update password',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setSaving(false);
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
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Privacy & Security</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security Section */}
        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={24} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Change Password</Text>
          </View>

          <View style={styles.passwordField}>
            <Text style={[styles.label, dynamicStyles.label]}>Current Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showCurrentPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.passwordField}>
            <Text style={[styles.label, dynamicStyles.label]}>New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.passwordField}>
            <Text style={[styles.label, dynamicStyles.label]}>Confirm New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#8B5CF6' }, saving && styles.saveButtonDisabled]}
            onPress={handleChangePassword}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Information Section */}
        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Data Privacy</Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={[styles.infoText, dynamicStyles.text]}>
              Your personal information is protected. We collect only necessary data to provide you with the best service experience.
            </Text>
          </View>

          <View style={styles.listInfoBox}>
            <Text style={[styles.infoTitle, dynamicStyles.text]}>What We Collect:</Text>
            <Text style={[styles.infoItem, dynamicStyles.textSecondary]}>• Email address and contact information</Text>
            <Text style={[styles.infoItem, dynamicStyles.textSecondary]}>• Location data for service matching</Text>
            <Text style={[styles.infoItem, dynamicStyles.textSecondary]}>• Usage data to improve our services</Text>
            <Text style={[styles.infoItem, dynamicStyles.textSecondary]}>• Profile information you provide</Text>
          </View>

          <View style={styles.listInfoBox}>
            <Text style={[styles.infoTitle, dynamicStyles.text]}>Your Rights:</Text>
            <Text style={[styles.infoItem, dynamicStyles.textSecondary]}>• Access your personal data</Text>
            <Text style={[styles.infoItem, dynamicStyles.textSecondary]}>• Update or delete your information</Text>
            <Text style={[styles.infoItem, dynamicStyles.textSecondary]}>• Withdraw consent at any time</Text>
            <Text style={[styles.infoItem, dynamicStyles.textSecondary]}>• Request data portability</Text>
          </View>

          <TouchableOpacity
            style={styles.viewPrivacyButton}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={styles.viewPrivacyButtonText}>View Full Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Data Control Section */}
        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={24} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Data Control</Text>
          </View>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => Alert.alert(
              'Download Data',
              'You can request a copy of your data. We will process your request and send it to your registered email.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Request', onPress: () => Toast.show({ type: 'info', text1: '', text2: 'You will receive your data via email', position: 'top', topOffset: 100, visibilityTime: 2000 }) }
              ]
            )}
          >
            <View style={styles.controlButtonContent}>
              <Ionicons name="download" size={24} color="#8B5CF6" />
              <View style={styles.controlButtonText}>
                <Text style={[styles.controlButtonTitle, dynamicStyles.text]}>Download My Data</Text>
                <Text style={[styles.controlButtonSubtitle, dynamicStyles.textSecondary]}>
                  Get a copy of your personal data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

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
  sectionTitle: { color: colors.text },
  label: { color: colors.text },
  input: { 
    color: colors.text,
    borderColor: colors.border,
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  passwordField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  saveButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  listInfoBox: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
  },
  viewPrivacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 8,
    marginTop: 8,
  },
  viewPrivacyButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  controlButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  controlButtonText: {
    marginLeft: 16,
    flex: 1,
  },
  controlButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  controlButtonSubtitle: {
    fontSize: 13,
    color: '#666',
  },
});

export default PrivacySecurityScreen;

