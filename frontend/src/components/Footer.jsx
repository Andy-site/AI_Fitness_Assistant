// Footer.js (or Footer.jsx)
import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

const Footer = () => {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerIconButton}>
        <Image
          source={require('../assets/Images/Home.png')}  // Relative path
          style={styles.footerIconImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerIconButton}>
        <Image
          source={require('../assets/Images/Res.png')}  // Relative path
          style={styles.footerIconImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerIconButton}>
        <Image
          source={require('../assets/Images/Stars.png')}  // Relative path
          style={styles.footerIconImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerIconButton}>
        <Image
          source={require('../assets/Images/Help.png')}  // Relative path
          style={styles.footerIconImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    height: 59,
    backgroundColor: '#B3A0FF',
    borderTopWidth: 1,
    borderTopColor: '#7C57FF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  footerIconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerIconImage: {
    width: 24,
    height: 24,
  },
});

export default Footer;
