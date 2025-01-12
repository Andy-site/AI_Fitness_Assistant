import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';

const Landing = ({ navigation }) => {
  useEffect(() => {
    // Navigate to the next screen (Email screen) after 1 second
    const timer = setTimeout(() => {
      navigation.navigate('Loading1'); // Replace with your desired next screen
    }, 1000); // 1 second delay

    // Cleanup on unmount
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Frame for Launch */}
      <View style={styles.launchFrame}>
        {/* Logo */}
        <Image source={require('../../assets/Images/Logo.png')} style={styles.logo} />

        {/* FITHUB Text */}
        <Text style={styles.fithubText}>FIT_HUB</Text>
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
  },
  logo: {
    position: 'absolute',
    width: 100, // Adjust width based on logo size
    height: 100, // Adjust height based on logo size
    left: '50%',
    top: 280,
    transform: [{ translateX: -50 }], // Center horizontally
    resizeMode: 'contain', // Ensure the logo maintains its aspect ratio
  },
  fithubText: {
    position: 'absolute',
    width: 276.92,
    height: 60,
    left: 58,
    top: 380,
    fontFamily: 'Poppins-Italic', // Ensure the font is properly linked or replace it with a default font
    fontStyle: 'italic',
    fontWeight: '800',
    fontSize: 40,
    lineHeight: 60,
    display: 'flex',
    textAlign: 'center',
    textTransform: 'uppercase', // Converts all text to uppercase
    color: '#E2F163',
  },
});

export default Landing;
