import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Footer from '../../components/Footer';
import { fetchUserDetails } from '../../api/fithubApi';

const IconButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.iconButton} onPress={onPress}>
    <Image source={icon} style={styles.iconImage} resizeMode="contain" />
    <Text style={styles.iconText}>{label}</Text>
  </TouchableOpacity>
);

const Home = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        setIsLoading(true);
        const user = await fetchUserDetails();
        setFirstName(user.first_name || 'User');
      } catch (err) {
        console.error('Error retrieving user details:', err);
        setError('Failed to load user details');
      } finally {
        setIsLoading(false);
      }
    };

    getUserDetails();
  }, []);

  const iconData = [
    {
      icon: require('../../assets/Images/Vector.png'),
      label: 'People',
      onPress: () => {},
    },
    {
      icon: require('../../assets/Images/Scan.png'),
      label: 'Pose Estimation',
      onPress: () => {},
    },
    {
      icon: require('../../assets/Images/Dumbell.png'),
      label: 'Workout',
      onPress: () => navigation.navigate('Workout'),
    },
    {
      icon: require('../../assets/Images/icon3(1).png'),
      label: 'Nutrition',
      onPress: () => navigation.navigate('MealSugg'),
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#896CFE" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.outcontainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.greeting}>Hi {firstName}!</Text>
          <Text style={styles.greeting2}>Personal Health Assistant</Text>
        </View>

        <View style={styles.iconRow}>
          {iconData.map((item, index) => (
            <React.Fragment key={item.label}>
              <IconButton icon={item.icon} label={item.label} onPress={item.onPress} />
              {index < iconData.length - 1 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('LandPose')}>
              <Text style={styles.seeAll}>Pose</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('FavoriteExercises')}>
              <Text style={styles.seeAll}>Favourites</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212020',
  },
  loadingText: {
    color: '#896CFE',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212020',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
  outcontainer: {
    flex: 1,
    backgroundColor: '#212020',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    marginTop: 30,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#896CFE',
  },
  greeting2: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#896CFE',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  iconButton: {
    alignItems: 'center',
  },
  iconImage: {
    width: 35,
    height: 35,
  },
  iconText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  separator: {
    width: 1,
    height: 50,
    backgroundColor: '#896CFE',
  },
  recommendationsContainer: {
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E2F163',
    marginBottom: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 10,
  },
});

export default Home;
