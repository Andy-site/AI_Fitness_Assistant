import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LandPose = () => {
  const navigation = useNavigation();

  const handleNextPress = () => navigation.navigate('PoseNavigation');
  const handleSkipPress = () => navigation.navigate('Home');

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image source={require('../../assets/Images/Pose.jpeg')} style={styles.backgroundImage} />
      <View style={styles.overlay} />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkipPress}>
        <Text style={styles.skipText}>Skip</Text>
        <View style={styles.separator} />
        <Icon name="skip-next" size={30} color="#e2f163" />
      </TouchableOpacity>

      {/* Header Section */}
      <View style={styles.headerContainer}>
        
          <Icon name = "line-scan" size={40} color="#e2f163" />

        <Text style={styles.description}>
        Proper form is key to effective workouts and injury prevention. Get real-time feedback and perfect your posture!        </Text>
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#212020',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerContainer: {
    position: 'absolute',
    top: '40%',
    width: '100%',
    alignItems: 'center',
    // backgroundColor: '#B3A0FF',
    paddingVertical: 20,
    backgroundColor: '#B3A0FF',
       backdropFilter: 'blur(7px)', 
       filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
  },
 
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'capitalize',
    
  },
  description: {
    marginTop: 10,
    width: 300,
    height: 70,
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    textTransform: 'capitalize',
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
    width: 1,
    height: 20,
    backgroundColor: '#e2f163',
    marginHorizontal: 8,
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
});

export default LandPose;
