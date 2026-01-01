import React, { useMemo, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigationState, CommonActions } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import Common Screens
import Dashboard from '../screens/common/Dashboard';
import LeadsScreen from '../screens/common/LeadsScreen';
import ResponsesScreen from '../screens/common/ResponsesScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import ChatScreen from '../screens/common/ChatScreen';
import ChatDetailsScreen from '../screens/common/ChatDetailsScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import EditServicesScreen from '../screens/common/EditServicesScreen';
import EditLocationScreen from '../screens/common/EditLocationScreen';
import EditCompanyScreen from '../screens/common/EditCompanyScreen';
import PortfolioScreen from '../screens/common/PortfolioScreen';
import FICAVerificationScreen from '../screens/auth/FICAVerificationScreen';
import HelpCenterScreen from '../screens/common/HelpCenterScreen';
import ContactSupportScreen from '../screens/common/ContactSupportScreen';
import TermsOfServiceScreen from '../screens/common/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/common/PrivacyPolicyScreen';
import PrivacySecurityScreen from '../screens/common/PrivacySecurityScreen';
import PaymentMethodsScreen from '../screens/common/PaymentMethodsScreen';
import CreditsScreen from '../screens/common/CreditsScreen';
import CreditsHistoryScreen from '../screens/common/CreditsHistoryScreen';

// Import Customer Screens
import CustomerLeads from '../screens/customer/CustomerLeads';
import CreateLeadScreen from '../screens/customer/CreateLeadScreen';
import ExpertProfileScreen from '../screens/customer/ExpertProfileScreen';

// Import Unified Lead Details Screen (replaces both LeadDetailsScreen and CustomerLeadDetailsScreen)
import LeadDetailsScreen from '../screens/common/LeadDetailsScreen';

// Import Service Provider Screens
import ProviderLeads from '../screens/provider/ProviderLeads';

// Import Unified Stack Navigators
import UnifiedHomeStack from './stacks/UnifiedHomeStack';
import UnifiedProfileStack from './stacks/UnifiedProfileStack';
import UnifiedLeadsStack from './stacks/UnifiedLeadsStack';
import UnifiedResponsesStack from './stacks/UnifiedResponsesStack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ============================================================================
// OLD STACK NAVIGATORS - DEPRECATED (Replaced by Unified Stacks)
// ============================================================================
// These are kept for reference but are no longer used.
// All navigation now uses UnifiedHomeStack, UnifiedProfileStack, 
// UnifiedLeadsStack, and UnifiedResponsesStack from ./stacks/
// ============================================================================

// Customer Home Stack Navigator - DEPRECATED
/*
const CustomerHomeStack = ({ onLogout, onRefreshUserData }) => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CustomerDashboard" 
      component={Dashboard}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CustomerCreateLead" 
      component={CreateLeadScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CustomerLeadDetails" 
      component={LeadDetailsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ChatDetails" 
      component={ChatDetailsScreen}
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    />
    <Stack.Screen 
      name="ExpertProfile" 
      component={ExpertProfileScreen}
      options={{ 
        title: 'Expert Profile',
        headerShown: false,
      }}
    />
    <Stack.Screen 
      name="Settings" 
      options={{ headerShown: false }}
    >
      {(props) => <SettingsScreen {...props} onLogout={onLogout} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="HelpCenter" 
      component={HelpCenterScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ContactSupport" 
      component={ContactSupportScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="TermsOfService" 
      component={TermsOfServiceScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PrivacyPolicy" 
      component={PrivacyPolicyScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PrivacySecurity" 
      component={PrivacySecurityScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PaymentMethods" 
      component={PaymentMethodsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Credits" 
      component={CreditsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CreditsHistory" 
      component={CreditsHistoryScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="EditServices" 
      options={{ headerShown: false }}
    >
      {(props) => <EditServicesScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="EditLocation" 
      options={{ headerShown: false }}
    >
      {(props) => <EditLocationScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="Portfolio" 
      component={PortfolioScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="FICAVerification"
      options={{ headerShown: false }}
    >
      {(props) => <FICAVerificationScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
  </Stack.Navigator>
);

// Customer Leads Stack Navigator
const CustomerLeadsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CustomerLeads" 
      component={CustomerLeads}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CustomerLeadsCreateLead" 
      component={CreateLeadScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CustomerLeadsDetails" 
      component={LeadDetailsScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);
*/

// Customer Profile Stack Navigator - DEPRECATED
/*
const CustomerProfileStack = ({ onLogout, onRefreshUserData }) => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CustomerProfile" 
      options={{ headerShown: false }}
    >
      {(props) => <ProfileScreen {...props} onLogout={onLogout} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="Settings" 
      options={{ headerShown: false }}
    >
      {(props) => <SettingsScreen {...props} onLogout={onLogout} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="PrivacySecurity" 
      component={PrivacySecurityScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PaymentMethods" 
      component={PaymentMethodsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Credits" 
      component={CreditsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CreditsHistory" 
      component={CreditsHistoryScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="HelpCenter" 
      component={HelpCenterScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ContactSupport" 
      component={ContactSupportScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="TermsOfService" 
      component={TermsOfServiceScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PrivacyPolicy" 
      component={PrivacyPolicyScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="EditServices" 
      options={{ headerShown: false }}
    >
      {(props) => <EditServicesScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="EditLocation" 
      options={{ headerShown: false }}
    >
      {(props) => <EditLocationScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="Portfolio" 
      component={PortfolioScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="FICAVerification"
      options={{ headerShown: false }}
    >
      {(props) => <FICAVerificationScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
  </Stack.Navigator>
);
*/

// Provider Home Stack Navigator - DEPRECATED
/*
const ProviderHomeStack = ({ onLogout, onRefreshUserData }) => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProviderDashboard" 
      component={Dashboard}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Settings" 
      options={{ headerShown: false }}
    >
      {(props) => <SettingsScreen {...props} onLogout={onLogout} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="HelpCenter" 
      component={HelpCenterScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ContactSupport" 
      component={ContactSupportScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="TermsOfService" 
      component={TermsOfServiceScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PrivacyPolicy" 
      component={PrivacyPolicyScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PrivacySecurity" 
      component={PrivacySecurityScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PaymentMethods" 
      component={PaymentMethodsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Credits" 
      component={CreditsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CreditsHistory" 
      component={CreditsHistoryScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="EditServices" 
      options={{ headerShown: false }}
    >
      {(props) => <EditServicesScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="EditLocation" 
      options={{ headerShown: false }}
    >
      {(props) => <EditLocationScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="Portfolio" 
      component={PortfolioScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="FICAVerification"
      options={{ headerShown: false }}
    >
      {(props) => <FICAVerificationScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
  </Stack.Navigator>
);
*/

// Provider Leads Stack Navigator - DEPRECATED
/*
const ProviderLeadsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProviderLeads" 
      component={LeadsScreen}
      options={{ 
        title: 'Available Leads',
        headerRight: () => (
          <TouchableOpacity style={{ padding: 8 }}>
            <Ionicons name="filter" size={24} color="#8B5CF6" />
          </TouchableOpacity>
        )
      }}
    />
    <Stack.Screen 
      name="ProviderLeadDetails" 
      component={LeadDetailsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ChatDetails" 
      component={ChatDetailsScreen}
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    />
    <Stack.Screen 
      name="ExpertProfile" 
      component={ExpertProfileScreen}
      options={{ 
        title: 'Expert Profile',
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);
*/

// Customer Responses Stack Navigator (Chat for customers) - DEPRECATED
/*
const CustomerResponsesStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CustomerResponses" 
      component={ChatScreen}
      options={{ 
        headerShown: false,
      }}
    />
    <Stack.Screen 
      name="ChatDetails" 
      component={ChatDetailsScreen}
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    />
    <Stack.Screen 
      name="ExpertProfile" 
      component={ExpertProfileScreen}
      options={{ 
        title: 'Expert Profile',
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);
*/

// Provider Responses Stack Navigator - DEPRECATED
/*
const ProviderResponsesStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProviderResponses" 
      component={ResponsesScreen}
      options={{ 
        headerShown: false,
      }}
    />
    <Stack.Screen 
      name="LeadDetails" 
      component={LeadDetailsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ChatDetails" 
      component={ChatDetailsScreen}
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    />
    <Stack.Screen 
      name="ExpertProfile" 
      component={ExpertProfileScreen}
      options={{ 
        title: 'Expert Profile',
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);
*/

// Provider Profile Stack Navigator - DEPRECATED
/*
const ProviderProfileStack = ({ onLogout, onRefreshUserData }) => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProviderProfile" 
      options={{ headerShown: false }}
    >
      {(props) => <ProfileScreen {...props} onLogout={onLogout} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="Settings" 
      options={{ headerShown: false }}
    >
      {(props) => <SettingsScreen {...props} onLogout={onLogout} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="PrivacySecurity" 
      component={PrivacySecurityScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PaymentMethods" 
      component={PaymentMethodsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Credits" 
      component={CreditsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CreditsHistory" 
      component={CreditsHistoryScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="HelpCenter" 
      component={HelpCenterScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ContactSupport" 
      component={ContactSupportScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="TermsOfService" 
      component={TermsOfServiceScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PrivacyPolicy" 
      component={PrivacyPolicyScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="EditServices" 
      options={{ headerShown: false }}
    >
      {(props) => <EditServicesScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="EditLocation" 
      options={{ headerShown: false }}
    >
      {(props) => <EditLocationScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="Portfolio" 
      component={PortfolioScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="FICAVerification"
      options={{ headerShown: false }}
    >
      {(props) => <FICAVerificationScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
  </Stack.Navigator>
);
*/

// Common Stack Navigator (Still in use for "More" tab)
const CommonStack = ({ onLogout, onRefreshUserData }) => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MoreHome"
      options={{ headerShown: false }}
    >
      {(props) => <SettingsScreen {...props} onLogout={onLogout} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="HelpCenter" 
      component={HelpCenterScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ContactSupport" 
      component={ContactSupportScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="TermsOfService" 
      component={TermsOfServiceScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PrivacyPolicy" 
      component={PrivacyPolicyScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PrivacySecurity" 
      component={PrivacySecurityScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PaymentMethods" 
      component={PaymentMethodsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Credits" 
      component={CreditsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CreditsHistory" 
      component={CreditsHistoryScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Chat" 
      component={ChatScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Notifications" 
      component={NotificationsScreen}
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen 
      name="EditServices" 
      options={{ headerShown: false }}
    >
      {(props) => <EditServicesScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="EditLocation" 
      options={{ headerShown: false }}
    >
      {(props) => <EditLocationScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="Portfolio" 
      component={PortfolioScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="EditCompany" 
      options={{ headerShown: false }}
    >
      {(props) => <EditCompanyScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
    <Stack.Screen 
      name="FICAVerification"
      options={{ headerShown: false }}
    >
      {(props) => <FICAVerificationScreen {...props} onRefreshUserData={onRefreshUserData} />}
    </Stack.Screen>
  </Stack.Navigator>
);

const MainNavigator = ({ user, onLogout, onRefreshUserData }) => {
  const isCustomer = user?.role === 'Customer';
  const isProvider = user?.role === 'Provider' || user?.role === 'Expert';
  const isUnverifiedExpert = user?.role === 'Expert' && (!user?.fica_verified || !user?.verified_by);
  const insets = useSafeAreaInsets();
  
  // Memoize unified stack navigators
  const memoizedUnifiedHomeStack = useMemo(() => 
    (props) => <UnifiedHomeStack {...props} onLogout={onLogout} onRefreshUserData={onRefreshUserData} userRole={user?.role} />,
    [onLogout, onRefreshUserData, user?.role]
  );

  const memoizedUnifiedProfileStack = useMemo(() => 
    (props) => <UnifiedProfileStack {...props} onLogout={onLogout} onRefreshUserData={onRefreshUserData} userRole={user?.role} />,
    [onLogout, onRefreshUserData, user?.role]
  );

  const memoizedUnifiedLeadsStack = useMemo(() => 
    (props) => <UnifiedLeadsStack {...props} userRole={user?.role} />,
    [user?.role]
  );

  const memoizedUnifiedResponsesStack = useMemo(() => 
    (props) => <UnifiedResponsesStack {...props} userRole={user?.role} />,
    [user?.role]
  );

  const memoizedCommonStack = useMemo(() => 
    (props) => <CommonStack {...props} onLogout={onLogout} onRefreshUserData={onRefreshUserData} />,
    [onLogout, onRefreshUserData]
  );

  // Memoize screen options to prevent recreation
  const screenOptions = useCallback(({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;
      if (route.name === 'Home') {
        iconName = focused ? 'home' : 'home-outline';
      } else if (route.name === 'Leads') {
        iconName = focused ? 'list' : 'list-outline';
      } else if (route.name === 'Responses') {
        iconName = focused ? 'mail' : 'mail-outline';
      } else if (route.name === 'Profile') {
        iconName = focused ? 'person' : 'person-outline';
      } else if (route.name === 'More') {
        iconName = focused ? 'menu' : 'menu-outline';
      }
      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#8B5CF6',
    tabBarInactiveTintColor: 'gray',
    headerShown: false,
    tabBarHideOnKeyboard: true,
    lazy: true, // Enable lazy loading
    tabBarStyle: {
      backgroundColor: '#ffffff',
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
      paddingBottom: Math.max(insets.bottom, 5),
      paddingTop: 5,
      height: 60 + Math.max(insets.bottom - 5, 0),
    },
    animationEnabled: false, // Disable animations for better performance
  }), [insets.bottom]);

  // Refresh user data when component mounts or user changes
  React.useEffect(() => {
    if (user && onRefreshUserData) {
      onRefreshUserData();
    }
  }, [user?.id]); // Only refresh when user ID changes

  return (
    <Tab.Navigator
        initialRouteName="Home"
        screenOptions={screenOptions}
        detachInactiveScreens={true} // Improve performance by detaching inactive screens
    >
      <Tab.Screen 
        name="Home" 
        options={{ title: 'Home' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Close Notifications if open when switching to Home tab
            const state = navigation.getState();
            const homeTab = state.routes.find(r => r.name === 'Home');
            if (homeTab && homeTab.state) {
              const stackState = homeTab.state;
              const currentRoute = stackState.routes[stackState.index];
              if (currentRoute?.name === 'Notifications') {
                // Pop Notifications screen by navigating to Dashboard
                const dashboardScreen = isCustomer ? 'CustomerDashboard' : 'ProviderDashboard';
                navigation.navigate('Home', { screen: dashboardScreen });
              }
            }
          },
        })}
      >
        {memoizedUnifiedHomeStack}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Leads" 
        options={{ 
          title: isCustomer ? 'My Requests' : 'Leads',
          tabBarButton: isUnverifiedExpert ? () => null : undefined,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Close Notifications if open when switching to Leads tab
            const state = navigation.getState();
            const homeTab = state.routes.find(r => r.name === 'Home');
            if (homeTab && homeTab.state) {
              const stackState = homeTab.state;
              const currentRoute = stackState.routes[stackState.index];
              if (currentRoute?.name === 'Notifications') {
                // Pop Notifications screen by navigating to Dashboard
                const dashboardScreen = isCustomer ? 'CustomerDashboard' : 'ProviderDashboard';
                navigation.navigate('Home', { screen: dashboardScreen });
              }
            }
          },
        })}
      >
        {memoizedUnifiedLeadsStack}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Responses"
        options={{ 
          title: isCustomer ? 'Chat' : 'Responses',
          tabBarButton: isUnverifiedExpert ? () => null : undefined,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Close Notifications if open when switching to Responses tab
            const state = navigation.getState();
            const homeTab = state.routes.find(r => r.name === 'Home');
            if (homeTab && homeTab.state) {
              const stackState = homeTab.state;
              const currentRoute = stackState.routes[stackState.index];
              if (currentRoute?.name === 'Notifications') {
                // Pop Notifications screen by navigating to Dashboard
                const dashboardScreen = isCustomer ? 'CustomerDashboard' : 'ProviderDashboard';
                navigation.navigate('Home', { screen: dashboardScreen });
              }
            }
            
            // Always reset to the initial screen (list, not chat) when tab is pressed
            // This ensures we always show the chat list, not a previous chat conversation
            const responsesTab = state.routes.find(r => r.name === 'Responses');
            const initialScreenName = isCustomer ? 'CustomerResponses' : 'ProviderResponses';
            
            if (responsesTab && responsesTab.state) {
              const stackState = responsesTab.state;
              const currentRoute = stackState.routes[stackState.index];
              
              // If we're not on the initial screen (list), reset to it
              if (currentRoute?.name !== initialScreenName) {
                // Prevent default tab press to handle reset manually
                e.preventDefault();
                
                // Reset the Responses stack to show only the list screen
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'Responses',
                        state: {
                          routes: [{ name: initialScreenName }],
                          index: 0,
                        },
                      },
                    ],
                  })
                );
              }
            }
          },
        })}
      >
        {memoizedUnifiedResponsesStack}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Profile" 
        options={{ title: 'Profile' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Close Notifications if open when switching to Profile tab
            const state = navigation.getState();
            const homeTab = state.routes.find(r => r.name === 'Home');
            if (homeTab && homeTab.state) {
              const stackState = homeTab.state;
              const currentRoute = stackState.routes[stackState.index];
              if (currentRoute?.name === 'Notifications') {
                // Pop Notifications screen by navigating to Dashboard
                const dashboardScreen = isCustomer ? 'CustomerDashboard' : 'ProviderDashboard';
                navigation.navigate('Home', { screen: dashboardScreen });
              }
            }
          },
        })}
      >
        {memoizedUnifiedProfileStack}
      </Tab.Screen>
      
      <Tab.Screen 
        name="More" 
        options={{ title: 'More' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Close Notifications if open when switching to More tab
            const state = navigation.getState();
            const homeTab = state.routes.find(r => r.name === 'Home');
            if (homeTab && homeTab.state) {
              const stackState = homeTab.state;
              const currentRoute = stackState.routes[stackState.index];
              if (currentRoute?.name === 'Notifications') {
                // Pop Notifications screen by navigating to Dashboard
                const dashboardScreen = isCustomer ? 'CustomerDashboard' : 'ProviderDashboard';
                navigation.navigate('Home', { screen: dashboardScreen });
              }
            }
            
            // Always reset to MoreHome (Settings) when tab is pressed
            // This ensures Settings is always shown, not Notifications or other screens
            const moreTab = state.routes.find(r => r.name === 'More');
            
            if (moreTab && moreTab.state) {
              const stackState = moreTab.state;
              const currentRoute = stackState.routes[stackState.index];
              
              // If we're not on MoreHome, prevent default and reset to it
              if (currentRoute?.name !== 'MoreHome') {
                e.preventDefault();
                
                // Use navigate with reset to ensure we go to MoreHome
                navigation.navigate('More', {
                  screen: 'MoreHome',
                });
                
                // Then reset the stack after a brief delay to ensure navigation completes
                setTimeout(() => {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [
                        {
                          name: 'More',
                          state: {
                            routes: [{ name: 'MoreHome' }],
                            index: 0,
                          },
                        },
                      ],
                    })
                  );
                }, 100);
              }
              // If already on MoreHome, let default behavior happen (just switch tabs)
            }
            // If More tab doesn't have state yet, let default behavior happen
          },
        })}
      >
        {memoizedCommonStack}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainNavigator;
