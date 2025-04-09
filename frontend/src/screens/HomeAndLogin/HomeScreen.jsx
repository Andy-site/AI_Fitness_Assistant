import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Footer from '../../components/Footer';
import { fetchUserDetails } from '../../api/fithubApi';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const API_BASE_URL = 'http://192.168.0.117:8000/';

const IconButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.iconButton} onPress={onPress}>
    <Image source={icon} style={styles.iconImage} resizeMode="contain" />
    <Text style={styles.iconText}>{label}</Text>
  </TouchableOpacity>
);

const ExerciseCard = ({ image, title, description, onPress }) => (
  <TouchableOpacity style={styles.exerciseCard} onPress={onPress}>
    <Image source={image} style={styles.exerciseImage} />
    <View style={styles.exerciseInfo}>
      <Text style={styles.exerciseTitle}>{title}</Text>
      <Text style={styles.exerciseDescription}>{description}</Text>
    </View>
  </TouchableOpacity>
);

const Home = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bmi, setBmi] = useState(null);
  const [weight, setWeight] = useState(null);
  const [height, setHeight] = useState(null);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        setIsLoading(true);
        const user = await fetchUserDetails();
        setFirstName(user.first_name || 'User');
        setWeight(user.weight); // Assuming weight is in kg
        setHeight(user.height); // Assuming height is in cm
        
        if (user.profile_photo) {
          setProfileImage({ uri: `${API_BASE_URL}${user.profile_photo}` });
        }
        
        // Calculate BMI if weight and height are available
        if (user.weight && user.height) {
          const heightInMeters = user.height / 100;
          const calculatedBmi = user.weight / (heightInMeters * heightInMeters);
          setBmi(calculatedBmi.toFixed(1));
        }
      } catch (err) {
        console.error('Error retrieving user details:', err);
        setError('Failed to load user details');
      } finally {
        setIsLoading(false);
      }
    };

    getUserDetails();
  }, []);

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

        <View style={styles.iconRow}>
          {[
            { icon: require('../../assets/Images/Vector.png'), label: 'People', onPress: () => {} },
            { icon: require('../../assets/Images/Scan.png'), label: 'Pose Estimation', onPress: () => {} },
            { icon: require('../../assets/Images/Dumbell.png'), label: 'Workout', onPress: () => navigation.navigate('Workout') },
            { icon: require('../../assets/Images/icon3(1).png'), label: 'Nutrition', onPress: () => navigation.navigate('MealSugg') },
          ].map((item, index) => (
            <React.Fragment key={item.label}>
              <IconButton icon={item.icon} label={item.label} onPress={item.onPress} />
              {index < 3 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.favoritesContainer}>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => navigation.navigate('FavoriteExercises')}
          >
            <Text style={styles.favoriteButtonText}>My Favorites</Text>
            <MaterialIcons name="favorite" size={24} color="#fff" />
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

        <View style={styles.libraryContainer}>
          <Text style={styles.sectionTitle}>Exercise Library</Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.libraryButton}
              onPress={() => navigation.navigate('LandPose')}
            >
              <Text style={styles.libraryButtonText}>Pose Library</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.libraryButton}
              onPress={() => navigation.navigate('ExerciseLibrary')}
            >
              <Text style={styles.libraryButtonText}>All Exercises</Text>
            </TouchableOpacity>
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
  headerWithProfile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
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
    color: '#896CFE',
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
    backgroundColor: '#896CFE',
  },
  favoritesContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  favoriteButton: {
    flexDirection: 'row',
    backgroundColor: '#896CFE',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  favoriteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  recommendationsContainer: {
    marginTop: 25,
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