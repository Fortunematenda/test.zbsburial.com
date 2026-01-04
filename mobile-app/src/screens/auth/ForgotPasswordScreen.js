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

const ForgotPasswordScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await AuthService.forgotPassword(data.email);
      
      if (result.success) {
        setEmailSent(true);
        Toast.show({
          type: 'success',
          text1: 'Email Sent',
          text2: 'Please check your email for password reset instructions',
          position: 'top',
          topOffset: 100,
          visibilityTime: 3000,
        });
      } else {
        // Show professional, user-friendly error messages
        let errorTitle = 'Request Failed';
        let errorMessage = result.message || 'Unable to send reset email. Please try again.';
        
        if (errorMessage.toLowerCase().includes('email') && 
            (errorMessage.toLowerCase().includes('not found') || 
             errorMessage.toLowerCase().includes('does not exist'))) {
          errorTitle = 'Email Not Found';
          errorMessage = 'No account found with this email address. Please check your email or create a new account.';
        } else if (errorMessage.toLowerCase().includes('validation') || 
                   errorMessage.toLowerCase().includes('invalid')) {
          errorTitle = 'Invalid Email';
          errorMessage = 'Please enter a valid email address.';
        } else if (errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          errorTitle = 'Connection Error';
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (errorMessage.toLowerCase().includes('network')) {
          errorTitle = 'Network Error';
          errorMessage = 'Please check your internet connection and try again.';
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
      let errorTitle = 'Request Error';
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

  if (emailSent) {
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
                  <Ionicons name="mail-outline" size={64} color="#8B5CF6" />
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                  </View>
                </View>

                <Text style={styles.title}>Check Your Email</Text>
                
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>reset instructions sent</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Text style={styles.successMessage}>
                  We've sent password reset instructions to your email address. Please check your inbox and follow the link to reset your password.
                </Text>

                <Text style={styles.noteText}>
                  Didn't receive the email? Check your spam folder or try again.
                </Text>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={navigateToLogin}
                >
                  <Text style={styles.backButtonText}>Back to Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={() => {
                    setEmailSent(false);
                    control._reset();
                  }}
                >
                  <Text style={styles.resendButtonText}>Send Another Email</Text>
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
                <Ionicons name="lock-closed-outline" size={48} color="#8B5CF6" />
              </View>

              <Text style={styles.title}>Forgot Password</Text>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>reset your password</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.description}>
                Enter your email address and we'll send you instructions to reset your password.
              </Text>

              <View style={styles.formContainer}>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="mail-outline" 
                        size={20} 
                        color="rgba(255, 255, 255, 0.7)" 
                        style={styles.inputIcon}
                      />
                      <RNTextInput
                        placeholder="Email"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                      />
                    </View>
                  )}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#333333" />
                  ) : (
                    <Text style={styles.submitButtonText}>Send Reset Link</Text>
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
    position: 'relative',
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: -8,
    right: '35%',
    backgroundColor: '#000000',
    borderRadius: 16,
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
    marginBottom: 16,
    opacity: 0.9,
  },
  noteText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 32,
    opacity: 0.7,
    fontStyle: 'italic',
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
  backButton: {
    width: '100%',
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resendButton: {
    width: '100%',
    height: 45,
    backgroundColor: 'transparent',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
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

export default ForgotPasswordScreen;
