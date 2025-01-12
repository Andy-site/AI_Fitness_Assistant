import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import NextButton from '../../components/NextButton';  // Import your NextButton component

// Custom Password Input Component
const PasswordInput = ({ value, onChangeText, placeholder }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <View style={styles.inputContainer}>
      <TextInput
        placeholder={placeholder}
        secureTextEntry={!isVisible}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
      <Pressable 
        onPress={() => setIsVisible(!isVisible)}
        style={styles.visibilityButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.visibilityButtonText}>{isVisible ?  '👁️' : '🙈' }</Text>
      </Pressable>
    </View>
  );
};

const PasswordScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const isFocused = useIsFocused();

  const [validationErrors, setValidationErrors] = useState({
    length: true,
    uppercase: true,
    lowercase: true,
    number: true,
    special: true,
    match: true,
  });

  useEffect(() => {
    if (!isFocused) {
      setErrorMessage('');
    }
  }, [isFocused]);

  useEffect(() => {
    setValidationErrors({
      length: password.length < 8,
      uppercase: !/[A-Z]/.test(password),
      lowercase: !/[a-z]/.test(password),
      number: !/\d/.test(password),
      special: !/[@$!%*?&]/.test(password),
      match: password !== confirmPassword && confirmPassword.length > 0,
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
      navigation.navigate('NameScreen', { 
        email, 
        password: password 
      });
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const ValidationRule = ({ satisfied, text }) => (
    <Text style={[styles.rule, { color: satisfied ? '#4CAF50' : '#FF5252' }]}>{satisfied ? '✓' : '•'} {text}</Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Password</Text>

      <View style={styles.purpleBackgroundLarge}>
        <Text style={styles.label}>Password</Text>
        <PasswordInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />
        
         {/* Separator Line */}
        <View style={styles.separatorLine} />


        <Text style={styles.label}>Confirm Password</Text>
        <PasswordInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}

      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>Password must contain:</Text>
        <ValidationRule satisfied={!validationErrors.length} text="At least 8 characters" />
        <ValidationRule satisfied={!validationErrors.uppercase} text="One uppercase letter" />
        <ValidationRule satisfied={!validationErrors.lowercase} text="One lowercase letter" />
        <ValidationRule satisfied={!validationErrors.number} text="One number" />
        <ValidationRule satisfied={!validationErrors.special} text="One special character (@$!%*?&)" />
        {confirmPassword.length > 0 && (
          <ValidationRule satisfied={!validationErrors.match} text="Passwords match" />
        )}
      </View>

      <NextButton 
        title="Next" 
        onPress={handleNext}
        disabled={password !== confirmPassword || password.length < 8}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  purpleBackgroundLarge: {
    backgroundColor: '#B3A0FF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#232323',
    fontWeight: '500',
    marginBottom: 10,
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#CCCCCC', // Light gray color for the separator line
    marginVertical: 15, // Space around the separator line
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingLeft: 15,
    paddingRight: 50,
    fontSize: 16,
    color: '#232323',
  },
  visibilityButton: {
    position: 'absolute',
    right: 15,
    top: 12,
    zIndex: 1,
  },
  visibilityButtonText: {
    fontSize: 18,
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
  },
});

export default PasswordScreen;
