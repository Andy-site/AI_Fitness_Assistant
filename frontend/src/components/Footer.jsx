import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Footer = () => {
  const navigation = useNavigation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  if (isKeyboardVisible) {
    return null; // Hide footer when keyboard is open
  }

  const handleNavigateHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerIconButton} onPress={handleNavigateHome}>
        <Image source={require('../assets/Images/Home.png')} style={styles.footerIconImage} resizeMode="contain" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('LandPose')}>
        <Image source={require('../assets/Images/Scan2.png')} style={styles.footerIconImage} resizeMode="contain" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('MealSugg')}>
        <Image source={require('../assets/Images/Apple.png')} style={styles.footerIconImage} resizeMode="contain" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('Dashboard')}>
        <Image source={require('../assets/Images/Setting.png')} style={styles.footerIconImage} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    height: 60,
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
    width: 30,
    height: 30,
  },
});

export default Footer;
