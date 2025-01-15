import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';

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
    fontSize: 18,
  },
});

export default PasswordInput;
