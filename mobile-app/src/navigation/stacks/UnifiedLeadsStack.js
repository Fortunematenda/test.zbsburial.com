import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CustomerLeads from '../../screens/customer/CustomerLeads';
import LeadsScreen from '../../screens/common/LeadsScreen';
import CreateLeadScreen from '../../screens/customer/CreateLeadScreen';
import LeadDetailsScreen from '../../screens/common/LeadDetailsScreen';

const Stack = createStackNavigator();

/**
 * Unified Leads Stack Navigator
 * Combines CustomerLeadsStack and ProviderLeadsStack into one role-based stack
 */
const UnifiedLeadsStack = ({ userRole }) => {
  const isCustomer = userRole === 'Customer';

  return (
    <Stack.Navigator>
      {isCustomer ? (
        <>
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
        </>
      ) : (
        <>
          <Stack.Screen 
            name="ProviderLeads" 
            component={LeadsScreen}
            options={{ 
              title: 'Available Leads',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="ProviderLeadDetails" 
            component={LeadDetailsScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default UnifiedLeadsStack;

