import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
const Loading3 = ({ navigation }) => {
  const handleNextPress = () => {
    navigation.navigate('Loading4'); // Navigate to Loading4 when Next button is pressed
  };

  const handleSkipPress = () => {
    navigation.navigate('LoginScreen'); // Navigate to Email when Skip button is pressed
  };

  return (
    <View style={styles.container}>
         {/* Background Image */}
         <Image source={require('../../assets/Images/Girl2.png')} style={styles.backgroundImage} />
   
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
   
         {/* Skip Button with Arrow */}
         <TouchableOpacity style={styles.skipButton} onPress={handleSkipPress}>
           <Text style={styles.skipText}>Skip</Text>
           <View style={styles.separator} />
           <Icon name="skip-next" size={30} color="#e2f163" />
         </TouchableOpacity>
   
         {/* Start Your Journey Text */}
         <Text style={styles.startJourneyText}>Start your journey towards a more active lifestyle</Text>
   
         {/* Next Button */}
         <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
           <Text style={styles.nextText}>Next</Text>
         </TouchableOpacity>
   
         {/* Progress Bar */}
         <View style={styles.progressBar}>
           <View style={[styles.progressBarSegment, styles.activeProgress]} />
           <View style={[styles.progressBarSegment, styles.inactiveProgress]} />
           <View style={[styles.progressBarSegment, styles.activeProgress]} />
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
       backdropFilter: 'blur(7px)', 
       filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
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
     separator: {
      width: 1, // Thin vertical line
      height: 20, // Adjust height to match text and icon
      backgroundColor: '#e2f163', // Same color as the text/icon for consistency
      marginHorizontal: 8, // Spacing between elements
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
       backgroundColor: '#B3A0FF',
     },
     inactiveProgress: {
       backgroundColor: '#FFFFFF',
     },
   });
   
   export default Loading3;
   