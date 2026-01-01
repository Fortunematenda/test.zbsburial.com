import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

/**
 * LeadTimeInfoSection Component
 * Shared component for displaying time information
 */
const LeadTimeInfoSection = ({ lead, formatDateTime, styles: customStyles }) => {
  if (!lead) return null;

  // For customers, show simple time_ago
  if (lead.time_ago && !lead.posted_datetime && !lead.contacted_datetime) {
    return (
      <Card style={customStyles.card}>
        <Card.Content>
          <View style={customStyles.timeInfo}>
            <Ionicons name="time" size={20} color="#666" />
            <Text style={customStyles.timeText}>{lead.time_ago || 'Just now'}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  // For providers, show detailed datetime info
  return (
    <Card style={customStyles.card}>
      <Card.Content>
        <View style={customStyles.cardHeader}>
          <Ionicons name="time" size={24} color="#8B5CF6" />
          <Text style={customStyles.cardTitle}>Time Information</Text>
        </View>
        {lead.posted_datetime && (
          <View style={customStyles.timeInfoRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={customStyles.timeLabel}>Posted:</Text>
            <Text style={customStyles.timeText}>
              {formatDateTime(lead.posted_datetime)}
            </Text>
          </View>
        )}
        {lead.contacted_datetime && (
          <View style={customStyles.timeInfoRow}>
            <Ionicons name="person-add-outline" size={16} color="#8B5CF6" />
            <Text style={customStyles.timeLabel}>Contacted:</Text>
            <Text style={customStyles.timeText}>
              {formatDateTime(lead.contacted_datetime)}
            </Text>
          </View>
        )}
        {!lead.posted_datetime && !lead.contacted_datetime && (
          <Text style={customStyles.timeText}>Just now</Text>
        )}
      </Card.Content>
    </Card>
  );
};

export default LeadTimeInfoSection;

