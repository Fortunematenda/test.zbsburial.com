import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Text, Card, Title } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

/**
 * ProviderActionsSection Component
 * Provider-specific actions: unlock customer info, contact lead, view customer details
 */
const ProviderActionsSection = ({
  lead,
  leadId,
  navigation,
  unlockCustomerInfo,
  contactLead,
  styles: customStyles,
}) => {
  if (!lead) return null;

  const customer = lead.customer;

  return (
    <>
      {/* Customer Information Card */}
      {customer && customer.first_name ? (
        <Card style={customStyles.customerCard}>
          <Card.Content>
            <Title style={customStyles.customerTitle}>Customer Information</Title>
            <View style={customStyles.customerInfo}>
              <View style={customStyles.customerAvatar}>
                <Text style={customStyles.customerInitial}>
                  {customer.first_letter || '?'}
                </Text>
              </View>
              <View style={customStyles.customerDetails}>
                <Text style={customStyles.customerName}>
                  {customer.first_name || ''} {customer.last_name || ''}
                </Text>
                <View style={customStyles.contactInfo}>
                  <View style={customStyles.contactRow}>
                    <Ionicons name="mail" size={16} color="#666" />
                    <Text style={customStyles.customerEmail}>{customer.email || 'Email not available'}</Text>
                  </View>
                  <View style={customStyles.contactRow}>
                    <Ionicons name="call" size={16} color="#666" />
                    <Text style={customStyles.customerPhone}>{customer.contact_number || 'Phone not available'}</Text>
                    {customer.is_phone_verified && (
                      <View style={customStyles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={customStyles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
            
            {/* Unlock Contact Details Button - Only show if not unlocked */}
            {!customer.is_unlocked && (
              <View style={customStyles.unlockSection}>
                <View style={customStyles.unlockInfo}>
                  <Ionicons name="lock-closed" size={20} color="#FF6B6B" />
                  <Text style={customStyles.unlockText}>
                    Pay {lead.credits || 0} credits to unlock email and phone number
                  </Text>
                </View>
                <TouchableOpacity 
                  style={customStyles.unlockButton}
                  onPress={() => unlockCustomerInfo(navigation)}
                >
                  <Ionicons name="lock-open" size={16} color="white" />
                  <Text style={customStyles.unlockButtonText}>Unlock Contact Details</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Contact Actions - Only show if unlocked */}
            {customer.is_unlocked && (
              <View style={customStyles.contactActionsSection}>
                <Text style={customStyles.contactActionsTitle}>Contact Options</Text>
                <View style={customStyles.contactActionsRow}>
                  <TouchableOpacity 
                    style={customStyles.contactActionButton}
                    onPress={() => {
                      if (customer.contact_number) {
                        const phoneNumber = customer.contact_number.replace(/[^\d]/g, '');
                        Linking.openURL(`tel:${phoneNumber}`);
                      } else {
                        Alert.alert('No Phone Number', 'Phone number is not available.');
                      }
                    }}
                  >
                    <Ionicons name="call" size={20} color="#4CAF50" />
                    <Text style={customStyles.contactActionText}>Call</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={customStyles.contactActionButton}
                    onPress={() => {
                      if (customer.email) {
                        Linking.openURL(`mailto:${customer.email}`);
                      } else {
                        Alert.alert('No Email', 'Email address is not available.');
                      }
                    }}
                  >
                    <Ionicons name="mail" size={20} color="#8B5CF6" />
                    <Text style={customStyles.contactActionText}>Email</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={customStyles.contactActionButton}
                    onPress={() => {
                      navigation.navigate('ChatDetails', {
                        leadId: leadId,
                        providerId: customer.id,
                        serviceName: lead.service_name || 'Service',
                        providerName: `${customer.first_name} ${customer.last_name}`,
                      });
                    }}
                  >
                    <Ionicons name="chatbubble" size={20} color="#8B5CF6" />
                    <Text style={customStyles.contactActionText}>Chat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      ) : (
        <Card style={customStyles.customerCard}>
          <Card.Content>
            <Title style={customStyles.customerTitle}>Customer Information</Title>
            <View style={customStyles.noCustomerInfo}>
              <Ionicons name="person-outline" size={48} color="#ccc" />
              <Text style={customStyles.noCustomerText}>Customer information not available</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Contact Lead Button (if not already contacted) */}
      {!lead.contacted && (
        <Card style={customStyles.card}>
          <Card.Content>
            <TouchableOpacity 
              style={customStyles.contactButton}
              onPress={contactLead}
            >
              <Ionicons name="mail" size={20} color="#FFFFFF" />
              <Text style={customStyles.contactButtonText}>
                Contact Lead ({lead.credits || 0} credits)
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      )}
    </>
  );
};

export default ProviderActionsSection;

