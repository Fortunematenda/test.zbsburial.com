import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import logger from './src/utils/logger';
import ErrorBoundary from './src/components/ErrorBoundary';

// Import screens
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import LoadingScreen from './src/screens/LoadingScreen';

// Import services
import { AuthService } from './src/services/AuthService';
import { NotificationService } from './src/services/NotificationService';
import * as Notifications from 'expo-notifications';

// Import toast configuration
import { toastConfig } from './src/config/toastConfig';

// Import ThemeProvider
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();
const queryClient = new QueryClient();

// Navigation reference for deep linking from notifications
export const navigationRef = React.createRef();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Handle notification navigation
  const handleNotificationNavigation = useCallback((data) => {
    if (!isAuthenticated || !navigationRef.current || !user) {
      return;
    }

    const navigation = navigationRef.current;
    const url = data?.url || '';
    const notificationType = data?.type || '';
    const leadId = data?.lead_id || data?.leadId || null;

    try {
      // Determine if it's a chat notification
      const isChatNotification = url.includes('fortai://chat/') || notificationType === 'chat_message';
      
      // Determine if it's a lead notification (any lead-related notification)
      const isLeadNotification = url.includes('fortai://lead/') || 
                                 notificationType === 'new_lead' || 
                                 notificationType === 'lead_response' || 
                                 notificationType === 'lead_unlocked';

      if (isChatNotification) {
        // Navigate to chat
        const chatLeadId = leadId || url.match(/chat\/(\d+)/)?.[1];
        const senderId = data?.sender_id || null;
        
        if (chatLeadId && senderId) {
          // Navigate directly to ChatDetails, bypassing the list screen
          // This ensures the user goes straight to the chat from the notification
          navigation.dispatch(
            CommonActions.navigate({
              name: 'Main',
              params: {
                screen: 'Responses',
                params: {
                  screen: 'ChatDetails',
                  params: {
                    leadId: parseInt(chatLeadId),
                    providerId: parseInt(senderId),
                    serviceName: data?.service_name || 'Service',
                    providerName: data?.sender_name || 'User',
                  }
                }
              }
            })
          );
        }
      } else if (isLeadNotification) {
        // Navigate to lead details
        const leadIdFromUrl = leadId || url.match(/lead\/(\d+)/)?.[1];
        
        if (leadIdFromUrl) {
          // Determine the correct screen name based on user role
          const leadDetailsScreen = user?.role === 'Customer' ? 'CustomerLeadDetails' : 'ProviderLeadDetails';
          
          navigation.dispatch(
            CommonActions.navigate({
              name: 'Main',
              params: {
                screen: 'Leads',
                params: {
                  screen: leadDetailsScreen,
                  params: {
                    leadId: parseInt(leadIdFromUrl),
                  }
                }
              }
            })
          );
        }
      }
    } catch (error) {
      logger.error('Error navigating from notification:', error);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Set up notification listeners (outside async function so cleanup works)
    const notificationReceivedListener = Notifications.addNotificationReceivedListener(notification => {
      logger.log('Notification received:', notification);
      // You can show an alert, update UI, etc.
    });

    const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
      // Extract data from notification - it might be in different places
      const notification = response.notification || response.notification || response;
      const content = notification.request?.content || notification.content || {};
      const data = content.data || content || {};
      
      // Handle navigation based on notification data
      if (data && (data.url || data.lead_id || data.type)) {
        handleNotificationNavigation(data);
      }
    });

    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          ...Ionicons.font,
        });

        // Check if user is already authenticated
        const authResult = await AuthService.checkAuthStatus();
        if (authResult.isAuthenticated) {
          setIsAuthenticated(true);
          setUser(authResult.user);
        }

        // Initialize notification service (only once, after auth check)
        await NotificationService.initialize();
      } catch (e) {
        logger.warn(e);
      } finally {
        // Tell the application to render
        setIsLoading(false);
        SplashScreen.hideAsync();
      }
    }

    prepare();

    // Cleanup listeners on unmount
    return () => {
      notificationReceivedListener.remove();
      notificationResponseListener.remove();
    };
  }, [handleNotificationNavigation]);

  const handleLogin = async (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    // Register push token after login
    try {
      await NotificationService.initialize();
    } catch (error) {
      logger.error('Failed to register push token after login:', error);
    }
  };

  const handleLogout = async () => {
    // Wait for logout to complete before clearing state
    await AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const refreshUserData = async () => {
    try {
      const result = await AuthService.refreshUserData();
      if (result.success) {
        setUser(result.user);
        return result.user;
      }
    } catch (error) {
      logger.error('Error refreshing user data:', error);
    }
    return null;
  };

  // Handle deep linking for payment redirects
  useEffect(() => {
    const navigateToDashboard = (attempt = 0) => {
      try {
        const nav = navigationRef.current;
        if (!nav) {
          if (attempt < 10) {
            setTimeout(() => navigateToDashboard(attempt + 1), 150);
          }
          return;
        }
        const dashboardScreen = (user?.role === 'Customer') ? 'CustomerDashboard' : 'ProviderDashboard';
        // Prefer simple navigate with nested params
        nav.navigate('Main', {
          screen: 'Home',
          params: { screen: dashboardScreen },
        });
      } catch (e) {
        if (attempt < 10) {
          setTimeout(() => navigateToDashboard(attempt + 1), 150);
        }
      }
    };

    const handleDeepLink = async (event) => {
      const { url } = event;
      
      // Check if it's a purchase-related URL
      if (url.includes('purchase/success')) {
        // Extract credits from URL if present
        const creditsMatch = url.match(/credits=(\d+)/);
        const credits = creditsMatch ? creditsMatch[1] : 0;
        
        // Refresh user data to get updated credits
        await refreshUserData();
        
        Toast.show({
          type: 'success',
          text1: 'Payment Successful!',
          text2: `${credits} credits have been added to your account`,
        });

        // Navigate back to main dashboard (Home tab -> role-based dashboard), with retries if needed
        navigateToDashboard();
      } else if (url.includes('purchase/cancelled')) {
        Toast.show({
          type: 'info',
          text1: 'Payment Cancelled',
          text2: 'You cancelled the payment',
        });
      } else if (url.includes('purchase/failed')) {
        Toast.show({
          type: 'error',
          text1: 'Payment Failed',
          text2: 'Your payment could not be processed',
        });
      }
    };

    // Listen for incoming deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if the app was opened from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshUserData]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider>
            <ErrorBoundary onError={(e) => logger.error('Uncaught App error:', e)}>
              <AppContent 
                isAuthenticated={isAuthenticated}
                user={user}
                onLogout={handleLogout}
                onLogin={handleLogin}
                onRefreshUserData={refreshUserData}
              />
            </ErrorBoundary>
          </PaperProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent({ isAuthenticated, user, onLogout, onLogin, onRefreshUserData }) {
  const { isDarkMode } = useTheme();
  
  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main">
            {(props) => (
              <MainNavigator 
                {...props} 
                user={user} 
                onLogout={onLogout}
                onRefreshUserData={onRefreshUserData}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth">
            {(props) => (
              <AuthNavigator 
                {...props} 
                onLogin={onLogin} 
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
      <Toast config={toastConfig} />
    </NavigationContainer>
  );
}
