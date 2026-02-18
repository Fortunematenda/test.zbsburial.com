import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import ApiService, { API_BASE_URL } from '../../services/ApiService';
import logger from '../../utils/logger';
import Toast from 'react-native-toast-message';

// Safely get WEB_BASE_URL, ensuring API_BASE_URL is a string
const WEB_BASE_URL = (API_BASE_URL && typeof API_BASE_URL === 'string') 
  ? API_BASE_URL.replace('/api', '') 
  : 'http://192.168.1.90:8080';

const PortfolioScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [newImage, setNewImage] = useState({
    title: '',
    description: '',
    contactPerson: '',
    contactNumber: '',
    image: null,
  });

  // Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // If already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Otherwise, construct full URL
    return `${WEB_BASE_URL}/${imageUrl}`;
  };

  useEffect(() => {
    loadUserData();
    loadPortfolio();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      logger.error('Error loading user data:', error);
    }
  };

  const loadPortfolio = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      const response = await ApiService.portfolio.getUserPortfolio();
      if (response.success) {
        setPortfolio(response.data);
      }
    } catch (error) {
      logger.error('Error loading portfolio:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load portfolio',
        position: 'top',
        topOffset: 100,
      });
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPortfolio(true);
    setRefreshing(false);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permission is required to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setNewImage(prev => ({
          ...prev,
          image: result.assets[0],
        }));
      }
    } catch (error) {
      logger.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to select image',
        position: 'top',
        topOffset: 100,
      });
    }
  };

  const addToPortfolio = async () => {
    if (!newImage.image || !newImage.title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select an image and enter a title.',
        position: 'top',
        topOffset: 100,
      });
      return;
    }

    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', {
        uri: newImage.image.uri,
        type: 'image/jpeg',
        name: 'portfolio_image.jpg',
      });
      formData.append('title', newImage.title);
      if (newImage.description) {
        formData.append('description', newImage.description);
      }
      if (newImage.contactPerson) {
        formData.append('contact_person', newImage.contactPerson);
      }
      if (newImage.contactNumber) {
        formData.append('contact_number', newImage.contactNumber);
      }
      
      // Use fetch API directly for file upload instead of Axios
      const token = await SecureStore.getItemAsync('auth_token');
      const API_URL = `${API_BASE_URL}/user/portfolio`;
      
      const fetchResponse = await fetch(API_URL, {
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
      
      if (response.success) {
        setPortfolio(prev => [response.data, ...prev]);
        setNewImage({ title: '', description: '', contactPerson: '', contactNumber: '', image: null });
        setShowAddModal(false);
        Toast.show({
          type: 'success',
          text1: '',
          text2: 'Image added to portfolio',
          position: 'top',
          topOffset: 100,
          visibilityTime: 1500,
        });
      } else {
        logger.error('Portfolio upload failed:', response);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to add image',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
        // Reload portfolio to get updated count
        await loadPortfolio();
      }
    } catch (error) {
      logger.error('Error adding to portfolio:', error);
      logger.error('Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error.message || 'Failed to add image. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'top',
        topOffset: 100,
      });
    } finally {
      setUploading(false);
    }
  };

  const openPreview = (item) => {
    setPreviewItem(item);
    setShowPreviewModal(true);
  };

  const deleteFromPortfolio = async (imageId) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image from your portfolio?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.portfolio.deleteFromPortfolio(imageId);
              if (response.success) {
                setPortfolio(prev => prev.filter(item => item.id !== imageId));
                // Close preview if deleting the currently previewed item
                if (previewItem && previewItem.id === imageId) {
                  setShowPreviewModal(false);
                  setPreviewItem(null);
                }
                Toast.show({
                  type: 'success',
                  text1: '',
                  text2: 'Image deleted from portfolio',
                  position: 'top',
                  topOffset: 100,
                  visibilityTime: 1500,
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: response.message || 'Failed to delete image',
                  position: 'top',
                  topOffset: 100,
                  visibilityTime: 2500,
                });
              }
            } catch (error) {
              logger.error('Error deleting from portfolio:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete image',
                position: 'top',
                topOffset: 100,
              });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading portfolio...</Text>
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Portfolio</Text>
          <Text style={styles.headerSubtitle}>({portfolio.length}/10)</Text>
        </View>
        <TouchableOpacity 
          style={[styles.addButton, portfolio.length >= 10 && styles.addButtonDisabled]}
          onPress={() => setShowAddModal(true)}
          disabled={portfolio.length >= 10}
        >
          <Ionicons name="add" size={24} color={portfolio.length >= 10 ? "#ccc" : "#8B5CF6"} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="images" size={20} color="#8B5CF6" />
            <Text style={styles.infoText}>
              Showcase your best work to attract more customers
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="star" size={20} color="#8B5CF6" />
            <Text style={styles.infoText}>
              High-quality photos help build trust with potential customers
            </Text>
          </View>
        </View>

        {/* Portfolio Grid */}
        {portfolio.length > 0 ? (
          <View style={styles.portfolioGrid}>
            {portfolio.map((item) => (
              <View key={item.id} style={styles.portfolioItem}>
                <TouchableOpacity 
                  onPress={() => openPreview(item)}
                  activeOpacity={0.9}
                >
                  <Image 
                    source={{ uri: getImageUrl(item.image_url) }} 
                    style={styles.portfolioImage}
                  />
                  <View style={styles.portfolioOverlay}>
                    <Text style={styles.portfolioTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {item.description && (
                      <Text style={styles.portfolioDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteFromPortfolio(item.id)}
                >
                  <Ionicons name="trash" size={16} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No portfolio images yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add photos of your past work to showcase your skills
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color="#8B5CF6" />
              <Text style={styles.addFirstButtonText}>Add Your First Image</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Image Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add to Portfolio</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={addToPortfolio}
              disabled={uploading || !newImage.image || !newImage.title.trim()}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#8B5CF6" />
              ) : (
                <Text style={styles.modalSaveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Image</Text>
              {newImage.image ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: newImage.image.uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={pickImage}
                  >
                    <Ionicons name="camera" size={20} color="#8B5CF6" />
                    <Text style={styles.changeImageText}>Change Image</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.selectImageButton} onPress={pickImage}>
                  <Ionicons name="camera" size={32} color="#8B5CF6" />
                  <Text style={styles.selectImageText}>Select Image</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Title *</Text>
              <TextInput
                style={styles.modalTextInput}
                value={newImage.title}
                onChangeText={(text) => setNewImage(prev => ({ ...prev, title: text }))}
                placeholder="Enter image title"
                maxLength={50}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Description</Text>
              <TextInput
                style={[styles.modalTextInput, styles.modalTextArea]}
                value={newImage.description}
                onChangeText={(text) => setNewImage(prev => ({ ...prev, description: text }))}
                placeholder="Describe this work (optional)"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Contact Person</Text>
              <TextInput
                style={styles.modalTextInput}
                value={newImage.contactPerson}
                onChangeText={(text) => setNewImage(prev => ({ ...prev, contactPerson: text }))}
                placeholder="Contact person name (optional)"
                maxLength={100}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Contact Number</Text>
              <TextInput
                style={styles.modalTextInput}
                value={newImage.contactNumber}
                onChangeText={(text) => setNewImage(prev => ({ ...prev, contactNumber: text }))}
                placeholder="Contact number (optional)"
                maxLength={20}
                keyboardType="phone-pad"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={showPreviewModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View style={styles.previewModalOverlay}>
          <View style={styles.previewModalContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.previewCloseButton}
              onPress={() => setShowPreviewModal(false)}
            >
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>

            {/* Image */}
            {previewItem && (
              <>
                <Image
                  source={{ uri: getImageUrl(previewItem.image_url) }}
                  style={styles.previewModalImage}
                  resizeMode="contain"
                />
                
                {/* Title and Description */}
                <View style={styles.previewModalInfo}>
                  <Text style={styles.previewModalTitle}>{previewItem.title}</Text>
                  {previewItem.description && (
                    <Text style={styles.previewModalDescription}>
                      {previewItem.description}
                    </Text>
                  )}
                  
                  {/* Delete Button */}
                  <TouchableOpacity
                    style={styles.previewDeleteButton}
                    onPress={() => {
                      setShowPreviewModal(false);
                      deleteFromPortfolio(previewItem.id);
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#FF4444" />
                    <Text style={styles.previewDeleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    marginTop: 16,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  portfolioItem: {
    width: '48%',
    marginBottom: 16,
    marginHorizontal: '1%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  portfolioOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
  },
  portfolioTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  portfolioDescription: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '500',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancelButton: {
    padding: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSaveButton: {
    padding: 8,
  },
  modalSaveText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSection: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 8,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  selectImageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F0FF',
    paddingVertical: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E8E2FF',
    borderStyle: 'dashed',
  },
  selectImageText: {
    fontSize: 16,
    color: '#8B5CF6',
    marginTop: 8,
    fontWeight: '500',
  },
  imagePreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  changeImageText: {
    fontSize: 14,
    color: '#8B5CF6',
    marginLeft: 4,
    fontWeight: '500',
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  // Preview Modal Styles
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModalContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  previewModalImage: {
    width: '100%',
    height: '70%',
  },
  previewModalInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '30%',
  },
  previewModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  previewModalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  previewDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  previewDeleteButtonText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PortfolioScreen;
