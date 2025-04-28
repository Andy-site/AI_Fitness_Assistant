import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { fetchExerciseProgress } from '../../api/fithubApi';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { capitalizeWords } from '../../utils/StringUtils';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const ProgressScreen = () => {
  const [exerciseProgress, setExerciseProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [highestRecords, setHighestRecords] = useState([]);
  const isMounted = useRef(true);

  // Calculate highest records when exercise progress data changes
  useEffect(() => {
    if (Object.keys(exerciseProgress).length > 0) {
      const records = [];
      
      Object.keys(exerciseProgress).forEach((exerciseName) => {
        const exerciseRecords = exerciseProgress[exerciseName];
        let maxRecord = null;
        
        exerciseRecords.forEach((record) => {
          if (!maxRecord || record.weight_per_set > maxRecord.weight_per_set) {
            maxRecord = record;
          }
        });
        
        if (maxRecord) {
          records.push({
            exerciseName,
            weight: maxRecord.weight_per_set,
            date: maxRecord.date,
            id: `${exerciseName}-${maxRecord.date}` // Unique ID for each record
          });
        }
      });
      
      setHighestRecords(records);
    }
  }, [exerciseProgress]);

  // Fetch data on mount with proper cleanup
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const exerciseData = await fetchExerciseProgress();
        if (isMounted.current) {
          setExerciseProgress(exerciseData.exercise_progress || {});
        }
      } catch (error) {
        if (isMounted.current) {
          console.error('Error loading progress:', error);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    loadProgress();

    // Cleanup function to run on unmount
    return () => {
      isMounted.current = false;
    };
  }, []);

  const renderExerciseItem = ({ item }) => (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseName}>{capitalizeWords(item.exerciseName)}</Text>
      <View style={styles.detailRow}>
        <MaterialIcons name="fitness-center" size={16} color="#E2F163" />
        <Text style={styles.exerciseDetail}> Best: {item.weight} kg</Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialIcons name="calendar-today" size={16} color="#E2F163" />
        <Text style={styles.exerciseDetail}> Date: {item.date}</Text>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <Text style={styles.emptyText}>No personal records yet.</Text>
  );

  return (
    <SafeAreaView style={styles.outercontainer}>
      <Header title="Records" />
      <View style={styles.contentWrapper}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#B3A0FF" />
          </View>
        ) : (
          <FlatList
            data={highestRecords}
            keyExtractor={item => item.id}
            renderItem={renderExerciseItem}
            ListEmptyComponent={renderEmptyList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={false} // Helps with view hierarchy issues
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={10}
            extraData={loading} // Re-render when loading changes
          />
        )}
      </View>
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  outercontainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 20,
    marginTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseCard: {
    backgroundColor: '#B3A0FF',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  exerciseDetail: {
    fontSize: 16,
    color: '#E2F163',
    marginLeft: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
});

export default ProgressScreen;