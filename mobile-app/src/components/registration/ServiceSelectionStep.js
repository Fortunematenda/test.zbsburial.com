import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card } from 'react-native-paper';

/**
 * ServiceSelectionStep Component
 * Service selection for customers (shown in renderStep1 for customers)
 */
const ServiceSelectionStep = ({
  userType,
  services,
  selectedServices,
  setSelectedServices,
  showServiceModal,
  setShowServiceModal,
  prevStep,
  nextStep,
  styles,
}) => {
  if (userType !== 'customer') {
    return null; // This step is only for customers
  }

  return (
    <>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.sectionTitle}>What service are you looking for?</Text>
          <Text style={styles.sectionSubtitle}>Select the service you need help with</Text>
          
          <TouchableOpacity 
            style={styles.serviceDropdown}
            onPress={() => setShowServiceModal(true)}
          >
            <Text style={styles.serviceDropdownText}>
              {selectedServices.length > 0 
                ? `Selected: ${services.find(s => s.id === selectedServices[0])?.service_name || ''}`
                : 'Tap to select a service'
              }
            </Text>
            <Text style={styles.serviceDropdownIcon}>▼</Text>
          </TouchableOpacity>

          {selectedServices.length > 0 && (
            <View style={styles.selectedServicesContainer}>
              <View style={styles.selectedServiceChip}>
                <Text style={styles.selectedServiceText}>
                  {services.find(s => s.id === selectedServices[0])?.service_name}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={prevStep} style={styles.backButton}>
              Back
            </Button>
            <Button 
              mode="contained" 
              onPress={nextStep} 
              style={styles.nextButton}
              disabled={selectedServices.length === 0}
            >
              Next
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Service Selection Modal */}
      <Modal
        visible={showServiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowServiceModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Services</Text>
            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setShowServiceModal(false)}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Select the service you need help with
            </Text>
            
            <FlatList
              data={services}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.serviceModalItem,
                    selectedServices.includes(item.id) && styles.serviceModalItemSelected
                  ]}
                  onPress={() => {
                    // For customers, only allow one service selection
                    setSelectedServices([item.id]);
                    setShowServiceModal(false);
                  }}
                >
                  <View style={styles.serviceModalContent}>
                    <View style={styles.serviceModalIcon}>
                      <Text style={[
                        styles.serviceModalIconText,
                        selectedServices.includes(item.id) && styles.serviceModalIconTextSelected
                      ]}>
                        {selectedServices.includes(item.id) ? '✓' : '○'}
                      </Text>
                    </View>
                    <Text style={[
                      styles.serviceModalLabel,
                      selectedServices.includes(item.id) && styles.serviceModalLabelSelected
                    ]}>
                      {item.service_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default ServiceSelectionStep;

