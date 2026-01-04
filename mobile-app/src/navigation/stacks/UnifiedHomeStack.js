import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard from '../../screens/common/Dashboard';
import CreateLeadScreen from '../../screens/customer/CreateLeadScreen';
import LeadDetailsScreen from '../../screens/common/LeadDetailsScreen';
import ChatDetailsScreen from '../../screens/common/ChatDetailsScreen';
import ExpertProfileScreen from '../../screens/customer/ExpertProfileScreen';
import SettingsScreen from '../../screens/common/SettingsScreen';
import HelpCenterScreen from '../../screens/common/HelpCenterScreen';
import ContactSupportScreen from '../../screens/common/ContactSupportScreen';
import TermsOfServiceScreen from '../../screens/common/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../../screens/common/PrivacyPolicyScreen';
import PrivacySecurityScreen from '../../screens/common/PrivacySecurityScreen';
import ChangePasswordScreen from '../../screens/common/ChangePasswordScreen';
import PaymentMethodsScreen from '../../screens/common/PaymentMethodsScreen';
import CreditsScreen from '../../screens/common/CreditsScreen';
import CreditsHistoryScreen from '../../screens/common/CreditsHistoryScreen';
import EditServicesScreen from '../../screens/common/EditServicesScreen';
import EditLocationScreen from '../../screens/common/EditLocationScreen';
import PortfolioScreen from '../../screens/common/PortfolioScreen';
import FICAVerificationScreen from '../../screens/auth/FICAVerificationScreen';
import NotificationsScreen from '../../screens/common/NotificationsScreen';

const Stack = createStackNavigator();

/**
 * Unified Home Stack Navigator
 * Combines CustomerHomeStack and ProviderHomeStack into one role-based stack
 */
const UnifiedHomeStack = ({ onLogout, onRefreshUserData, userRole }) => {
  const isCustomer = userRole === 'Customer';

  return (
    <Stack.Navigator>
      {/* Dashboard - role-based rendering inside component */}
      {/* Include both screen names for compatibility */}
      <Stack.Screen 
        name="CustomerDashboard" 
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProviderDashboard" 
        component={Dashboard}
        options={{ headerShown: false }}
      />
      
      {/* Customer screens */}
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
      
      {/* Provider screens */}
      <Stack.Screen 
        name="ProviderLeadDetails" 
        component={LeadDetailsScreen}
        options={{ headerShown: false }}
      />
      
      {/* Shared screens */}
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
        name="ChangePassword"
        component={ChangePasswordScreen}
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
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default UnifiedHomeStack;

