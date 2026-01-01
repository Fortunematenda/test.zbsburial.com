import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import logger from '../../utils/logger';

/**
 * DashboardCard Component
 * Reusable card component for dashboard stats
 */
const DashboardCard = ({ icon, title, value, onPress, color = '#8B5CF6', styles: customStyles }) => {
  if (!onPress) {
    return (
      <View style={customStyles.card}>
        <View style={customStyles.cardContent}>
          <View style={[customStyles.cardIcon, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="white" />
          </View>
          <View style={customStyles.cardText}>
            <Text style={customStyles.cardTitle}>{title}</Text>
            <Text style={customStyles.cardValue}>{value}</Text>
            <Text style={customStyles.cardLink}>View</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={customStyles.card}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={customStyles.cardContent}>
        <View style={[customStyles.cardIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="white" />
        </View>
        <View style={customStyles.cardText}>
          <Text style={customStyles.cardTitle}>{title}</Text>
          <Text style={customStyles.cardValue}>{value}</Text>
          <Text style={customStyles.cardLink}>View</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * DashboardStats Component
 * Displays dashboard statistics cards for both Customer and Provider roles
 */
const DashboardStats = ({
  user,
  dashboardData,
  navigation,
  styles: customStyles,
}) => {
  // Helper function to navigate to a tab
  const navigateToTab = (tabName) => {
    try {
      // Method 1: Try navigating through parent
      const parent = navigation.getParent();
      if (parent && typeof parent.navigate === 'function') {
        parent.navigate(tabName);
        return;
      }
      
      // Method 2: Try direct navigation
      if (navigation.navigate) {
        navigation.navigate(tabName);
        return;
      }
      
      // Method 3: Use CommonActions as fallback
      navigation.dispatch(
        CommonActions.navigate({
          name: tabName,
        })
      );
    } catch (error) {
      logger.error('Navigation error:', error);
      // Last resort: try parent one more time
      const parent = navigation.getParent();
      if (parent) parent.navigate(tabName);
    }
  };

  // Customer stats
  if (user?.role === 'Customer') {
    return (
      <View style={customStyles.cardsContainer}>
        <DashboardCard
          icon="document-text"
          title="My Requests"
          value={dashboardData.leads || 0}
          onPress={() => navigateToTab('Leads')}
          color="#8B5CF6"
          styles={customStyles}
        />
        <DashboardCard
          icon="mail"
          title="Responses"
          value={dashboardData.responses || 0}
          onPress={() => navigateToTab('Responses')}
          color="#8B5CF6"
          styles={customStyles}
        />
      </View>
    );
  }

  // Provider/Expert stats
  if (user?.role === 'Provider' || user?.role === 'Expert') {
    // Show disabled message if not verified
    if (!user?.fica_verified || !user?.verified_by) {
      return (
        <View style={customStyles.disabledCardMessage}>
          <Text style={customStyles.disabledCardText}>
            Complete FICA verification to access leads and responses
          </Text>
        </View>
      );
    }

    return (
      <View style={customStyles.cardsContainer}>
        <DashboardCard
          icon="briefcase"
          title="Available Leads"
          value={dashboardData.leads}
          onPress={() => navigateToTab('Leads')}
          color="#8B5CF6"
          styles={customStyles}
        />
        <DashboardCard
          icon="mail"
          title="My Responses"
          value={dashboardData.responses}
          onPress={() => navigateToTab('Responses')}
          color="#8B5CF6"
          styles={customStyles}
        />
        <DashboardCard
          icon="checkmark-circle"
          title="Completed Jobs"
          value={dashboardData.completedJobs}
          onPress={() => navigateToTab('Responses')}
          color="#8B5CF6"
          styles={customStyles}
        />
      </View>
    );
  }

  return null;
};

export default DashboardStats;

