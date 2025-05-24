import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
  BackHandler,
  Alert,
} from 'react-native';
import Footer from '../../components/Footer';
import {
  fetchUserDetails,
  fetchRecommendedExercises,
  fetchRecommendedMeals,
  fetchDailysSummary
} from '../../api/fithubApi';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Svg, Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { capitalizeWords } from '../../utils/StringUtils';
import { InteractionManager } from 'react-native';

const API_BASE_URL = 'http://192.168.0.117:8000/';

const Home = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mealDetailsVisible, setMealDetailsVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [bmi, setBmi] = useState(null);
  const [firstName, setFirstName] = useState('User');
  const [lastName, setLastName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);
  const [dailySummary, setDailySummary] = useState({
    meals_eaten: 0,
    workouts_done: 0,
  });

  // Safe Android Back Press Handling
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (modalVisible) {
          setModalVisible(false);
          return true;
        }
        if (mealDetailsVisible) {
          setMealDetailsVisible(false);
          return true;
        }

        Alert.alert("Exit App", "Do you want to exit?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [modalVisible, mealDetailsVisible])
  );

  // Main data fetch
  const fetchData = async () => {
    try {
      console.log('Fetching user details...');
      const userResponse = await fetchUserDetails();
      setUserData(userResponse);
      setFirstName(userResponse.first_name || 'User');
      setLastName(userResponse.last_name || '');

      if (userResponse.profile_photo) {
        setProfileImage({
          uri: userResponse.profile_photo.startsWith('http')
            ? userResponse.profile_photo
            : `${API_BASE_URL}${userResponse.profile_photo}`,
        });
      }

      if (userResponse.height) {
        const heightInMeters = userResponse.height / 100;
        const weight = userResponse.estimated_weight > 0
          ? userResponse.estimated_weight
          : userResponse.weight;

        if (weight && weight > 0) {
          const calculatedBmi = weight / (heightInMeters * heightInMeters);
          setBmi(calculatedBmi.toFixed(1));
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      console.log('Fetching recommendations...');
      const ex = await fetchRecommendedExercises();
      const meals = await fetchRecommendedMeals();
      setExercises(ex.recommended_exercises || []);
      setMeals(meals || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      console.log('Fetching daily summary...');
      const data = await fetchDailysSummary();
      console.log('Daily summary data:', data);
      setDailySummary(data);
    } catch (err) {
      console.error('Error fetching daily summary:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const task = InteractionManager.runAfterInteractions(async () => {
        console.log("Home screen focused. Starting data fetch...");
        try {
          await fetchData();
          await fetchRecommendations();
          await fetchSummary();
        } catch (error) {
          console.error("Error in useFocusEffect:", error);
        } finally {
          if (isActive) {
            console.log("Data fetch complete. Disabling loading.");
            setIsLoading(false);
          }
        }
      });

      return () => {
        isActive = false;
        task.cancel?.();
      };
    }, [])
  );

  // Optional fallback timeout (safety net)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Timeout fallback: Forcing isLoading to false.");
        setIsLoading(false);
      }
    }, 10000); // 10 seconds
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const handleLogout = () => {
    setModalVisible(false);
    setTimeout(() => navigation.navigate('LogoutScreen'), 300);
  };

  const handleEditProfile = () => {
    setModalVisible(false);
    setTimeout(() => navigation.navigate('EditProfile'), 300);
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
    const maxBmi = 40;
    const percentage = Math.min((bmiValue / maxBmi) * 100, 100);
    return percentage;
  };

  // ---------------- UI RENDER ----------------

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
      <View style={styles.headerWithProfile}>
        <View>
          <Text style={styles.greeting}>Hi {firstName} {lastName}!</Text>
          <Text style={styles.greeting2}>Personal Health Assistant</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.profileImageButton}>
          <Image
            source={profileImage || require('../../assets/Images/default_user.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>

        {bmi && (
          <View style={styles.bmiContainer}>
            <Text style={styles.sectionTitle}>Your BMI</Text>
            <Text style={styles.bmiValue}>{bmi}</Text>
            <Text style={styles.bmiCategory}>{getBmiCategory(bmi)}</Text>
            <View style={styles.bmiScaleContainer}>
              <Svg height="20" width="100%" style={styles.bmiScale}>
                <Defs>
                  <SvgGradient id="bmiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#00FF00" />
                    <Stop offset="33%" stopColor="#FFFF00" />
                    <Stop offset="66%" stopColor="#FF8000" />
                    <Stop offset="100%" stopColor="#FF0000" />
                  </SvgGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#bmiGradient)" />
              </Svg>
              <MaterialIcons
                name="arrow-drop-down"
                size={40}
                color="#FFFFFF"
                style={[styles.bmiArrow, { left: `${getArrowPosition(bmi)}%` }]}
              />
            </View>
          </View>
        )}

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>📅 Today's Summary</Text>
          <View style={styles.summaryRow}>
            <MaterialIcons name="fastfood" size={24} color="#e2f163" />
            <Text style={styles.summaryLabel}>Meals Eaten:</Text>
            <Text style={styles.summaryValue}>{dailySummary.meals_eaten}</Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialIcons name="fitness-center" size={24} color="#6BE5FF" />
            <Text style={styles.summaryLabel}>Workouts Done:</Text>
            <Text style={styles.summaryValue}>{dailySummary.workouts_done}</Text>
          </View>
        </View>

        <View style={styles.sliderSection}>
          <Text style={styles.header}>🔥 Recommended Exercises</Text>
          <FlatList
            horizontal
            data={exercises.slice(0, 10)}
            keyExtractor={(item, index) => item.id?.toString() ?? `ex-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('ExeDetails', {
                  exerciseName: item.name,
                  bodyPart: item.category,
                })}
                style={styles.sliderCard}
              >
                <Text style={styles.cardTitle}>{capitalizeWords(item.name)}</Text>
                <Text style={styles.cardSubtitle}>Category: {capitalizeWords(item.category)}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.sliderSection}>
          <Text style={styles.header}>🍽️ Meals You Love</Text>
          <FlatList
            horizontal
            data={meals.slice(0, 10)}
            keyExtractor={(item, index) => item.id?.toString() ?? `meal-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.sliderCard2}
                onPress={() => {
                  setSelectedMeal(item);
                  setMealDetailsVisible(true);
                }}
              >
                <Text style={styles.cardTitle}>{item.meal} - {item.name}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.times_eaten}x • {item.dietary_restriction || 'No Restriction'}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={profileImage || require('../../assets/Images/default_user.png')}
              style={styles.modalImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.updateButton} onPress={handleEditProfile}>
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

      <Modal animationType="slide" transparent={true} visible={mealDetailsVisible} onRequestClose={() => setMealDetailsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => setMealDetailsVisible(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#000' }}>
  {selectedMeal?.meal} - {selectedMeal?.name}
</Text>

            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Ingredients:</Text>
            <ScrollView style={{ maxHeight: 150, width: '100%' }}>
              {(selectedMeal?.ingredients || []).map((ing, idx) => (
                <Text key={idx} style={{ color: '#333', marginBottom: 4 }}>• {ing}</Text>
              ))}
            </ScrollView>
            <Text style={{ marginTop: 10, color: '#666' }}>
              Dietary Restriction: {selectedMeal?.dietary_restriction || 'None'}
            </Text>
            <Text style={{ color: '#666' }}>Times Eaten: {selectedMeal?.times_eaten}</Text>
          </View>
        </View>
      </Modal>

      {!isLoading && <Footer />}
    </View>
  );
};


const styles = StyleSheet.create({
  outcontainer: { flex: 1, backgroundColor: '#212020' },
  container: { flex: 1, padding: 20, marginBottom: 70 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' },
  loadingText: { color: '#B3A0FF', marginTop: 10 },
  headerWithProfile: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, padding: 20 },
  greeting: { fontSize: 20, fontWeight: '700', color: '#B3A0FF' },
  greeting2: { marginTop: 10, fontSize: 16, fontWeight: '500', color: '#B3A0FF' },
  profileImageButton: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  profileImage: { width: '100%', height: '100%' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bmiContainer: { marginVertical: 20, alignItems: 'center' },
  bmiValue: { color: '#fff', fontSize: 40, fontWeight: 'bold', marginVertical: 10 },
  bmiCategory: { color: '#fff', fontSize: 16, marginBottom: 10 },
  bmiScaleContainer: { width: '100%', height: 20, marginTop: 10, position: 'relative' },
  bmiScale: { height: 10, borderRadius: 5, width: '100%' },
  bmiArrow: { position: 'absolute', top: -10 },
  sliderSection: { marginTop: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#fff' },
  sliderCard: {
    backgroundColor: '#B3A0FF',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    width: 200,
    justifyContent: 'center',
    
  },
  sliderCard2: {
    backgroundColor: '#B3A0FF',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    width: 200,
    justifyContent: 'center',
    marginBottom: 30,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  cardSubtitle: { fontSize: 13, color: '#e2f163', marginTop: 5 },
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
    width: '80%',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' },
  loadingText: { color: '#B3A0FF', marginTop: 10 },
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
  updateButtonText: { color: '#000', fontWeight: 'bold' },
  cancelButton: { marginTop: 10 },
  cancelText: { color: '#FF6B6B', fontWeight: 'bold' },
  summaryCard: {
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  summaryLabel: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
  },
  summaryValue: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Home;
