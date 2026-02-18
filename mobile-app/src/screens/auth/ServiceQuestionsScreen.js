import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RadioButton } from 'react-native-paper';
import ApiService from '../../services/ApiService';
import logger from '../../utils/logger';
import Toast from 'react-native-toast-message';

const ServiceQuestionsScreen = ({ navigation, route }) => {
  const { serviceId, serviceName, location, latitude, longitude } = route.params || {};
  
  const [serviceQuestions, setServiceQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (serviceId) {
      loadServiceQuestions(serviceId);
    } else {
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Service ID is required',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
      navigation.goBack();
    }
  }, [serviceId]);

  const loadServiceQuestions = async (serviceId) => {
    setLoadingQuestions(true);
    try {
      const response = await ApiService.post('/service-questions', { service_id: serviceId });
      if (response.success && response.questions) {
        setServiceQuestions(response.questions);
      } else {
        setServiceQuestions([]);
      }
    } catch (error) {
      logger.error('Error loading service questions:', error);
      setServiceQuestions([]);
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Failed to load questions. Please try again.',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleNext = () => {
    // If no questions, proceed directly to register
    if (serviceQuestions.length === 0) {
      navigateToRegister();
      return;
    }

    // Validate all questions are answered
    const allQuestionsAnswered = serviceQuestions.every(q => {
      return questionAnswers[q.question_id] && questionAnswers[q.question_id].trim() !== '';
    });

    if (!allQuestionsAnswered) {
      Toast.show({
        type: 'error',
        text1: '',
        text2: 'Please answer all questions before proceeding',
        position: 'top',
        topOffset: 100,
        visibilityTime: 2500,
      });
      return;
    }

    navigateToRegister();
  };

  const navigateToRegister = () => {
    navigation.navigate('Register', {
      prefillData: {
        serviceId: serviceId,
        serviceName: serviceName,
        location: location,
        latitude: latitude?.toString() || '',
        longitude: longitude?.toString() || '',
        questionAnswers: questionAnswers, // Pass question answers to register
      },
    });
  };

  if (loadingQuestions) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{serviceName || 'Service'}</Text>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={16} color="#8B5CF6" />
            <Text style={styles.locationText}>{location || 'Location'}</Text>
          </View>
        </View>

        {serviceQuestions.length === 0 ? (
          <View style={styles.noQuestionsContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#8B5CF6" />
            <Text style={styles.noQuestionsText}>
              No additional questions for this service
            </Text>
            <Text style={styles.noQuestionsSubtext}>
              You can proceed to registration
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Please answer all questions</Text>
            <Text style={styles.sectionSubtitle}>
              This helps us match you with the right professionals
            </Text>

            {serviceQuestions.map((q, index) => {
              const isAnswered = questionAnswers[q.question_id] && questionAnswers[q.question_id].trim() !== '';
              return (
                <View 
                  key={q.question_id} 
                  style={[
                    styles.questionContainer,
                    !isAnswered && styles.questionContainerUnanswered
                  ]}
                >
                  <Text style={[
                    styles.questionTitle,
                    !isAnswered && styles.questionTitleUnanswered
                  ]}>
                    {q.question} *
                  </Text>
                  <View style={styles.radioContainer}>
                    {q.answers.map((answer) => (
                      <TouchableOpacity
                        key={answer}
                        style={styles.radioItem}
                        onPress={() => setQuestionAnswers(prev => ({ 
                          ...prev, 
                          [q.question_id]: answer 
                        }))}
                        activeOpacity={0.7}
                      >
                        <RadioButton
                          value={answer}
                          status={questionAnswers[q.question_id] === answer ? 'checked' : 'unchecked'}
                          onPress={() => setQuestionAnswers(prev => ({ 
                            ...prev, 
                            [q.question_id]: answer 
                          }))}
                          color="#8B5CF6"
                        />
                        <Text style={styles.radioLabel}>{answer}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>Continue to Registration</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#8B5CF6',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  serviceInfo: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  noQuestionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noQuestionsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  noQuestionsSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  questionContainerUnanswered: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF9E6',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  questionTitleUnanswered: {
    color: '#FF9800',
  },
  radioContainer: {
    gap: 12,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  nextButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ServiceQuestionsScreen;

