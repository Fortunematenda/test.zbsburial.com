import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * DashboardHiredModal Component
 * Modal for selecting an expert when customer marks request as "hired"
 */
const DashboardHiredModal = ({
  visible,
  experts,
  loadingExperts,
  updatingStatus,
  onClose,
  onSelectExpert,
  styles: customStyles,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={customStyles.modalOverlay}>
        <View style={customStyles.modalContent}>
          <View style={customStyles.modalHeader}>
            <Text style={customStyles.modalTitle}>Who did you hire?</Text>
            <TouchableOpacity
              onPress={onClose}
              style={customStyles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {loadingExperts ? (
            <View style={customStyles.modalLoadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={customStyles.modalLoadingText}>Loading experts...</Text>
            </View>
          ) : (
            <ScrollView style={customStyles.modalBody}>
              {/* Option: Not on list */}
              <TouchableOpacity
                style={customStyles.expertOption}
                onPress={() => onSelectExpert(0)}
              >
                <Ionicons name="person-add-outline" size={24} color="#8B5CF6" />
                <Text style={customStyles.expertOptionText}>I hired someone not on the list</Text>
              </TouchableOpacity>

              {experts.length > 0 && (
                <>
                  <View style={customStyles.expertDivider}>
                    <Text style={customStyles.expertDividerText}>Or select an expert:</Text>
                  </View>
                  {experts.map((expert) => (
                    <TouchableOpacity
                      key={expert.id}
                      style={customStyles.expertOption}
                      onPress={() => onSelectExpert(expert.id)}
                    >
                      <Ionicons name="person" size={24} color="#8B5CF6" />
                      <Text style={customStyles.expertOptionText}>
                        {expert.first_name} {expert.last_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {experts.length === 0 && (
                <Text style={customStyles.noExpertsText}>
                  No experts have responded to this request yet.
                </Text>
              )}
            </ScrollView>
          )}

          {updatingStatus && (
            <View style={customStyles.modalFooter}>
              <ActivityIndicator size="small" color="#8B5CF6" />
              <Text style={customStyles.modalFooterText}>Updating...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default DashboardHiredModal;

