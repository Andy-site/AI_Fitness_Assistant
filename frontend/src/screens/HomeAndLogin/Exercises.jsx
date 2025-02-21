import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { fetchData, exerciseOptions } from '../../utils/ExerciseFetcher';
import Footer from '../../components/Footer';
import { capitalizeWords } from '../../utils/StringUtils';
import Header from '../../components/Header';

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
    navigation.navigate('ExeDetails', { exerciseName: exercise.name, bodyPart });
  };
  

  return (
    <View style={styles.container}>
      <Header title={`Exercises for ${bodyPart}`} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                  <View style={styles.separator} />
                  <Text style={styles.exerciseText}>{capitalizeWords(exercise.name)}</Text>
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
    marginTop: 50,
  },
  loader: {
    marginTop: 90,
  },
  gridContainer: {
    width: '95%',
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  exerciseItem: {
    backgroundColor: '#896CFE',
    borderRadius: 8,
    marginBottom: 20,
    width: '45%',
  },
  exerciseImage: {
    width: '100%',
    height: 163,
    borderRadius: 8,
  },
  exerciseText: {
    fontSize: 16,
    fontWeight: 600,
    padding: 10,
    color: '#000000',
    textAlign: 'left',
  },
  exerciseDetails: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E2F163',
    textAlign: 'left',
    width: '100%',
    marginBottom: 5,
    marginLeft: 10,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ffffff',
    marginVertical: 3,
  },
  noDataText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Exercises;