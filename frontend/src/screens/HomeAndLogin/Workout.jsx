import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { fetchData, exerciseOptions } from '../../utils/ExerciseFetcher';
import Footer from '../../components/Footer';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';

const images = {
  back: require('../../assets/Images/back.png'),
  cardio: require('../../assets/Images/cardio.png'),
  chest: require('../../assets/Images/chest.png'),
  'lower arms': require('../../assets/Images/arms2.png'),
  'lower legs': require('../../assets/Images/legs3.png'),
  neck: require('../../assets/Images/neck.png'),
  shoulders: require('../../assets/Images/shoulders.png'),
  'upper arms': require('../../assets/Images/arms1.png'),
  'upper legs': require('../../assets/Images/legs1.png'),
  waist: require('../../assets/Images/waist.png'),
};

const Workout = () => {
  const [bodyParts, setBodyParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBodyParts = async () => {
      const url = 'https://exercisedb.p.rapidapi.com/exercises/bodyPartList/';

      try {
        const data = await fetchData(url, exerciseOptions);
        if (Array.isArray(data)) {
          setBodyParts(data);
        }
      } catch (error) {
        console.error('Error fetching body parts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBodyParts();
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!searchQuery.trim()) return;

      setSearching(true);
      const url = `https://exercisedb.p.rapidapi.com/exercises/`;

      try {
        const data = await fetchData(url, exerciseOptions);
        if (Array.isArray(data)) {
          const lowerCaseSearch = searchQuery.toLowerCase();
          const filtered = data.filter(
            (exercise) =>
              exercise.name.toLowerCase().startsWith(lowerCaseSearch) ||
              exercise.equipment.toLowerCase().startsWith(lowerCaseSearch) ||
              exercise.target.toLowerCase().startsWith(lowerCaseSearch)
          );
          setExercises(filtered);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setSearching(false);
      }
    };

    fetchExercises();
  }, [searchQuery]);

  const handleBodyPartSelect = (part) => {
    navigation.navigate('Exercises', { bodyPart: part });
  };

  const handleExerciseSelect = (exercise) => {
    navigation.navigate('ExeDetails', { exercise });
  };

  return (
    <View style={styles.container} >
      <Header title="Select Body Parts" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.subtitle}>Select Muscle Groups</Text>
          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchBar}
              placeholder="Search exercises..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {/* FontAwesome as search icon */}
            const myIcon = <Icon name="search" size={20} color="#e2f163"  style={styles.searchIcon} />;
          </View>

          {searching ? (
            <ActivityIndicator size="large" color="#E2F163" style={styles.loader} />
          ) : (
            <View style={styles.exercisesContainer}>
              {searchQuery && exercises.length > 0 ? (
                exercises.map((exercise, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exerciseItem}
                    onPress={() => handleExerciseSelect(exercise)}
                  >
                    <Text style={styles.exerciseText}>{exercise.name}</Text>
                    <Text style={styles.equipmentText}>{exercise.equipment}</Text>
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
                      onPress={() => handleBodyPartSelect(part)}
                    >
                      {images[part] && <Image source={images[part]} style={styles.bodyPartImage} />}
                      <View style={styles.separator} />
                      <Text style={styles.bodyPartText}>{part.charAt(0).toUpperCase() + part.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
    subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E2F163',
    marginBottom: 20,
    marginTop: 60,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '95%',
    marginBottom: 20,
    padding: 10,
  },
  searchIcon: {
    marginLeft: 10,
    backgroundColor:'#896cfe',
    padding: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#896cfe',
  },
  searchBar: {
    flex: 1,
    color: '#000',
    fontSize: 15,
  },
  loader: {
    marginTop: 20,
  },
  exercisesContainer: {
    width: '100%',
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
  equipmentText: {
    fontSize: 14,
    color: '#DDDDDD',
  },
  noResultsText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
  bodyPartsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 25,
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
    height: 155,
    resizeMode: 'cover',
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
});

export default Workout;
