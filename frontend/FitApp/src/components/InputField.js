import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const InputField = ({ placeholder, value, onChangeText, keyboardType, secureTextEntry }) => {
  return (
    <TextInput
      placeholder={placeholder}
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
    />
  );
};

const styles = StyleSheet.create({
  input: { 
    borderWidth: 1, 
    marginVertical: 10, 
    padding: 10, 
    borderRadius: 5 
  },
});

export default InputField;
