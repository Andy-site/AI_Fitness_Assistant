import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { capitalizeWords } from '../../utils/StringUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { endExerciseSession, logExercisePerformance } from '../../api/fithubApi';
import { getAuthToken } from '../../api/fithubApi';
import { useNavigation } from '@react-navigation/native';

const RepsAndSets = ({ route }) => {
  const navigation = useNavigation();
  const { exercise, startTime, bodyPart } = route.params;

  const [sets, setSets] = useState([{ weight: '', reps: '' }]);
  const [totalTime, setTotalTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [workoutExerciseId, setWorkoutExerciseId] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const [userWeight, setUserWeight] = useState(null);
  const [userHeight, setUserHeight] = useState(null);
  const [firstName, setFirstName] = useState('User');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const MET = 5.0;

  // Calculate elapsed time from startTime
  useEffect(() => {
    if (startTime) {
      const calculateElapsedTime = () => {
        const now = new Date().getTime();
        const start = new Date(startTime).getTime();
        const elapsedSeconds = Math.floor((now - start) / 1000);
        setTotalTime(elapsedSeconds);
      };

      calculateElapsedTime(); // Initial calculation
      const id = setInterval(calculateElapsedTime, 1000);
      setIntervalId(id);

      return () => clearInterval(id);
    }
  }, [startTime]);

  const getUserDetails = async () => {
    try {
      setIsLoading(true);
      const userDetails = await AsyncStorage.getItem('user_details');
      if (userDetails) {
        const user = JSON.parse(userDetails);
        setFirstName(user.first_name || 'User');
        setUserWeight(user.weight || 70);
        setUserHeight(user.height || 175);
      }
    } catch (error) {
      console.error('Error retrieving user details:', error);
      setError('Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchToken = async () => {
    try {
      const token = await getAuthToken();
      setUserToken(token);
      setLoading(false);
    } catch (error) {
      console.error('Error retrieving user token:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserDetails();
    fetchToken();
  }, []);

  const addSet = () => {
    setSets([...sets, { weight: '', reps: '' }]);
  };

  const deleteSet = (index) => {
    const updatedSets = sets.filter((_, i) => i !== index);
    setSets(updatedSets);
  };

  const handleInputChange = (index, field, value) => {
    const updatedSets = [...sets];
    updatedSets[index][field] = value;
    setSets(updatedSets);
  };

  const calculateCaloriesBurned = () => {
    const timeInMinutes = totalTime / 60; // Convert seconds to minutes
    if (isNaN(timeInMinutes) || timeInMinutes <= 0 || !userWeight) return 0;

    const caloriesBurned = MET * userWeight * 0.0175 * timeInMinutes;
    return caloriesBurned.toFixed(2);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const initializeExerciseSession = async () => {
      try {
        const token = await getAuthToken();
        setUserToken(token);
        
        if (token && exercise) {
          const response = await startExerciseSession(
            exercise,
            setWorkoutExerciseId,
            setStartTime
          );
          
          console.log('Exercise session initialized:', response);
          
          if (response && response.workout_exercise_id) {
            setWorkoutExerciseId(response.workout_exercise_id);
          } else {
            console.error('No workout_exercise_id received from the server');
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error initializing exercise session:', error);
        Alert.alert(
          'Error',
          'Failed to start exercise session. Please try again.'
        );
        setLoading(false);
      }
    };
  
    initializeExerciseSession();
  }, [exercise]);
  

const finishWorkout = async () => {
  if (!userToken) {
    Alert.alert('Error', 'User is not logged in.');
    return;
  }

  try {
    // Debug log to check workoutExerciseId
    console.log('Current workoutExerciseId:', workoutExerciseId);

    if (!workoutExerciseId) {
      Alert.alert('Error', 'Exercise session not properly initialized. Please restart the exercise.');
      return;
    }

    const calories = calculateCaloriesBurned();
    
    // Only proceed if we have valid sets
    const validSets = sets.filter(set => set.weight && set.reps);
    if (validSets.length === 0) {
      Alert.alert('Error', 'Please enter at least one set with weight and reps.');
      return;
    }

    // First log the performance
    await logExercisePerformance(workoutExerciseId, validSets, userToken);
    
    // Then end the session
    await endExerciseSession(workoutExerciseId, totalTime, userToken, calories);

    Alert.alert(
      'Workout Finished!',
      `Total Time: ${formatTime(totalTime)}\nCalories Burned: ${calories} kcal`,
      [
        {
          text: 'OK',
          onPress: () => {
            if (intervalId) {
              clearInterval(intervalId);
            }
            navigation.navigate('Workout');
          }
        }
      ]
    );
  } catch (error) {
    console.error('Error during workout completion:', error);
    Alert.alert('Error', `Failed to save workout: ${error.message}`);
  }
};

// Add this debug render to check values
useEffect(() => {
  console.log('Current state:', {
    workoutExerciseId,
    userToken,
    exercise: exercise?.name,
    totalTime
  });
}, [workoutExerciseId, userToken, exercise, totalTime]);

  if (isLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  if (!userToken) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>User is not logged in. Please log in to continue.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Sets Information" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.exerciseTitle}>
          Exercise: {capitalizeWords(exercise.name)}
        </Text>
        <Text style={styles.bodyPart}>
          Target Muscle: {capitalizeWords(exercise.bodyPart)}
        </Text>

        {startTime && (
          <View style={styles.timerContainer}>
            <Icon name="clock-o" size={20} color="#FFFFFF" />
            <Text style={styles.timeText}>{formatTime(totalTime)}</Text>
          </View>
        )}

        {sets.map((set, index) => (
          <View key={index} style={styles.setContainer}>
            <Text style={styles.setTitle}>Set {index + 1}</Text>
            <View style={styles.tableRow}>
              <View style={styles.inputColumn}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Weight"
                  keyboardType="numeric"
                  value={set.weight}
                  onChangeText={(value) => handleInputChange(index, 'weight', value)}
                />
              </View>
              <View style={styles.inputColumn}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Reps"
                  keyboardType="numeric"
                  value={set.reps}
                  onChangeText={(value) => handleInputChange(index, 'reps', value)}
                />
              </View>
            </View>

            <View style={styles.buttonsRow}>
              <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
                <Icon name="plus" size={20} color="#000000" />
                <Text style={styles.addSetButtonText}>Add Set</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteSet(index)}>
                <Icon name="trash" size={20} color="#ffffff" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.finishButton} onPress={finishWorkout}>
          <Icon name="check-circle" size={20} color="#ffffff" />
          <Text style={styles.finishButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footerContainer}>
        <Footer />
      </View>
    </View>
  );
};



const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
    marginTop: 80,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E2F163',
    textAlign: 'left',
    marginBottom: 10,
    marginLeft: 20,
  },
  bodyPart: {
    fontSize: 18,
    color: '#E2F163',
    textAlign: 'left',
    marginBottom: 20,
    marginLeft: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    paddingRight: 25,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  setContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    padding: 10,
    backgroundColor: '#896cfe',
    borderRadius: 15,
  },
  setTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  inputColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
    fontWeight: '400',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  addSetButton: {
    flexDirection: 'row',
    backgroundColor: '#E2F163',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  addSetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#FF0000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 10,
    fontWeight: '500',
  },
  finishButton: {
    flexDirection: 'row',
    backgroundColor: '#00C853',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 70,
    alignSelf: 'center',
  },
  finishButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default RepsAndSets;
