import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { capitalizeWords } from '../../utils/StringUtils';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { startExercise, getAuthToken, getExerciseDetailsByName } from '../../api/fithubApi';
import { Alert } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const ExeDetails = ({ route }) => {
  const { exerciseName, bodyPart } = route.params;
  const navigation = useNavigation();
  const [exerciseDetails, setExerciseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the calculateEstimatedTime function
  const calculateEstimatedTime = (secondaryMusclesCount) => {
    if (secondaryMusclesCount <= 1) return 5; // 5 minutes for one muscle
    return 5 + (secondaryMusclesCount - 1) * 2; // Increase by 2 minutes for each additional muscle
  };

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      try {
        const authToken = await getAuthToken();
        if (!authToken) throw new Error('User is not authenticated');

        const data = await getExerciseDetailsByName(exerciseName, authToken);
        setExerciseDetails(data);
      } catch (error) {
        console.error('Error fetching exercise details:', error);
        setError(error.message || 'Failed to fetch exercise details');
      } finally {
        setLoading(false);
      }
    };

    if (exerciseName) {
      fetchExerciseDetails();
    } else {
      setError('Exercise name is missing');
      setLoading(false);
    }
  }, [exerciseName]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#896cfe" />
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

  const handleStartPress = async () => {
    if (!exerciseDetails.id || !bodyPart) {
      Alert.alert('Missing Information', 'Cannot start without exercise data.');
      return;
    }

    const startTime = Date.now(); // Record the start time

    const exerciseData = {
      workout_exercise_id: exerciseDetails.id, // Exercise ID
      body_part: bodyPart,       // Body part being targeted
      start_time: startTime,     // Start time of the exercise session
      exercise_name: exerciseDetails.name,
    };

    console.log('Exercise Data:', exerciseData); // Debugging log

    try {
      const authToken = await getAuthToken();
      if (!authToken) throw new Error('User is not authenticated');

      // Call the API function to start the exercise
      const result = await startExercise(exerciseData, authToken);
      console.log('Exercise started with ID:', result.workout_exercise_id);

      // Navigate to the next screen
      navigation.navigate('RepsAndSets', {
        workout_exercise_id: exerciseDetails.id,
        startTime,
        bodyPart,
        exercise_id: result.workout_exercise_id,
        exercise_name: exerciseDetails.name,
      });
    } catch (error) {
      console.error('Error starting exercise:', error);
      Alert.alert('Error', error.message || 'An error occurred while starting the exercise session.');
    }
  };

  const handleAddToFavourites = () => {
    Alert.alert('Add to Favourites', 'Exercise added to your favourites.');
  };

  return (
    <View style={styles.outerContainer}>
      <Header title="Exercise Info" />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{capitalizeWords(exerciseDetails.name)}</Text>
          <TouchableOpacity onPress={handleAddToFavourites} style={styles.heartIconContainer}>
            <Icon name="heart" size={25} color="#896cfe" />
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
            ? exerciseDetails.secondaryMuscles
                .map(muscle => capitalizeWords(muscle))
                .join(', ')
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

        {/* Start button with clock icon */}
        <TouchableOpacity style={styles.startButton} onPress={handleStartPress}>
          <Text style={styles.startButtonText}>Start</Text>
          <View style={styles.separatorContainer}>
            <Text style={styles.separator}>|</Text>
            <View style={styles.timeContainer}>
              <Icon name="clock-o" size={20} color="#000000" />
              <Text
                style={styles.estimatedTimeText}>{`${calculateEstimatedTime(exerciseDetails.secondaryMuscles?.length || 0)} min`}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollViewContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 80,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2F163',
    maxWidth: 300,
  },
  heartIconContainer: {
    paddingLeft: 10,
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
  noDataText: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 10,
    marginBottom: 10,
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
    marginBottom: 30,
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
    color: '#000000',
    marginHorizontal: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimatedTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default ExeDetails;