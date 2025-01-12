import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const Loading3 = () => {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require('../../assets/Images/Girl2.png')} // Replace with your actual image path
        style={styles.backgroundImage}
      />
      
      {/* Semi-transparent Overlay */}
      <View style={styles.overlay} />

      {/* Image (Icon2.png) */}
      <Image
        source={require('../../assets/Images/Icon3.png')}
        style={styles.icon}
      />
      
      {/* Nutrition text */}
      <Text style={styles.nutritionText}>Find nutrition tips that fit your lifestyle</Text>

      {/* Next text */}
      <Text style={styles.nextText}>Next</Text>

      {/* Skip Button */}
      <Text style={styles.skip}>Skip</Text>

      {/* Arrow */}
      <View style={styles.arrow} />
      
      {/* Loading Progress */}
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
    width: '100%',
    height: '100%',
    backgroundColor: '#232323',
    borderRadius: 20,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '90%',
    left: 0,
    top: 0,
    resizeMode: 'cover', // Ensures the background image covers the container
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '90%',
    backgroundColor: 'rgba(0, 0, 0, 0.35)', // Semi-transparent overlay
    borderRadius: 20,
  },
  icon: {
    position: 'absolute',
    width: 40.51,
    height: 42.7,
    left: '50%',
    top: 353,
    transform: [{ translateX: -40.51 / 2 }], // Center the icon
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
  nextText: {
    position: 'absolute',
    width: 97,
    height: 23,
    left: '50%',
    top: 534,
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
    color: '#FFFFFF',
    transform: [{ translateX: -97 / 2 }],
  },
  skip: {
    position: 'absolute',
    width: 33,
    height: 17,
    left: 315,
    top: 65,
    fontFamily: 'League Spartan',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 17,
    color: '#E2F163',
  },
  arrow: {
    position: 'absolute',
    width: 6,
    height: 11,
    left: 364,
    top: 78,
    backgroundColor: '#E2F163',
    transform: [{ rotate: '180deg' }],
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

export default Loading3;
