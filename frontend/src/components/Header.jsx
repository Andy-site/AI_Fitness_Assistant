import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const Header = ({ title, showBackButton = true }) => {
  const navigation = useNavigation(); // For navigating back

  const handleBackPress = () => {
    navigation.goBack(); // Go back to the previous screen
  };

  return (
    <View style={styles.header}>
      {/* Render back button only if showBackButton is true */}
      {showBackButton && (
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="caret-left" size={30} color="#E2F163" />
        </TouchableOpacity>
      )}

      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    header: {
      position: 'absolute', 
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#000000',
      padding: 20,
      flexDirection: 'row', // Ensure row alignment
      alignItems: 'center', // Align items in the center
      justifyContent: 'center',
      zIndex: 1,
    },
    backButton: {
      position: 'absolute',
      left: 20,
      padding: 10,
      marginTop: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: '#896CFE',
      marginLeft: 10,
      marginTop: 5,
      textAlign: 'center',
    //   maxWidth: 200, // Limit the maximum width of the title to 200 pixels for better readability and responsiveness.
    },
  });
  

export default Header;
