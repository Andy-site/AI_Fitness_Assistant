import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../api/fithubApi';
import { useNavigation } from '@react-navigation/native';


const LogoutScreen = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigation = useNavigation();

  // Function to handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true); // Start the loading state

      await logout();
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Error during logout:', error.message);
      Alert.alert('Error', 'An error occurred while logging out');
    } finally {
      setIsLoggingOut(false); // Reset loading state
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Are you sure you want to log out?</Text>
      <Button
        title={isLoggingOut ? 'Logging out...' : 'Log Out'}
        onPress={handleLogout}
        disabled={isLoggingOut}  // Disable the button while logging out
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default LogoutScreen;
