import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput as RNTextInput,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../../services/AuthService';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { token, email } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await AuthService.resetPassword({
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      if (result.success) {
        setPasswordReset(true);
        Toast.show({
          type: 'success',
          text1: 'Password Reset',
          text2: 'Your password has been successfully reset. You can now sign in.',
          position: 'top',
          topOffset: 100,
          visibilityTime: 3000,
        });
      } else {
        // Show professional, user-friendly error messages
        let errorTitle = 'Reset Failed';
        let errorMessage = result.message || 'Unable to reset password. Please try again.';
        
        if (errorMessage.toLowerCase().includes('token') || 
            errorMessage.toLowerCase().includes('invalid') ||
            errorMessage.toLowerCase().includes('expired')) {
          errorTitle = 'Invalid or Expired Link';
          errorMessage = 'This password reset link is invalid or has expired. Please request a new one.';
        } else if (errorMessage.toLowerCase().includes('password') && 
                   errorMessage.toLowerCase().includes('match')) {
          errorTitle = 'Password Mismatch';
          errorMessage = 'Passwords do not match. Please ensure both password fields are identical.';
        } else if (errorMessage.toLowerCase().includes('password') && 
                   (errorMessage.toLowerCase().includes('length') || 
                    errorMessage.toLowerCase().includes('short'))) {
          errorTitle = 'Password Too Short';
          errorMessage = 'Password must be at least 8 characters long. Please choose a stronger password.';
        } else if (errorMessage.toLowerCase().includes('validation')) {
          errorTitle = 'Validation Error';
          errorMessage = 'Please check your input and try again.';
        }
        
        Toast.show({
          type: 'error',
          text1: errorTitle,
          text2: errorMessage,
          position: 'top',
          topOffset: 100,
          visibilityTime: 4000,
        });
      }
    } catch (error) {
      // Handle unexpected errors with professional messages
      let errorTitle = 'Reset Error';
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message && error.message.includes('timeout')) {
        errorTitle = 'Connection Timeout';
        errorMessage = 'The request took too long. Please check your connection and try again.';
      } else if (error.message && error.message.includes('Network')) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect. Please check your internet connection.';
      }
      
      Toast.show({
        type: 'error',
        text1: errorTitle,
        text2: errorMessage,
        position: 'top',
        topOffset: 100,
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  if (passwordReset) {
    return (
      <LinearGradient
        colors={['#000000', '#200D42', '#4F21A1', '#A46EDB']}
        locations={[0, 0.34, 0.65, 0.82]}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.glassCard}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                </View>

                <Text style={styles.title}>Password Reset Successful</Text>
                
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>reset complete</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Text style={styles.successMessage}>
                  Your password has been successfully reset. You can now sign in with your new password.
                </Text>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={navigateToLogin}
                >
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#000000', '#200D42', '#4F21A1', '#A46EDB']}
      locations={[0, 0.34, 0.65, 0.82]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.glassCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="key-outline" size={48} color="#8B5CF6" />
              </View>

              <Text style={styles.title}>Reset Password</Text>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>create new password</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.description}>
                Enter your new password below. Make sure it's at least 8 characters long.
              </Text>

              <View style={styles.formContainer}>
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="lock-closed-outline" 
                        size={20} 
                        color="rgba(255, 255, 255, 0.7)" 
                        style={styles.inputIcon}
                      />
                      <RNTextInput
                        placeholder="New Password (min. 8 characters)"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        style={[styles.input, styles.passwordInput]}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color="rgba(255, 255, 255, 0.8)"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}

                <Controller
                  control={control}
                  name="password_confirmation"
                  rules={{
                    required: 'Password confirmation is required',
                    validate: (value, { password }) => 
                      value === password || 'Passwords do not match',
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="lock-closed-outline" 
                        size={20} 
                        color="rgba(255, 255, 255, 0.7)" 
                        style={styles.inputIcon}
                      />
                      <RNTextInput
                        placeholder="Confirm New Password"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        style={[styles.input, styles.passwordInput]}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color="rgba(255, 255, 255, 0.8)"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.password_confirmation && (
                  <Text style={styles.errorText}>{errors.password_confirmation.message}</Text>
                )}

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#333333" />
                  ) : (
                    <Text style={styles.submitButtonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.backToLoginButton}
                  onPress={navigateToLogin}
                >
                  <Ionicons name="arrow-back" size={16} color="#FFFFFF" style={styles.backIcon} />
                  <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    alignSelf: 'center',
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 32,
    backdropFilter: 'blur(20px)',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFFFFF',
  },
  dividerText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginHorizontal: 8,
    textTransform: 'lowercase',
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.9,
  },
  successMessage: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    opacity: 0.9,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    width: '100%',
    height: 50,
    marginVertical: 15,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
  },
  input: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingLeft: 50,
    paddingVertical: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: 5,
    zIndex: 10,
  },
  errorText: {
    color: '#8B5CF6',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 20,
  },
  submitButton: {
    width: '100%',
    height: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  loginButton: {
    width: '100%',
    height: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 8,
  },
  backIcon: {
    marginRight: 8,
  },
  backToLoginText: {
    fontSize: 14.5,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});

export default ResetPasswordScreen;
