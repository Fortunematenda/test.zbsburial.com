import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

/**
 * LeadImagesSection Component
 * Shared component for displaying lead images
 */
const LeadImagesSection = ({ 
  lead, 
  formatImageUrl, 
  onImagePress,
  styles: customStyles 
}) => {
  if (!lead?.images || lead.images.length === 0) {
    return null;
  }

  return (
    <Card style={customStyles.card}>
      <Card.Content>
        <View style={customStyles.cardHeader}>
          <Ionicons name="images" size={24} color="#8B5CF6" />
          <Text style={customStyles.cardTitle}>Photos</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {lead.images.map((image, index) => {
            const imageUrl = formatImageUrl(image);
            if (!imageUrl) return null;
            
            return (
              <TouchableOpacity 
                key={index}
                onPress={() => onImagePress(imageUrl)}
              >
                <Image 
                  source={{ uri: imageUrl }} 
                  style={customStyles.image}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Card.Content>
    </Card>
  );
};

export default LeadImagesSection;

