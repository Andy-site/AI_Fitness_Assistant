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
    navigation.navigate('ExeDetails', { exercise });
  };

  const capitalizeWords = (str) => {
    return str
      .split(' ') // Split the string into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(' '); // Join the words back into a single string
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
                  onPress={() => handlePress(exercise)}
                >
                  <Image
                    source={{ uri: exercise.gifUrl }}
                    style={styles.exerciseImage}
                    resizeMode="contain"
                  />
                  {/* Separator between Name and Details */}
                  <View style={styles.separator} />
                  <Text style={styles.exerciseText}>{capitalizeWords(exercise.name)}</Text>
                  
                  {/* Separator between Name and Details */}
                  <View style={styles.separator} />
                  
                  <Text style={styles.exerciseDetails}>
                    Equipment: {capitalizeWords(exercise.equipment)}
                  </Text>
                  <Text style={styles.exerciseDetails}>
                    Target: {capitalizeWords(exercise.target)}
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
    paddingBottom: 70,

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
    width: '95%',
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  exerciseItem: {
    backgroundColor: '#896CFE',
    borderRadius: 8,
    // padding: 15,
    marginBottom: 20,
    width: '45%', // Ensures a grid layout with 2 items per row
    
  },
  exerciseImage: {
    width: '100%',
    height: 163,
    borderRadius: 8,
  },
  exerciseText: {
    fontSize: 16,
    fontWeight: 600,
    padding:10,
    color: '#000000',
    textAlign: 'left',
  },
  exerciseDetails: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E2F163',
    textAlign: 'left', // Align details to the left
    width: '100%', // Ensure the text takes up the full width of the container
    marginBottom:5,
    marginLeft: 10, // Add space to the left of the text to align it with the image
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ffffff', // Purple color
    marginVertical: 3, // Add space around the separator
  },
  noDataText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Exercises;
