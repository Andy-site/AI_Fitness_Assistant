import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Modal,
  FlatList
} from 'react-native';
import Footer from '../../components/Footer';
import { fetchUserDetails, fetchRecommendedExercises } from '../../api/fithubApi';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { capitalizeWords } from '../../utils/StringUtils';

const API_BASE_URL = 'http://192.168.0.117:8000/';
const screenWidth = Dimensions.get('window').width;

const Home = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bmi, setBmi] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [page, setPage] = useState(1);


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
              : `${API_BASE_URL}${userResponse.profile_photo}`,
          });
        }

        if (userResponse.weight && userResponse.height) {
          const heightInMeters = userResponse.height / 100;
          const calculatedBmi = userResponse.weight / (heightInMeters * heightInMeters);
          setBmi(calculatedBmi.toFixed(1));
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchExercises = async () => {
      try {
        const data = await fetchRecommendedExercises();
        setExercises(data.recommended_exercises);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setLoading(false);
      }
    };

    fetchData();
    fetchExercises();
  }, []);

  const handleLogout = () => {
    navigation.navigate('LogoutScreen');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{capitalizeWords(item.name)}</Text>
      <Text style={styles.category}>Category: {capitalizeWords(item.category)}</Text>
    </View>
  );

  const getBmiCategory = (bmiValue) => {
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue <= 24.9) return 'Healthy Weight';
    if (bmiValue <= 29.9) return 'Overweight';
    if (bmiValue <= 34.9) return 'Obesity (Class I)';
    if (bmiValue <= 39.9) return 'Obesity (Class II)';
    return 'Obesity (Class III)';
  };

  const getArrowPosition = (bmiValue) => {
    const maxBmi = 40;
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

  return (
    <View style={styles.outcontainer}>
      <ScrollView style={styles.container}>
        <View style={styles.headerWithProfile}>
          <View>
            <Text style={styles.greeting}>Hi {firstName}!</Text>
            <Text style={styles.greeting2}>Personal Health Assistant</Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.profileImageButton}>
            <Image
              source={profileImage || require('../../assets/Images/default_user.png')}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.workoutButton} onPress={() => navigation.navigate('Workout')}>
          <Text style={styles.favoriteButtonText}>Workout</Text>
          <MaterialIcons name="fitness-center" size={24} color="#FF6B6B" />
        </TouchableOpacity>

        {bmi && (
          <View style={styles.bmiContainer}>
            <Text style={styles.sectionTitle}>Your BMI</Text>
            <Text style={styles.bmiValue}>{bmi}</Text>
            <Text style={styles.bmiCategory}>{getBmiCategory(bmi)}</Text>

            <View style={styles.bmiScaleContainer}>
              <LinearGradient
                colors={['#00FF00', '#FFFF00', '#FF8000', '#FF0000']}
                style={styles.bmiScale}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <MaterialIcons
                name="arrow-drop-down"
                size={30}
                color="#FFFFFF"
                style={[styles.bmiArrow, { left: `${getArrowPosition(bmi)}%` }]}
              />
            </View>
          </View>
        )}

        <View style={styles.favoritesAndLibraryContainer}>
          <TouchableOpacity style={styles.favoriteButton} onPress={() => navigation.navigate('FavoriteExercises')}>
            <Text style={styles.favoriteButtonText}>My Favorites</Text>
            <MaterialIcons name="favorite" size={24} color="#e2f163" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.browseLibraryButton} onPress={() => navigation.navigate('CreateLibrary')}>
            <Text style={styles.favoriteButtonText}>Browse Library</Text>
            <MaterialIcons name="pageview" size={27} color="#b3a0ff" />
          </TouchableOpacity>
        </View>

        <View style={styles.reccontainer}>
  <Text style={styles.header}>Recommended Exercises</Text>
  {loading ? (
    <ActivityIndicator size="small" color="#b3a0ff" />
  ) : (
    <>
      <View style={{ paddingHorizontal: 10 }}>
  {exercises
    .slice((page - 1) * 5, page * 5)
    .map(item => (
      <TouchableOpacity
        key={item.id}
        style={{ marginBottom: 10 }}
        onPress={() => navigation.navigate('ExeDetails', { exerciseName: item.name,bodyPart: item.category,  })}
      >
        {renderItem({ item })}
      </TouchableOpacity>
    ))}
</View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 10 }}>
        <TouchableOpacity
          onPress={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
          style={[styles.pageButton, page === 1 && styles.disabledButton]}
        >
          <Text style={styles.pageButtonText}>Previous</Text>
        </TouchableOpacity>
        <Text style={{ alignSelf: 'center', color:'#fff'}}>
          Page {page} of {Math.ceil(exercises.length / 5)}
        </Text>
        <TouchableOpacity
          onPress={() => setPage(prev => Math.min(prev + 1, Math.ceil(exercises.length / 5)))}
          disabled={page === Math.ceil(exercises.length / 5)}
          style={[styles.pageButton, page === Math.ceil(exercises.length / 5) && styles.disabledButton]}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </>
  )}
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
            <Image
              source={profileImage || require('../../assets/Images/default_user.png')}
              style={styles.modalImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('EditProfile');
              }}
            >
              <Text style={styles.updateButtonText}>Update Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.updateButton} onPress={handleLogout}>
              <Text style={styles.updateButtonText}>Log out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
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
  outcontainer: {
    flex: 1,
    backgroundColor: '#212020',
  },
  container: {
    flex: 1,
    padding: 20,
    marginBottom: 70,
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
    color: '#B3A0FF',
  },
  greeting2: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#B3A0FF',
  },
  profileImageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  workoutButton: {
    backgroundColor: '#b3a0ff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flexDirection: 'row',
    width: '50%',
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  favoritesAndLibraryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  favoriteButton: {
    backgroundColor: '#b3a0ff',
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
  browseLibraryButton: {
    backgroundColor: '#e2f163',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reccontainer: {
    marginTop: 20,
    marginBottom:50,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  card: {
    backgroundColor: '#B3A0FF',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color:'#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  category: {
    fontSize: 14,
    color: '#e2f163',
    marginTop: 5,
  },
  bmiContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bmiValue: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  pageButton: {
    backgroundColor: '#b3a0ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#e2f163',
  },
  pageButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  
  bmiCategory: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  bmiScaleContainer: {
    width: '100%',
    height: 20,
    marginTop: 10,
    position: 'relative',
  },
  bmiScale: {
    height: 10,
    borderRadius: 5,
    width: '100%',
  },
  bmiArrow: {
    position: 'absolute',
    top: -10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  updateButton: {
    backgroundColor: '#b3a0ff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
});

export default Home;
