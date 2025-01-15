import React from 'react';
<<<<<<< HEAD
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
=======
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const Loading4 = ({ navigation }) => {
  const handleNextPress = () => {
    navigation.navigate('Email'); // Navigate to Email when Skip button is pressed
  };

  return (
    <View style={styles.container}>
         {/* Background Image */}
         <Image source={require('../../assets/Images/Gym2.png')} style={styles.backgroundImage} />
   
         {/* Semi-Transparent Overlay */}
         <View style={styles.overlay} />
   
         {/* Gradient Button (blurred rectangle) */}
         <View style={styles.gradientButton} />
   
         {/* Work Out Icon */}
         <Image 
           source={require('../../assets/Images/Icon3.png')} 
           style={styles.workOutIcon} 
           resizeMode="contain" 
         />
   
         
   
         {/* Start Your Journey Text */}
         <Text style={styles.startJourneyText}>A community for you, Challenge Yourself!!</Text>
   
         {/* Next Button */}
         <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
           <Text style={styles.nextText}>Get Started</Text>
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
       height: '100%',
       top: 0,
       left: 0,
     },
     overlay: {
       position: 'absolute',
       width: '100%',
       height: '100%',
       top: 0,
       backgroundColor: 'rgba(0, 0, 0, 0.2)',
     },
     gradientButton: {
      position: 'absolute',
      width: '100%',
      height: 169,
      top: 337,
      backgroundColor: '#B3A0FF',
      opacity: 0.9, // Adjust opacity for the gradient effect
      shadowColor: "#000", // Adding shadow for a blur-like effect
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
     workOutIcon: {
       position: 'absolute',
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
       backdropFilter: 'blur(7px)', 
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
   
   export default Loading4;
   
>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d
