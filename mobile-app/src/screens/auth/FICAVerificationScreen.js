import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';
import ApiService, { API_BASE_URL } from '../../services/ApiService';
import Toast from 'react-native-toast-message';

const FICAVerificationScreen = ({ navigation, onRefreshUserData }) => {
  const [idImage, setIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickIDImage = async () => {
    try {
      // Show action sheet to choose camera or library
      Alert.alert(
        'Choose ID Source',
        'Select how you want to upload your ID/Passport',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              // Request camera permissions
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need access to your camera to take a photo of your ID.');
                return;
              }

              // Launch camera
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                setIdImage(result.assets[0]);
              }
            },
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              try {
                // Launch document picker for PDF support
                const result = await DocumentPicker.getDocumentAsync({
                  type: ['image/*', 'application/pdf'],
                  copyToCacheDirectory: true,
                });

                if (!result.canceled && result.assets && result.assets.length > 0) {
                  setIdImage(result.assets[0]);
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to pick document. Please try again.');
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const pickSelfieImage = async () => {
    try {
      // Show action sheet to choose camera or library
      Alert.alert(
        'Choose Selfie Source',
        'Select how you want to take your selfie',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              // Request camera permissions
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need access to your camera to take a selfie.');
                return;
              }

              // Launch camera
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelfieImage(result.assets[0]);
              }
            },
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              // Request media library permissions
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need access to your photos to upload your selfie.');
                return;
              }

              // Launch image picker
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelfieImage(result.assets[0]);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const submitVerification = async () => {
    if (!idImage || !selfieImage) {
      Alert.alert('Missing Files', 'Please upload both your ID/Passport and a selfie holding your ID.');
      return;
    }

    setUploading(true);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Determine file extension and MIME type for ID
      const idUri = idImage.uri;
      const idExtension = idUri.substring(idUri.lastIndexOf('.') + 1).toLowerCase();
      
      // Use provided name if available (from document picker), otherwise construct from URI
      let idFileName = `id_upload.${idExtension}`;
      let idMimeType = 'image/jpeg';
      
      if (idImage.name) {
        idFileName = idImage.name;
      }
      
      if (idExtension === 'pdf') {
        idMimeType = 'application/pdf';
      } else if (idExtension === 'png') {
        idMimeType = 'image/png';
      } else if (idExtension === 'jpg' || idExtension === 'jpeg') {
        idMimeType = 'image/jpeg';
      }
      
      // Add ID image
      formData.append('idUpload', {
        uri: idImage.uri,
        name: idFileName,
        type: idMimeType,
      });

      // Determine file extension and MIME type for selfie
      const selfieUri = selfieImage.uri;
      const selfieExtension = selfieUri.substring(selfieUri.lastIndexOf('.') + 1).toLowerCase();
      
      // Use provided name if available
      let selfieFileName = `selfie_upload.${selfieExtension}`;
      let selfieMimeType = 'image/jpeg';
      
      if (selfieImage.name) {
        selfieFileName = selfieImage.name;
      }
      
      if (selfieExtension === 'png') {
        selfieMimeType = 'image/png';
      } else if (selfieExtension === 'jpg' || selfieExtension === 'jpeg') {
        selfieMimeType = 'image/jpeg';
      }
      
      // Add selfie image
      formData.append('selfieUpload', {
        uri: selfieImage.uri,
        name: selfieFileName,
        type: selfieMimeType,
      });

      // Use fetch API directly for file upload instead of Axios
      const token = await SecureStore.getItemAsync('auth_token');
      
      const fetchResponse = await fetch(`${API_BASE_URL}/verify-fica`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let fetch set it with boundary
        },
        body: formData,
      });
      
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        throw new Error(`Upload failed: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }
      
      const response = await fetchResponse.json();

      if (response.status === 'success') {
        // Update user data in SecureStore with the updated verification status
        if (response.data && response.data.user) {
          await SecureStore.setItemAsync('user_data', JSON.stringify(response.data.user));
        }

        // Refresh user data if callback is provided
        if (onRefreshUserData) {
          await onRefreshUserData();
        }

        Toast.show({
          type: 'success',
          text1: '',
          text2: 'Your documents have been submitted for verification. We will review them shortly.',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2000,
        });

        // Navigate back to dashboard after a short delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        Toast.show({
          type: 'error',
          text1: '',
          text2: response.message || 'Failed to submit verification documents.',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      let errorMessage = 'Failed to submit verification documents.';
      
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          // Handle validation errors
          const errors = error.response.data.errors;
          const firstError = Object.values(errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.show({
        type: 'error',
        text1: '',
        text2: errorMessage,
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Your FICA</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            ⚠️ Disclaimer: In order for you to view leads, you need to submit the necessary documents for verification.
          </Text>
        </View>

        {/* Upload ID/Passport Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Upload ID/Passport</Text>
          
          <TouchableOpacity 
            style={styles.uploadArea} 
            onPress={pickIDImage}
            activeOpacity={0.7}
          >
            {idImage ? (
              <>
                {idImage.name && idImage.name.endsWith('.pdf') ? (
                  <View style={styles.pdfPreview}>
                    <Ionicons name="document" size={64} color="#8B5CF6" />
                    <Text style={styles.pdfFileName}>{idImage.name}</Text>
                  </View>
                ) : (
                  <Image source={{ uri: idImage.uri }} style={styles.previewImage} />
                )}
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload" size={48} color="#8B5CF6" />
                <Text style={styles.uploadText}>Tap to Take or Upload</Text>
                <Text style={styles.uploadHint}>ID or Passport document (PDF, PNG, JPG)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Upload Selfie Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Upload Selfie Holding ID/Passport</Text>
          
          <TouchableOpacity 
            style={styles.uploadArea} 
            onPress={pickSelfieImage}
            activeOpacity={0.7}
          >
            {selfieImage ? (
              <Image source={{ uri: selfieImage.uri }} style={styles.previewImage} />
            ) : (
              <>
                <Ionicons name="camera" size={48} color="#8B5CF6" />
                <Text style={styles.uploadText}>Tap to Take or Upload</Text>
                <Text style={styles.uploadHint}>Selfie with your ID visible (PNG, JPG)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, uploading && styles.submitButtonDisabled]} 
          onPress={submitVerification}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  disclaimerBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  uploadSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  uploadArea: {
    height: 200,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginTop: 12,
  },
  uploadHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  pdfPreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pdfFileName: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default FICAVerificationScreen;

