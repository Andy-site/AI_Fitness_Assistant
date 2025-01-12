import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const InputField = ({ style, ...props }) => {
  return <TextInput style={[styles.input, style]} {...props} />;
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingLeft: 10,
    fontSize: 16,
    color: '#232323',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
});

export default InputField;
