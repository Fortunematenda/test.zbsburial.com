import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

/**
 * LeadInfoSection Component
 * Shared component for displaying basic lead information
 */
const LeadInfoSection = ({ lead, serviceDetails, styles: customStyles }) => {
  if (!lead) return null;

  return (
    <>
      {/* Service Information */}
      <Card style={customStyles.card}>
        <Card.Content>
          <View style={customStyles.cardHeader}>
            <Ionicons name="briefcase" size={24} color="#8B5CF6" />
            <Text style={customStyles.cardTitle}>Service</Text>
          </View>
          <Text style={customStyles.serviceName}>{lead.service_name || 'Service Request'}</Text>
        </Card.Content>
      </Card>

      {/* Description */}
      <Card style={customStyles.card}>
        <Card.Content>
          <View style={customStyles.cardHeader}>
            <Ionicons name="document-text" size={24} color="#8B5CF6" />
            <Text style={customStyles.cardTitle}>Description</Text>
          </View>
          <Text style={customStyles.description}>{lead.description || 'No description provided'}</Text>
        </Card.Content>
      </Card>

      {/* Service Questions Answers */}
      {serviceDetails.length > 0 && (
        <Card style={customStyles.card}>
          <Card.Content>
            <View style={customStyles.cardHeader}>
              <Ionicons name="chatbubbles" size={24} color="#8B5CF6" />
              <Text style={customStyles.cardTitle}>Service Details</Text>
            </View>
            {serviceDetails.map((detail, index) => (
              <View key={index} style={customStyles.detailItem}>
                <Text style={customStyles.detailQuestion}>{detail.question || detail.question_id}</Text>
                <Text style={customStyles.detailAnswer}>{detail.answer}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Location */}
      <Card style={customStyles.card}>
        <Card.Content>
          <View style={customStyles.cardHeader}>
            <Ionicons name="location" size={24} color="#8B5CF6" />
            <Text style={customStyles.cardTitle}>Location</Text>
          </View>
          <Text style={customStyles.location}>{lead.location || 'Location not specified'}</Text>
        </Card.Content>
      </Card>
    </>
  );
};

export default LeadInfoSection;

