import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const NextButton = ({ title, onPress, disabled, style }) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.nextButton, disabled && styles.disabledButton, style]} // Merge styles
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={styles.nextButtonText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row', // Use row direction to horizontally center the button
    justifyContent: 'center', // Center the button horizontally
    width: '100%', // Ensure it takes up full width
  },
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
