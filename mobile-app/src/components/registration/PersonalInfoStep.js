import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { Controller } from 'react-hook-form';

/**
 * PersonalInfoStep Component
 * Step 4 for providers / Step 5 for customers: Personal information (name, email, phone)
 */
const PersonalInfoStep = ({
  control,
  errors,
  prevStep,
  nextStep,
  styles,
}) => {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.sectionTitle}>Your Information</Text>
        
        <Controller
          control={control}
          name="first_name"
          rules={{
            required: 'First name is required',
            minLength: { value: 2, message: 'First name must be at least 2 characters' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="First Name"
              mode="outlined"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.first_name}
              style={styles.input}
            />
          )}
        />
        {errors.first_name && <Text style={styles.errorText}>{errors.first_name.message}</Text>}

        <Controller
          control={control}
          name="last_name"
          rules={{
            required: 'Last name is required',
            minLength: { value: 2, message: 'Last name must be at least 2 characters' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Last Name"
              mode="outlined"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.last_name}
              style={styles.input}
            />
          )}
        />
        {errors.last_name && <Text style={styles.errorText}>{errors.last_name.message}</Text>}

        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Email"
              mode="outlined"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              style={styles.input}
            />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        <Controller
          control={control}
          name="contact_number"
          rules={{
            required: 'Phone number is required',
            pattern: { value: /^0[6-8][0-9]{8}$/, message: 'Invalid phone number format' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Phone Number (e.g., 0612345678)"
              mode="outlined"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType="phone-pad"
              error={errors.contact_number}
              style={styles.input}
            />
          )}
        />
        {errors.contact_number && <Text style={styles.errorText}>{errors.contact_number.message}</Text>}

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

export default PersonalInfoStep;

