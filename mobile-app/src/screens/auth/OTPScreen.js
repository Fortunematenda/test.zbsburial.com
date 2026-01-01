import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  Title,
  Paragraph,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { AuthService } from '../../services/AuthService';

const OTPScreen = ({ navigation, route, onLogin }) => {
  const { userId, email, leadData } = route.params || {};
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Please enter a 4-digit OTP',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await AuthService.verifyOtp({
        otp,
        user_id: userId,
        ...(leadData ? { leadData } : {}), // Include leadData if present
      });

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: '',
          text2: 'Welcome!',
          position: 'top',
          topOffset: 100,
          visibilityTime: 1500,
        });
        onLogin(result.user);
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

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const result = await AuthService.resendOtp(userId);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: '',
          text2: 'A new OTP has been sent to your phone',
          position: 'top',
          topOffset: 100,
          visibilityTime: 1500,
        });
        setTimer(60);
        setCanResend(false);
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
        text2: 'Failed to resend OTP',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (text) => {
    // Only allow numbers and limit to 4 digits
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 4) {
      setOtp(numericText);
    }
  };

  return (
    <LinearGradient
      colors={['#FF2D20', '#FF6B6B']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>Verify Phone Number</Title>
          <Paragraph style={styles.subtitle}>
            We've sent a 4-digit code to{'\n'}
            <Text style={styles.phoneNumber}>{email}</Text>
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="Enter OTP"
              mode="outlined"
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={4}
              style={styles.otpInput}
              autoFocus
            />

            <Button
              mode="contained"
              onPress={handleVerifyOtp}
              style={styles.verifyButton}
              contentStyle={styles.verifyButtonContent}
              disabled={isLoading || otp.length !== 4}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                'Verify OTP'
              )}
            </Button>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the code?{' '}
              </Text>
              {canResend ? (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={isResending}
                >
                  <Text style={styles.resendButton}>
                    {isResending ? 'Sending...' : 'Resend'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  Resend in {timer}s
                </Text>
              )}
            </View>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              labelStyle={styles.backButtonText}
            >
              Change Phone Number
            </Button>
          </Card.Content>
        </Card>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  phoneNumber: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  card: {
    elevation: 8,
    borderRadius: 16,
  },
  cardContent: {
    padding: 24,
  },
  otpInput: {
    marginBottom: 24,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
  },
  verifyButton: {
    backgroundColor: '#FF2D20',
    borderRadius: 8,
    marginBottom: 24,
  },
  verifyButtonContent: {
    paddingVertical: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    color: '#666666',
    fontSize: 14,
  },
  resendButton: {
    color: '#FF2D20',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timerText: {
    color: '#999999',
    fontSize: 14,
  },
  backButton: {
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#FF2D20',
  },
});

export default OTPScreen;
