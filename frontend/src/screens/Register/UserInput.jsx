import React, { useState } from 'react';
import { View, StyleSheet, Text, ToastAndroid, ScrollView } from 'react-native';
import InputField from '../../components/InputField';
import NextButton from '../../components/NextButton';

const UserInput = ({ navigation, route }) => {
  const [firstName, setFirstName] = useState(route.params?.firstName || '');
  const [lastName, setLastName] = useState(route.params?.lastName || '');
  const [age, setAge] = useState(route.params?.age || '');
  const [height, setHeight] = useState(route.params?.height || '');
  const [weight, setWeight] = useState(route.params?.weight || '');

  const [errors, setErrors] = useState({});

  const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const handleNext = () => {
    const newErrors = {};
    const parsedAge = parseInt(age, 10);
    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(weight);

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      showToast('First name is required');
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      showToast('Last name is required');
    }

    if (isNaN(parsedAge) || parsedAge <= 0) {
      newErrors.age = 'Please enter a valid age';
      showToast('Please enter a valid age');
    }

    if (isNaN(parsedHeight) || parsedHeight <= 0) {
      newErrors.height = 'Please enter a valid height';
      showToast('Please enter a valid height');
    }

    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      newErrors.weight = 'Please enter a valid weight';
      showToast('Please enter a valid weight');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

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
        <Text style={styles.label}>
          First Name <Text style={styles.required}>*</Text>
        </Text>
        <InputField
          placeholder="First Name"
          style={styles.input}
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            setErrors((prev) => ({ ...prev, firstName: null }));
          }}
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        <View style={styles.separator} />

        {/* Last Name */}
        <Text style={styles.label}>
          Last Name <Text style={styles.required}>*</Text>
        </Text>
        <InputField
          placeholder="Last Name"
          style={styles.input}
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            setErrors((prev) => ({ ...prev, lastName: null }));
          }}
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
        <View style={styles.separator} />

        {/* Age */}
        <Text style={styles.label}>
          Age <Text style={styles.required}>*</Text>
        </Text>
        <InputField
          placeholder="Age (e.g., 22)"
          style={styles.input}
          keyboardType="numeric"
          value={age}
          onChangeText={(text) => {
            setAge(text);
            setErrors((prev) => ({ ...prev, age: null }));
          }}
        />
        {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
        <View style={styles.separator} />

        {/* Height */}
        <Text style={styles.label}>
          Height <Text style={styles.required}>*</Text>
        </Text>
        <InputField
          placeholder="Height (e.g., 175)"
          style={styles.input}
          keyboardType="numeric"
          value={height}
          onChangeText={(text) => {
            setHeight(text);
            setErrors((prev) => ({ ...prev, height: null }));
          }}
        />
        <Text style={styles.unitHint}>in centimeters (cm)</Text>
        {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
        <View style={styles.separator} />

        {/* Weight */}
        <Text style={styles.label}>
          Weight <Text style={styles.required}>*</Text>
        </Text>
        <InputField
          placeholder="Weight (e.g., 70.5)"
          style={styles.input}
          keyboardType="numeric"
          value={weight}
          onChangeText={(text) => {
            setWeight(text);
            setErrors((prev) => ({ ...prev, weight: null }));
          }}
        />
        <Text style={styles.unitHint}>in kilograms (kg)</Text>
        {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
      </View>

      <NextButton title="Next" onPress={handleNext} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#222',
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 10,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232323',
    marginBottom: 8,
  },
  required: {
    color: '#FF5252',
  },
  unitHint: {
    fontSize: 12,
    color: '#444',
    marginBottom: 10,
    marginTop: -8,
    marginLeft: 5,
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
  errorText: {
    fontSize: 13,
    color: '#FF5252',
    marginTop: -5,
    marginBottom: 10,
    marginLeft: 5,
    fontWeight: '500',
  },
});

export default UserInput;
