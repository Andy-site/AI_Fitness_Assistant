import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

<<<<<<< HEAD
const Loading2 = () => {
=======
const Loading2 = ({ navigation }) => {
  const handleNextPress = () => {
    navigation.navigate('Loading3'); // Navigate to Loading3 when Next button is pressed
  };

  const handleSkipPress = () => {
    navigation.navigate('Email'); // Navigate to Email when Skip button is pressed
  };

>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image source={require('../../assets/Images/Gym.png')} style={styles.backgroundImage} />

      {/* Semi-Transparent Overlay */}
      <View style={styles.overlay} />

      {/* Gradient Button (blurred rectangle) */}
      <View style={styles.gradientButton} />

      {/* Work Out Icon */}
<<<<<<< HEAD
      <Image source={require('../../assets/Images/Icon1.png')} style={styles.workOutIcon} />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
=======
      <Image 
        source={require('../../assets/Images/Icon1.png')} 
        style={styles.workOutIcon} 
        resizeMode="contain" 
      />

      {/* Skip Button with Arrow */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkipPress}>
        <Text style={styles.skipText}>Skip</Text>
        <Image source={require('../../assets/Images/Arrow.png')} style={styles.arrowIcon} />
>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d
      </TouchableOpacity>

      {/* Start Your Journey Text */}
      <Text style={styles.startJourneyText}>Start your journey towards a more active lifestyle</Text>

      {/* Next Button */}
<<<<<<< HEAD
      <TouchableOpacity style={styles.nextButton}>
=======
      <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
<<<<<<< HEAD
        <View style={[styles.progressBarSegment, styles.activeProgress]} />
        <View style={[styles.progressBarSegment, styles.activeProgress]} />
        <View style={[styles.progressBarSegment, styles.inactiveProgress]} />
=======
        <View style={[styles.progressBarSegment, styles.inactiveProgress]} />
        <View style={[styles.progressBarSegment, styles.activeProgress]} />
        <View style={[styles.progressBarSegment, styles.activeProgress]} />
>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d
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
<<<<<<< HEAD
    height: 852,
=======
    height: '100%',
>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
<<<<<<< HEAD
    height: 852,
=======
    height: '100%',
>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  gradientButton: {
    position: 'absolute',
    width: '100%',
    height: 169,
    top: 337,
    backgroundColor: '#B3A0FF',
<<<<<<< HEAD
    backdropFilter: 'blur(7px)', // For modern browsers, consider using libraries for this
=======
    backdropFilter: 'blur(7px)', 
>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d
    filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
  },
  workOutIcon: {
    position: 'absolute',
<<<<<<< HEAD
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
=======
    width: 50, 
    height: 50, 
    top: 347, 
    left: '50%', 
    transform: [{ translateX: -30 }],
  },
  skipButton: {
    position: 'absolute',
    top: 65,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  skipText: {
    fontFamily: 'League Spartan',
    fontSize: 20,
    fontWeight: '500',
    color: '#E2F163',
    marginRight: 5, 
  },
  arrowIcon: {
    width: 8,
    height: 8,
    marginTop: 3,
    marginLeft: 3,
>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d
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
<<<<<<< HEAD
    backdropFilter: 'blur(7px)', // Backdrop filter for modern browsers
=======
    backdropFilter: 'blur(7px)', 
>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d
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
