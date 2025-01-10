import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import InputField from '../components/InputField';
import NextButton from '../components/NextButton';

const PasswordScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isFocused = useIsFocused();

  const [validationErrors, setValidationErrors] = useState({
    length: true,
    uppercase: true,
    lowercase: true,
    number: true,
    special: true,
    match: true
  });

  // Clear error message when screen loses focus
  useEffect(() => {
    if (!isFocused) {
      setErrorMessage('');
    }
  }, [isFocused]);

  // Real-time password validation
  useEffect(() => {
    setValidationErrors({
      length: password.length < 8,
      uppercase: !/[A-Z]/.test(password),
      lowercase: !/[a-z]/.test(password),
      number: !/\d/.test(password),
      special: !/[@$!%*?&]/.test(password),
      match: password !== confirmPassword && confirmPassword.length > 0
    });
  }, [password, confirmPassword]);

  const validatePassword = () => {
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setErrorMessage('Password must include at least one uppercase letter.');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setErrorMessage('Password must include at least one lowercase letter.');
      return false;
    }
    if (!/\d/.test(password)) {
      setErrorMessage('Password must include at least one numeric digit.');
      return false;
    }
    if (!/[@$!%*?&]/.test(password)) {
      setErrorMessage('Password must include at least one special character.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    try {
      if (!validatePassword()) {
        return;
      }

      // Here you would typically hash the password before navigation
      // const hashedPassword = await hashPassword(password);
      
      // For now, we'll just navigate with the password
      navigation.navigate('NameScreen', { 
        email, 
        password: password // Replace with hashedPassword when implemented
      });
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const ValidationRule = ({ satisfied, text }) => (
    <Text style={[styles.rule, { color: satisfied ? '#4CAF50' : '#FF5252' }]}>
      {satisfied ? '✓' : '•'} {text}
    </Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Password</Text>
      
      <View style={styles.inputContainer}>
        <InputField
          placeholder="Password"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <Pressable 
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.visibilityButton}
        >
          <Text>{isPasswordVisible ? '🙈' : '👁️'}</Text>
        </Pressable>
      </View>

      <View style={styles.inputContainer}>
        <InputField
          placeholder="Confirm Password"
          secureTextEntry={!isConfirmVisible}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
        />
        <Pressable 
          onPress={() => setIsConfirmVisible(!isConfirmVisible)}
          style={styles.visibilityButton}
        >
          <Text>{isConfirmVisible ? '🙈' : '👁️'}</Text>
        </Pressable>
      </View>

      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}

      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>Password must contain:</Text>
        <ValidationRule 
          satisfied={!validationErrors.length} 
          text="At least 8 characters" 
        />
        <ValidationRule 
          satisfied={!validationErrors.uppercase} 
          text="One uppercase letter" 
        />
        <ValidationRule 
          satisfied={!validationErrors.lowercase} 
          text="One lowercase letter" 
        />
        <ValidationRule 
          satisfied={!validationErrors.number} 
          text="One number" 
        />
        <ValidationRule 
          satisfied={!validationErrors.special} 
          text="One special character (@$!%*?&)" 
        />
        {confirmPassword.length > 0 && (
          <ValidationRule 
            satisfied={!validationErrors.match} 
            text="Passwords match" 
          />
        )}
      </View>

      <NextButton 
        title="Next" 
        onPress={handleNext}
        disabled={Object.values(validationErrors).some(error => error)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    color: '#333',
  },
  visibilityButton: {
    padding: 10,
  },
  rulesContainer: {
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  rule: {
    fontSize: 14,
    marginVertical: 4,
  },
  errorMessage: {
    color: '#FF5252',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  }
});

export default PasswordScreen;