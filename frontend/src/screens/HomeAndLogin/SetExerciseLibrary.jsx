import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, ScrollView } from 'react-native';
import { exerciseOptions, fetchData } from '../../utils/ExerciseFetcher';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import { capitalizeWords } from '../../utils/StringUtils';
import Footer from '../../components/Footer';
import { addExerciseToLibrary, getAuthToken } from '../../api/fithubApi';

const bodyPartsList = ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];

const SetExerciseLibrary = ({ route }) => {
  const [exercises, setExercises] = useState([]);
  const [equipmentCategories, setEquipmentCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [showBodyPartModal, setShowBodyPartModal] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const { libraryId } = route.params;

  const fetchExercises = async (bodyPart) => {
    setLoading(true);
    try {
      const url = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`;
      const data = await fetchData(url, exerciseOptions);
      setExercises(data);
      categorizeByEquipment(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

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
    setSelectedExercises(prevState => {
      if (prevState.includes(exercise.id)) {  // Correct field name: exercise.id
        return prevState.filter(id => id !== exercise.id); // Deselect exercise
      }
      return [...prevState, exercise.id]; // Select exercise
    });
  };

  const handleConfirmSelection = async () => {
    try {
      const token = await getAuthToken(); // Fetch the token asynchronously
      if (!token) {
        alert('No token found. Please log in.');
        return;
      }
      console.log('Selected Exercises:', selectedExercises);
  
      // Log the selected exercises before making the API call
      const exercisesToAdd = exercises.filter(ex => selectedExercises.includes(ex.id)); // Use ex.id instead of ex.workout_exercise_id
    
      // Log the exercises that will be sent to the API
      console.log('Exercises to Add:', exercisesToAdd);
  
      for (let exerciseData of exercisesToAdd) {
        try {
          console.log('Sending Exercise to API:', exerciseData);  // Log individual exercise data
          await addExerciseToLibrary(libraryId, exerciseData, token); // Use the libraryId from route params
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
  
  

  const renderExerciseCategory = ({ item }) => {
    return (
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{capitalizeWords(item)}</Text>
        <View style={styles.exercisesContainer}>
          {equipmentCategories[item]?.map(ex => (
            <View key={ex.id} style={styles.exerciseRow}>
              <Text style={styles.exerciseText}>{capitalizeWords(ex.name)}</Text>
              <TouchableOpacity onPress={() => toggleExerciseSelection(ex)}>
                <Icon
                  name={selectedExercises.includes(ex.id) ? 'check-circle' : 'circle'} // Correct field name: ex.id
                  size={24}
                  color={selectedExercises.includes(ex.id) ? '#e2f163' : '#fff'}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
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
              fetchExercises(item);
              setShowBodyPartModal(false);
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

      <ScrollView style={styles.scrollView}>
        <View style={styles.selectionRow}>
          <Text style={styles.selectionLabel}>Select Body Part:</Text>
          <TouchableOpacity onPress={() => setShowBodyPartModal(true)} style={styles.selectionBox}>
            <Text style={styles.selectionText}>{capitalizeWords(selectedBodyPart) || 'Select'}</Text>
            <Icon name="caret-down" size={20} color="#fff" style={styles.dropdownIcon} />
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size='large' color='#000' />}

        {Object.keys(equipmentCategories).map((category) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{capitalizeWords(category)}</Text>
            <View style={styles.exercisesContainer}>
              {equipmentCategories[category].map(ex => (
                <View key={ex.id} style={styles.exerciseRow}>
                  <Text style={styles.exerciseText}>{capitalizeWords(ex.name)}</Text>
                  <TouchableOpacity onPress={() => toggleExerciseSelection(ex)}>
                    <Icon
                      name={selectedExercises.includes(ex.id) ? 'check-circle' : 'circle'} // Correct field name: ex.id
                      size={24}
                      color={selectedExercises.includes(ex.id) ? '#e2f163' : '#fff'}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Confirm Button inside ScrollView */}
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmSelection}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </ScrollView>

      {renderBodyPartModal()}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollView: { flex: 1, padding: 16, marginBottom: 70 }, // Add extra bottom padding for button space
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 20,
    marginTop: 70,
    borderRadius: 5,
  },
  selectionLabel: { color: '#fff', fontSize: 16, marginRight: 10 },
  selectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#896cfe',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    justifyContent: 'space-between',
  },
  selectionText: { color: '#fff', fontSize: 16 },
  dropdownIcon: { marginLeft: 5 },

  categoryContainer: {
    margin: 15,
    backgroundColor: '#896cfe',
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
    borderBottomWidth: 1, // Adds a bottom border (separator)
    
    borderBottomColor: '#ccc', 
  },
  exerciseText: {
    color: '#000',
    fontSize: 16,
    marginVertical: 2,
    fontWeight:500,
    flexShrink: 1,
    maxWidth:'90%'
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
