import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

/**
 * LeadStatsSection Component
 * Shared component for displaying lead statistics (budget, credits, urgency)
 */
const LeadStatsSection = ({ lead, styles: customStyles }) => {
  if (!lead) return null;

  return (
    <>
      {/* Budget and Credits */}
      <Card style={customStyles.card}>
        <Card.Content>
          <View style={customStyles.statsContainer}>
            <View style={customStyles.statItem}>
              <Ionicons name="cash" size={24} color="#8B5CF6" />
              <Text style={customStyles.statLabel}>Credits</Text>
              <Text style={customStyles.statValue}>{lead.credits || 0}</Text>
            </View>
            {lead.budget && lead.budget !== 'Not specified' && (
              <View style={customStyles.statItem}>
                <Ionicons name="wallet" size={24} color="#8B5CF6" />
                <Text style={customStyles.statLabel}>Budget</Text>
                <Text style={customStyles.statValue}>{lead.budget.toString().replace(/\$/g, 'R')}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Urgency */}
      {lead.urgent && (
        <Card style={customStyles.card}>
          <Card.Content>
            <View style={customStyles.statsContainer}>
              <View style={customStyles.statItem}>
                <Ionicons name="alert-circle" size={24} color="#EF5350" />
                <Text style={customStyles.statLabel}>Urgent</Text>
                <Text style={customStyles.statValue}>Yes</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}
    </>
  );
};

export default LeadStatsSection;

