// CustomButton.js
import React from 'react';
import { Button } from 'react-native';

const NextButton = ({ title, onPress }) => {
  return <Button title={title} onPress={onPress} />;
};

export default NextButton;
