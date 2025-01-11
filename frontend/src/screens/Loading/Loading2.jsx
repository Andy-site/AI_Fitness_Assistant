import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const Loading2 = () => {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image source={require('../../assets/Images/Gym.png')} style={styles.backgroundImage} />

      {/* Semi-Transparent Overlay */}
      <View style={styles.overlay} />

      {/* Gradient Button (blurred rectangle) */}
      <View style={styles.gradientButton} />

      {/* Work Out Icon */}
      <Image source={require('../../assets/Images/Icon1.png')} style={styles.workOutIcon} />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Start Your Journey Text */}
      <Text style={styles.startJourneyText}>Start your journey towards a more active lifestyle</Text>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton}>
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressBarSegment, styles.activeProgress]} />
        <View style={[styles.progressBarSegment, styles.activeProgress]} />
        <View style={[styles.progressBarSegment, styles.inactiveProgress]} />
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
    height: 852,
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: 852,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  gradientButton: {
    position: 'absolute',
    width: '100%',
    height: 169,
    top: 337,
    backgroundColor: '#B3A0FF',
    backdropFilter: 'blur(7px)', // For modern browsers, consider using libraries for this
    filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
  },
  workOutIcon: {
    position: 'absolute',
    width: 38.35,
    height: 43.32,
    top: 353,
    left: '50%',
    transform: [{ translateX: -19.175 }],
    backgroundColor: '#E2F163', // Color fill
  },
  skipButton: {
    position: 'absolute',
    width: 33,
    height: 17,
    top: 65,
    left: 315,
  },
  skipText: {
    fontFamily: 'League Spartan',
    fontSize: 18,
    fontWeight: '500',
    color: '#E2F163',
  },
  startJourneyText: {
    position: 'absolute',
    width: 309,
    height: 60,
    top: 405,
    left: '50%',
    transform: [{ translateX: -154.5 }],
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  nextButton: {
    position: 'absolute',
    width: 211,
    height: 44,
    top: 524,
    left: '50%',
    transform: [{ translateX: -105.5 }],
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    backdropFilter: 'blur(7px)', // Backdrop filter for modern browsers
    filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 18,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  progressBar: {
    position: 'absolute',
    width: 68,
    height: 4,
    top: 474,
    left: '50%',
    transform: [{ translateX: -34 }],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBarSegment: {
    width: 20,
    height: 4,
    borderRadius: 12,
  },
  activeProgress: {
    backgroundColor: '#896CFE',
  },
  inactiveProgress: {
    backgroundColor: '#FFFFFF',
  },
});

export default Loading2;
