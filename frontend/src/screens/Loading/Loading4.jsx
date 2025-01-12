import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const Loading4 = () => {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require('../../assets/Images/Gym2.png')} // Replace with your actual image path
        style={styles.backgroundImage}
      />
      
      {/* Semi-transparent Overlay */}
      <View style={styles.overlay} />

      {/* Icon4 Image */}
      <Image
        source={require('../../assets/Images/Icon4.png')} // Replace with your actual image path
        style={styles.icon}
      />

      {/* Nutrition text */}
      <Text style={styles.nutritionText}>A community for you, challenge yourself</Text>

      {/* Get Started text */}
      <Text style={styles.getStartedText}>Get Started</Text>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={styles.progressStepActive} />
        <View style={styles.progressStep} />
        <View style={styles.progressStep} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 393,
    height: 852,
    backgroundColor: '#232323',
    borderRadius: 20,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    resizeMode: 'cover', // Ensures the background image covers the container
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Semi-transparent overlay
    borderRadius: 20,
  },
  icon: {
    position: 'absolute',
    width: 63.5,
    height: 42.73,
    left: '50%',
    top: 354,
    transform: [{ translateX: -63.5 / 2 }], // Center the icon
  },
  nutritionText: {
    position: 'absolute',
    width: 309,
    height: 60,
    left: '50%',
    top: 405,
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'center',
    color: '#FFFFFF',
    transform: [{ translateX: -309 / 2 }],
  },
  getStartedText: {
    position: 'absolute',
    width: 127,
    height: 23,
    left: '50%',
    top: 534,
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
    color: '#FFFFFF',
    transform: [{ translateX: -127 / 2 }],
  },
  progressBar: {
    position: 'absolute',
    width: 68,
    height: 4,
    left: '50%',
    top: 474,
    transform: [{ translateX: -68 / 2 }],
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStepActive: {
    width: 20,
    height: 4,
    backgroundColor: '#896CFE',
    borderRadius: 12,
  },
  progressStep: {
    width: 20,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
});

export default Loading4;
