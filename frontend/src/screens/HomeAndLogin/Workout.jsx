import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { fetchData, exerciseOptions } from '../../utils/ExerciseFetcher'; // Import the fetchData and exerciseOptions
import Footer from '../../components/Footer';
import { useNavigation } from '@react-navigation/native'; // For navigation


const Workout = () => {
  const [bodyParts, setBodyParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    const fetchBodyParts = async () => {
      const url = 'https://exercisedb.p.rapidapi.com/exercises/bodyPartList/';

      try {
        const data = await fetchData(url, exerciseOptions);
        console.log('Fetched Data:', data);

        if (Array.isArray(data)) {
          const uniqueBodyParts = [...new Set(data)];
          setBodyParts(uniqueBodyParts);
        } else {
          console.error('Data is not an array:', data);
        }
      } catch (error) {
        console.error('Error fetching body parts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBodyParts();
  }, []);

  const handleBodyPartSelect = (part) => {
    navigation.navigate('Exercises', { bodyPart: part }); // Navigate to Exercise page with body part
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Workout</Text>
        <Text style={styles.subtitle}>Select a body part</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#E2F163" style={styles.loader} />
        ) : (
          <View style={styles.bodyPartsContainer}>
            {bodyParts.length > 0 ? (
              bodyParts.map((part, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.bodyPartItem}
                  onPress={() => handleBodyPartSelect(part)} // On press, navigate to Exercise page
                >
                  <Text style={styles.bodyPartText}>{part}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noDataText}>No body parts available.</Text>
            )}
          </View>
        )}
      </ScrollView>
      <Footer /> // Include the Footer component at the bottom of the screen
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black background for the whole screen
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
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  bodyPartsContainer: {
    width: '90%',
    marginTop: 20,
    alignItems: 'center', // Center the buttons inside the container
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Ensure buttons are spaced evenly
  },
  bodyPartItem: {
    width: '45%', // Adjust width for 2 items per row
    height: 130, // Increased height for bigger buttons
    backgroundColor: '#B3A0FF', // Purple background for the button
    borderRadius: 16,
    padding: 4, // Increased padding for spacing inside the button
    marginBottom: 15,
    marginRight: 10, // Add some margin for spacing between buttons
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyPartText: {
    fontSize: 20, // Increased text size
    color: '#00000', // Text color set to white
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Workout;
