import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Button,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm } from 'react-hook-form';
import { useRegistration } from '../../hooks/registration/useRegistration';
import LocationStep from '../../components/registration/LocationStep';
import ServiceSelectionStep from '../../components/registration/ServiceSelectionStep';
import ServiceQuestionsStep from '../../components/registration/ServiceQuestionsStep';
import ProjectDetailsStep from '../../components/registration/ProjectDetailsStep';
import PersonalInfoStep from '../../components/registration/PersonalInfoStep';
import CompanyInfoStep from '../../components/registration/CompanyInfoStep';
import PasswordStep from '../../components/registration/PasswordStep';

const RegisterScreen = ({ navigation, onLogin, route }) => {
  // Use custom hook for all state management and business logic
  const {
    isLoading,
    gettingLocation,
    loadingQuestions,
    userType,
    setUserType,
    currentStep,
    services,
    selectedServices,
    setSelectedServices,
    showServiceModal,
    setShowServiceModal,
    location,
    setLocation,
    serviceQuestions,
    questionAnswers,
    setQuestionAnswers,
    leadDescription,
    setLeadDescription,
    leadBudget,
    setLeadBudget,
    leadUrgent,
    setLeadUrgent,
    leadHiringDecision,
    setLeadHiringDecision,
    getCurrentLocation,
    nextStep,
    prevStep,
    submitRegistration,
  } = useRegistration(route, navigation, onLogin);

  const { control, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    await submitRegistration(data);
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const renderStep1 = () => {
    // For customers: Show service selection
    if (userType === 'customer') {
      return (
        <ServiceSelectionStep
          userType={userType}
          services={services}
          selectedServices={selectedServices}
          setSelectedServices={setSelectedServices}
          showServiceModal={showServiceModal}
          setShowServiceModal={setShowServiceModal}
          prevStep={prevStep}
          nextStep={nextStep}
          styles={styles}
        />
      );
    }

    // For providers: Show personal details (reuse PersonalInfoStep)
    return (
      <PersonalInfoStep
        control={control}
        errors={errors}
        prevStep={prevStep}
        nextStep={nextStep}
        styles={styles}
      />
    );
  };

  // Step rendering functions - simplified to component calls
  const renderStep2 = () => (
    <LocationStep
      userType={userType}
      location={location}
      setLocation={setLocation}
      gettingLocation={gettingLocation}
      getCurrentLocation={getCurrentLocation}
      prevStep={prevStep}
      nextStep={nextStep}
      styles={styles}
    />
  );

  const renderStep3 = () => {
    if (userType === 'customer') {
      return (
        <ServiceQuestionsStep
          userType={userType}
          serviceQuestions={serviceQuestions}
          questionAnswers={questionAnswers}
          setQuestionAnswers={setQuestionAnswers}
          loadingQuestions={loadingQuestions}
          prevStep={prevStep}
          nextStep={nextStep}
          styles={styles}
        />
      );
    }
    return (
      <CompanyInfoStep
        control={control}
        errors={errors}
        handleSubmit={handleSubmit}
        prevStep={prevStep}
        nextStep={nextStep}
        styles={styles}
      />
    );
  };

  const renderStep4 = () => {
    if (userType === 'customer') {
      return (
        <ProjectDetailsStep
          userType={userType}
          leadDescription={leadDescription}
          setLeadDescription={setLeadDescription}
          leadBudget={leadBudget}
          setLeadBudget={setLeadBudget}
          leadUrgent={leadUrgent}
          setLeadUrgent={setLeadUrgent}
          leadHiringDecision={leadHiringDecision}
          setLeadHiringDecision={setLeadHiringDecision}
          prevStep={prevStep}
          nextStep={nextStep}
          styles={styles}
        />
      );
    }
    return (
      <PersonalInfoStep
        control={control}
        errors={errors}
        prevStep={prevStep}
        nextStep={nextStep}
        styles={styles}
      />
    );
  };

  const renderStep5 = () => {
    if (userType === 'customer') {
      return (
        <PersonalInfoStep
          control={control}
          errors={errors}
          prevStep={prevStep}
          nextStep={nextStep}
          styles={styles}
        />
      );
    }
    return (
      <PasswordStep
        control={control}
        errors={errors}
        password={password}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isLoading={isLoading}
        prevStep={prevStep}
        styles={styles}
      />
    );
  };

  const renderStep6 = () => (
    <PasswordStep
      control={control}
      errors={errors}
      password={password}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      isLoading={isLoading}
      prevStep={prevStep}
      styles={styles}
    />
  );

  return (
    <LinearGradient
      colors={['#000000', '#200D42', '#4F21A1', '#A46EDB']}
      locations={[0, 0.34, 0.65, 0.82]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              {route?.params?.initialStep !== undefined
                ? `Step ${currentStep - route.params.initialStep + 1} of 3` // Steps 4, 5, 6 = steps 1, 2, 3 in this flow
                : `Step ${currentStep - 1} of ${
                    userType === 'customer' 
                      ? (serviceQuestions.length > 0 ? '5' : '4') // Step 2,3,4,5,6 = Step 1,2,3,4,5
                      : '4' // Step 2,3,4,5 = Step 1,2,3,4
                  }`
              }
            </Text>
          </View>

          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Button
              mode="text"
              onPress={navigateToLogin}
              labelStyle={styles.loginButtonText}
            >
              Sign In
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  card: {
    elevation: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  cardContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  radioContainer: {
    marginBottom: 24,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: '#8B5CF6',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
  locationButton: {
    backgroundColor: '#F3F0FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  locationButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '500',
  },
  distanceContainer: {
    marginBottom: 20,
  },
  distanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  distanceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  distanceButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  distanceButtonSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  distanceButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  distanceButtonTextSelected: {
    color: '#FFFFFF',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  serviceLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  serviceLabelDisabled: {
    color: '#ccc',
    opacity: 0.6,
  },
  loadingServices: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
  // Service Dropdown Styles
  serviceDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  serviceDropdownText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  serviceDropdownIcon: {
    fontSize: 12,
    color: '#666666',
  },
  selectedServicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  selectedServiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F0FF',
    borderColor: '#8B5CF6',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedServiceText: {
    fontSize: 14,
    color: '#8B5CF6',
    marginRight: 6,
  },
  removeServiceButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeServiceText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalDoneButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalDoneText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginVertical: 16,
    textAlign: 'center',
  },
  serviceModalItem: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  serviceModalItemSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#8B5CF6',
  },
  serviceModalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  serviceModalIcon: {
    marginRight: 12,
  },
  serviceModalIconText: {
    fontSize: 16,
    color: '#ccc',
  },
  serviceModalIconTextSelected: {
    color: '#8B5CF6',
  },
  serviceModalLabel: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  serviceModalLabelSelected: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  radiusContainer: {
    marginBottom: 20,
  },
  radiusOption: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  radiusOptionSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#8B5CF6',
  },
  radiusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  radiusIcon: {
    marginRight: 12,
  },
  radiusIconText: {
    fontSize: 16,
    color: '#ccc',
  },
  radiusIconTextSelected: {
    color: '#8B5CF6',
  },
  radiusText: {
    fontSize: 16,
    color: '#333',
  },
  radiusTextSelected: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#8B5CF6',
  },
  nextButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#8B5CF6',
  },
  nextButtonContent: {
    paddingVertical: 8,
  },
  registerButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    marginBottom: 16,
  },
  registerButtonContent: {
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666666',
  },
  loginButtonText: {
    color: '#8B5CF6',
  },
});

export default RegisterScreen;
