import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import NextButton from '../../components/NextButton';
import {sendOtp, registerUser} from '../../api/fithubApi';
import DropDownPicker from 'react-native-dropdown-picker';

const GoalScreen = ({ navigation, route }) => {

  const { email } = route.params; 
  const [goal, setGoal] = useState(route.params?.goal || '');
  const [goalWeight, setGoalWeight] = useState(route.params?.goalWeight || '');
  const [goalDuration, setGoalDuration] = useState(route.params?.goalDuration || '');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      label: `${i + 1} Month${i > 0 ? 's' : ''}`,
      value: `${i + 1}`,
    }))
  );


  const goals = [
    { label: 'Weight Loss', value: 'Weight Loss' },
    { label: 'Weight Gain', value: 'Weight Gain' },
  ];

  const userWeight = route.params?.weight || 0;

  const handleSelect = (selectedGoal) => {
    setGoal(selectedGoal);
    setError('');
  };


  const handleNext = async () => {
          // Validate if all fields are filled
          if (!goal || !goalWeight || !goalDuration) {
              setError('Please fill in all fields');
              return;
          }
      
          // Validate weight based on goal
          if (goal === 'Weight Loss' && parseFloat(goalWeight) >= parseFloat(userWeight)) {
              setError(`Goal weight must be less than your current weight for weight loss. Your weight is ${userWeight}`);
              return;
          }
          
          if (goal === 'Weight Gain' && parseFloat(goalWeight) <= parseFloat(userWeight)) {
              setError(`Goal weight must be greater than your current weight for weight gain. Your weight is ${userWeight}`);
              return;
          }
          
      
          // Prepare user data to be sent for OTP
          const userData = {
              ...route.params,
              goal,
              goal_weight: goalWeight, // Sending goal weight
              goal_duration: `${goalDuration} ${parseInt(goalDuration) === 1 ? 'month' : 'months'}`, // Sending goal duration
              first_name: route.params.firstName,
              last_name: route.params.lastName,
              email: route.params.email, // Make sure to include the email
          };
      
          try {
  
              const registrationResponse = await registerUser(userData);
              console.log('Registration response:', registrationResponse);
  
              console.log('Sending OTP to email:', userData.email);
              
              // Send OTP before registering the user
              await sendOtp(userData.email);  // Send OTP before proceeding with registration
      
              console.log('OTP sent successfully');
              
              // Proceed to the OTP verification screen
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
            onPress={() => handleSelect(item.value)}
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

      <TextInput
        style={[styles.inputField, error && styles.errorBorder]}
        placeholder="Enter your goal weight (kg)"
        keyboardType="numeric"
        value={goalWeight}
        onChangeText={setGoalWeight}
      />
      <Text style={styles.unitText}>Weight in kilograms (kg)</Text>

      {(goalWeight && goal) && (
        <Text style={{
          color:
            (goal === 'Weight Loss' && goalWeight >= userWeight) ||
            (goal === 'Weight Gain' && goalWeight <= userWeight)
              ? '#FF5252'
              : '#B3A0FF',
          fontSize: 13,
          marginLeft: 4,
          marginBottom: 8,
        }}>
          {
            goal === 'Weight Loss'
              ? 'Goal weight must be less than current weight'
              : 'Goal weight must be greater than current weight'
          }
        </Text>
      )}

      <DropDownPicker
        open={open}
        value={goalDuration}
        items={items}
        setOpen={setOpen}
        setValue={setGoalDuration}
        setItems={setItems}
        placeholder="Select Goal Duration (e.g., 3 months)"
        containerStyle={styles.dropdownContainer}
        style={styles.dropdownStyle}
        dropDownStyle={styles.dropdownList}
      />

      <NextButton
        title="Finish Registration"
        onPress={handleNext}
        disabled={!goal || !goalWeight || !goalDuration}
        style={!goal || !goalWeight || !goalDuration ? { opacity: 0.5 } : {}}
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
    padding: 20,
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
  },
  optionButton: {
    backgroundColor: '#B3A0FF',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#e8f0fe',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedText: {
    color: '#007AFF',
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
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
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
    color: '#ccc',
    marginBottom: 8,
    marginLeft: 4,
  },
  dropdownContainer: {
    marginBottom: 12,
    zIndex: 10,
  },
  dropdownStyle: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 5,
  },
  debugText: {
    marginTop: 12,
    fontSize: 12,
    color: 'yellow',
    textAlign: 'center',
  },
});

export default GoalScreen;
