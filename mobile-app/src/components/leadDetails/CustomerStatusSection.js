import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

/**
 * CustomerStatusSection Component
 * Customer-specific status display with navigation to responses
 */
const CustomerStatusSection = ({
  lead,
  leadId,
  navigation,
  getStatusColor,
  getStatusText,
  styles: customStyles,
}) => {
  if (!lead) return null;

  const status = lead.displayStatus || 'pending';
  const responseCount = lead.response_count || 0;

  return (
    <View style={customStyles.statusContainer}>
      {status === 'in_progress' && responseCount > 0 ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            // Navigate to Responses tab, then to CustomerResponses screen with leadId
            navigation.navigate('Responses', {
              screen: 'CustomerResponses',
              params: { leadId: leadId }
            });
          }}
        >
          <Chip 
            style={[customStyles.statusBadgeClickable, { backgroundColor: getStatusColor(status) }]}
            textStyle={customStyles.statusBadgeText}
            icon={() => <Ionicons name="chatbubbles" size={16} color="#FFFFFF" />}
          >
            {getStatusText(status)} ({responseCount})
          </Chip>
        </TouchableOpacity>
      ) : (
        <Chip 
          style={[customStyles.statusBadge, { backgroundColor: getStatusColor(status) }]}
          textStyle={customStyles.statusBadgeText}
        >
          {getStatusText(status)}
        </Chip>
      )}
    </View>
  );
};

export default CustomerStatusSection;

