import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NextButton from '../../components/NextButton';

const MealSugg = () => {
  const navigation = useNavigation();

    const handleNext= () => navigation.navigate('LandNutri');
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/Images/Nutri2.png' )}
        style={styles.backgroundImage}
      />
      <View style={styles.overlay} />
      <View style={styles.header}>
      <View style={styles.headerContainer}>
  <View style={styles.headerRow}>
    <Image
      source={require('../../assets/Images/nutricon.png')} // Replace with your correct image path
      style={styles.logo}
    />
    <Text style={styles.title}>Meal Plans</Text>
  </View>
  <Text style={styles.description}>
    Fitness journey depends 90% upon your dietary items. Start with perfect suggestions according to your goals.
  </Text>
</View>

</View>

      <NextButton
      title = 'Know Your Plan'
      onPress={handleNext}
      style={{marginTop:250}}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerContainer: {
    backgroundColor: '#896cfe', // Purple background
    paddingVertical: 20,
    // borderRadius: 15, // Rounded corners
    alignItems: 'center', 
    width: '100%', // Adjust width to fit content
    alignSelf: 'center', // Center the container
    marginTop: 20, // Add some spacing
  },
  headerRow: {
    flexDirection: 'row', // Makes items align in a row
    alignItems: 'center', // Aligns items vertically
  },
  
  logo: {
    width: 40, // Adjust icon size as needed
    height: 40,
    marginRight: 10, // Adds spacing between icon and text
    resizeMode: 'contain',
  },
  
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    position: 'absolute',
    top: '40%',
    alignItems: 'center',
    width: '100%',

  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal:35
  },
 
});

export default MealSugg;
