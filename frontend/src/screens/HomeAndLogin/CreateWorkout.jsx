import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, TextInput } from 'react-native';

import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useNavigation } from '@react-navigation/native';
import { capitalizeWords } from '../../utils/StringUtils';
import { fetchBodyParts, fetchExercisesForBodyPart } from '../../utils/ExerciseFetcher';

const CreateWorkout = () => {
  const [bodyParts, setBodyParts] = useState([]);
  const [exercises, setExercises] = useState({});
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [libraryName, setLibraryName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBodyPartsData = async () => {
      const bodyPartsData = await fetchBodyParts();
      console.log('Fetched Body Parts:', bodyPartsData);
      if (bodyPartsData) {
        setBodyParts(bodyPartsData);
      }
    };
  
    fetchBodyPartsData();
  }, []);
  
  useEffect(() => {
    const fetchExercisesForBodyParts = async () => {
      let exerciseData = {};
      for (let primary_muscles of bodyParts) {
        const exercisesData = await fetchExercisesForBodyPart(primary_muscles);
        console.log(`Fetched Exercises for ${primary_muscles}:`, exercisesData);
        exerciseData[primary_muscles] = exercisesData || [];
      }
      setExercises(exerciseData);
    };
  
    if (bodyParts.length > 0) {
      fetchExercisesForBodyParts();
    }
  }, [bodyParts]);
  
  const toggleExerciseSelection = exercise => {
    setSelectedExercises(prev =>
      prev.includes(exercise)
        ? prev.filter(ex => ex !== exercise)
        : [...prev, exercise],
    );
  };

  const handleConfirm = () => {
    if (!libraryName.trim()) {
      alert('Please enter a library name!');
      return;
    }
    // Assuming saveWorkoutToStorage is defined elsewhere
    saveWorkoutToStorage(selectedExercises, libraryName);
    navigation.navigate('WorkoutSummary', { selectedExercises, libraryName });
  };

  return (
    <View style={styles.container}>
      <Header title="Create Workout" />
      <ScrollView>
        {Array.isArray(bodyParts) &&
          bodyParts.map(primary_muscles => {
            // Convert primary_muscles to a string if necessary
            const displayName = Array.isArray(primary_muscles)
              ? primary_muscles.join(', ')
              : primary_muscles || '';
  
            return (
              <View key={displayName} style={styles.bodyPartContainer}>
                <Text style={styles.partTitle}>{capitalizeWords(displayName)}</Text>
                <View style={styles.exerciseGrid}>
                {Array.isArray(exercises[primary_muscles]) &&
  exercises[primary_muscles].map(exercise => (
    <TouchableOpacity
      key={exercise.id}
      style={[
        styles.exerciseBox,
        selectedExercises.includes(exercise) && styles.selectedExercise,
      ]}
      onPress={() => toggleExerciseSelection(exercise)}
    >
      {/* Render Image if the URL exists */}
      {exercise.images && exercise.images.length > 0 ? (
  <Image
    source={{ uri: exercise.images[0] }} // Fetch the first image
    style={styles.exerciseImage}
    onError={(e) => console.log('Image error:', e.nativeEvent.error)} // Handle image load errors
  />
) : (
  <View style={styles.exerciseImage}>
    <Text style={styles.placeholderText}>No Image</Text> {/* Placeholder text or content */}
  </View>
)}
      <Text style={styles.exerciseText}>
        {capitalizeWords(exercise.name)}
      </Text>
      <Text style={styles.exerciseDetails}>Level: {exercise.level}</Text>
      <Text style={styles.exerciseDetails}>Force: {exercise.force}</Text>
      <Text style={styles.exerciseDetails}>Mechanic: {exercise.mechanic}</Text>
    </TouchableOpacity>
  ))}

                </View>
              </View>
            );
          })}
      </ScrollView>
  
      {selectedExercises.length > 0 && (
        <View style={styles.floatingCounter}>
          <Text style={styles.counterText}>{selectedExercises.length}</Text>
        </View>
      )}
  
      <View style={styles.libraryInputContainer}>
        <TextInput
          style={styles.libraryInput}
          placeholder="Enter workout library name"
          value={libraryName}
          onChangeText={setLibraryName}
        />
      </View>
  
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm</Text>
      </TouchableOpacity>
  
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  bodyPartContainer: {
    marginBottom: 16,
    padding: 10,
    marginTop: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  partTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#000000',
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  exerciseBox: {
    width: '48%',
    padding: 10,
    backgroundColor: '#896cfe',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedExercise: {
    backgroundColor: '#e2f163',
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0', 
  },
  exerciseText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    color: '#ffffff',
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#ffffff',
  },
  floatingCounter: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: '#896cfe',
    borderRadius: 20,
    borderColor: '#000000',
    borderWidth: 2,
    padding: 10,
  },
  counterText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  libraryInputContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  libraryInput: {
    height: 40,
    borderColor: '#7E57C2',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  confirmButton: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#7E57C2',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CreateWorkout;
