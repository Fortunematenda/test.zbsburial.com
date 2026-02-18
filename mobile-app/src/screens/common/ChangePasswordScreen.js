import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import ApiService from '../../services/ApiService';
import Toast from 'react-native-toast-message';

const ChangePasswordScreen = ({ navigation }) => {
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
        text1: 'Error',
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
        text1: 'Error',
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
        text1: 'Error',
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
          text1: 'Success',
          text2: response.message || 'Password updated successfully',
          position: 'top',
          topOffset: 100,
          visibilityTime: 1500,
        });

        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to update password',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
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
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Change Password</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.description, dynamicStyles.description]}>
            Enter your current password and choose a new secure password.
          </Text>

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
                autoCorrect={false}
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
                placeholder="Enter new password (min. 8 characters)"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
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
                autoCorrect={false}
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
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getDynamicStyles = (colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.header,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  label: {
    color: colors.text,
  },
  description: {
    color: colors.textSecondary,
  },
  input: {
    color: colors.text,
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
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
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  passwordField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  input: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingRight: 50,
    paddingVertical: 12,
    minHeight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 48,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangePasswordScreen;
