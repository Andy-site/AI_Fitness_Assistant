import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../api/fithubApi';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const LogoutScreen = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Error during logout:', error.message);
      Alert.alert('Error', 'An error occurred while logging out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <MaterialIcons name="logout" size={60} color="#B3A0FF" />
        <Text style={styles.title}>Log Out</Text>
        <Text style={styles.subtitle}>Are you sure you want to log out?</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <MaterialIcons name="logout" size={24} color="#FFF" />
                <Text style={styles.buttonText}>Log Out</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={isLoggingOut}
          >
            <MaterialIcons name="close" size={24} color="#000" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212020',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E2F163',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#B3A0FF',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15, // Added padding back
    borderRadius: 10,
    gap: 10,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
  },
  cancelButton: {
    backgroundColor: '#E2F163',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default LogoutScreen;