import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatBudget, getUrgencyColor } from '../../utils/leadsHelpers';

/**
 * LeadCard Component
 * Displays a single lead card with all details
 */
const LeadCard = ({ lead, navigation, unlockingLeadId, onUnlock }) => {
  // Ensure all values are properly handled
  const safeLead = {
    id: lead?.id || 0,
    title: lead?.title || 'Untitled',
    description: lead?.description || 'No description',
    location: lead?.location || 'Location not specified',
    budget: formatBudget(lead?.budget) || 'Price not specified',
    date: lead?.date || 'Date not specified',
    distance: lead?.distance || null,
    urgency: lead?.urgency || 'Normal',
    urgent: lead?.urgent || false,
    frequent: lead?.frequent || 0,
    is_phone_verified: lead?.is_phone_verified || 0,
    contacted: lead?.contacted || 0,
    remender: lead?.remender || 0,
    user: lead?.user || null
  };

  return (
    <TouchableOpacity 
      style={styles.leadCard}
      onPress={() => navigation.navigate('ProviderLeadDetails', { 
        leadId: safeLead.id
      })}
    >
      <View style={styles.leadHeader}>
        <Text style={styles.leadTitle}>{safeLead.title}</Text>
        <View style={[styles.urgencyTag, { backgroundColor: getUrgencyColor(safeLead.urgency) }]}>
          <Text style={styles.urgencyText}>{safeLead.urgency}</Text>
        </View>
      </View>
      
      <Text style={styles.leadDescription}>{safeLead.description}</Text>
      
      <View style={styles.leadDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={16} color="#8B5CF6" />
          <Text style={styles.detailText}>{safeLead.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash" size={16} color="#8B5CF6" />
          <Text style={styles.detailText}>{safeLead.budget}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color="#8B5CF6" />
          <Text style={styles.detailText}>{safeLead.date}</Text>
        </View>
        {safeLead.distance && (
          <View style={styles.detailItem}>
            <Ionicons name="navigate" size={16} color="#8B5CF6" />
            <Text style={styles.detailText}>{safeLead.distance}</Text>
          </View>
        )}
      </View>
      
      {/* Desktop-style badges */}
      <View style={styles.badgesContainer}>
        {safeLead.urgent && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Urgent</Text>
          </View>
        )}
        {safeLead.frequent > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Frequent</Text>
          </View>
        )}
        {safeLead.is_phone_verified > 0 && (
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
            <Text style={styles.badgeText}>Verified</Text>
          </View>
        )}
        {safeLead.contacted > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{safeLead.contacted} contacted</Text>
          </View>
        )}
        {safeLead.remender > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{safeLead.remender} remaining</Text>
          </View>
        )}
      </View>
      
      {safeLead.user && (
        <View style={styles.leadFooter}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitial}>
                {safeLead.user.initial || safeLead.user.name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{safeLead.user.name || 'Unknown User'}</Text>
              <View style={styles.userRating}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{safeLead.user.rating || 0}</Text>
                <Text style={styles.completedJobs}>({safeLead.user.completedJobs || 0} hired, {safeLead.user.hiredRate || 0}%)</Text>
              </View>
            </View>
          </View>
          
          {onUnlock && (
            <TouchableOpacity 
              style={[styles.respondButton, unlockingLeadId === safeLead.id && styles.respondButtonDisabled]}
              onPress={(e) => {
                e.stopPropagation(); // Prevent card navigation
                onUnlock(lead);
              }}
              disabled={unlockingLeadId === safeLead.id}
            >
              {unlockingLeadId === safeLead.id ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.respondButtonText}>Respond</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  leadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  urgencyTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leadDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  leadDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
  },
  completedJobs: {
    fontSize: 12,
    color: '#999',
  },
  respondButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  respondButtonDisabled: {
    opacity: 0.6,
  },
  respondButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default LeadCard;

