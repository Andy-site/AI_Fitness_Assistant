import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { capitalizeWords } from '../../utils/StringUtils';
import { addExerciseToLibrary, getAuthToken, fetchExercises as fetchFromApi } from '../../api/fithubApi';

const bodyPartsList = ['None', 'back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];

const SetExerciseLibrary = ({ route }) => {
  const [exercises, setExercises] = useState([]);
  const [equipmentCategories, setEquipmentCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [showBodyPartModal, setShowBodyPartModal] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [error, setError] = useState(null);
  const [shouldFetch, setShouldFetch] = useState(false);
  const { libraryId } = route.params;

  useEffect(() => {
    const fetchAllExercises = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchFromApi(
          selectedBodyPart,
          null,      // No equipment filter
          null,      // No search query
          1,
          100
        );

        console.log("API Response:", response);

        if (response && response.results) {
          setExercises(response.results);
          categorizeByEquipment(response.results);
        } else {
          setError('No exercises found.');
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setError('Failed to load exercises. Please try again later.');
      } finally {
        setLoading(false);
        setShouldFetch(false);
      }
    };

    if (shouldFetch && selectedBodyPart) {
      fetchAllExercises();
    }
  }, [shouldFetch, selectedBodyPart]);

  const categorizeByEquipment = (exerciseList) => {
    const categorized = {};
    exerciseList.forEach(exercise => {
      if (!categorized[exercise.equipment]) {
        categorized[exercise.equipment] = [];
      }
      categorized[exercise.equipment].push(exercise);
    });
    setEquipmentCategories(categorized);
  };

  const toggleExerciseSelection = (exercise) => {
    setSelectedExercises(prevState =>
      prevState.includes(exercise.id)
        ? prevState.filter(id => id !== exercise.id)
        : [...prevState, exercise.id]
    );
  };

  const handleConfirmSelection = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        alert('No token found. Please log in.');
        return;
      }
  
      const exercisesToAdd = exercises.filter(ex => selectedExercises.includes(ex.id));
  
      for (let exerciseData of exercisesToAdd) {
        try {
          // Ensure required field `body_part` is added from `category`
          console.log("Selected Exercises to Add:", exercisesToAdd);

          const payload = {
            ...exerciseData,
            bodyPart: exerciseData.category, // ✅ Map category to body_part
          };
  
          await addExerciseToLibrary(libraryId, payload, token);
        } catch (error) {
          console.error('Error adding exercise to library:', error);
          alert('Failed to add exercises');
          return;
        }
      }
  
      alert('Exercises added to library');
    } catch (error) {
      console.error('Error fetching token:', error);
      alert('Failed to retrieve authentication token');
    }
  };
  

  const renderBodyPartModal = () => (
    <Modal visible={showBodyPartModal} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <FlatList
          style={styles.modalContent}
          data={bodyPartsList}
          keyExtractor={(part) => part}
          renderItem={({ item }) => (
            <TouchableOpacity key={item} style={styles.modalItem} onPress={() => {
              setSelectedBodyPart(item);
              setShowBodyPartModal(false);
              setShouldFetch(true);
            }}>
              <Text style={styles.modalText}>{capitalizeWords(item)}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Header title="Exercise Library" />

        <View style={styles.selectionRow}>
          <Text style={styles.selectionLabel}>Select Body Part:</Text>
          <TouchableOpacity onPress={() => setShowBodyPartModal(true)} style={styles.selectionBox}>
            <Text style={styles.selectionText}>{capitalizeWords(selectedBodyPart) || 'Select'}</Text>
            <Icon name="caret-down" size={25} color="#000" style={styles.dropdownIcon} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
        {loading ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#e2f163" />
    <Text style={styles.loadingText}>Loading Exercises...</Text>
  </View>
) : (
  <>
    {Object.keys(equipmentCategories).map((category) => (
      <View key={category} style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{capitalizeWords(category)}</Text>
        <View style={styles.exercisesContainer}>
          {equipmentCategories[category].map(ex => (
            <View key={ex.id} style={styles.exerciseRow}>
              <Text style={styles.exerciseText}>{capitalizeWords(ex.name)}</Text>
              <TouchableOpacity onPress={() => toggleExerciseSelection(ex)}>
                <Icon
                  name={selectedExercises.includes(ex.id) ? 'check-circle' : 'circle'}
                  size={24}
                  color={selectedExercises.includes(ex.id) ? '#e2f163' : '#fff'}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    ))}

{selectedBodyPart && !loading && (
  <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmSelection}>
    <Text style={styles.confirmButtonText}>Confirm</Text>
  </TouchableOpacity>
)}

  </>
)}

      </ScrollView>

      {renderBodyPartModal()}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollView: { flex: 1,  marginBottom: 70 },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingHorizontal: 20,
    marginTop: 80,
    borderRadius: 5,
    justifyContent: 'space-between',
    gap: 10, // Optional: If using RN >= 0.71, for spacing
  },
  
  selectionLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginRight: 10,
  },
  
  selectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2f163',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: 130, 
    justifyContent: 'space-between',
  },
  
  selectionText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  
  dropdownIcon: { marginLeft: 5 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  

  categoryContainer: {
    margin: 15,
    backgroundColor: '#B3A0FF',
    padding: 10,
    marginVertical: 2,
    borderRadius: 8,
  },
  categoryTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
  exercisesContainer: {
    paddingLeft: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  exerciseText: {
    color: '#000',
    fontSize: 16,
    marginVertical: 2,
    fontWeight: '500',
    flexShrink: 1,
    maxWidth: '90%',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000AA',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalText: {
    fontSize: 16,
    color: '#000',
  },

  confirmButton: {
    backgroundColor: '#e2f163',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 50,
  },
  confirmButtonText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default SetExerciseLibrary;
