import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ToastAndroid,
  Alert,
} from 'react-native';
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

  const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const handleNext = async () => {
  setError('');

  if (!goal || !goalWeight || !goalDuration || !activityLevel) {
    const message = 'All fields are required';
    setError(message);
    showToast(message);
    return;
  }

  const parsedGoalWeight = parseFloat(goalWeight);

  if (goal === 'Weight Loss' && parsedGoalWeight >= parseFloat(userWeight)) {
    const message = `Goal weight must be less than your current weight (${userWeight} kg)`;
    setError(message);
    showToast(message);
    return;
  }

  if (goal === 'Weight Gain' && parsedGoalWeight <= parseFloat(userWeight)) {
    const message = `Goal weight must be more than your current weight (${userWeight} kg)`;
    setError(message);
    showToast(message);
    return;
  }

  const userData = {
    ...route.params,
    goal,
    goal_weight: goalWeight,
    goal_duration: `${goalDuration}`,
    activity_level: activityLevel,
    first_name: route.params.firstName,
    last_name: route.params.lastName,
    email: route.params.email,
  };

  try {
    const registrationResponse = await registerUser(userData);

    // Registration succeeded
    console.log('Registration successful. Sending OTP...');
    await sendOtp(userData.email);
    console.log('OTP sent successfully');

    navigation.navigate('RegisterScreen', { email: userData.email });

  } catch (err) {
    console.log('Registration or OTP error:', err);

    const message =
      typeof err === 'object' && err?.error
        ? err.error
        : 'An error occurred during registration.';

    // Check if it's an email already registered case
    if (message === 'Email already registered.') {
      Alert.alert(
        'Email Already Registered',
        'This email is already registered. Please log in instead.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('LoginScreen', { email: userData.email }),
          },
        ],
        { cancelable: false }
      );
    } else {
      // setError(message);
      showToast(message);
    }
  }
};


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Select Your Goal</Text>
      <Text style={styles.subtitle}>What do you want to achieve?</Text>

      <View style={styles.selectorContainer}>
        {goals.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              goal === item.value && styles.selectedButton,
            ]}
            onPress={() => {
              setGoal(item.value);
              setError('');
            }}
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

        {error && <Text style={styles.errorMessage}>{error}</Text>}
        {!error && (
          <Text style={styles.helperText}>
            This will help us personalize your experience
          </Text>
        )}
      </View>

      <Text style={styles.currentWeight}>Your current weight: {userWeight} kg</Text>

      <View style={styles.inputcontainer}>
        <TextInput
          style={styles.inputField}
          placeholder="Enter your goal weight (kg)"
          keyboardType="numeric"
          value={goalWeight}
          onChangeText={(text) => {
            setGoalWeight(text);
            setError('');
          }}
        />
        <Text style={styles.unitText}>Weight in kilograms (kg)</Text>

        <Text style={styles.label}>Select Your Goal Duration</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={goalDuration}
            onValueChange={(itemValue) => {
              setGoalDuration(itemValue);
              setError('');
            }}
            style={styles.picker}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const month = i + 1;
              return (
                <Picker.Item
                  key={month}
                  label={`${month} Month${month > 1 ? 's' : ''}`}
                  value={`${month} month`}
                />
              );
            })}
          </Picker>
        </View>

        <Text style={styles.label}>Select Your Activity Level</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={activityLevel}
            onValueChange={(itemValue) => {
              setActivityLevel(itemValue);
              setError('');
            }}
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
      />

      <Text style={styles.debugText}>Debug Info: Weight = {userWeight} kg</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
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
  errorMessage: {
    color: '#FF5252',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
  helperText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  inputcontainer: {
    backgroundColor: '#b3a0ff',
    padding: 20,
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
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#232323',
    marginBottom: 6,
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
  currentWeight: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 8,
    marginLeft: 4,
    textAlign: 'center',
  },
  debugText: {
    marginTop: 12,
    fontSize: 12,
    color: 'yellow',
    textAlign: 'center',
  },
});

export default GoalScreen;
