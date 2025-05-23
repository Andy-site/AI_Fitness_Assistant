import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import InputField from '../../components/InputField';
import NextButton from '../../components/NextButton';

const UserInput = ({ navigation, route }) => {
  const [firstName, setFirstName] = useState(route.params?.firstName || '');
  const [lastName, setLastName] = useState(route.params?.lastName || '');
  const [age, setAge] = useState(route.params?.age || '');
  const [height, setHeight] = useState(route.params?.height || '');
  const [weight, setWeight] = useState(route.params?.weight || '');

  

  const handleNext = () => {
    const parsedAge = parseInt(age, 10);
    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(weight);

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter both first and last names.');
      return;
    }

    if (isNaN(parsedAge) || parsedAge <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid age.');
      return;
    }

    if (isNaN(parsedHeight) || parsedHeight <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid height.');
      return;
    }

    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid weight.');
      return;
    }

    navigation.navigate('GoalScreen', {
      firstName,
      lastName,
      age: parsedAge,
      height: parsedHeight,
      weight: parsedWeight,
      email: route.params?.email,
      session_id: route.params?.session_id,
      password: route.params?.password,
      confirmPassword: route.params?.confirmPassword,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Enter Your Details</Text>
      
      <View style={styles.purpleBackground}>
        {/* First Name */}
        <Text style={styles.label}>First Name</Text>
        <InputField
          placeholder="First Name"
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />
        <View style={styles.separator} />

        {/* Last Name */}
        <Text style={styles.label}>Last Name</Text>
        <InputField
          placeholder="Last Name"
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        />
        <View style={styles.separator} />

        {/* Age */}
        <Text style={styles.label}>Age</Text>
        <InputField
          placeholder="Age (e.g., 22)"
          style={styles.input}
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />
        <View style={styles.separator} />

        {/* Height */}
<Text style={styles.label}>Height</Text>
<InputField
  placeholder="Height (e.g., 175)"
  style={styles.input}
  keyboardType="numeric"
  value={height}
  onChangeText={setHeight}
/>
<Text style={styles.unitHint}>in centimeters (cm)</Text>
<View style={styles.separator} />

{/* Weight */}
<Text style={styles.label}>Weight</Text>
<InputField
  placeholder="Weight (e.g., 70.5)"
  style={styles.input}
  keyboardType="numeric"
  value={weight}
  onChangeText={setWeight}
/>
<Text style={styles.unitHint}>in kilograms (kg)</Text>


      </View>

      <NextButton title="Next" onPress={handleNext} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 20,
    backgroundColor: '#222',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    marginTop: 50,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  purpleBackground: {
    backgroundColor: '#B3A0FF',
    padding: 20,
    marginBottom: 30,
  },
  unitHint: {
    fontSize: 12,
    color: '#444',
    marginBottom: 10,
    marginTop: -8,
    marginLeft: 5,
  },
  
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232323',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#232323',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#D1C4E9',
    marginVertical: 10,
  },
});

export default UserInput;
