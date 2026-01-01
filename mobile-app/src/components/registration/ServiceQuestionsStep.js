import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, ActivityIndicator, RadioButton } from 'react-native-paper';

/**
 * ServiceQuestionsStep Component
 * Step 3: Service-specific questions for customers
 */
const ServiceQuestionsStep = ({
  userType,
  serviceQuestions,
  questionAnswers,
  setQuestionAnswers,
  loadingQuestions,
  prevStep,
  nextStep,
  styles,
}) => {
  if (userType !== 'customer') {
    return null; // This step is only for customers
  }

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.sectionTitle}>Service Details</Text>
        <Text style={styles.sectionSubtitle}>Tell us more about what you need</Text>
        
        {loadingQuestions ? (
          <ActivityIndicator size="large" color="#8B5CF6" style={{ marginVertical: 40 }} />
        ) : serviceQuestions.length > 0 ? (
          <>
            {serviceQuestions.map((q) => (
              <View key={q.question_id} style={{ marginBottom: 20 }}>
                <Text style={styles.sectionTitle}>{q.question}</Text>
                <View style={styles.radioContainer}>
                  {q.answers.map((answer) => (
                    <View key={answer} style={styles.radioItem}>
                      <RadioButton
                        value={answer}
                        status={questionAnswers[q.question_id] === answer ? 'checked' : 'unchecked'}
                        onPress={() => setQuestionAnswers(prev => ({ ...prev, [q.question_id]: answer }))}
                      />
                      <Text style={styles.radioLabel}>{answer}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            
            <View style={styles.buttonContainer}>
              <Button mode="outlined" onPress={prevStep} style={styles.backButton}>
                Back
              </Button>
              <Button 
                mode="contained" 
                onPress={nextStep} 
                style={styles.nextButton}
                disabled={Object.keys(questionAnswers).length !== serviceQuestions.length}
              >
                Next
              </Button>
            </View>
          </>
        ) : (
          <Button mode="contained" onPress={nextStep} style={styles.nextButton}>
            Next
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

export default ServiceQuestionsStep;

