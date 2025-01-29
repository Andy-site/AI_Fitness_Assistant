import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { capitalizeWords } from '../../utils/StringUtils';
import Footer from '../../components/Footer';

const screenWidth = Dimensions.get('window').width;

const RepsAndSets = ({ route }) => {
  const { exercise } = route.params;

  const [sets, setSets] = useState([{ weight: '', reps: '' }]);
  const [startTime, setStartTime] = useState(null); // To track start time
  const [totalTime, setTotalTime] = useState(0); // To store total time in minutes
  const [intervalId, setIntervalId] = useState(null); // Store interval ID for clearing the timer

  const userWeight = 70; // Example: you can take this value from the user's registration data
  const MET = 5.0; // Average MET value for weightlifting (moderate intensity)
  const distanceMoved = 0.5; // Assumed distance moved for each rep (in meters)

  // Function to handle adding a new set
  const addSet = () => {
    setSets([...sets, { weight: '', reps: '' }]);
  };

  // Function to handle input changes
  const handleInputChange = (index, field, value) => {
    const updatedSets = [...sets];
    updatedSets[index][field] = value;
    setSets(updatedSets);
  };

  // Function to delete a set
  const deleteSet = (index) => {
    const updatedSets = sets.filter((_, i) => i !== index);
    setSets(updatedSets);
  };

  // Function to start the workout
  const startWorkout = () => {
    const currentTime = Date.now();
    setStartTime(currentTime); // Start the timer
    // Set up interval to update the total time every second
    const id = setInterval(() => {
      setTotalTime(((Date.now() - currentTime) / 1000 / 60).toFixed(2)); // Time in minutes
    }, 1000); // Update every second
    setIntervalId(id);
  };

  // Function to stop the workout and clear the interval
  const stopWorkout = () => {
    if (intervalId) {
      clearInterval(intervalId); // Stop the interval timer
      setIntervalId(null);
    }
  };

  // Function to calculate total calories burned based on sets, reps, and weight
  const calculateCaloriesBurned = () => {
    let totalWork = 0;

    // Calculate work done for each set (work = weight * distance * reps)
    sets.forEach(set => {
      const weight = parseFloat(set.weight);
      const reps = parseInt(set.reps);
      if (!isNaN(weight) && !isNaN(reps)) {
        const workPerRep = weight * distanceMoved * 9.81; // Work done per rep in joules
        totalWork += workPerRep * reps; // Total work for this set
      }
    });

    // Convert work from joules to calories (1 joule = 0.239 calories)
    const totalCalories = (totalWork * 0.239).toFixed(2);

    return totalCalories;
  };

  // Function to finish workout and show calories burned
  const finishWorkout = () => {
    stopWorkout(); // Stop the real-time timer
    const caloriesBurned = calculateCaloriesBurned(); // Calculate total calories burned

    // Show the alert with total time and calories burned
    Alert.alert(
      'Workout Finished!',
      `Total Time: ${totalTime} minutes\nCalories Burned: ${caloriesBurned} kcal`,
      [{ text: 'OK' }]
    );
  };

  useEffect(() => {
    // Optionally, auto-start the workout when the component is mounted
    if (!startTime) {
      startWorkout();
    }
    // Clean up the interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [startTime, intervalId]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.exerciseTitle}>{capitalizeWords(exercise.name)}</Text>
        <Text style={styles.bodyPart}>{capitalizeWords(exercise.bodyPart)}</Text>

        {/* Display the total time in real time if the workout has started */}
        {startTime && (
          <Text style={styles.timeText}>
            Time Elapsed: {totalTime} minutes
          </Text>
        )}

        {/* Render sets */}
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

            {/* Delete button */}
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteSet(index)}>
              <Icon name="trash" size={20} color="#ffffff" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add set button */}
        <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
          <Icon name="plus" size={20} color="#00000" />
          <Text style={styles.addSetButtonText}>Add Set</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Finish button placed below the scrollable content */}
      <TouchableOpacity style={styles.finishButton} onPress={finishWorkout}>
        <Icon name="check-circle" size={20} color="#ffffff" />
        <Text style={styles.finishButtonText}>Finish Workout</Text>
      </TouchableOpacity>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    marginBottom: 50, // Adding margin bottom to scroll container
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2F163',
    textAlign: 'center',
    marginBottom: 10,
  },
  bodyPart: {
    fontSize: 18,
    color: '#E2F163',
    textAlign: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  setContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    padding: 10,
    backgroundColor: '#896cfe',
    borderRadius: 15,
  },
  setTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000000',
    marginBottom: 10,
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
  addSetButton: {
    flexDirection: 'row',
    backgroundColor: '#E2F163',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  addSetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#FF0000',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 10,
    fontWeight: '600',
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
    marginBottom: 50, // Adding margin bottom to finish button to avoid overlapping with footer
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
