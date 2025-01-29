import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const Header = ({ title }) => {
  const navigation = useNavigation(); // For navigating back

  const handleBackPress = () => {
    navigation.goBack(); // Go back to the previous screen
  };

  return (
    <View style={styles.header}>
      {/* Back arrow button */}
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <Icon name="caret-left" size={30} color="#E2F163" />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute', // Fix the header to the top
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Ensures it stays above content
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2F163',
    marginBottom: 10,
  },
});

export default Header;
