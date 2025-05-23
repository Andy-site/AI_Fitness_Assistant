import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {capitalizeWords} from '../../utils/StringUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import {endExerciseSession, logExercisePerformance, cancelExerciseSession} from '../../api/fithubApi';
import {getAuthToken} from '../../api/fithubApi';
import {useNavigation} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
const RepsAndSets = ({route}) => {
  const navigation = useNavigation();
  // Expecting exercise object, exerciseId, startTime, and bodyPart from the previous screen
  const {workout_exercise_id, startTime, bodyPart, exercise_name, exercise_id} =
    route.params;

  const [sets, setSets] = useState([{weight: '', reps: ''}]);

  const [totalTime, setTotalTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  // We'll use the passed exerciseId as our workout exercise id
  const [Exercise_Id] = useState(workout_exercise_id);
  const [API_Exercise_Id] = useState(exercise_id);
  const [Exercise_name] = useState(exercise_name);
  const [Exercise_body] = useState(bodyPart);
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

      calculateElapsedTime();
      const id = setInterval(calculateElapsedTime, 1000);
      setIntervalId(id);

      return () => clearInterval(id); // Cleanup on unmount
    }
  }, [startTime]);

  // Get user details from AsyncStorage
  const getUserDetails = async () => {
    try {
      setIsLoading(true);
      const userDetails = await AsyncStorage.getItem('user_details');
      if (userDetails) {
        const user = JSON.parse(userDetails);
        setFirstName(user.first_name || 'User');
        setUserWeight(user.weight || 70);
        setUserHeight(user.height || 175);
        console.log('User details:', user);
      } else {
        console.log('No user details found.');
      }
    } catch (error) {
      console.error('Error retrieving user details:', error);
      setError('Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  // Use the provided getAuthToken function to fetch the token
  const fetchToken = async () => {
    try {
      const usertoken = await getAuthToken();
      console.log('Fetched token:', usertoken);
      setUserToken(usertoken);
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
    setSets([...sets, {weight: '', reps: ''}]);
    console.log('Added set. Total sets:', sets.length + 1);
  };

  const deleteSet = index => {
    const updatedSets = sets.filter((_, i) => i !== index);
    setSets(updatedSets);
    console.log(
      'Deleted set at index',
      index,
      '. Total sets:',
      updatedSets.length,
    );
  };

  const handleInputChange = (index, field, value) => {
    const updatedSets = [...sets];
    updatedSets[index][field] = value;
    setSets(updatedSets);
    console.log(`Updated set ${index} ${field}:`, value);
  };

  const calculateCaloriesBurned = () => {
    const timeInMinutes = totalTime / 60; // Convert seconds to minutes
    if (isNaN(timeInMinutes) || timeInMinutes <= 0 || !userWeight) return 0;
    const caloriesBurned = MET * userWeight * 0.0175 * timeInMinutes;
    console.log('Calories burned:', caloriesBurned);
    return caloriesBurned.toFixed(2);
  };

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const cancelWorkout = async () => {
  Alert.alert(
    'Cancel Workout',
    'Are you sure you want to cancel this workout? This action cannot be undone.',
    [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes, Cancel',
        onPress: async () => {
  try {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    await cancelExerciseSession(API_Exercise_Id);
    navigation.navigate('Workout');
  } catch (error) {
    console.error('Error cancelling workout:', error);
    Alert.alert('Error', error.message || 'Failed to cancel workout.');
  } 
        },
        style: 'destructive',
      },
    ]
  );
};

  const finishWorkout = async () => {
    if (!userToken) {
      Alert.alert('Error', 'User is not logged in.');
      return;
    }

    try {
      console.log('Current workoutExerciseId:', Exercise_Id);
      if (!Exercise_Id) {
        Alert.alert(
          'Error',
          'Exercise session not properly initialized. Please restart the exercise.',
        );
        return;
      }

      const calories = calculateCaloriesBurned();
      const set_data = sets && sets.filter(set => set.weight && set.reps);
      if (!set_data || set_data.length === 0) {
        Alert.alert(
          'Error',
          'Please enter at least one set with weight and reps.',
        );
        return;
      }

      // Log payload before sending
      const logPayload = {
        workout_exercise_id: API_Exercise_Id,
        sets: set_data.map((set, index) => ({
          set_number: index + 1,
          reps: parseInt(set.reps, 10),
          weight: parseFloat(set.weight),
        })),
      };
      console.log('Logging performance payload:', logPayload);

      const logResponse = await logExercisePerformance(
        API_Exercise_Id,
        set_data,
        userToken,
      );
      console.log('Log exercise performance response:', logResponse);

      // Prepare payload for ending exercise
      const endPayload = {
        workout_exercise_id: API_Exercise_Id,
        total_time_seconds: totalTime,
        calories_burned: calories,
      };
      console.log('Ending exercise payload:', endPayload);
      const endResponse = await endExerciseSession(
        API_Exercise_Id,
        totalTime,
        userToken,
        calories,
      );
      console.log('End exercise session response:', endResponse);

      Alert.alert(
        'Workout Finished!',
        `Total Time: ${formatTime(
          totalTime,
        )}\nCalories Burned: ${calories} kcal`,
        [
          {
            text: 'OK',
            onPress: () => {
  if (intervalId) {
    clearInterval(intervalId);
    setIntervalId(null);
  }
  navigation.navigate('Workout');
},

          },
        ],
      );
    } catch (error) {
      console.error('Error during workout completion:', error);
      Alert.alert('Error', `Failed to save workout: ${error.message}`);
    }
  };



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
        <Text style={styles.errorMessage}>
          User is not logged in. Please log in to continue.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Sets Information" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.exerciseTitle}>
          Exercise: {capitalizeWords(Exercise_name)}
        </Text>
        <Text style={styles.bodyPart}>
          Target Muscle: {capitalizeWords(Exercise_body)}
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
                <Picker
          selectedValue={set.weight}
          style={[styles.picker, {  backgroundColor: 'white', borderWidth: 1, borderColor: '#000', borderRadius: 5 }]}
          onValueChange={(value) => handleInputChange(index, 'weight', value)}
        >
                  {[...Array(31)].map((_, i) => (
                    <Picker.Item key={i} label={`${i * 5}`} value={i * 5} />
                  ))}
                </Picker>
              </View>
              <View style={styles.inputColumn}>
                <Text style={styles.inputLabel}>Reps</Text>
                <Picker
          selectedValue={set.reps}
          style={[styles.picker, { backgroundColor: 'white', borderWidth: 1, borderColor: '#000', borderRadius: 5 }]}
          onValueChange={(value) => handleInputChange(index, 'reps', value)}
        >
                  {[...Array(51)].map((_, i) => (
                    <Picker.Item key={i} label={`${i}`} value={i} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.buttonsRow}>
              <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
                <Icon name="plus" size={20} color="#000000" />
                <Text style={styles.addSetButtonText}>Add Set</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteSet(index)}>
                <Icon name="trash" size={20} color="#ffffff" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.actionButtonsRow}>
  <TouchableOpacity style={[styles.finishButton, { marginRight: 10 }]} onPress={finishWorkout}>
    <Icon name="check-circle" size={20} color="#000" />
    <Text style={styles.finishButtonText}>Finish Workout</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.cancelButton} onPress={cancelWorkout}>
    <Icon name="times-circle" size={20} color="#fff" />
    <Text style={styles.cancelButtonText}>Cancel Workout</Text>
  </TouchableOpacity>
</View>


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
    backgroundColor: '#222',
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
    backgroundColor: '#B3A0FF',
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


  actionButtonsRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 20,
  marginBottom: 70,
  paddingHorizontal: 20,
},

finishButton: {
  flexDirection: 'row',
  backgroundColor: '#e2f163',
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 15,
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
},

cancelButton: {
  flexDirection: 'row',
  backgroundColor: '#FF0000',
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 15,
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
},

cancelButtonText: {
  fontSize: 16,
  fontWeight: '600',
  marginLeft: 10,
  color: '#fff',
},

  finishButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default RepsAndSets;
