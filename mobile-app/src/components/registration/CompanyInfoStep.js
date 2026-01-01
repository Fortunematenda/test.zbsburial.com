import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, RadioButton } from 'react-native-paper';
import { Controller } from 'react-hook-form';

/**
 * CompanyInfoStep Component
 * Step 3: Company information for providers
 */
const CompanyInfoStep = ({
  control,
  errors,
  handleSubmit,
  prevStep,
  nextStep,
  styles,
}) => {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.sectionTitle}>Company Information</Text>
        <Text style={styles.sectionSubtitle}>Tell us about your business</Text>
        
        <Controller
          control={control}
          name="company_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Company Name (Optional)"
              mode="outlined"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={styles.input}
            />
          )}
        />

        <Text style={[styles.sectionSubtitle, { marginTop: 20, marginBottom: 10 }]}>
          Does your company have a website? *
        </Text>
        <View style={styles.radioContainer}>
          <Controller
            control={control}
            name="is_company_website"
            rules={{ required: 'Please select an option' }}
            render={({ field: { onChange, value } }) => (
              <>
                <View style={styles.radioItem}>
                  <RadioButton
                    value="1"
                    status={value === '1' ? 'checked' : 'unchecked'}
                    onPress={() => onChange('1')}
                  />
                  <Text style={styles.radioLabel}>Yes</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton
                    value="0"
                    status={value === '0' ? 'checked' : 'unchecked'}
                    onPress={() => onChange('0')}
                  />
                  <Text style={styles.radioLabel}>No</Text>
                </View>
              </>
            )}
          />
        </View>
        {errors.is_company_website && <Text style={styles.errorText}>{errors.is_company_website.message}</Text>}

        <Text style={[styles.sectionSubtitle, { marginTop: 20, marginBottom: 10 }]}>
          Company size, employees *
        </Text>
        <View style={styles.radioContainer}>
          <Controller
            control={control}
            name="company_size"
            rules={{ required: 'Please select company size' }}
            render={({ field: { onChange, value } }) => (
              <>
                {['Self-employed', '2-10', '11-50', '51-200', '200+'].map((size) => (
                  <View key={size} style={styles.radioItem}>
                    <RadioButton
                      value={size}
                      status={value === size ? 'checked' : 'unchecked'}
                      onPress={() => onChange(size)}
                    />
                    <Text style={styles.radioLabel}>{size}</Text>
                  </View>
                ))}
              </>
            )}
          />
        </View>
        {errors.company_size && <Text style={styles.errorText}>{errors.company_size.message}</Text>}

        <Text style={[styles.sectionSubtitle, { marginTop: 20, marginBottom: 10 }]}>
          Does your company have a sales team? *
        </Text>
        <View style={styles.radioContainer}>
          <Controller
            control={control}
            name="is_company_sales_team"
            rules={{ required: 'Please select an option' }}
            render={({ field: { onChange, value } }) => (
              <>
                <View style={styles.radioItem}>
                  <RadioButton
                    value="1"
                    status={value === '1' ? 'checked' : 'unchecked'}
                    onPress={() => onChange('1')}
                  />
                  <Text style={styles.radioLabel}>Yes</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton
                    value="0"
                    status={value === '0' ? 'checked' : 'unchecked'}
                    onPress={() => onChange('0')}
                  />
                  <Text style={styles.radioLabel}>No</Text>
                </View>
              </>
            )}
          />
        </View>
        {errors.is_company_sales_team && <Text style={styles.errorText}>{errors.is_company_sales_team.message}</Text>}

        <Text style={[styles.sectionSubtitle, { marginTop: 20, marginBottom: 10 }]}>
          Does your company use social media? *
        </Text>
        <View style={styles.radioContainer}>
          <Controller
            control={control}
            name="is_company_social_media"
            rules={{ required: 'Please select an option' }}
            render={({ field: { onChange, value } }) => (
              <>
                <View style={styles.radioItem}>
                  <RadioButton
                    value="1"
                    status={value === '1' ? 'checked' : 'unchecked'}
                    onPress={() => onChange('1')}
                  />
                  <Text style={styles.radioLabel}>Yes</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton
                    value="0"
                    status={value === '0' ? 'checked' : 'unchecked'}
                    onPress={() => onChange('0')}
                  />
                  <Text style={styles.radioLabel}>No</Text>
                </View>
              </>
            )}
          />
        </View>
        {errors.is_company_social_media && <Text style={styles.errorText}>{errors.is_company_social_media.message}</Text>}

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={prevStep} style={styles.backButton}>
            Back
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSubmit(nextStep)} 
            style={styles.nextButton}
          >
            Next
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

export default CompanyInfoStep;

