import React, { useState } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import InputField from '../components/InputField';

const EmailScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleNext = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address (e.g., user@example.com).');
      return;
    }

    navigation.navigate('PasswordScreen', { email });
  };

  return (
    <View style={styles.container}>
      <InputField
        placeholder="e.g., user@example.com"
        value={email}
        onChangeText={setEmail}
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

export default EmailScreen;
