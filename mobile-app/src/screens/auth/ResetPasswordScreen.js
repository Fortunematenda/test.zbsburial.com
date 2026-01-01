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

const ResetPasswordScreen = ({ navigation, route }) => {
  const { token, email } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
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
          text1: '',
          text2: 'You can now sign in with your new password',
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

  if (passwordReset) {
    return (
      <LinearGradient
        colors={['#FF2D20', '#FF6B6B']}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Title style={styles.title}>Password Reset Successful</Title>
            <Paragraph style={styles.subtitle}>
              Your password has been successfully reset. You can now sign in with your new password.
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Button
                mode="contained"
                onPress={navigateToLogin}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
              >
                Sign In
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
            <Title style={styles.title}>Reset Password</Title>
            <Paragraph style={styles.subtitle}>
              Enter your new password below.
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
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
                  <TextInput
                    label="New Password"
                    mode="outlined"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    secureTextEntry
                    error={errors.password}
                    style={styles.input}
                  />
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
                  <TextInput
                    label="Confirm New Password"
                    mode="outlined"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    secureTextEntry
                    error={errors.password_confirmation}
                    style={styles.input}
                  />
                )}
              />
              {errors.password_confirmation && (
                <Text style={styles.errorText}>{errors.password_confirmation.message}</Text>
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
                  'Reset Password'
                )}
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
  loginButton: {
    backgroundColor: '#FF2D20',
    borderRadius: 8,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
});

export default ResetPasswordScreen;
