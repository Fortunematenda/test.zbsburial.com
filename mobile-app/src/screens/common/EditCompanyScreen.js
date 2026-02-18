import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import ApiService from '../../services/ApiService';
import Toast from 'react-native-toast-message';

const EditCompanyScreen = ({ navigation, onRefreshUserData }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    biography: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await ApiService.user.getProfile();
      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setFormData({
          company_name: userData.company_name || '',
          biography: userData.biography || '',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Failed to load company details',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data for API
      const updateData = {
        company_name: formData.company_name || '',
        biography: formData.biography || '',
      };
      
      // Update company details via API
      const response = await ApiService.user.updateProfile(updateData);
      
      if (response.success || response.status === 'success') {
        // Update SecureStore with fresh data
        const updatedUser = {
          ...user,
          ...updateData,
        };
        await SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
        
        // Refresh user data in parent components if callback exists
        if (onRefreshUserData) {
          await onRefreshUserData();
        }
        
        Toast.show({
          type: 'success',
          text1: '',
          text2: 'Company details updated successfully',
          position: 'top',
          topOffset: 100,
          visibilityTime: 1500,
        });
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigation.goBack();
        }, 500);
      } else {
        const errorMessage = response.message || response.data?.message || 'Failed to update company details';
        Toast.show({
          type: 'error',
          text1: '',
          text2: errorMessage,
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      const errorMessage = error.message || error.response?.data?.message || 'Failed to update company details. Please try again.';
      Toast.show({
        type: 'error',
        text1: '',
        text2: errorMessage,
        position: 'top',
        topOffset: 100,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading company details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Details</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Company Name Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={formData.company_name}
              onChangeText={(value) => setFormData({...formData, company_name: value})}
              placeholder="Enter company name"
              placeholderTextColor="#999"
              maxLength={255}
            />
          </View>
        </View>

        {/* Biography Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biography</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.biography}
              onChangeText={(value) => setFormData({...formData, biography: value})}
              placeholder="Tell us about your company and expertise..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={8}
              maxLength={1000}
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.characterCount}>
            {formData.biography.length}/1000 characters
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    padding: 8,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  input: {
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 44,
    backgroundColor: 'transparent',
  },
  textArea: {
    minHeight: 150,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'right',
  },
});

export default EditCompanyScreen;

