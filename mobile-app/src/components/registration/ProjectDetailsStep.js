import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, Checkbox } from 'react-native-paper';

/**
 * ProjectDetailsStep Component
 * Step 4: Project details for customers (description, budget, urgency flags)
 */
const ProjectDetailsStep = ({
  userType,
  leadDescription,
  setLeadDescription,
  leadBudget,
  setLeadBudget,
  leadUrgent,
  setLeadUrgent,
  leadHiringDecision,
  setLeadHiringDecision,
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
        <Text style={styles.sectionTitle}>Project Details</Text>
        
        <TextInput
          label="Description"
          mode="outlined"
          value={leadDescription}
          onChangeText={setLeadDescription}
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="Type brief description of the project"
        />

        <TextInput
          label="Estimated Budget (e.g., R 500.00)"
          mode="outlined"
          value={leadBudget}
          onChangeText={setLeadBudget}
          style={styles.input}
          keyboardType="numeric"
          placeholder="R 0.00"
        />

        <View style={styles.checkboxContainer}>
          <Checkbox
            status={leadUrgent ? 'checked' : 'unchecked'}
            onPress={() => setLeadUrgent(!leadUrgent)}
          />
          <Text style={styles.checkboxLabel}>Is it urgent?</Text>
        </View>

        <View style={styles.checkboxContainer}>
          <Checkbox
            status={leadHiringDecision ? 'checked' : 'unchecked'}
            onPress={() => setLeadHiringDecision(!leadHiringDecision)}
          />
          <Text style={styles.checkboxLabel}>Ready to Hire?</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={prevStep} style={styles.backButton}>
            Back
          </Button>
          <Button mode="contained" onPress={nextStep} style={styles.nextButton}>
            Next
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

export default ProjectDetailsStep;

