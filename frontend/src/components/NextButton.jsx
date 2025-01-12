import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const NextButton = ({ title, onPress, disabled, style }) => {
  return (
    <TouchableOpacity 
      style={[styles.nextButton, disabled && styles.disabledButton, style]} // Merge styles
      onPress={onPress} 
      disabled={disabled}
    >
      <Text style={styles.nextButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  nextButton: {
    width: '70%',
    height: 50,
    
    backgroundColor: '#232323',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginLeft:50,
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#232323', // Light grey when disabled
    borderColor: '#888888',
  },
});

export default NextButton;
