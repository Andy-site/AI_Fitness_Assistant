import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native';
import Footer from '../../components/Footer';
import { PieChart } from 'react-native-chart-kit';
import { fetchUserDetails} from '../../api/fithubApi';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ExerciseCard from '../../components/ExerciseCard';



const API_BASE_URL = 'http://192.168.0.117:8000/';

const screenWidth = Dimensions.get('window').width;

const Home = ({ navigation }) => {
  // Combine loading states into one
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bmi, setBmi] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(true); // Loading state for calorie data

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const userResponse = await fetchUserDetails();
  
        setUserData(userResponse);
        setFirstName(userResponse.first_name || 'User');
  
        if (userResponse.profile_photo) {
          setProfileImage({
            uri: userResponse.profile_photo.startsWith('http')
              ? userResponse.profile_photo
              : `${API_BASE_URL}${userResponse.profile_photo}`
          });
        }
  
        if (userResponse.weight && userResponse.height) {
          const heightInMeters = userResponse.height / 100;
          const calculatedBmi = userResponse.weight / (heightInMeters * heightInMeters);
          setBmi(calculatedBmi.toFixed(1));
        }
  
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
        setLoading(false); // Set both loading states to false
      }
    };
  
    fetchData();
  }, []);
  const handleLogout = async () => {
    navigation.navigate('LogoutScreen'); // Navigate to the logout screen
  };

  const getBmiCategory = (bmiValue) => {
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue <= 24.9) return 'Healthy Weight';
    if (bmiValue <= 29.9) return 'Overweight';
    if (bmiValue <= 34.9) return 'Obesity (Class I)';
    if (bmiValue <= 39.9) return 'Obesity (Class II)';
    return 'Obesity (Class III)';
  };

  const getArrowPosition = (bmiValue) => {
    if (!bmiValue) return 0;
    const maxBmi = 40; // Maximum value on scale
    const percentage = Math.min((bmiValue / maxBmi) * 100, 100);
    return percentage;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B3A0FF" />
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
      <ScrollView style={styles.container}>
        <View style={styles.headerWithProfile}>
          <View>
            <Text style={styles.greeting}>Hi {firstName}!</Text>
            <Text style={styles.greeting2}>Personal Health Assistant</Text>
          </View>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.profileImageButton}
            >
              {profileImage ? (
                <Image source={profileImage} style={styles.profileImage} />
              ) : (
                <Image source={require('../../assets/Images/default_user.png')} style={styles.profileImage} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
    style={styles.workoutButton}
    onPress={() => navigation.navigate('Workout')} // Navigate to CreateWorkout screen
  >
    <Text style={styles.favoriteButtonText}>Workout</Text>
    <MaterialIcons name="fitness-center" size={24} color="#FF6B6B" />
  </TouchableOpacity>

        {/* BMI Display */}
        {bmi && (
          <View style={styles.bmiContainer}>
            <Text style={styles.sectionTitle}>Your BMI</Text>
            <Text style={styles.bmiValue}>{bmi}</Text>
            <Text style={styles.bmiCategory}>{getBmiCategory(bmi)}</Text>
            
            <View style={styles.bmiScaleContainer}>
              <LinearGradient
                colors={['#00FF00', '#FFFF00', '#FF8000', '#FF0000']}
                style={styles.bmiScale}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              />
              <MaterialIcons
                name="arrow-drop-down"
                size={30}
                color="#FFFFFF"
                style={[styles.bmiArrow, { left: `${getArrowPosition(bmi)}%` }]}
              />
            </View>

            <View style={styles.bmiRanges}>
              <View style={styles.bmiRangeItem}>
              <Text style={styles.bmiRangeText}>Underweight: {"\u003C"}18.5</Text>
                <View style={[styles.bmiRangeColor, { backgroundColor: '#00FF00' }]} />
              </View>
              <View style={styles.bmiRangeItem}>
                <Text style={styles.bmiRangeText}>Healthy: 18.5-24.9</Text>
                <View style={[styles.bmiRangeColor, { backgroundColor: '#FFFF00' }]} />
              </View>
              <View style={styles.bmiRangeItem}>
                <Text style={styles.bmiRangeText}>Overweight: 25-29.9</Text>
                <View style={[styles.bmiRangeColor, { backgroundColor: '#FF8000' }]} />
              </View>
              <View style={styles.bmiRangeItem}>
                <Text style={styles.bmiRangeText}>Obese: ≥30</Text>
                <View style={[styles.bmiRangeColor, { backgroundColor: '#FF0000' }]} />
              </View>
            </View>
          </View>
        )}


        <View style={styles.favoritesAndLibraryContainer}>
  {/* My Favorites Button */}
  <TouchableOpacity 
    style={styles.favoriteButton}
    onPress={() => navigation.navigate('FavoriteExercises')}
  >
    <Text style={styles.favoriteButtonText}>My Favorites</Text>
    <MaterialIcons name="favorite" size={24} color="#e2f163" />
  </TouchableOpacity>

  {/* Browse Library Button */}
  <TouchableOpacity
    style={styles.browseLibraryButton}
    onPress={() => navigation.navigate('CreateLibrary')} // Navigate to CreateLibrary screen
  >
    <Text style={styles.favoriteButtonText}>Browse Library</Text>
    <MaterialIcons name="pageview" size={27} color="#b3a0ff" />
  </TouchableOpacity>
</View>


        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recommended Exercises</Text>
          <View style={styles.exercisesContainer}>
            {[
              { id: 1, title: 'Push-ups', description: 'Best for chest and triceps', image: require('../../assets/Images/pushup.jpg') },
              { id: 2, title: 'Squats', description: 'Perfect for leg strength', image: require('../../assets/Images/squat.jpg') },
            ].map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                image={exercise.image}
                title={exercise.title}
                description={exercise.description}
                onPress={() => navigation.navigate('ExerciseDetail', { exercise })}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {profileImage ? (
              <Image source={profileImage} style={styles.modalImage} resizeMode="cover" />
            ) : (
              <Image source={require('../../assets/Images/default_user.png')} style={styles.profileImage} resizeMode='cover' />
            )}
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('EditProfile');
              }}
            >
              <Text style={styles.updateButtonText}>Update Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
        style={styles.updateButton}
        onPress={handleLogout}
      >
        <Text style={styles.updateButtonText}>Log out</Text>
      </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    color: '#B3A0FF',
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
    marginBottom: 50,
  },
  headerWithProfile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },

    favoritesAndLibraryContainer: {
      flexDirection: 'row', // Aligns the buttons horizontally
      justifyContent: 'space-between', // Space between the buttons
      alignItems: 'center', // Center the buttons vertically
      marginVertical: 15, // Adjust the vertical spacing
    },
    favoriteButton: {
      backgroundColor: '#b3a0ff', // Pink color for Favorites button
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    favoriteButtonText: {
      color: '#000',
      fontSize: 16,
      marginRight: 5,
    },
    workoutButton: {
      backgroundColor: '#b3a0ff', // Pink color for Favorites button
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 5,
      flexDirection: 'row',
      width: '50%',
      alignSelf:'center',
      alignItems: 'center',
    },
    browseLibraryButton: {
      backgroundColor: '#e2f163', // Green color for Browse Library button
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    browseLibraryButtonText: {
      color: '#000',
      fontSize: 16,
    },

  
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#B3A0FF',
  },
  greeting2: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#B3A0FF',
  },
  profileImageContainer: {
    marginTop: 10,
  },
  profileImageButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '80%',
  },
  modalImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: '#e2f163',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
  },
  updateButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    color: '#AAA',
    fontSize: 14,
    marginTop: 10,
  },
  // BMI Styles
  bmiContainer: {
    marginTop: 25,
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    padding: 15,
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
  },
  bmiCategory: {
    fontSize: 16,
    color: '#B3A0FF',
    textAlign: 'center',
    marginBottom: 15,
  },
  bmiScaleContainer: {
    position: 'relative',
    marginVertical: 15,
  },
  bmiScale: {
    height: 20,
    borderRadius: 10,
  },
  bmiArrow: {
    position: 'absolute',
    top: -15,
    transform: [{ translateX: -15 }],
  },
  bmiRanges: {
    marginTop: 15,
  },
  bmiRangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bmiRangeText: {
    color: '#FFFFFF',
    fontSize: 12,
    flex: 1,
  },
  bmiRangeColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    padding: 15,
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
    backgroundColor: '#B3A0FF',
  },

  
  recommendationsContainer: {
    marginTop: 25,
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E2F163',
    marginBottom: 15,
  },
  exercisesContainer: {
    gap: 15,
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    overflow: 'hidden',
    height: 100,
  },
  exerciseImage: {
    width: 100,
    height: '100%',
  },
  exerciseInfo: {
    padding: 15,
    flex: 1,
    justifyContent: 'center',
  },
  exerciseTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  exerciseDescription: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  libraryContainer: {
    marginTop: 25,
    marginBottom: 70,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  libraryButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  libraryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default Home;