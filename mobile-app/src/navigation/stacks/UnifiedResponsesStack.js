import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatScreen from '../../screens/common/ChatScreen';
import ResponsesScreen from '../../screens/common/ResponsesScreen';
import LeadDetailsScreen from '../../screens/common/LeadDetailsScreen';
import ChatDetailsScreen from '../../screens/common/ChatDetailsScreen';
import ExpertProfileScreen from '../../screens/customer/ExpertProfileScreen';

const Stack = createStackNavigator();

/**
 * Unified Responses Stack Navigator
 * Combines CustomerResponsesStack and ProviderResponsesStack into one role-based stack
 */
const UnifiedResponsesStack = ({ userRole }) => {
  const isCustomer = userRole === 'Customer';

  return (
    <Stack.Navigator>
      {isCustomer ? (
        <>
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
        </>
      ) : (
        <>
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
        </>
      )}
    </Stack.Navigator>
  );
};

export default UnifiedResponsesStack;

