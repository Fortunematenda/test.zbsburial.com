import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../../screens/common/ProfileScreen';
import SettingsScreen from '../../screens/common/SettingsScreen';
import PrivacySecurityScreen from '../../screens/common/PrivacySecurityScreen';
import PaymentMethodsScreen from '../../screens/common/PaymentMethodsScreen';
import CreditsScreen from '../../screens/common/CreditsScreen';
import CreditsHistoryScreen from '../../screens/common/CreditsHistoryScreen';
import HelpCenterScreen from '../../screens/common/HelpCenterScreen';
import ContactSupportScreen from '../../screens/common/ContactSupportScreen';
import TermsOfServiceScreen from '../../screens/common/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../../screens/common/PrivacyPolicyScreen';
import EditServicesScreen from '../../screens/common/EditServicesScreen';
import EditLocationScreen from '../../screens/common/EditLocationScreen';
import PortfolioScreen from '../../screens/common/PortfolioScreen';
import FICAVerificationScreen from '../../screens/auth/FICAVerificationScreen';

const Stack = createStackNavigator();

/**
 * Unified Profile Stack Navigator
 * Combines CustomerProfileStack and ProviderProfileStack into one role-based stack
 */
const UnifiedProfileStack = ({ onLogout, onRefreshUserData, userRole }) => {
  const isCustomer = userRole === 'Customer';
  
  return (
    <Stack.Navigator>
      {/* Include both screen names for compatibility */}
      <Stack.Screen 
        name="CustomerProfile" 
        options={{ headerShown: false }}
      >
        {(props) => <ProfileScreen {...props} onLogout={onLogout} onRefreshUserData={onRefreshUserData} />}
      </Stack.Screen>
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
};

export default UnifiedProfileStack;

