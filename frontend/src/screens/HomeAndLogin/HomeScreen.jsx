import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  ActivityIndicator,
} from 'react-native';
import Footer from '../../components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Separate component for the icon button
const IconButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.iconButton} onPress={onPress}>
    <Image
      source={icon}
      style={styles.iconImage}
      resizeMode="contain"
    />
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
        const userDetails = await AsyncStorage.getItem('user_details');
        if (userDetails) {
          const user = JSON.parse(userDetails);
          setFirstName(user.first_name || 'User');
        }
      } catch (error) {
        console.error('Error retrieving user details:', error);
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
      onPress: () => {}
    },
    {
      icon: require('../../assets/Images/Progress.png'),
      label: 'Progress',
      onPress: () => {}
    },
    {
      icon: require('../../assets/Images/Dumbell.png'),
      label: 'Workout',
      onPress: () => navigation.navigate('Workout')
    },
    {
      icon: require('../../assets/Images/icon3(1).png'),
      label: 'Nutrition',
      onPress: () => navigation.navigate('LandNutri')
    }
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

  const renderCard = (image, index) => (
    <ImageBackground
      key={index}
      source={image}
      style={styles.card}
      imageStyle={styles.cardImage}>
      <View style={styles.cardOverlay}>
        <Text style={styles.cardText}>Workout {index + 1}</Text>
      </View>
    </ImageBackground>
  );

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
              <IconButton
                icon={item.icon}
                label={item.label}
                onPress={item.onPress}
              />
              {index < iconData.length - 1 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          {[
            require('../../assets/Images/Girl1.png'),
            require('../../assets/Images/Girl2.png')
          ].map((image, index) => renderCard(image, index))}
        </View>

        <View style={styles.weeklyChallenge}>
          <Text style={styles.challengeTitle}>Weekly Challenge</Text>
          <Text style={styles.challengeText}>Plank With Hip Twist</Text>
        </View>

        <Text style={styles.articlesTips}>Articles & Tips</Text>
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
    
    borderColor: '#FFFFFF',
    
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
    width: 30,
    height: 30,
    borderRadius: 15,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E2F163',
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  card: {
    width: '48%',
    height: 138,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    resizeMode: 'cover',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: 10,
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  weeklyChallenge: {
    backgroundColor: '#212020',
    borderRadius: 20,
    padding: 20,
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2F163',
  },
  challengeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 10,
  },
  articlesTips: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E2F163',
    marginTop: 30,
  },
});

export default Home;