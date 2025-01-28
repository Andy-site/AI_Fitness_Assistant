import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { fetchData, exerciseOptions } from '../../utils/ExerciseFetcher';
import Footer from '../../components/Footer';

const Exercises = ({ navigation }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const { bodyPart } = route.params;

  useEffect(() => {
    const fetchExercises = async () => {
      const url = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`;
      
      try {
        const data = await fetchData(url, exerciseOptions);
        console.log('Fetched Exercises Data:', data);  // Check the structure of the response
        if (Array.isArray(data)) {
          setExercises(data);
        } else {
          console.error('Data is not an array:', data);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchExercises();
  }, [bodyPart]);
  

  const handlePress = (exercise) => {
    navigation.navigate('ExeDetails', { exercise }); // Navigate to ExeDetails screen
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Exercises for {bodyPart}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#E2F163" style={styles.loader} />
        ) : (
          <View style={styles.gridContainer}>
            {exercises.length > 0 ? (
              exercises.map((exercise, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exerciseItem}
                  onPress={() => handlePress(exercise)} // Navigate on press
                >
                  <Image
  source={{ uri: exercise.gifUrl }}
  style={styles.exerciseImage}
  resizeMode="contain"
/>
                  <Text style={styles.exerciseText}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetails}>
                    Equipment: {exercise.equipment} | Target: {exercise.target}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noDataText}>No exercises available for this body part.</Text>
            )}
          </View>
        )}
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    paddingTop: 20,
  },
  scrollContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2F163',
    marginBottom: 10,
  },
  loader: {
    marginTop: 20,
  },
  gridContainer: {
    width: '90%',
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  exerciseItem: {
    backgroundColor: '#6A0DAD',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    width: '45%', // Ensures a grid layout with 2 items per row
    alignItems: 'center',
    marginBottom: 20,
  },
  exerciseImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  exerciseText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#E2F163',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Exercises;
