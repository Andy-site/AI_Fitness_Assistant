import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import the Ionicons icon set
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
      <Ionicons
        name={isVisible ? 'eye' : 'eye-off'}  // Toggle between eye and eye-off icons
        size={30}
        color="black" // You can change the color based on your design
        style={styles.visibilityButtonText}
      />
    </Pressable>
    </View>
  );
};

// Define styles here
const styles = StyleSheet.create({
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
    fontSize: 25,
  },
});

export default PasswordInput;
