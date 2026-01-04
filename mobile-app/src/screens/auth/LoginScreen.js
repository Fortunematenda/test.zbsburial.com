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

const LoginScreen = ({ navigation, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(data);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: '',
          text2: 'Welcome back!',
          position: 'top',
          topOffset: 100,
          visibilityTime: 1500,
        });
        onLogin(result.user);
      } else {
        // Show professional, user-friendly error messages
        let errorTitle = 'Login Failed';
        let errorMessage = result.message || 'Unable to sign in. Please check your credentials and try again.';
        
        // Map common error messages to user-friendly ones
        if (errorMessage.toLowerCase().includes('invalid password') || 
            errorMessage.toLowerCase().includes('password') ||
            errorMessage.toLowerCase().includes('credentials')) {
          errorTitle = 'Invalid Credentials';
          errorMessage = 'The email or password you entered is incorrect. Please try again or use "Forgot Password" to reset.';
        } else if (errorMessage.toLowerCase().includes('email') && 
                   (errorMessage.toLowerCase().includes('not found') || 
                    errorMessage.toLowerCase().includes('does not exist'))) {
          errorTitle = 'Account Not Found';
          errorMessage = 'No account found with this email address. Please check your email or create a new account.';
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
      let errorTitle = 'Login Error';
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

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

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
              <Text style={styles.title}>Login</Text>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>login with your email</Text>
                <View style={styles.dividerLine} />
              </View>

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

                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputContainer}>
                      <RNTextInput
                        placeholder="Password"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        secureTextEntry={!showPassword}
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

                <TouchableOpacity 
                  style={styles.forgotButton}
                  onPress={navigateToForgotPassword}
                >
                  <Text style={styles.forgotButtonText}>Forgot your password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#333333" />
                  ) : (
                    <Text style={styles.submitButtonText}>Log in</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footerLinks}>
                  <Text style={styles.footerText}>
                    Are you a Pro?{' '}
                    <Text style={styles.footerLink} onPress={() => navigation.navigate('ProviderLanding')}>
                      Register Now!
                    </Text>
                  </Text>
                  <Text style={[styles.footerText, styles.footerTextMargin]}>
                    Need a Service?{' '}
                    <Text style={styles.footerLink} onPress={() => navigation.navigate('Landing')}>
                      Get Started!
                    </Text>
                  </Text>
                </View>
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
  formContainer: {
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    width: '100%',
    height: 50,
    marginVertical: 15,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    paddingHorizontal: 20,
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
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 15,
    marginTop: 15,
  },
  forgotButtonText: {
    fontSize: 14.5,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
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
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  footerLinks: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footerTextMargin: {
    marginTop: 8,
  },
  footerLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
