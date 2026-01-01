import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
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
          text1: '',
          text2: 'Please check your email for reset instructions',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: '',
          text2: result.message,
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'An unexpected error occurred',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
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
        colors={['#FF2D20', '#FF6B6B']}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Title style={styles.title}>Check Your Email</Title>
            <Paragraph style={styles.subtitle}>
              We've sent password reset instructions to your email address.
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Button
                mode="contained"
                onPress={navigateToLogin}
                style={styles.backToLoginButton}
                contentStyle={styles.backToLoginButtonContent}
              >
                Back to Login
              </Button>
            </Card.Content>
          </Card>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#FF2D20', '#FF6B6B']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Title style={styles.title}>Forgot Password</Title>
            <Paragraph style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset your password.
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
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
                  <TextInput
                    label="Email Address"
                    mode="outlined"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                    style={styles.input}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.resetButton}
                contentStyle={styles.resetButtonContent}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>

              <Button
                mode="text"
                onPress={navigateToLogin}
                style={styles.backToLoginButton}
                labelStyle={styles.backToLoginButtonText}
              >
                Back to Login
              </Button>
            </Card.Content>
          </Card>
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
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    elevation: 8,
    borderRadius: 16,
  },
  cardContent: {
    padding: 24,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: '#FF2D20',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
  resetButton: {
    backgroundColor: '#FF2D20',
    borderRadius: 8,
    marginBottom: 16,
  },
  resetButtonContent: {
    paddingVertical: 8,
  },
  backToLoginButton: {
    alignSelf: 'center',
  },
  backToLoginButtonContent: {
    paddingVertical: 8,
  },
  backToLoginButtonText: {
    color: '#FF2D20',
  },
});

export default ForgotPasswordScreen;
