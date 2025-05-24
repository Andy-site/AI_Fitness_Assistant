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
const ITEMS_PER_PAGE = 20;

const Workout = () => {
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigation = useNavigation();

  // Applied filters for actual fetching
  const [appliedCategory, setAppliedCategory] = useState(null);
  const [appliedEquipment, setAppliedEquipment] = useState(null);

  // Temporary filters used in modal only
  const [tempCategory, setTempCategory] = useState(null);
  const [tempEquipment, setTempEquipment] = useState(null);

  const [filterModalVisible, setFilterModalVisible] = useState(false);


  useEffect(() => {
    const fetchAllExercises = async () => {
      setLoading(true);
      setError(null);
      try {
        const exercisesData = await fetchExercises(
          appliedCategory,
          appliedEquipment,
          '',
          page,
          ITEMS_PER_PAGE
        );
        setExercises(exercisesData.results);
        setTotalCount(exercisesData.count);
      } catch (err) {
        setError('Failed to load exercises. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllExercises();
  }, [page, appliedCategory, appliedEquipment]);

  const applyFilters = () => {
    setAppliedCategory(tempCategory);
    setAppliedEquipment(tempEquipment);
    setPage(1); // reset pagination
    setFilterModalVisible(false);
  };

  const clearFilters = () => {
    setTempCategory(null);
    setTempEquipment(null);
    setAppliedCategory(null);
    setAppliedEquipment(null);
    setPage(1);
  };

  const navigateToExerciseDetails = (exercise) => {
    navigation.navigate('ExeDetails', {
      exerciseName: exercise.name,
      bodyPart: exercise.category,
    });
  };

  const capitalizeWords = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

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
        onPress={() => setPage(1)}
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
            {/* Top Controls */}
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
                    onPress={() => navigation.navigate('FavoriteExercises')}
                  >
                    <Icon name="heart" size={20} color="#000" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.navigate('ExerciseSearch')}
                  >
                    <Icon name="search" size={20} color="#000" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      setTempCategory(appliedCategory);
                      setTempEquipment(appliedEquipment);
                      setFilterModalVisible(true);
                    }}
                  >
                    <Icon name="filter" size={20} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Filter Feedback */}
            {(appliedCategory || appliedEquipment) && (
              <View style={styles.filterFeedback}>
                <View style={styles.filterLabels}>
                  {appliedCategory && (
                    <View style={styles.filterTag}>
                      <Text style={styles.filterTagText}>
                        Body Part: {capitalizeWords(appliedCategory)}
                      </Text>
                    </View>
                  )}
                  {appliedEquipment && (
                    <View style={styles.filterTag}>
                      <Text style={styles.filterTagText}>
                        Equipment: {capitalizeWords(appliedEquipment)}
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
                    <TouchableOpacity
                      onPress={() => setFilterModalVisible(false)}
                    >
                      <Icon name="times" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.filterLabel}>Body Part</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={tempCategory}
                      onValueChange={setTempCategory}
                      style={styles.picker}
                    >
                      <Picker.Item label="All Body Parts" value={null} />
                      {categories.map((category, idx) => (
                        <Picker.Item
                          key={idx}
                          label={capitalizeWords(category)}
                          value={category}
                        />
                      ))}
                    </Picker>
                  </View>

                  <Text style={styles.filterLabel}>Equipment</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={tempEquipment}
                      onValueChange={setTempEquipment}
                      style={styles.picker}
                    >
                      <Picker.Item label="All Equipment" value={null} />
                      {equipmentList.map((equipment, idx) => (
                        <Picker.Item
                          key={idx}
                          label={capitalizeWords(equipment)}
                          value={equipment}
                        />
                      ))}
                    </Picker>
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.applyFilterButton}
                      onPress={applyFilters}
                    >
                      <Text style={styles.applyFilterButtonText}>
                        Apply Filters
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => {
                        setTempCategory(null);
                        setTempEquipment(null);
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
            {exercises.length > 0 ? (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
              >
                {exercises.map((exercise, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exerciseItem}
                    onPress={() => navigateToExerciseDetails(exercise)}
                  >
                    <Text style={styles.exerciseText}>
                      {capitalizeWords(exercise.name)}
                    </Text>
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
                <Text style={styles.noResultsText}>
                  No exercises match your filters
                </Text>
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Pagination */}
        {totalCount > ITEMS_PER_PAGE && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 10,
            paddingHorizontal: 10,
            marginBottom: 70
          }}>
            <TouchableOpacity
              onPress={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              style={[
                styles.pageButton,
                page === 1 && styles.disabledButton
              ]}
            >
              <Text style={styles.pageButtonText}>Previous</Text>
            </TouchableOpacity>

            <Text style={{ alignSelf: 'center', color: '#fff', paddingTop: 8 }}>
              Page {page} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setPage(prev => Math.min(prev + 1, Math.ceil(totalCount / ITEMS_PER_PAGE)))
              }
              disabled={page === Math.ceil(totalCount / ITEMS_PER_PAGE)}
              style={[
                styles.pageButton,
                page === Math.ceil(totalCount / ITEMS_PER_PAGE) && styles.disabledButton
              ]}
            >
              <Text style={styles.pageButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#222',
  },
  topRowContainer: {
    paddingHorizontal: 15,
    marginTop: 90,
  },
  pageButton: {
  backgroundColor: '#e2f163',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 5,
  marginBottom: 10,
},

disabledButton: {
  backgroundColor: '#808080',
  
},

pageButtonText: {
  color: '#000',
  fontSize: 16,
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
    backgroundColor: '#B3A0FF',
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
    backgroundColor: '#B3A0FF',
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
    borderColor: '#B3A0FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#B3A0FF',
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
    color: '#B3A0FF',
    fontWeight: 'bold',
    fontSize: 16,
    padding: 10,
  },
});

export default Workout;