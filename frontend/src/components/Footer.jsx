// Footer.js (or Footer.jsx)
import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Footer = () => {
  const navigation = useNavigation(); 
  return (
    <View style={styles.footer}>
      <TouchableOpacity style=
      {styles.footerIconButton}
      onPress={() => navigation.navigate('Home')}
      >
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
    backgroundColor: '#896CFE',
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
