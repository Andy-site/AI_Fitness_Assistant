import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import {
  fetchData,
  fetchBodyParts,
  fetchExercisesForBodyPart,
} from '../../utils/ExerciseFetcher';
import Footer from '../../components/Footer';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import {capitalizeWords} from '../../utils/StringUtils';

const images = {
  'middle back': require('../../assets/Images/back.png'),
  cardio: require('../../assets/Images/cardio.png'),
  chest: require('../../assets/Images/chest.png'),
  forearms: require('../../assets/Images/arms1.png'),
  calves: require('../../assets/Images/legs1.png'),
  neck: require('../../assets/Images/neck.png'),
  shoulders: require('../../assets/Images/shoulders.png'),
  biceps: require('../../assets/Images/arms2.png'),
  abductors: require('../../assets/Images/legs3.png'),
  waist: require('../../assets/Images/waist.png'),
  adductors: require('../../assets/Images/adductors.jpg'),
  glutes: require('../../assets/Images/glutes.jpg'),
  hamstrings: require('../../assets/Images/hamstrings.webp'),
  triceps: require('../../assets/Images/triceps.webp'),
  'lower back': require('../../assets/Images/lowerback.jpg'),
  lats: require('../../assets/Images/lats.jpg'),
  quadriceps: require('../../assets/Images/quadriceps.png'),
  abdominals: require('../../assets/Images/abdominals.jpg'),
  traps: require('../../assets/Images/traps.jpg'),
};

const Workout = () => {
  const [bodyParts, setBodyParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadBodyParts = async () => {
      setLoading(true);
      try {
        const data = await fetchBodyParts();
        if (Array.isArray(data)) {
          setBodyParts(data); // Assuming data is an array of primary muscles
        }
      } catch (error) {
        console.error('Error fetching body parts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBodyParts();
  }, []);

  useEffect(() => {
    const loadExercises = async () => {
      if (!searchQuery.trim()) return;

      setSearching(true);
      try {
        const data = await fetchData(
          'http://192.168.0.117:8000/api/exercises/',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (Array.isArray(data)) {
          const lowerCaseSearch = searchQuery.toLowerCase();
          const filtered = data.filter(
            exercise =>
              exercise.name.toLowerCase().startsWith(lowerCaseSearch) ||
              exercise.equipment.toLowerCase().startsWith(lowerCaseSearch) ||
              exercise.target.toLowerCase().startsWith(lowerCaseSearch),
          );
          setExercises(filtered);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setSearching(false);
      }
    };

    loadExercises();
  }, [searchQuery]);

  const handleBodyPartSelect = async primaryMuscle => {
    try {
      const exercises = await fetchExercisesForBodyPart(primaryMuscle);
      if (Array.isArray(exercises)) {
        navigation.navigate('Exercises', {bodyPart: primaryMuscle, exercises});
      } else {
        console.error(`No exercises found for ${primaryMuscle}`);
      }
    } catch (error) {
      console.error(`Error fetching exercises for ${primaryMuscle}:`, error);
    }
  };

  const handleExerciseSelect = exercise => {
    navigation.navigate('ExeDetails', {
      exercise: {
        id: exercise.id,
        name: exercise.name,
        force: exercise.force,
        level: exercise.level,
        mechanic: exercise.mechanic,
        equipment: exercise.equipment,
        category: exercise.category,
        primary_muscles: exercise.primary_muscles,
        secondary_muscles: exercise.secondary_muscles,
        instructions: exercise.instructions,
        image: exercise.image, // Array of images
      },
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Select Body Parts" />

      {/* Search Bar Component */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search Exercises..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={text => setSearchQuery(String(text))} // Ensure it's a string
        />
        <Icon style={styles.searchIcon} name="search" size={20} color="#e2f163" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {searchQuery && exercises.length > 0 ? (
          exercises.map((exercise, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exerciseItem}
              onPress={() => handleExerciseSelect(exercise)}>
              <Text style={styles.exerciseText}>
                {capitalizeWords(exercise.name)}
              </Text>
              <Text style={styles.detailsText}>Force: {exercise.force}</Text>
              <Text style={styles.detailsText}>Level: {exercise.level}</Text>
              <Text style={styles.detailsText}>
                Mechanic: {exercise.mechanic}
              </Text>
              <Text style={styles.equipmentText}>
                Equipment: {exercise.equipment}
              </Text>
              {exercise.images && exercise.images.length > 0 ? (
                <Image
                  source={{
                    uri: `http://192.168.0.117:8000${exercise.images[0]}`,
                  }}
                  style={styles.exerciseImage}
                  defaultSource={require('../../assets/Images/Girl1.png')}
                />
              ) : (
                <Image
                  source={require('../../assets/Images/Girl1.png')}
                  style={styles.exerciseImage}
                />
              )}
            </TouchableOpacity>
          ))
        ) : searchQuery ? (
          <Text style={styles.noResultsText}>No exercises found</Text>
        ) : (
          <View style={styles.bodyPartsContainer}>
            {bodyParts.map((part, index) => (
              <TouchableOpacity
                key={index}
                style={styles.bodyPartItem}
                onPress={() => handleBodyPartSelect(part)}>
                {images[part] ? (
                  <Image source={images[part]} style={styles.bodyPartImage} />
                ) : (
                  <Text>No image for {part}</Text> // Fallback
                )}
                <View style={styles.separator} />
                <Text style={styles.bodyPartText}>
                  {capitalizeWords(part)}
                </Text>
              </TouchableOpacity>
            ))}
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
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '95%',
    marginBottom: 20,
    padding: 10,
    marginTop: 90, // Adjust the margin top if necessary
  },
  searchBar: {
    flex: 1,
    color: '#000',
    fontSize: 15,
    paddingVertical: 2, // Ensure the text input is visible
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginTop: 10,
    justifyContent: 'space-around',
  },
  bodyPartsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 35,
  },
  bodyPartItem: {
    width: '45%',
    height: 180,
    backgroundColor: '#896cfe',
    marginBottom: 20,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyPartImage: {
    width: '105%',
    height: 150,
    resizeMode: 'cover',
  },
  searchIcon:{
    backgroundColor: '#896cfe',
    padding:5,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e2f163',
    
   
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ffffff',
    marginVertical: 3,
  },
  bodyPartText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 10,
  },
  exerciseItem: {
    padding: 10,
    backgroundColor: '#B3A0FF',
    marginBottom: 20,
    borderRadius: 8,
  },
  exerciseText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  detailsText: {
    fontSize: 14,
    color: '#E2F163',
  },
  equipmentText: {
    fontSize: 14,
    color: '#DDDDDD',
  },
  exerciseImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 8,
    marginTop: 10,
  },
});

export default Workout;
