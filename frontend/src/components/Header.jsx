import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';

const Header = ({ title, showBackButton = true }) => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Check if current screen is Notification to hide the notification icon
  const isNotificationScreen = route.name === 'Notification';

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  return (
    <View style={styles.header}>
      {/* Back Button */}
      {showBackButton && (
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="caret-left" size={30} color="#E2F163" />
        </TouchableOpacity>
      )}

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Notification Icon - Only show if not on Notification screen */}
      {!isNotificationScreen && (
        <TouchableOpacity onPress={handleNotificationPress} style={styles.notificationButton}>
          <Icon name="bell" size={24} color="#896CFE" />
        </TouchableOpacity>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
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
    textAlign: 'center',
  },
  notificationButton: {
    position: 'absolute',
    right: 20,
    padding: 10,
  },
});

export default Header;