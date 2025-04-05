import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Picker } from '@react-native-picker/picker';
import { fetchExercises } from '../../api/fithubApi';
import { capitalizeWords } from '../../utils/StringUtils';
import { checkFavoriteStatus} from '../../api/fithubApi';

const categories = [
  'chest', 'back', 'cardio', 'lower arms', 'waist', 'shoulders',
  'lower legs', 'neck', 'upper arms', 'upper legs'
];

const equipmentList = [
  'roller', 'skierg machine', 'tire', 'stepmill machine', 'hammer',
  'weighted', 'dumbbell', 'ez barbell', 'band', 'cable',
  'upper body ergometer', 'rope', 'elliptical machine', 'kettlebell',
  'medicine ball', 'leverage machine', 'wheel roller', 'barbell',
  'assisted', 'resistance band', 'bosu ball', 'smith machine',
  'sled machine', 'stability ball', 'olympic barbell', 'trap bar',
  'body weight', 'stationary bike'
];

const Workout = () => {
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [favoriteExercises, setFavoriteExercises] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchAllExercises = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const exercisesData = await fetchExercises(
          selectedCategory,
          selectedEquipment,
          '', // No search query for now
          1,  // Page 1
          20  // Fetch 20 exercises
        );
  
        console.log("API Response:", exercisesData); // Debugging log
  
        if (exercisesData && exercisesData.results) {
          setExercises(exercisesData.results);
          setFilteredExercises(exercisesData.results);
        } else {
          setError('No exercises found.');
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setError('Failed to load exercises. Please try again later.');
      } finally {
        setLoading(false);
        setShouldFetch(false); // Reset the fetch trigger
      }
    };
  
    if (shouldFetch) {
      fetchAllExercises();
    }
  }, [shouldFetch]);

  const applyFilters = () => {
    let filtered = [...exercises];

    if (selectedCategory) {
      filtered = filtered.filter(exercise =>
        exercise.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedEquipment) {
      filtered = filtered.filter(exercise =>
        exercise.equipment?.toLowerCase() === selectedEquipment.toLowerCase()
      );
    }

    console.log("Filtered Exercises:", filtered); // Debugging log
    setFilteredExercises(filtered);
    setShouldFetch(true);
    setFilterModalVisible(false); // Close the modal after applying filters
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedEquipment(null);
    setShouldFetch(true);
  };

  const navigateToExerciseDetails = async (exercise) => {
      navigation.navigate('ExeDetails', { 
        exerciseName: exercise.name, 
        bodyPart: exercise.category, 

      });
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#E2F163" />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="exclamation-circle" size={50} color="#E2F163" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => {
          const fetchAllExercises = async () => {
            setLoading(true);
            setError(null);
            try {
              const exercisesData = await fetchExercises(
                selectedCategory,
                selectedEquipment,
                '', // You can add a searchQuery if needed
                1, // Starting page number (you can change this for pagination)
                20 // Limit the number of exercises per page
              );
              setExercises(exercisesData);
              setFilteredExercises(exercisesData);
            } catch (error) {
              setError('Failed to load exercises. Please try again later.');
            } finally {
              setLoading(false);
            }
          };
          fetchAllExercises();
        }}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="Workout Exercises" />

        {loading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : (
          <>
            {/* Top Row */}
            <View style={styles.topRowContainer}>
              <View style={styles.topRow}>
                <TouchableOpacity 
                  style={styles.libraryButton} 
                  onPress={() => navigation.navigate('CreateLibrary')}
                >
                  <Icon name="list-ul" size={20} color="#000" />
                  <Text style={styles.buttonText}>Browse Library</Text>
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.iconButton} 
                    onPress={() => navigation.navigate('ExerciseSearch')}
                  >
                    <Icon name="search" size={20} color="#000" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.iconButton} 
                    onPress={() => setFilterModalVisible(true)}
                  >
                    <Icon name="filter" size={20} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Filter Feedback */}
            {(selectedCategory || selectedEquipment) && (
              <View style={styles.filterFeedback}>
                <View style={styles.filterLabels}>
                  {selectedCategory && (
                    <View style={styles.filterTag}>
                      <Text style={styles.filterTagText}>
                        Body Part: {capitalizeWords(selectedCategory)}
                      </Text>
                    </View>
                  )}
                  {selectedEquipment && (
                    <View style={styles.filterTag}>
                      <Text style={styles.filterTagText}>
                        Equipment: {capitalizeWords(selectedEquipment)}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.clearFiltersButton} 
                  onPress={clearFilters}
                >
                  <Icon name="times-circle" size={20} color="#E2F163" />
                </TouchableOpacity>
              </View>
            )}

            {/* Filter Modal */}
            <Modal 
              visible={filterModalVisible} 
              animationType="slide" 
              transparent
              onRequestClose={() => setFilterModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Filter Exercises</Text>
                    <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                      <Icon name="times" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.filterLabel}>Body Part</Text>
                  <View style={styles.pickerContainer}>
                    <Picker 
                      selectedValue={selectedCategory} 
                      onValueChange={setSelectedCategory} 
                      style={styles.picker}
                    >
                      <Picker.Item label="All Body Parts" value={null} />
                      {categories.map((category, index) => (
                        <Picker.Item key={index} label={capitalizeWords(category)} value={category} />
                      ))}
                    </Picker>
                  </View>

                  <Text style={styles.filterLabel}>Equipment</Text>
                  <View style={styles.pickerContainer}>
                    <Picker 
                      selectedValue={selectedEquipment} 
                      onValueChange={setSelectedEquipment} 
                      style={styles.picker}
                    >
                      <Picker.Item label="All Equipment" value={null} />
                      {equipmentList.map((equipment, index) => (
                        <Picker.Item key={index} label={capitalizeWords(equipment)} value={equipment} />
                      ))}
                    </Picker>
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={styles.applyFilterButton} 
                      onPress={applyFilters}
                    >
                      <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.clearButton} 
                      onPress={() => {
                        clearFilters();
                        setFilterModalVisible(false);
                      }}
                    >
                      <Text style={styles.clearButtonText}>Clear All</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Exercises List */}
            {filteredExercises.length > 0 ? (
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
              >
                {filteredExercises.map((exercise, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.exerciseItem}
                    onPress={() => navigateToExerciseDetails(exercise)}
                  >
                    <Text style={styles.exerciseText}>{capitalizeWords(exercise.name)}</Text>
                    <View style={styles.exerciseDetails}>
                      <Text style={styles.equipmentText}>
                        <Text style={styles.labelText}>Equipment: </Text>
                        {capitalizeWords(exercise.equipment)}
                      </Text>
                      <Text style={styles.bodyPartText}>
                        <Text style={styles.labelText}>Body Part: </Text>
                        {capitalizeWords(exercise.category)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No exercises match your filters</Text>
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <Footer />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topRowContainer: {
    paddingHorizontal: 15,
    marginTop: 90,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 15,
  },
  actionButtons: {
    flexDirection: 'row'
  },
  libraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2f163',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 0.8,
  },
  iconButton: {
    backgroundColor: '#e2f163',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginLeft: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  filterFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  filterLabels: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterTag: {
    backgroundColor: '#444',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginRight: 8,
    marginBottom: 5,
  },
  filterTagText: {
    color: '#E2F163',
    fontSize: 14,
  },
  clearFiltersButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  exerciseItem: {
    padding: 15,
    backgroundColor: '#896cfe',
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  exerciseText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exerciseDetails: {
    marginTop: 3,
  },
  labelText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  equipmentText: {
    fontSize: 14,
    color: '#e2f163',
    marginBottom: 3,
  },
  bodyPartText: {
    fontSize: 14,
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderBox: {
    backgroundColor: 'rgba(25, 25, 25, 0.8)',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  loadingText: {
    color: '#E2F163',
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  applyFilterButton: {
    backgroundColor: '#896cfe',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  applyFilterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    borderWidth: 1,
    borderColor: '#896cfe',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#896cfe',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#E2F163',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E2F163',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    color: '#E2F163',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
  },
  clearFiltersText: {
    color: '#896cfe',
    fontWeight: 'bold',
    fontSize: 16,
    padding: 10,
  },
});

export default Workout;