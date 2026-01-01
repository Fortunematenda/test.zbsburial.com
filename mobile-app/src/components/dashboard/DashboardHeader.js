import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../common/Avatar';

/**
 * DashboardHeader Component
 * Header section with logo, search, notifications, menu, and profile
 */
const DashboardHeader = ({
  user,
  unreadNotificationCount,
  onRefresh,
  onSearchPress,
  onNotificationsPress,
  onSettingsPress,
  onProfilePress,
  styles: customStyles,
}) => {
  return (
    <View style={customStyles.header}>
      <View style={customStyles.headerLeft}>
        <TouchableOpacity 
          style={customStyles.logoContainer}
          onPress={onRefresh}
        >
          <Image 
            source={require('../../../assets/fortailogoicon.png')} 
            style={customStyles.logoImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      
      <View style={customStyles.headerRight}>
        <View style={customStyles.headerActions}>
          <TouchableOpacity 
            style={customStyles.searchButton}
            onPress={onSearchPress}
          >
            <Ionicons name="search" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={customStyles.notificationButton}
            onPress={onNotificationsPress}
          >
            <Ionicons name="notifications" size={24} color="#8B5CF6" />
            {unreadNotificationCount > 0 && (
              <View style={customStyles.notificationBadge}>
                <Text style={customStyles.badgeText}>
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={customStyles.menuButton}
            onPress={onSettingsPress}
          >
            <Ionicons name="menu" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={customStyles.profileButton}
            onPress={onProfilePress}
          >
            <Avatar
              imageUri={user?.profile_picture}
              firstName={user?.first_name}
              lastName={user?.last_name}
              size={32}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DashboardHeader;

