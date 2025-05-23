import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ToastAndroid,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { capitalizeWords } from '../../utils/StringUtils';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import {
  getExerciseDetailsByName,
  toggleFavoriteStatus,
  checkFavoriteStatus,
  startExercise,
  getAuthToken,
} from '../../api/fithubApi';

const screenWidth = Dimensions.get('window').width;

const ExeDetails = ({ route }) => {
  const { exerciseName, bodyPart } = route.params;
  const navigation = useNavigation();
  const [exerciseDetails, setExerciseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const fetchExerciseDetails = useCallback(async () => {
    try {
      const authToken = await getAuthToken();
      if (!authToken) throw new Error('User is not authenticated');

      const data = await getExerciseDetailsByName(exerciseName, authToken);
      setExerciseDetails(data);
      

      // Explicitly check favorite status
      const favoriteStatus = await checkFavoriteStatus(exerciseName, authToken);
      console.log("Initial favorite status:", favoriteStatus);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error('Error fetching exercise details:', error);
      setError(error.message || 'Failed to fetch exercise details');
    } finally {
      setLoading(false);
    }
  }, [exerciseName]);

  useEffect(() => {
    fetchExerciseDetails();
  }, [fetchExerciseDetails]);

  const calculateEstimatedTime = (secondaryMusclesCount) => {
    if (secondaryMusclesCount <= 1) return 5;
    return 5 + (secondaryMusclesCount - 1) * 2;
  };

  // Function to show toast on Android or alert on iOS
  const showNotification = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // For iOS fallback, use the modal
      setModalMessage(message);
      setIsModalVisible(true);
      setTimeout(() => {
        setIsModalVisible(false);
      }, 2000);
    }
  };

  const handleToggleFavorite = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'User is not authenticated');
        return;
      }

      console.log("Current favorite status before toggle:", isFavorite);
      
      // Optimistically update UI first for better responsiveness
      const newStatus = !isFavorite;
      setIsFavorite(newStatus);
      
      // Show feedback immediately
      showNotification(newStatus ? 'Added to favorites' : 'Removed from favorites');
      
      // Then make the API call
      const response = await toggleFavoriteStatus(exerciseName, token);
      
      // Log response for debugging
      console.log("Toggle favorite response:", response?.data);
      
      // If API response doesn't match our optimistic update, revert
      if (response?.data?.is_favorite !== undefined && response.data.is_favorite !== newStatus) {
        console.log("API response differs from expected, reverting to:", response.data.is_favorite);
        setIsFavorite(response.data.is_favorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      setIsFavorite(!isFavorite);
      Alert.alert('Error', error.message || 'An error occurred while toggling favorite status.');
    }
  }, [exerciseName, isFavorite]);

  const handleStartPress = async () => {
  if (!exerciseDetails?.name || !bodyPart) {
    Alert.alert('Missing Information', 'Cannot start without exercise data.');
    return;
  }

  const startTime = Date.now();

  const exerciseData = {
    exercise_name: exerciseDetails.name,
    body_part: bodyPart,
    workout_exercise_id: exerciseDetails.id, // pass this only if required
  };
  console.log('Exercise Name sent:', exerciseData.exercise_name);

  try {
    const authToken = await getAuthToken();
    if (!authToken) throw new Error('User is not authenticated');

    const result = await startExercise(exerciseData, authToken);

    navigation.navigate('RepsAndSets', {
      workout_exercise_id: exerciseDetails.id, // optional
      startTime,
      bodyPart,
      exercise_id: result.workout_exercise_id, // backend ID
      exercise_name: exerciseDetails.name,
    });
  } catch (error) {
    console.error('Error starting exercise:', error);
    Alert.alert('Error', error.message || 'An error occurred while starting the exercise session.');
  }
};


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B3A0FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{`Error: ${error}`}</Text>
      </View>
    );
  }

  if (!exerciseDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No exercise details found.</Text>
      </View>
    );
  }

  // Determine heart icon based on favorite status
  const heartIconName = isFavorite ? "heart" : "heart";
  const heartIconColor = isFavorite ? '#E2F163' : '#B3A0FF';

  return (
    <View style={styles.outerContainer}>
      <Header title="Exercise Info" />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{capitalizeWords(exerciseDetails.name)}</Text>
          <TouchableOpacity 
            onPress={handleToggleFavorite}
            style={styles.heartButton}
          >
            <Icon
              name={heartIconName}
              size={26}
              color={heartIconColor}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.details}>
          Equipment: {capitalizeWords(exerciseDetails.equipment)}
        </Text>
        <Text style={styles.details}>
          Target: {capitalizeWords(exerciseDetails.target)}
        </Text>

        <Text style={styles.instructionsTitle}>Instructions:</Text>
        {exerciseDetails.instructions?.length > 0 ? (
          exerciseDetails.instructions.map((step, index) => (
            <Text key={index} style={styles.instructionText}>
              {index + 1}. {step}
            </Text>
          ))
        ) : (
          <Text style={styles.noDataText}>No instructions available.</Text>
        )}

        <Text style={styles.secondaryMusclesTitle}>Secondary Muscles:</Text>
        <Text style={styles.secondaryMusclesText}>
          {exerciseDetails.secondaryMuscles?.length > 0
            ? exerciseDetails.secondaryMuscles.map(muscle => capitalizeWords(muscle)).join(', ')
            : 'No secondary muscles specified.'}
        </Text>

        {exerciseDetails.gifUrl && (
          <View style={styles.gifContainer}>
            <FastImage
              source={{
                uri: exerciseDetails.gifUrl,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              style={styles.gifImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        )}

        <TouchableOpacity style={styles.startButton} onPress={handleStartPress}>
          <Text style={styles.startButtonText}>Start</Text>
          <View style={styles.separatorContainer}>
            <Text style={styles.separator}>|</Text>
            <View style={styles.timeContainer}>
              <Icon name="clock-o" size={20} color="#000000" />
              <Text style={styles.estimatedTimeText}>
                {`${calculateEstimatedTime(exerciseDetails.secondaryMuscles?.length || 0)} min`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Footer />

      {/* Complete replacement of the Modal component */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{modalMessage}</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#222',
  },
  scrollViewContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 80,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2F163',
    maxWidth: '85%',
  },
  heartButton: {
    padding: 10,  // Increase touch target area
  },
  details: {
    fontSize: 16,
    color: '#E2F163',
    marginBottom: 5,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
    marginBottom: 5,
  },
  secondaryMusclesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
  },
  secondaryMusclesText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
    marginBottom: 20,
  },
  gifContainer: {
    width: screenWidth - 40,
    aspectRatio: 1,
    alignSelf: 'center',
    marginVertical: 20,
  },
  gifImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#E2F163',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 50,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 50,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  separator: {
    fontSize: 20,
    marginHorizontal: 5,
    color: '#000000',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimatedTimeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
    maxWidth: '80%',
    elevation: 10, // Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  modalText: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  noDataText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default ExeDetails;