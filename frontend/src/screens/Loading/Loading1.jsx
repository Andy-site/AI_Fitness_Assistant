import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';

const Loading1 = () => {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require('../../assets/Images/Girl1.png')}
        style={styles.backgroundImage}
      />

      {/* Semi-Transparent Overlay */}
      <View style={styles.overlay} />

      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Welcome To</Text>

      {/* FIT_HUB Text */}
      <Text style={styles.fithubText}>FIT_HUB</Text>

      {/* Logo Image */}
      <Image
        source={require('../../assets/Images/Logo.png')}
        style={styles.logo}
      />
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
    width: 393,
    height: 852,
    left: '50%',
    top: 0,
    transform: [{ translateX: -393 / 2 }],
    resizeMode: 'cover', // Ensure the image covers the container
  },
  overlay: {
    position: 'absolute',
    width: 393,
    height: 852,
    left: '50%',
    top: 0,
    transform: [{ translateX: -393 / 2 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  welcomeText: {
    position: 'absolute',
    width: '100%', // Ensure the text has enough space
    height: 28,
    left: '19%',
    top: 330, // Adjusted for more space
    transform: [{ translateX: -128 / 2 }],  // Center horizontally
    fontFamily: 'League Spartan',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 28,
    color: '#E2F163',
    textAlign: 'center',
    flexWrap: 'wrap', // Allow text to wrap
  },
  fithubText: {
    position: 'absolute',
    width: 374.09,
    height: 81.05,
    left: '50%',
    top: 444.95,
    transform: [{ translateX: -374.09 / 2 }],
    fontFamily: 'Poppins-Italic',
    fontStyle: 'italic',
    fontWeight: '800',
    fontSize: 50,
    lineHeight: 81,
    color: '#E2F163',
    textAlign: 'center',
    textTransform: 'uppercase', // Converts all text to uppercase
    
  },
  logo: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -100 / 2 }, { translateY: -100 / 2 }],
    width: 100, // Adjust based on your logo size
    height: 100,
    resizeMode: 'contain',
  },
});

export default Loading1;
