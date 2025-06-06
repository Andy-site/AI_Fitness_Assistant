import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { fetchUserDetails } from '../../api/fithubApi';

const API_BASE_URL = 'http://localhost:8000/';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const [name, setName] = useState('Fitness Enthusiast');
  const [profileImage, setProfileImage] = useState(null);

  useFocusEffect(
  useCallback(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userResponse = await fetchUserDetails();
        setUserData(userResponse);
        setName(userResponse?.first_name + ' ' + userResponse?.last_name || 'Fitness Enthusiast');
        setProfileImage(
          userResponse.profile_photo
            ? {
                type: 'image',
                uri: userResponse.profile_photo.startsWith('http')
                  ? userResponse.profile_photo
                  : `${API_BASE_URL}${userResponse.profile_photo}`,
              }
            : { type: 'icon' }
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])
);


  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  const handleLogout = async () => {
    navigation.navigate('LogoutScreen'); // Navigate to the login screen
   };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B3A0FF" />
        <Text style={styles.loadingText}>Loading your fitness dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.outcontainer}>
      <Header title="Settings" />
    <SafeAreaView style={styles.container}>
    
        {/* User Welcome Section */}
        <View style={styles.welcomeContainer}>
          {profileImage?.type === 'image' ? (
    <Image
      source={{ uri: profileImage.uri }}
      style={styles.profileImage}
    />
  ) : (
    <View style={styles.profileImage}>
      <MaterialIcons name="person" size={80} color="#888" alignSelf='center' />
    </View>
  )}

          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{name || 'Fitness Enthusiast'}</Text>
          </View>
        </View>

        {/* Navigation Cards */}

        <ScrollView style={styles.cardsContainer}>
          <TouchableOpacity style={styles.navCard} onPress={() => navigateToScreen('WorkoutCalendar')}>
            <View style={[styles.cardIcon, { backgroundColor: 'rgba(226, 241, 99, 0.2)' }]}>
              <MaterialIcons name="calendar-today" size={28} color="#E2F163" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}> Calendar</Text>
              <Text style={styles.cardDescription}>Track your workout and Meal streaks and history</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#B3A0FF" style={styles.cardArrow} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={() => navigateToScreen('ProgressTracking')}>
            <View style={[styles.cardIcon, { backgroundColor: 'rgba(179, 160, 255, 0.2)' }]}>
              <MaterialIcons name="trending-up" size={28} color="#B3A0FF" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Progress Tracking</Text>
              <Text style={styles.cardDescription}>View your goals, calories, and timelines</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#B3A0FF" style={styles.cardArrow} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={() => navigateToScreen('Visualization')}>
  <View style={[styles.cardIcon, { backgroundColor: 'rgba(100, 149, 237, 0.2)' }]}>
    <MaterialIcons name="bar-chart" size={28} color="#6495ED" />
  </View>
  <View style={styles.cardTextContainer}>
    <Text style={styles.cardTitle}>Progress Visualization</Text>
    <Text style={styles.cardDescription}>View bar graphs and charts of your progress</Text>
  </View>
  <MaterialIcons name="chevron-right" size={24} color="#B3A0FF" style={styles.cardArrow} />
</TouchableOpacity>


          <TouchableOpacity style={styles.navCard} onPress={() => navigateToScreen('Progress')}>
            <View style={[styles.cardIcon, { backgroundColor: 'rgba(255, 107, 107, 0.2)' }]}>
              <MaterialIcons name="fitness-center" size={28} color="#FF6B6B" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Personal Records</Text>
              <Text style={styles.cardDescription}>Track your personal bests</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#B3A0FF" style={styles.cardArrow} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={() => navigateToScreen('EditProfile')}>
            <View style={[styles.cardIcon, { backgroundColor: 'rgba(226, 241, 99, 0.2)' }]}>
              <MaterialIcons name="person" size={28} color="#E2F163" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Profile</Text>
              <Text style={styles.cardDescription}>Edit your profile details</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#B3A0FF" style={styles.cardArrow} />
          </TouchableOpacity>

          {/* Logout Card */}
<TouchableOpacity style={styles.navCard} onPress={handleLogout}>
  <View style={[styles.cardIcon, { backgroundColor: 'rgba(255, 99, 99, 0.2)' }]}>
    <MaterialIcons name="logout" size={28} color="#FF6363" />
  </View>
  <View style={styles.cardTextContainer}>
    <Text style={styles.cardTitle}>Logout</Text>
    <Text style={styles.cardDescription}>Sign out of your account</Text>
  </View>
  <MaterialIcons name="chevron-right" size={24} color="#B3A0FF" style={styles.cardArrow} />
</TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  outcontainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    marginTop: 70,
    flex: 1,
    backgroundColor: '#222',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#B3A0FF',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 16,
    marginTop: 50,
    marginBottom: 50,
  },
  welcomeContainer: {
    
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 10,
  },
  profileImage: { 
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    alignSelf:'center',

  },
  welcomeTextContainer: {
    marginLeft: 16,
  },
  welcomeText: {
    marginTop:10,
    color: '#AAA',
    fontSize: 16,
    marginBottom: 4,
    textAlign:'center',
  },
  userName: {
    color: '#E2F163',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign:'center',
  },
  cardsContainer: {
    flex: 1,
    paddingTop: 10,
    marginBottom: 80,
  },
  navCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    color: '#AAA',
    fontSize: 14,
  },
  cardArrow: {
    marginLeft: 10,
  },
});

export default Dashboard;
