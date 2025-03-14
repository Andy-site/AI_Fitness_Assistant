import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,TouchableWithoutFeedback,
 
} from 'react-native';
import { fetchData, exerciseOptions } from '../../utils/ExerciseFetcher';
import Footer from '../../components/Footer';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import { capitalizeWords } from '../../utils/StringUtils';


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
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  // This state controls whether the search bar is in "active" mode.
  const [searchActive, setSearchActive] = useState(false);
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
    const fetchExercises = async (query, currentPage) => {
      if (searching || query.trim() === '') return; // Prevent fetching if search query is empty
  
      setSearching(true);
      setPage(currentPage); // Reset page number when new search query is initiated.
  
      try {
        const url = `https://exercisedb.p.rapidapi.com/exercises?limit=10&offset=${currentPage * 10}`;
  
        const data = await fetchData(url, exerciseOptions);
  
        if (data && Array.isArray(data)) {
          setExercises(prev => (currentPage === 0 ? data : [...prev, ...data])); // Append data on next pages
          setHasMore(data.length === 10);
          setPage(currentPage + 1);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setSearching(false);
      }
    };
  
    if (searchQuery.trim()) {
      fetchExercises(searchQuery, 0); // Fetch only if there’s search query
    }
  }, [searchQuery, searching]);
  
  
    

  const handleBodyPartSelect = part => {
    navigation.navigate('Exercises', { bodyPart: part });
  };

  const handleExerciseSelect = exercise => {
    navigation.navigate('ExeDetails', { exercise });
  };

  const handleOutsidePress = () => {
    setSearchActive(false);
    setSearchQuery('');
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        <Header title="Select Body Parts" />

        {/* Top row: Library Button & Search Bar */}
        <View style={styles.topRow}>
          {!searchActive && (
            <TouchableOpacity
              style={styles.libraryButton}
              onPress={() => navigation.navigate('CreateLibrary')}
            >
              <Text style={styles.libraryButtonText}>My Library</Text>
              <Icon name="list-ul" size={24} color="#000" />
            </TouchableOpacity>
          )}
          
          <View style={styles.searchBarRow}>
          <View style={styles.searchBarRow}>
  <View
    style={[
      styles.searchBarContainer,
      searchActive ? styles.searchBarActive : styles.searchBarInactive,
    ]}
  >
    <TextInput
      style={styles.searchBar}
      placeholder="Search for exercises..."
      placeholderTextColor="#666"
      value={searchQuery}
      onChangeText={setSearchQuery}
      autoCorrect={false}
      onFocus={() => setSearchActive(true)}
      onBlur={() => {
        if (!searchQuery.trim()) setSearchActive(false);
      }}
    />
    <TouchableOpacity
      onPress={() => setSearchActive(true)} 
      style={styles.searchIconContainer} 
    >
      <Icon name="search" size={20} color="#e2f163" style={styles.searchIcon} />
    </TouchableOpacity>
  </View>
</View>


            
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                    <Text style={styles.exerciseText}>Name: {capitalizeWords(exercise.name)}</Text>
                    <Text style={styles.equipmentText}>
                      Equipment: {capitalizeWords(exercise.equipment)}
                    </Text>
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
                      {images[part] && (
                        <Image source={images[part]} style={styles.bodyPartImage} />
                      )}
                      <View style={styles.separator} />
                      <Text style={styles.bodyPartText}>
                        {part.charAt(0).toUpperCase() + part.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
        <Footer />
      </View>
    </TouchableWithoutFeedback>
  
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '95%',
    alignSelf: 'center',
    marginVertical: 15,
    marginTop: 90,
  },
  libraryButton: {
    backgroundColor: '#e2f163',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 10,
    borderBlockColor: '#ffffff',
    borderEndWidth:1,
    flexDirection: 'row', // Align icon and text horizontally
    alignItems: 'center', // Vertically center the items within the button
  },
  libraryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    padding:5,
    marginRight: 5,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 1,
    flex: 1, // Search bar should take available spacee
    position: 'relative', // Needed for positioning the icon inside the input
  },
  searchBarActive: {
    flex: 1,
  },
  searchBarInactive: {
    flex: 1,
  },
  searchIcon: {
    marginLeft: 10,
    marginRight:5,
    backgroundColor: '#896cfe',
    padding: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#896cfe',
  },
  searchBar: {
    flex: 1,
    color: '#000000',
    fontSize: 15,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
    paddingBlockEnd:50,
  },
  loader: {
    marginTop: 20,
  },
  exercisesContainer: {
    width: '100%',
  },
  exerciseItem: {
    padding: 5,
    backgroundColor: '#896cfe',
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  exerciseText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  equipmentText: {
    fontSize: 14,
    color: '#e2f163',
    fontWeight: '400',
    fontFamily:'Times',
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
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 25,
    gap:5,
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