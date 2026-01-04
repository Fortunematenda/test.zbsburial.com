import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthService } from '../../services/AuthService';
import logger from '../../utils/logger';
import Toast from 'react-native-toast-message';

// SettingItem component defined outside to prevent recreation on every render
// Note: styles will be defined later in the file, but it's accessible when component renders
const SettingItem = React.memo(({ icon, title, subtitle, onPress, rightComponent, showArrow = true, textSecondaryColor, settingItemStyle, settingTitleStyle, settingSubtitleStyle }) => {
  const handlePress = () => {
    if (onPress) {
      // Direct call without logging for better performance
      onPress();
    }
  };
  
  return (
    <TouchableOpacity 
      style={[styles.settingItem, settingItemStyle]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={24} color="#8B5CF6" />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, settingTitleStyle]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, settingSubtitleStyle]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && <Ionicons name="chevron-forward" size={20} color={textSecondaryColor} />}
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.icon === nextProps.icon &&
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.showArrow === nextProps.showArrow &&
    prevProps.textSecondaryColor === nextProps.textSecondaryColor &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.rightComponent === nextProps.rightComponent &&
    prevProps.settingItemStyle === nextProps.settingItemStyle &&
    prevProps.settingTitleStyle === nextProps.settingTitleStyle &&
    prevProps.settingSubtitleStyle === nextProps.settingSubtitleStyle
  );
});

const SettingsScreen = ({ navigation, onLogout, onRefreshUserData, route }) => {
  // Get onLogout from params if not passed as prop
  const onLogoutCallback = onLogout || route?.params?.onLogout;
  
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    locationServices: true,
  });
  const [loading, setLoading] = useState(true);
  
  // Ref to prevent double-clicks (using timestamp for better control)
  const lastPressTime = useRef(0);
  const PRESS_DEBOUNCE_MS = 100; // Reduced to 100ms for faster response
  const isNavigating = useRef(false); // Prevent concurrent navigations

  useEffect(() => {
    // Load data in parallel for faster initialization
    const loadData = async () => {
      try {
        await Promise.all([
          loadUserData(),
          loadSettings()
        ]);
      } catch (error) {
        logger.error('Error loading settings data:', error);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync dark mode with theme context (only when darkMode changes from toggle)
  useEffect(() => {
    if (!loading) {
      const syncDarkMode = async () => {
        try {
          const saved = await SecureStore.getItemAsync('app_settings');
          const parsed = saved ? JSON.parse(saved) : {};
          if (parsed.darkMode !== isDarkMode) {
            parsed.darkMode = isDarkMode;
            await SecureStore.setItemAsync('app_settings', JSON.stringify(parsed));
          }
        } catch (error) {
          logger.error('Error syncing dark mode:', error);
        }
      };
      syncDarkMode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDarkMode]);

  const loadUserData = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      logger.error('Error loading user data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load user data',
        position: 'top',
        topOffset: 80,
      });
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await SecureStore.getItemAsync('app_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Remove darkMode from settings since it's managed by theme context
        const { darkMode, ...otherSettings } = parsed;
        setSettings({
          pushNotifications: true,
          emailNotifications: true,
          locationServices: true,
          ...otherSettings,
        });
      } else {
        // No saved settings, use defaults
        setSettings({
          pushNotifications: true,
          emailNotifications: true,
          locationServices: true,
        });
      }
    } catch (error) {
      logger.error('Error loading settings:', error);
      // Use defaults on error
      setSettings({
        pushNotifications: true,
        emailNotifications: true,
        locationServices: true,
      });
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load settings. Using defaults.',
        position: 'top',
        topOffset: 80,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      // Preserve darkMode in saved settings (managed by theme context)
      const saved = await SecureStore.getItemAsync('app_settings');
      const currentSettings = saved ? JSON.parse(saved) : {};
      const settingsToSave = {
        ...newSettings,
        darkMode: currentSettings.darkMode ?? isDarkMode,
      };
      await SecureStore.setItemAsync('app_settings', JSON.stringify(settingsToSave));
      setSettings(newSettings);
    } catch (error) {
      logger.error('Error saving settings:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save settings. Please try again.',
        position: 'top',
        topOffset: 80,
      });
    }
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Use AuthService.logout() which properly handles cleanup and prevents 401 errors
              const result = await AuthService.logout();
              if (result.success && onLogoutCallback) {
                Toast.show({
                  type: 'success',
                  text1: 'Logged out',
                  text2: 'You have been signed out.',
                  position: 'top',
                  topOffset: 80,
                });
                onLogoutCallback();
              } else if (!result.success) {
                Toast.show({
                  type: 'error',
                  text1: 'Logout Failed',
                  text2: result.message || 'Failed to logout',
                  position: 'top',
                  topOffset: 80,
                });
              }
            } catch (error) {
              logger.error('Error logging out:', error);
              // Even if logout fails, try to clear local data and call callback
              try {
                await SecureStore.deleteItemAsync('auth_token');
                await SecureStore.deleteItemAsync('user_data');
              } catch (e) {
                // Ignore cleanup errors
              }
              Toast.show({
                type: 'error',
                text1: 'Logout Error',
                text2: 'We encountered an issue logging you out.',
                position: 'top',
                topOffset: 80,
              });
              if (onLogoutCallback) {
                onLogoutCallback();
              }
            }
          },
        },
      ]
    );
  };

  // Memoize dynamicStyles to prevent recreation on every render
  const dynamicStyles = React.useMemo(() => getDynamicStyles(colors), [colors]);

  // Optimized navigation function - faster and more direct
  const navigateSafely = useCallback((routeName, params = {}) => {
    const now = Date.now();
    const timeSinceLastPress = now - lastPressTime.current;
    
    // Prevent multiple rapid navigations and concurrent navigations
    if (timeSinceLastPress < PRESS_DEBOUNCE_MS || isNavigating.current) {
      return;
    }
    
    lastPressTime.current = now;
    isNavigating.current = true;
    
    // Use requestAnimationFrame for smoother transition
    requestAnimationFrame(() => {
      try {
        // Direct navigation - React Navigation will find the route
        navigation.navigate(routeName, params);
      } catch (error) {
        logger.error('Navigation error:', error);
        Toast.show({
          type: 'error',
          text1: 'Navigation Error',
          text2: `Unable to navigate to ${routeName}.`,
          position: 'top',
          topOffset: 80,
        });
      } finally {
        // Reset navigation flag after a short delay
        setTimeout(() => {
          isNavigating.current = false;
        }, 200);
      }
    });
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.header} />
      
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            const now = Date.now();
            if (now - lastPressTime.current >= PRESS_DEBOUNCE_MS) {
              lastPressTime.current = now;
              navigation.goBack();
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={dynamicStyles.settingTitle}>Loading settings...</Text>
          </View>
        )}
        {/* Account Settings Section */}
        <View style={[styles.section, dynamicStyles.section]}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Account Settings</Text>
          
          <SettingItem
            icon="lock-closed"
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => navigateSafely('ChangePassword')}
            textSecondaryColor={colors.textSecondary}
            settingItemStyle={dynamicStyles.settingItem}
            settingTitleStyle={dynamicStyles.settingTitle}
            settingSubtitleStyle={dynamicStyles.settingSubtitle}
          />
          
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive notifications on your device"
            rightComponent={
              <Switch
                value={settings.pushNotifications}
                onValueChange={() => handleToggle('pushNotifications')}
                trackColor={{ false: '#E0E0E0', true: '#8B5CF6' }}
                thumbColor={settings.pushNotifications ? '#ffffff' : '#f4f3f4'}
              />
            }
            showArrow={false}
            textSecondaryColor={colors.textSecondary}
            settingItemStyle={dynamicStyles.settingItem}
            settingTitleStyle={dynamicStyles.settingTitle}
            settingSubtitleStyle={dynamicStyles.settingSubtitle}
          />
          
          <SettingItem
            icon="mail"
            title="Email Notifications"
            subtitle="Receive notifications via email"
            rightComponent={
              <Switch
                value={settings.emailNotifications}
                onValueChange={() => handleToggle('emailNotifications')}
                trackColor={{ false: '#E0E0E0', true: '#8B5CF6' }}
                thumbColor={settings.emailNotifications ? '#ffffff' : '#f4f3f4'}
              />
            }
            showArrow={false}
            textSecondaryColor={colors.textSecondary}
            settingItemStyle={dynamicStyles.settingItem}
            settingTitleStyle={dynamicStyles.settingTitle}
            settingSubtitleStyle={dynamicStyles.settingSubtitle}
          />
        </View>

        {/* Professional Settings Section - Only for Expert/Provider users */}
        {user && (user.role === 'Expert' || user.role === 'Provider') && (
          <View style={[styles.section, dynamicStyles.section]}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Professional Settings</Text>
            
            <SettingItem
              icon="briefcase"
              title="My Services"
              subtitle="Manage services you provide"
              onPress={() => navigateSafely('EditServices')}
              textSecondaryColor={colors.textSecondary}
              settingItemStyle={dynamicStyles.settingItem}
              settingTitleStyle={dynamicStyles.settingTitle}
              settingSubtitleStyle={dynamicStyles.settingSubtitle}
            />
            
            <SettingItem
              icon="images"
              title="Portfolio"
              subtitle="Add photos of your past work"
              onPress={() => navigateSafely('Portfolio')}
              textSecondaryColor={colors.textSecondary}
              settingItemStyle={dynamicStyles.settingItem}
              settingTitleStyle={dynamicStyles.settingTitle}
              settingSubtitleStyle={dynamicStyles.settingSubtitle}
            />
          </View>
        )}

        {/* App Settings Section */}
        <View style={[styles.section, dynamicStyles.section]}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>App Settings</Text>
          
          <SettingItem
            icon="location"
            title="Location Services"
            subtitle="Allow location access for better service matching"
            rightComponent={
              <Switch
                value={settings.locationServices}
                onValueChange={() => handleToggle('locationServices')}
                trackColor={{ false: '#E0E0E0', true: '#8B5CF6' }}
                thumbColor={settings.locationServices ? '#ffffff' : '#f4f3f4'}
              />
            }
            showArrow={false}
            textSecondaryColor={colors.textSecondary}
            settingItemStyle={dynamicStyles.settingItem}
            settingTitleStyle={dynamicStyles.settingTitle}
            settingSubtitleStyle={dynamicStyles.settingSubtitle}
          />
          
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle="Switch to dark theme"
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={(value) => toggleDarkMode(value)}
                trackColor={{ false: '#E0E0E0', true: '#8B5CF6' }}
                thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
              />
            }
            showArrow={false}
            textSecondaryColor={colors.textSecondary}
            settingItemStyle={dynamicStyles.settingItem}
            settingTitleStyle={dynamicStyles.settingTitle}
            settingSubtitleStyle={dynamicStyles.settingSubtitle}
          />
          
          <SettingItem
            icon="language"
            title="Language"
            subtitle="English"
            onPress={() => Alert.alert('Coming Soon', 'Language settings will be available soon')}
            textSecondaryColor={colors.textSecondary}
            settingItemStyle={dynamicStyles.settingItem}
            settingTitleStyle={dynamicStyles.settingTitle}
            settingSubtitleStyle={dynamicStyles.settingSubtitle}
          />
        </View>

        {/* Support Section */}
        <View style={[styles.section, dynamicStyles.section]}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Support</Text>
          
          <SettingItem
            icon="chatbubble"
            title="Contact Support"
            subtitle="Get in touch with our team"
            onPress={() => navigateSafely('ContactSupport')}
            textSecondaryColor={colors.textSecondary}
            settingItemStyle={dynamicStyles.settingItem}
            settingTitleStyle={dynamicStyles.settingTitle}
            settingSubtitleStyle={dynamicStyles.settingSubtitle}
          />
          
          <SettingItem
            icon="star"
            title="Rate App"
            subtitle="Rate us on the app store"
            onPress={() => Alert.alert('Coming Soon', 'App rating will be available soon')}
            textSecondaryColor={colors.textSecondary}
            settingItemStyle={dynamicStyles.settingItem}
            settingTitleStyle={dynamicStyles.settingTitle}
            settingSubtitleStyle={dynamicStyles.settingSubtitle}
          />
        </View>

        {/* About Section */}
        <View style={[styles.section, dynamicStyles.section]}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>About</Text>
          
          <SettingItem
            icon="information-circle"
            title="App Version"
            subtitle="1.0.0"
            showArrow={false}
            textSecondaryColor={colors.textSecondary}
            settingItemStyle={dynamicStyles.settingItem}
            settingTitleStyle={dynamicStyles.settingTitle}
            settingSubtitleStyle={dynamicStyles.settingSubtitle}
          />
          
          <SettingItem
            icon="document-text"
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() => navigateSafely('TermsOfService')}
            textSecondaryColor={colors.textSecondary}
            settingItemStyle={dynamicStyles.settingItem}
            settingTitleStyle={dynamicStyles.settingTitle}
            settingSubtitleStyle={dynamicStyles.settingSubtitle}
          />
          
          <SettingItem
            icon="shield"
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={() => navigateSafely('PrivacyPolicy')}
            textSecondaryColor={colors.textSecondary}
            settingItemStyle={dynamicStyles.settingItem}
            settingTitleStyle={dynamicStyles.settingTitle}
            settingSubtitleStyle={dynamicStyles.settingSubtitle}
          />
        </View>

        {/* Security & Logout Section */}
        <View style={[styles.section, dynamicStyles.section]}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Security & Logout</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, dynamicStyles.settingItem, styles.logoutItem]} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="log-out" size={24} color="#FF4444" />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, dynamicStyles.settingTitle, styles.logoutText]}>Logout</Text>
                <Text style={[styles.settingSubtitle, dynamicStyles.settingSubtitle]}>Sign out of your account</Text>
              </View>
            </View>
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
  section: {
    backgroundColor: colors.card,
  },
  sectionTitle: {
    color: colors.textSecondary,
    backgroundColor: colors.background,
  },
  settingItem: {
    borderBottomColor: colors.border,
  },
  settingTitle: {
    color: colors.text,
  },
  settingSubtitle: {
    color: colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: colors.card,
    borderColor: '#FF4444',
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
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SettingsScreen;