import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * DashboardUserRequests Component
 * Displays customer's active requests list
 */
const DashboardUserRequests = ({
  userRequests,
  onCloseRequest,
  onHiredSomeone,
  onCreateLead,
  navigation,
  styles: customStyles,
}) => {
  if (!userRequests || userRequests.length === 0) {
    return (
      <>
        {/* Create Lead Button */}
        <TouchableOpacity 
          style={customStyles.createLeadButton}
          onPress={onCreateLead}
        >
          <Text style={customStyles.createLeadButtonText}>Create new lead</Text>
        </TouchableOpacity>

        {/* Empty State */}
        <View style={customStyles.requestsSection}>
          <Text style={customStyles.sectionTitle}>Your requests</Text>
          <View style={customStyles.emptyState}>
            <Text style={customStyles.emptyStateText}>No requests yet</Text>
            <Text style={customStyles.emptyStateSubtext}>Create your first service request to get started</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      {/* Create Lead Button */}
      <TouchableOpacity 
        style={customStyles.createLeadButton}
        onPress={onCreateLead}
      >
        <Text style={customStyles.createLeadButtonText}>Create new lead</Text>
      </TouchableOpacity>

      {/* Your Requests Section */}
      <View style={customStyles.requestsSection}>
        <Text style={customStyles.sectionTitle}>Your requests</Text>
        
        {userRequests.map((request) => (
          <TouchableOpacity 
            key={request.id} 
            style={customStyles.requestCard}
            onPress={() => {
              const leadId = request.id || request.lead_id;
              if (leadId) {
                navigation.navigate('CustomerLeadDetails', { leadId });
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={customStyles.serviceTitle}>{request.title}</Text>
            <Text style={customStyles.requestDescription} numberOfLines={2}>
              {request.description || 'No description provided'}
            </Text>
            <View style={customStyles.dateContainer}>
              <Ionicons name="time-outline" size={14} color="#8B5CF6" />
              <Text style={customStyles.requestDate}>{request.date}</Text>
            </View>
            
            <View style={customStyles.infoColumn}>
              <View style={customStyles.infoItem}>
                <Ionicons name="location" size={16} color="#8B5CF6" />
                <Text style={customStyles.infoText}>
                  {request.location || 'No location'}
                </Text>
              </View>
              <View style={customStyles.infoItem}>
                <Ionicons name="cash" size={16} color="#8B5CF6" />
                <Text style={customStyles.infoText}>
                  {(request.budget || 'No budget').toString().replace(/\$/g, 'R')}
                </Text>
              </View>
            </View>
            
            <View style={customStyles.statusContainer}>
              <View style={customStyles.statusIconWrapper}>
                <View style={[
                  customStyles.statusIcon, 
                  request.status === 'in_progress' && customStyles.statusIconBlue
                ]}>
                  <Ionicons name="checkmark" size={24} color="white" />
                </View>
                <Text style={customStyles.statusMessage}>{request.statusMessage}</Text>
              </View>
            </View>
            
            {request.status === 'in_progress' && (
              <View style={[
                customStyles.statusTag,
                customStyles.statusTagBlue
              ]}>
                <Text style={[
                  customStyles.statusTagText,
                  customStyles.statusTagTextBlue
                ]}>
                  Experts Responded
                </Text>
              </View>
            )}
            
            {request.status === 'Open' || request.status === 'pending' || request.status === 'in_progress' ? (
              <View style={customStyles.actionLinks}>
                <TouchableOpacity 
                  style={customStyles.actionLink}
                  onPress={(e) => {
                    e.stopPropagation();
                    onCloseRequest(request.id);
                  }}
                >
                  <Text style={customStyles.actionLinkText}>Close request</Text>
                </TouchableOpacity>
                <View style={customStyles.divider} />
                <TouchableOpacity 
                  style={customStyles.actionLink}
                  onPress={(e) => {
                    e.stopPropagation();
                    onHiredSomeone(request.id);
                  }}
                >
                  <Text style={customStyles.actionLinkText}>I hired someone</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={customStyles.closedBadge}>
                <Text style={customStyles.closedBadgeText}>Closed</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

export default DashboardUserRequests;

