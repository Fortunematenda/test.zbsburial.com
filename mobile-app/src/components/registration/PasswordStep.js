import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator } from 'react-native-paper';
import { Controller } from 'react-hook-form';

/**
 * PasswordStep Component
 * Step 5 for providers / Step 6 for customers: Password creation
 */
const PasswordStep = ({
  control,
  errors,
  password,
  handleSubmit,
  onSubmit,
  isLoading,
  prevStep,
  styles,
}) => {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.sectionTitle}>Create Password</Text>
        
        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Password"
              mode="outlined"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              secureTextEntry
              error={errors.password}
              style={styles.input}
            />
          )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        <Controller
          control={control}
          name="password_confirmation"
          rules={{
            required: 'Password confirmation is required',
            validate: (value) => value === password || 'Passwords do not match',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Confirm Password"
              mode="outlined"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              secureTextEntry
              error={errors.password_confirmation}
              style={styles.input}
            />
          )}
        />
        {errors.password_confirmation && <Text style={styles.errorText}>{errors.password_confirmation.message}</Text>}

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={prevStep} style={styles.backButton}>
            Back
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSubmit(onSubmit)} 
            style={styles.registerButton}
            contentStyle={styles.registerButtonContent}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : 'Create Account'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

export default PasswordStep;

