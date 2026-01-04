import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import ApiService, { API_BASE_URL } from '../../services/ApiService';
import Avatar from '../../components/common/Avatar';
import Toast from 'react-native-toast-message';
import logger from '../../utils/logger';

const GOOGLE_PLACES_API_KEY = 'AIzaSyA_Qd54wgjWo4t-Klmi3m_pz8HbHz0GQto';

// ProfileField component moved outside to prevent recreation on each render
const ProfileField = React.memo(({ label, value, formatDisplay, fieldName, editable, multiline, isEditing, currentValue, onChangeText, keyboardType, placeholder }) => {
  if (isEditing && editable) {
    return (
      <View style={profileFieldStyles.fieldContainer}>
        <Text style={profileFieldStyles.fieldLabel}>{label}</Text>
        <RNTextInput
          value={currentValue ?? ''}
          onChangeText={onChangeText}
          style={profileFieldStyles.nativeTextInput}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType}
          editable={fieldName !== 'email'}
          placeholder={placeholder}
          placeholderTextColor="#999"
          blurOnSubmit={false}
          returnKeyType={multiline ? 'default' : 'next'}
        />
      </View>
    );
  }
  
  return (
    <View style={profileFieldStyles.fieldContainer}>
      <Text style={profileFieldStyles.fieldLabel}>{label}</Text>
      <Text style={profileFieldStyles.fieldValue}>{formatDisplay ? formatDisplay(value) : (value || 'Not provided')}</Text>
    </View>
  );
});

const profileFieldStyles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  nativeTextInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    minHeight: 44,
  },
});

const ProfileScreen = ({ navigation, onLogout, onRefreshUserData }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [localImageUri, setLocalImageUri] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    location: '',
    zip_code: '',
    latitude: '',
    longitude: '',
    company_name: '',
    distance: '',
    biography: '',
  });
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        contact_number: user.contact_number || '',
        location: user.location || '',
        zip_code: user.zip_code ?? '',
        latitude: user.latitude || '',
        longitude: user.longitude || '',
        company_name: user.company_name || '',
        distance: user.distance || '',
        biography: user.biography || '',
      });
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Always load fresh data from database
      const response = await ApiService.user.getProfile();
      if (response.success && response.data) {
        const user = response.data;
        setUser(user);
        
        // Update SecureStore with fresh data from database (both keys for compatibility)
        await SecureStore.setItemAsync('user_data', JSON.stringify(user));
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        
        // Refresh user data in parent components if callback exists
        if (onRefreshUserData) {
          await onRefreshUserData();
        }
      }
    } catch (error) {
      // Silently handle user data loading errors
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('auth_token');
              await SecureStore.deleteItemAsync('user_data');
              if (onLogout) {
                onLogout();
              }
            } catch (error) {
              // Silently handle logout errors
            }
          },
        },
      ]
    );
  };

  const formatDistance = (distance) => {
    if (!distance || distance === '0') return 'Unlimited';
    return `${distance} km`;
  };

  const distanceOptions = [
    { value: '10', label: '10 km' },
    { value: '20', label: '20 km' },
    { value: '50', label: '50 km' },
    { value: '0', label: 'Unlimited' },
  ];

  const handleChangeProfilePicture = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Photo',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickImage('gallery'),
        },
      ]
    );
  };

  const pickImage = async (source) => {
    try {
      let result;
      
      if (source === 'camera') {
        // Request camera permission
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
          return;
        }
        
        // Launch camera with optimized settings for faster upload
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'], // Use array format for newer expo-image-picker
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.6, // Reduced from 0.8 for smaller file size
          allowsMultiple: false,
          // Optimize for profile picture size (max 512x512 is enough)
          exif: false, // Remove EXIF data for smaller size
        });
      } else {
        // Request media library permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Photo library permission is required to select an image.');
          return;
        }
        
        // Launch image library with optimized settings
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'], // Use array format for newer expo-image-picker
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.6, // Reduced from 0.8 for smaller file size and faster upload
          allowsMultiple: false,
          // Optimize for profile picture size
          exif: false, // Remove EXIF data for smaller size
        });
      }

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets[0]) {
        // Show immediate preview of selected image
        setLocalImageUri(result.assets[0].uri);
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      logger.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image. Please try again.',
        position: 'top',
        topOffset: 80,
      });
    }
  };

  const uploadProfilePicture = async (imageUri) => {
    console.log('🚀 [AVATAR UPLOAD] Starting upload process...');
    console.log('📸 [AVATAR UPLOAD] Image URI:', imageUri);
    console.log('📸 [AVATAR UPLOAD] URI Type:', typeof imageUri);
    console.log('📸 [AVATAR UPLOAD] URI Length:', imageUri?.length);
    
    try {
      setUploadingImage(true);
      console.log('✅ [AVATAR UPLOAD] Upload state set to true');

      // Log image URI for debugging
      logger.log('Uploading image from URI:', {
        uri: imageUri,
        uriType: typeof imageUri,
        uriLength: imageUri?.length,
      });

      // Create FormData
      console.log('📦 [AVATAR UPLOAD] Creating FormData...');
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      console.log('📦 [AVATAR UPLOAD] Filename extracted:', filename);
      console.log('📦 [AVATAR UPLOAD] File type detected:', type);

      // Ensure proper file format for React Native
      // React Native FormData expects: { uri, name, type }
      const fileData = {
        uri: imageUri,
        name: filename || 'profile.jpg',
        type: type,
      };

      console.log('📦 [AVATAR UPLOAD] File data object:', {
        hasUri: !!fileData.uri,
        name: fileData.name,
        type: fileData.type,
      });

      logger.log('FormData file data:', {
        hasUri: !!fileData.uri,
        name: fileData.name,
        type: fileData.type,
      });

      formData.append('avatar', fileData);
      console.log('✅ [AVATAR UPLOAD] FormData.append called');

      // Log FormData structure
      console.log('📦 [AVATAR UPLOAD] FormData structure:', {
        hasParts: !!formData._parts,
        partsCount: formData._parts?.length || 0,
        firstPart: formData._parts?.[0] ? {
          fieldName: formData._parts[0][0],
          hasValue: !!formData._parts[0][1],
        } : null,
      });

      logger.log('FormData created:', {
        hasParts: !!formData._parts,
        partsCount: formData._parts?.length || 0,
        firstPart: formData._parts?.[0] ? {
          fieldName: formData._parts[0][0],
          hasValue: !!formData._parts[0][1],
        } : null,
      });

      // Use fetch API directly for file upload (works better than axios in React Native)
      console.log('🔑 [AVATAR UPLOAD] Retrieving auth token...');
      const token = await SecureStore.getItemAsync('auth_token');
      console.log('🔑 [AVATAR UPLOAD] Token retrieved:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      
      const API_URL = `${API_BASE_URL}/user/avatar`;
      console.log('🌐 [AVATAR UPLOAD] API URL:', API_URL);
      console.log('🌐 [AVATAR UPLOAD] API Base URL:', API_BASE_URL);
      
      logger.log('Starting avatar upload to:', API_URL);
      
      console.log('📤 [AVATAR UPLOAD] Sending fetch request...');
      const startTime = Date.now();
      const fetchResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let fetch set it with boundary
        },
        body: formData,
      });
      
      const requestDuration = Date.now() - startTime;
      console.log('⏱️ [AVATAR UPLOAD] Request completed in:', requestDuration + 'ms');
      console.log('📥 [AVATAR UPLOAD] Response status:', fetchResponse.status);
      console.log('📥 [AVATAR UPLOAD] Response status text:', fetchResponse.statusText);
      console.log('📥 [AVATAR UPLOAD] Response OK:', fetchResponse.ok);
      console.log('📥 [AVATAR UPLOAD] Response headers:', Object.fromEntries(fetchResponse.headers.entries()));
      
      logger.log('Upload response status:', fetchResponse.status, fetchResponse.statusText);
      
      if (!fetchResponse.ok) {
        console.error('❌ [AVATAR UPLOAD] Upload failed! Status:', fetchResponse.status);
        const errorText = await fetchResponse.text();
        console.error('❌ [AVATAR UPLOAD] Error response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error('❌ [AVATAR UPLOAD] Error response JSON:', errorData);
        } catch (e) {
          errorData = { message: 'Upload failed', raw: errorText };
          console.error('❌ [AVATAR UPLOAD] Could not parse error response as JSON');
        }
        
        logger.error('Upload failed:', errorData);
        throw new Error(errorData.message || `Upload failed: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }
      
      console.log('✅ [AVATAR UPLOAD] Response OK, parsing JSON...');
      const responseText = await fetchResponse.text();
      console.log('📥 [AVATAR UPLOAD] Response text:', responseText);
      
      let response;
      try {
        response = JSON.parse(responseText);
        console.log('✅ [AVATAR UPLOAD] Response JSON parsed:', response);
      } catch (e) {
        console.error('❌ [AVATAR UPLOAD] Failed to parse response JSON:', e);
        throw new Error('Invalid response from server');
      }
      
      logger.log('Upload response:', response);

      if (response.success) {
        console.log('✅ [AVATAR UPLOAD] Upload successful!');
        
        // Get the profile picture URL with cache-busting timestamp
        const profilePictureUrl = response.data?.profile_picture || response.data?.avatar_url || response.profile_picture;
        console.log('🖼️ [AVATAR UPLOAD] Profile picture URL from response:', profilePictureUrl);
        
        const cacheBustedUrl = profilePictureUrl ? `${profilePictureUrl}${profilePictureUrl.includes('?') ? '&' : '?'}t=${Date.now()}` : null;
        console.log('🖼️ [AVATAR UPLOAD] Cache-busted URL:', cacheBustedUrl);
        
        logger.log('Setting profile picture URL:', cacheBustedUrl);
        
        // Update local user data
        const updatedUser = {
          ...user,
          profile_picture: cacheBustedUrl || profilePictureUrl,
        };
        console.log('👤 [AVATAR UPLOAD] Updating local user state...');
        setUser(updatedUser);
        
        // Clear local preview since we now have the server URL
        console.log('🖼️ [AVATAR UPLOAD] Clearing local image preview');
        setLocalImageUri(null);

        // Update SecureStore
        console.log('💾 [AVATAR UPLOAD] Saving user data to SecureStore...');
        await SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
        console.log('✅ [AVATAR UPLOAD] User data saved to SecureStore');

        // Refresh user data in parent
        if (onRefreshUserData) {
          console.log('🔄 [AVATAR UPLOAD] Refreshing user data in parent...');
          await onRefreshUserData();
          console.log('✅ [AVATAR UPLOAD] User data refreshed');
        }

        console.log('✅ [AVATAR UPLOAD] Upload process completed successfully!');
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Profile picture updated successfully!',
          position: 'top',
          topOffset: 80,
        });
      } else {
        console.error('❌ [AVATAR UPLOAD] Upload unsuccessful. Response:', response);
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ [AVATAR UPLOAD] ERROR CAUGHT:', error);
      console.error('❌ [AVATAR UPLOAD] Error message:', error.message);
      console.error('❌ [AVATAR UPLOAD] Error stack:', error.stack);
      
      logger.error('Error uploading profile picture:', error);
      
      // Clear local preview on error so user sees the previous image
      console.log('🖼️ [AVATAR UPLOAD] Clearing local preview due to error');
      setLocalImageUri(null);
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to upload profile picture. Please try again.',
        position: 'top',
        topOffset: 80,
      });
    } finally {
      console.log('🏁 [AVATAR UPLOAD] Setting upload state to false');
      setUploadingImage(false);
      console.log('🏁 [AVATAR UPLOAD] Upload process finished');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Prepare update data (only include fields that are editable)
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        contact_number: formData.contact_number,
        location: formData.location,
        zip_code: formData.zip_code ? String(formData.zip_code) : '',
        latitude: formData.latitude || '',
        longitude: formData.longitude || '',
      };

      // Add expert-specific fields if user is an Expert
      if (user?.role === 'Expert') {
        updateData.company_name = formData.company_name || null;
        updateData.distance = formData.distance || null;
        updateData.biography = formData.biography || null;
      }

      const response = await ApiService.user.updateProfile(updateData);

      if (response.success) {
        // Reload user data to get updated profile
        await loadUserData();
        
        setIsEditing(false);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Profile updated successfully!',
          position: 'top',
          topOffset: 80,
        });
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      logger.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || error.message || 'Failed to update profile. Please try again.',
        position: 'top',
        topOffset: 80,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to current user data
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        location: user.location || '',
        zip_code: user.zip_code ?? '',
        company_name: user.company_name || '',
        distance: user.distance || '',
        biography: user.biography || '',
      });
    }
    setIsEditing(false);
  };

  // Memoize the field update handler to prevent re-renders
  const handleFieldChange = useCallback((fieldName, text) => {
    setFormData(prev => ({ ...prev, [fieldName]: text }));
  }, []);

  // Create stable onChange handlers for each field
  const getFieldHandler = useCallback((fieldName) => {
    return (text) => handleFieldChange(fieldName, text);
  }, [handleFieldChange]);

  // Helper to get keyboard type
  const getKeyboardType = useCallback((fieldName) => {
    if (fieldName === 'distance' || fieldName === 'zip_code') {
      return 'numeric';
    } else if (fieldName === 'email') {
      return 'email-address';
    } else if (fieldName === 'contact_number') {
      return 'phone-pad';
    }
    return 'default';
  }, []);

  // Fetch address suggestions for location autocomplete
  const fetchAddressSuggestions = useCallback(async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:za&key=${GOOGLE_PLACES_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.predictions) {
        setAddressSuggestions(data.predictions);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      logger.error('Error fetching address suggestions:', error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Handle location field change with autocomplete
  const handleLocationChange = useCallback((text) => {
    handleFieldChange('location', text);
    fetchAddressSuggestions(text);
  }, [handleFieldChange, fetchAddressSuggestions]);

  // Select address from autocomplete suggestions
  const selectAddress = useCallback(async (prediction) => {
    try {
      setLoadingSuggestions(true);
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${GOOGLE_PLACES_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.result && data.result.geometry) {
        // Extract zip code from address components
        let extractedZipCode = '';
        
        if (data.result.address_components) {
          // Look through all components for postal code
          for (const component of data.result.address_components) {
            // Check for postal_code type
            if (component.types.includes('postal_code')) {
              extractedZipCode = component.long_name || component.short_name || '';
              break;
            }
            // Check for postal_code_prefix as fallback
            if (!extractedZipCode && component.types.includes('postal_code_prefix')) {
              extractedZipCode = component.long_name || component.short_name || '';
            }
          }
        }
        
        // Fallback: Try to extract zip code from description or secondary text
        if (!extractedZipCode) {
          const searchText = prediction.description || prediction.structured_formatting?.secondary_text || '';
          // Look for 4-5 digit postal codes (South African format)
          const zipCodeMatch = searchText.match(/\b\d{4,5}\b/);
          if (zipCodeMatch) {
            extractedZipCode = zipCodeMatch[0];
          }
        }

        // If still no zip code found, try reverse geocoding using coordinates
        if (!extractedZipCode && data.result.geometry.location) {
          try {
            const lat = data.result.geometry.location.lat;
            const lng = data.result.geometry.location.lng;
            const reverseGeoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_PLACES_API_KEY}`;
            
            const reverseGeoResponse = await fetch(reverseGeoUrl);
            const reverseGeoData = await reverseGeoResponse.json();
            
            if (reverseGeoData.results && reverseGeoData.results.length > 0) {
              // Check the first result (most specific) for postal code
              const firstResult = reverseGeoData.results[0];
              if (firstResult.address_components) {
                for (const component of firstResult.address_components) {
                  if (component.types.includes('postal_code')) {
                    extractedZipCode = component.long_name || component.short_name || '';
                    break;
                  }
                }
              }
            }
          } catch (reverseGeoError) {
            logger.error('Error in reverse geocoding:', reverseGeoError);
            // Continue without zip code if reverse geocoding fails
          }
        }

        const fullAddress = prediction.description || prediction.structured_formatting?.main_text || '';
        
        logger.info('Address selected:', { 
          fullAddress, 
          extractedZipCode,
          addressComponents: data.result.address_components 
        });
        
        // Update location, zip code, latitude, and longitude
        // Always update zip_code to the extracted value (even if empty) when location changes
        setFormData(prev => {
          const updated = {
            ...prev,
            location: fullAddress,
            zip_code: extractedZipCode || '',
            latitude: data.result.geometry.location.lat.toString(),
            longitude: data.result.geometry.location.lng.toString(),
          };
          logger.info('FormData updated:', updated);
          return updated;
        });
        
        setShowSuggestions(false);
        setAddressSuggestions([]);
      }
    } catch (error) {
      logger.error('Error fetching address details:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch address details. Please try again.',
        position: 'top',
        topOffset: 80,
      });
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
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
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={handleChangeProfilePicture}
            disabled={uploadingImage}
            activeOpacity={0.7}
          >
            {uploadingImage ? (
              <View style={styles.profileImageUploading}>
                <ActivityIndicator size="large" color="#8B5CF6" />
              </View>
            ) : (
              <>
                <Avatar
                  key={localImageUri || user?.profile_picture || 'avatar'}
                  imageUri={localImageUri || user?.profile_picture}
                  firstName={user?.first_name}
                  lastName={user?.last_name}
                  size={100}
                />
                <View style={styles.editIconContainer}>
                  <View style={styles.editIcon}>
                    <Ionicons name="camera" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.userRole}>{user?.role}</Text>
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={handleChangeProfilePicture}
            disabled={uploadingImage}
          >
            <Text style={styles.changePhotoText}>
              {uploadingImage ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
          
          {/* Rating Display for Experts */}
          {user?.role === 'Expert' && user?.rating !== null && user?.rating !== undefined && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>{user.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Profile Information */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {!isEditing && (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => {
                  // Ensure formData is synced with user data before entering edit mode
                  if (user) {
                    setFormData({
                      first_name: user.first_name || '',
                      last_name: user.last_name || '',
                      email: user.email || '',
                      location: user.location || '',
                      zip_code: user.zip_code ?? '',
                      company_name: user.company_name || '',
                      distance: user.distance || '',
                      biography: user.biography || '',
                    });
                  }
                  setIsEditing(true);
                }}
              >
                <Ionicons name="pencil" size={20} color="#8B5CF6" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <ProfileField
            key="first_name"
            label="First Name"
            value={user?.first_name}
            fieldName="first_name"
            editable={true}
            isEditing={isEditing}
            currentValue={formData.first_name}
            onChangeText={getFieldHandler('first_name')}
            keyboardType={getKeyboardType('first_name')}
            placeholder="Enter first name"
          />
          
          <ProfileField
            key="last_name"
            label="Last Name"
            value={user?.last_name}
            fieldName="last_name"
            editable={true}
            isEditing={isEditing}
            currentValue={formData.last_name}
            onChangeText={getFieldHandler('last_name')}
            keyboardType={getKeyboardType('last_name')}
            placeholder="Enter last name"
          />
          
          <ProfileField
            key="email"
            label="Email"
            value={user?.email}
            fieldName="email"
            editable={false}
            isEditing={isEditing}
            currentValue={formData.email}
            onChangeText={getFieldHandler('email')}
            keyboardType={getKeyboardType('email')}
            placeholder="Enter email"
          />
          
          <ProfileField
            key="contact_number"
            label="Phone Number"
            value={user?.contact_number}
            fieldName="contact_number"
            editable={true}
            isEditing={isEditing}
            currentValue={formData.contact_number}
            onChangeText={getFieldHandler('contact_number')}
            keyboardType={getKeyboardType('contact_number')}
            placeholder="Enter phone number"
          />
          
          {/* Location Field with Autocomplete */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Location</Text>
            {isEditing ? (
              <View style={{ position: 'relative' }}>
                <RNTextInput
                  value={formData.location || ''}
                  onChangeText={handleLocationChange}
                  style={styles.nativeTextInput}
                  keyboardType="default"
                  placeholder="Start typing your address..."
                  placeholderTextColor="#999"
                  blurOnSubmit={false}
                />
                {loadingSuggestions && (
                  <View style={styles.loadingIndicator}>
                    <ActivityIndicator size="small" color="#8B5CF6" />
                  </View>
                )}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView 
                      style={styles.suggestionsList} 
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled={true}
                    >
                      {addressSuggestions.map((prediction) => (
                        <TouchableOpacity
                          key={prediction.place_id}
                          style={styles.suggestionItem}
                          onPress={() => selectAddress(prediction)}
                        >
                          <Ionicons name="location" size={20} color="#8B5CF6" style={styles.suggestionIcon} />
                          <View style={styles.suggestionTextContainer}>
                            <Text style={styles.suggestionMainText}>
                              {prediction.structured_formatting?.main_text || prediction.description}
                            </Text>
                            {prediction.structured_formatting?.secondary_text && (
                              <Text style={styles.suggestionSecondaryText}>
                                {prediction.structured_formatting.secondary_text}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.fieldValue}>{user?.location || 'Not provided'}</Text>
            )}
          </View>
          
          {/* Zip Code - Display only (auto-populated from location, hidden when editing) */}
          {!isEditing && (
            <ProfileField
              key="zip_code"
              label="Zip Code"
              value={user?.zip_code}
              fieldName="zip_code"
              editable={false}
            />
          )}
        </View>

        {/* Professional Information - Only for Expert users */}
        {user?.role === 'Expert' && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            
            <ProfileField
              key="company_name"
              label="Company Name"
              value={user?.company_name}
              fieldName="company_name"
              editable={true}
              isEditing={isEditing}
              currentValue={formData.company_name}
              onChangeText={getFieldHandler('company_name')}
              keyboardType={getKeyboardType('company_name')}
              placeholder="Enter company name"
            />
            
            {/* Coverage Radius - Dropdown Selection */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Coverage Radius</Text>
              {isEditing ? (
                <View style={styles.radiusContainer}>
                  {distanceOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.radiusOption,
                        formData.distance === option.value && styles.radiusOptionSelected
                      ]}
                      onPress={() => {
                        handleFieldChange('distance', option.value);
                      }}
                    >
                      <View style={styles.radiusContent}>
                        <View style={styles.radiusIcon}>
                          <Ionicons 
                            name={formData.distance === option.value ? "radio-button-on" : "radio-button-off"} 
                            size={20} 
                            color={formData.distance === option.value ? "#8B5CF6" : "#ccc"} 
                          />
                        </View>
                        <Text style={[
                          styles.radiusText,
                          formData.distance === option.value && styles.radiusTextSelected
                        ]}>
                          {option.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.fieldValue}>{formatDistance(user?.distance)}</Text>
              )}
            </View>
            
            <ProfileField
              key="biography"
              label="Biography"
              value={user?.biography}
              fieldName="biography"
              multiline={true}
              editable={true}
              isEditing={isEditing}
              currentValue={formData.biography}
              onChangeText={getFieldHandler('biography')}
              keyboardType={getKeyboardType('biography')}
              placeholder="Enter your biography"
            />

            {/* Save/Cancel buttons - Only show when editing */}
            {isEditing && (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancelEdit}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Save/Cancel buttons for non-Expert users - Only show when editing */}
        {user?.role !== 'Expert' && isEditing && (
          <View style={styles.infoSection}>
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelEdit}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}


      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    backgroundColor: '#f8f8f8',
    flexGrow: 1,
  },
  profileSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
    width: '100%',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
    alignSelf: 'center',
  },
  profileImageUploading: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8E2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 2,
  },
  editIcon: {
    backgroundColor: '#8B5CF6',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  actionsSection: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    flex: 1,
  },
  actionValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  updateRequestContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
  },
  updateRequestText: {
    flex: 1,
    marginLeft: 12,
  },
  updateRequestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  updateRequestMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  requestUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  requestUpdateButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F5F3FF',
  },
  editButtonText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: '#ffffff',
  },
  nativeTextInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    minHeight: 44,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingIndicator: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  suggestionSecondaryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  radiusContainer: {
    marginTop: 8,
  },
  radiusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  radiusOptionSelected: {
    backgroundColor: '#F5F3FF',
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },
  radiusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radiusIcon: {
    marginRight: 12,
  },
  radiusText: {
    fontSize: 16,
    color: '#333',
  },
  radiusTextSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});

export default ProfileScreen;

