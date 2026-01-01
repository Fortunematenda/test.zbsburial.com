import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import ApiService from '../../services/ApiService';
import logger from '../../utils/logger';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 48) / 3;

const ExpertProfileScreen = ({ route, navigation }) => {
  const { expertId, leadId } = route.params || {};
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('portfolio');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  useEffect(() => {
    if (expertId) {
      loadUserData();
      loadExpertProfile();
    } else {
      setLoading(false);
    }
  }, [expertId]);

  const loadUserData = async () => {
    try {
      const userDataJson = await SecureStore.getItemAsync('user_data');
      if (userDataJson) {
        const userData = JSON.parse(userDataJson);
        setUser(userData);
      }
    } catch (error) {
      logger.error('Error loading user data:', error);
    }
  };

  const loadExpertProfile = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      const response = await ApiService.get(`/expert-profile/${expertId}`);
      logger.log('Expert profile response:', JSON.stringify(response, null, 2));
      
      if (response.status === 'success' && response.data) {
        setExpert(response.data);
      } else {
        logger.log('Response status or data missing:', { status: response.status, hasData: !!response.data });
        Toast.show({
          type: 'error',
          text1: '',
          text2: 'Failed to load expert profile',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      logger.error('Error loading expert profile:', error);
      Toast.show({
        type: 'error',
        text1: '',
        text2: error.message || 'Failed to load expert profile',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpertProfile(true);
    setRefreshing(false);
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={20} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={20} color="#FFD700" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={20} color="#FFD700" />);
    }

    return stars;
  };

  const submitReview = async () => {
    if (rating === 0) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Please select a rating',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
      return;
    }

    if (!leadId) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Lead ID is required',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await ApiService.post('/submit-review', {
        expert_id: expertId,
        lead_id: leadId,
        rating: rating,
        comment: comment,
      });

      if (response.status === 'success') {
        Toast.show({
          type: 'success',
          text1: '',
          text2: 'Review submitted successfully',
          position: 'top',
          topOffset: 100,
          visibilityTime: 1500,
        });
        setShowReviewForm(false);
        setRating(0);
        setComment('');
        await loadExpertProfile(); // Refresh to show the new review
      } else {
        Toast.show({
          type: 'error',
          text1: '',
          text2: 'Failed to submit review',
          position: 'top',
          topOffset: 100,
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      logger.error('Error submitting review:', error);
      Toast.show({
        type: 'error',
        text1: '',
        text2: error.message || 'Failed to submit review',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerAvatar}>
            <Text style={styles.reviewerInitial}>
              {item.first_name.charAt(0)}{item.last_name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.reviewerName}>
              {item.first_name} {item.last_name}
            </Text>
            <View style={styles.reviewStars}>
              {renderStarRating(item.rating)}
            </View>
          </View>
        </View>
        <Text style={styles.reviewDate}>
          {item.date_entered ? new Date(item.date_entered).toLocaleDateString() : ''}
        </Text>
      </View>
      {item.comment && (
        <Text style={styles.reviewComment}>{item.comment}</Text>
      )}
    </View>
  );

  const renderPortfolioItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.portfolioItem}
      onPress={() => {
        setSelectedPortfolioItem(item);
        setShowPortfolioModal(true);
      }}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.portfolioImage} />
      ) : (
        <View style={[styles.portfolioImage, styles.portfolioPlaceholder]}>
          <Ionicons name="image-outline" size={40} color="#ccc" />
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading expert profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!expert) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Ionicons name="person-circle-outline" size={64} color="#ccc" />
          <Text style={styles.errorText}>Expert profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expert Profile</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <Card.Content>
            <View style={styles.profileHeader}>
              {expert.profile_picture ? (
                <Image source={{ uri: expert.profile_picture }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {expert.first_name.charAt(0)}{expert.last_name.charAt(0)}
                  </Text>
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.expertName}>
                  {expert.first_name} {expert.last_name}
                </Text>
                {expert.company_name && (
                  <Text style={styles.companyName}>{expert.company_name}</Text>
                )}
                {expert.location && (
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={16} color="#666" />
                    <Text style={styles.locationText}>{expert.location}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Rating Section */}
            {expert.total_reviews > 0 && (
              <View style={styles.ratingSection}>
                <View style={styles.ratingInfo}>
                  <Text style={styles.ratingNumber}>{expert.average_rating}</Text>
                  <View style={styles.ratingStars}>
                    {renderStarRating(expert.average_rating)}
                  </View>
                  <Text style={styles.ratingCount}>({expert.total_reviews} reviews)</Text>
                </View>
              </View>
            )}

            {/* Biography */}
            {expert.biography && (
              <View style={styles.biographySection}>
                <Text style={styles.biographyText}>{expert.biography}</Text>
              </View>
            )}

            {/* Services */}
            {expert.services && expert.services.length > 0 && (
              <View style={styles.servicesSection}>
                <Text style={styles.sectionTitle}>Services</Text>
                <View style={styles.servicesGrid}>
                  {expert.services.map((service, index) => (
                    <View key={index} style={styles.serviceBadge}>
                      <Text style={styles.serviceText}>{service.service_name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'portfolio' && styles.tabActive]}
            onPress={() => setSelectedTab('portfolio')}
          >
            <Ionicons 
              name={selectedTab === 'portfolio' ? 'images' : 'images-outline'} 
              size={20} 
              color={selectedTab === 'portfolio' ? '#8B5CF6' : '#666'} 
            />
            <Text style={[styles.tabText, selectedTab === 'portfolio' && styles.tabTextActive]}>
              Portfolio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'reviews' && styles.tabActive]}
            onPress={() => setSelectedTab('reviews')}
          >
            <Ionicons 
              name={selectedTab === 'reviews' ? 'star' : 'star-outline'} 
              size={20} 
              color={selectedTab === 'reviews' ? '#8B5CF6' : '#666'} 
            />
            <Text style={[styles.tabText, selectedTab === 'reviews' && styles.tabTextActive]}>
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {selectedTab === 'portfolio' && (
          <Card style={styles.contentCard}>
            <Card.Content>
              {expert.portfolio && expert.portfolio.length > 0 ? (
                <FlatList
                  data={expert.portfolio}
                  renderItem={renderPortfolioItem}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={3}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="images-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No portfolio items</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {selectedTab === 'reviews' && (
          <Card style={styles.contentCard}>
            <Card.Content>
              {expert.reviews && expert.reviews.length > 0 ? (
                <FlatList
                  data={expert.reviews}
                  renderItem={renderReview}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="star-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No reviews yet</Text>
                </View>
              )}
              {leadId && (
                <TouchableOpacity
                  style={styles.writeReviewButton}
                  onPress={() => setShowReviewForm(true)}
                >
                  <Ionicons name="star" size={20} color="#fff" />
                  <Text style={styles.writeReviewButtonText}>Write a Review</Text>
                </TouchableOpacity>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Portfolio Image Preview Modal */}
      <Modal
        visible={showPortfolioModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPortfolioModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPortfolioModal(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            
            {selectedPortfolioItem && selectedPortfolioItem.image_url && (
              <>
                <Image
                  source={{ uri: selectedPortfolioItem.image_url }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <View style={styles.modalDetails}>
                  {selectedPortfolioItem.title && (
                    <Text style={styles.modalTitle}>{selectedPortfolioItem.title}</Text>
                  )}
                  {selectedPortfolioItem.description && (
                    <Text style={styles.modalDescription}>
                      {selectedPortfolioItem.description}
                    </Text>
                  )}
                  {selectedPortfolioItem.contact_person && (
                    <View style={styles.modalContact}>
                      <Ionicons name="person" size={16} color="#8B5CF6" />
                      <Text style={styles.modalContactText}>
                        {selectedPortfolioItem.contact_person}
                      </Text>
                    </View>
                  )}
                  {selectedPortfolioItem.contact_number && (
                    <View style={styles.modalContact}>
                      <Ionicons name="call" size={16} color="#8B5CF6" />
                      <Text style={styles.modalContactText}>
                        {selectedPortfolioItem.contact_number}
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Review Form Modal */}
      <Modal
        visible={showReviewForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReviewForm(false)}
      >
        <View style={styles.reviewModalContainer}>
          <View style={styles.reviewModalContent}>
            <View style={styles.reviewModalHeader}>
              <Text style={styles.reviewModalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setShowReviewForm(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={40}
                    color={star <= rating ? "#FFD700" : "#ddd"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewCommentInput}
              placeholder="Write your review here..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitReviewButton, submitting && styles.submitReviewButtonDisabled]}
              onPress={submitReview}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitReviewButtonText}>Submit Review</Text>
              )}
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  profileCard: {
    margin: 16,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  expertName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: '#666',
  },
  biographySection: {
    marginTop: 16,
  },
  biographyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  servicesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceBadge: {
    backgroundColor: '#E8E2FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#E8E2FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  tabTextActive: {
    color: '#8B5CF6',
  },
  contentCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  portfolioItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginRight: 8,
    marginBottom: 8,
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  portfolioPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  reviewStars: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  writeReviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '95%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  modalDetails: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalContactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  reviewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  reviewModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    marginHorizontal: 4,
  },
  reviewCommentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#000',
    minHeight: 120,
    marginBottom: 20,
  },
  submitReviewButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitReviewButtonDisabled: {
    opacity: 0.6,
  },
  submitReviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExpertProfileScreen;

