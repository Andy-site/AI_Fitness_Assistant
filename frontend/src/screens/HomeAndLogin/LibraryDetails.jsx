import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    SectionList,
  } from 'react-native';
  import React, { useState, useEffect } from 'react';
  import { getLibraryExercises, deleteLibraryExercise } from '../../api/fithubApi';
  import Header from '../../components/Header';
  import Footer from '../../components/Footer';
  import { capitalizeWords } from '../../utils/StringUtils';
  import Icon from 'react-native-vector-icons/FontAwesome';
  import { useNavigation } from '@react-navigation/native';
  
  const LibraryDetails = ({ route }) => {
    const [libraryExercises, setLibraryExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { libraryId, token } = route.params;
    const navigation = useNavigation();
  
    useEffect(() => {
      const fetchExercises = async () => {
        try {
          const data = await getLibraryExercises(libraryId, token);
          console.log('Fetched Exercises:', data);
          setLibraryExercises(data);
        } catch (error) {
          console.error('Error fetching exercises:', error);
          setError(error.message || 'Failed to fetch exercises');
        } finally {
          setLoading(false);
        }
      };
      fetchExercises();
    }, [libraryId, token]);
  
    useEffect(() => {
      return () => {
        console.log('LibraryDetails component unmounted');
      };
    }, []);
  
    const handleAddExercise = () => {
      navigation.navigate('SetExerciseLibrary', { libraryId });
    };
  
    const handleDeleteExercise = async (exerciseId) => {
      try {
        setLibraryExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
  
        setTimeout(async () => {
          try {
            await deleteLibraryExercise(libraryId, exerciseId, token);
          } catch (error) {
            console.error('Error in API call:', error);
            const data = await getLibraryExercises(libraryId, token);
            setLibraryExercises(data);
          }
        }, 100);
      } catch (error) {
        console.error('Error deleting exercise:', error);
        setError(error.message || 'Failed to delete exercise');
      }
    };
  
    // Transform data for SectionList (group by body part)
    const groupedExercises = libraryExercises.reduce((acc, exercise) => {
      const bodyPart = exercise.body_part || 'Unknown';
      const existingSection = acc.find((section) => section.title === bodyPart);
  
      if (existingSection) {
        existingSection.data.push(exercise);
      } else {
        acc.push({ title: bodyPart, data: [exercise] });
      }
      return acc;
    }, []);
  
    const renderExerciseItem = ({ item, section }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ExeDetails', { exerciseId: item.id, exerciseName: item.name, bodyPart: section.title })}
          style={styles.exerciseContainer}>
          <View style={styles.exerciseDetailsContainer}>
            <Text style={styles.exerciseName}>
              {capitalizeWords(item.name || '')} {/* Provide a default value */}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteExercise(item.id)}
            style={styles.deleteButton}>
            <Icon name="trash" size={24} color="red" />
          </TouchableOpacity>
        </TouchableOpacity>
      );
  
    const renderSectionHeader = ({ section }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>
          {capitalizeWords(section.title)}
        </Text>
      </View>
    );
  
    const renderEmptyList = () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No exercises found. Add some to get started!
        </Text>
        <TouchableOpacity
          onPress={handleAddExercise}
          style={[styles.addButton, styles.emptyAddButton]}>
          <Text style={styles.addButtonText}>Add Your First Exercise</Text>
        </TouchableOpacity>
      </View>
    );
  
    if (loading) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#896cfe" />
          </View>
        </SafeAreaView>
      );
    }
  
    if (error) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{`Error: ${error}`}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                setError(null);
                getLibraryExercises(libraryId, token)
                  .then((data) => {
                    setLibraryExercises(data);
                    setLoading(false);
                  })
                  .catch((err) => {
                    setError(err.message || 'Failed to fetch exercises');
                    setLoading(false);
                  });
              }}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
  
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.outerContainer}>
          <Header title="Library Details" backScreen="CreateLibrary" />
          <View style={styles.innerContainer}>
            {groupedExercises.length > 0 && (
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Your Exercises</Text>
                <TouchableOpacity
                  onPress={handleAddExercise}
                  style={styles.addButton}>
                  <View style={styles.row}>
                    <Icon name="plus" size={20} color="#fff" />
                    <Text style={styles.addButtonText}> Exercise</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
  
            <SectionList
              sections={groupedExercises}
              keyExtractor={(item, index) => `exercise-${item.id}-${index}`}
              renderItem={renderExerciseItem}
              renderSectionHeader={renderSectionHeader}
              ListEmptyComponent={renderEmptyList}
              contentContainerStyle={
                groupedExercises.length === 0
                  ? styles.emptyListContainer
                  : styles.listContainer
              }
            />
          </View>
          <Footer />
        </View>
      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#000' },
    outerContainer: { flex: 1, backgroundColor: '#000' },
    innerContainer: {
      flex: 1,
      padding: 20,
      marginTop: 70,
      backgroundColor: '#000',
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    sectionHeader: {
      backgroundColor: '#e2f163',
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
      marginTop: 10,
    },
    sectionHeaderText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
      textAlign: 'center',
    },
    exerciseContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 5,
      backgroundColor: '#896cfe',
      borderRadius: 8,
      marginBottom: 10,
      justifyContent: 'space-between',
    },
    exerciseDetailsContainer: {
      flex: 0.8, // Takes 80% of the space
      justifyContent: 'center', // Center the text vertically
    },
    exerciseName: {
      fontSize: 15,
      fontWeight: '600',
      color: '#fff',
      flexShrink: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      color: 'red',
      marginBottom: 20,
      textAlign: 'center',
    },
    addButton: {
      backgroundColor: '#896cfe',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 25,
    },
    addButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    deleteButton: { padding: 10 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  
  export default LibraryDetails;