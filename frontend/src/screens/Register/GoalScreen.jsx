import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import NextButton from '../../components/NextButton';
import { sendOtp, registerUser } from '../../api/fithubApi';

const activityLevels = [
  { label: 'Sedentary (little or no exercise)', value: 'sedentary' },
  { label: 'Light (light exercise 1-3 days/week)', value: 'light' },
  { label: 'Moderate (moderate exercise 3-5 days/week)', value: 'moderate' },
  { label: 'Active (hard exercise 6-7 days/week)', value: 'active' },
  { label: 'Very Active (very hard exercise/physical job)', value: 'very active' },
];

const GoalScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [goal, setGoal] = useState(route.params?.goal || '');
  const [goalWeight, setGoalWeight] = useState(route.params?.goalWeight || '');
  const [goalDuration, setGoalDuration] = useState(route.params?.goalDuration || '');
  const [activityLevel, setActivityLevel] = useState(route.params?.activityLevel || '');
  const [error, setError] = useState('');

  const goals = [
    { label: 'Weight Loss', value: 'Weight Loss' },
    { label: 'Weight Gain', value: 'Weight Gain' },
  ];

  const userWeight = route.params?.weight || 0;

  const handleNext = async () => {
    if (!goal || !goalWeight || !goalDuration || !activityLevel) {
      setError('Please fill in all fields');
      return;
    }

    if (goal === 'Weight Loss' && parseFloat(goalWeight) >= parseFloat(userWeight)) {
      setError(`Goal weight must be less than your current weight for weight loss. Your weight is ${userWeight}`);
      return;
    }

    if (goal === 'Weight Gain' && parseFloat(goalWeight) <= parseFloat(userWeight)) {
      setError(`Goal weight must be greater than your current weight for weight gain. Your weight is ${userWeight}`);
      return;
    }

    const userData = {
      ...route.params,
      goal,
      goal_weight: goalWeight,
      goal_duration: `${goalDuration} ${parseInt(goalDuration) === 1 ? 'month' : 'months'}`,
      activity_level: activityLevel,
      first_name: route.params.firstName,
      last_name: route.params.lastName,
      email: route.params.email,
    };

    try {
      const registrationResponse = await registerUser(userData);
      console.log('Registration response:', registrationResponse);

      console.log('Sending OTP to email:', userData.email);
      await sendOtp(userData.email);

      console.log('OTP sent successfully');
      navigation.navigate('RegisterScreen', { email: userData.email });
    } catch (error) {
      console.error('Error during OTP sending:', error);
      setError('Error during OTP sending.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Goal</Text>
      <Text style={styles.subtitle}>What do you want to achieve?</Text>

      <View style={styles.selectorContainer}>
        {goals.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              goal === item.value && styles.selectedButton,
              error && styles.errorBorder,
            ]}
            onPress={() => setGoal(item.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                goal === item.value && styles.selectedText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        {goal && (
          <Text style={styles.goalDescription}>
            {goal === 'Weight Loss' && 'You want to shed some fat and slim down.'}
            {goal === 'Weight Gain' && 'You want to build muscle or increase size.'}
          </Text>
        )}

        {error ? (
          <Text style={styles.errorMessage}>{error}</Text>
        ) : (
          <Text style={styles.helperText}>
            This will help us personalize your experience
          </Text>
        )}
      </View>

      <Text style={styles.currentWeight}>Your current weight: {userWeight} kg</Text>
      <View style={styles.inputcontainer}>
        <TextInput
          style={[styles.inputField, error && styles.errorBorder]}
          placeholder="Enter your goal weight (kg)"
          keyboardType="numeric"
          value={goalWeight}
          onChangeText={setGoalWeight}
        />
        <Text style={styles.unitText}>Weight in kilograms (kg)</Text>

        <Text style={styles.label}>Select Your Goal Duration</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={goalDuration}
            onValueChange={(itemValue) => setGoalDuration(itemValue)}
            style={styles.picker}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <Picker.Item key={i} label={`${i + 1} Month${i > 0 ? 's' : ''}`} value={`${i + 1}`} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Select Your Activity Level</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={activityLevel}
            onValueChange={(itemValue) => setActivityLevel(itemValue)}
            style={styles.picker}
          >
            {activityLevels.map((item, index) => (
              <Picker.Item key={index} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>
      </View>

      <NextButton
        title="Finish Registration"
        onPress={handleNext}
        disabled={!goal || !goalWeight || !goalDuration || !activityLevel}
        style={!goal || !goalWeight || !goalDuration || !activityLevel ? { opacity: 0.5 } : {}}
      />

      <Text style={styles.debugText}>Debug Info: Weight = {userWeight} kg</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#B3A0FF',
    textAlign: 'center',
    marginBottom: 24,
  },
  selectorContainer: {
    marginBottom: 24,
    backgroundColor: '#B3A0FF',
    padding: 20,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  inputcontainer: {
    backgroundColor: '#b3a0ff',
    padding: 20,
  },
  selectedButton: {
    backgroundColor: '#e8f0fe',
    borderWidth: 2,
    borderColor: '#e2f163',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  selectedText: {
    color: '#b3a0ff',
    fontWeight: 'bold',
  },
  goalDescription: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 12,
    marginLeft: 4,
  },
  errorBorder: {
    borderColor: '#FF5252',
  },
  errorMessage: {
    color: '#FF5252',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  helperText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  inputField: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    fontSize: 16,
  },
  unitText: {
    color: '#B3A0FF',
    fontSize: 13,
    marginLeft: 4,
    marginBottom: 10,
  },
  currentWeight: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 8,
    marginLeft: 4,
    textAlign: 'center',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  debugText: {
    marginTop: 12,
    fontSize: 12,
    color: 'yellow',
    textAlign: 'center',
  },
});

export default GoalScreen;