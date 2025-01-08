import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import InputField from '../components/InputField';

const PasswordScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validatePassword = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (password.length < 8) {
      Alert.alert('Password Too Short', 'Password must be at least 8 characters long.');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      Alert.alert('Missing Uppercase Letter', 'Password must include at least one uppercase letter.');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      Alert.alert('Missing Lowercase Letter', 'Password must include at least one lowercase letter.');
      return false;
    }
    if (!/\d/.test(password)) {
      Alert.alert('Missing Number', 'Password must include at least one numeric digit.');
      return false;
    }
    if (!/[@$!%*?&]/.test(password)) {
      Alert.alert('Missing Special Character', 'Password must include at least one special character (e.g., @$!%*?&).');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validatePassword()) return;

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    navigation.navigate('NameScreen', { email, password });
  };

  return (
    <View style={styles.container}>
      <InputField
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <InputField
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      <Button title="Next" onPress={handleNext} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
});

export default PasswordScreen;
