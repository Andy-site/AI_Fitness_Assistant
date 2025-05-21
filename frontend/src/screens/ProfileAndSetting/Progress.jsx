import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { fetchExerciseProgress } from '../../api/fithubApi';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { capitalizeWords } from '../../utils/StringUtils';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const ProgressScreen = () => {
  const [exerciseProgress, setExerciseProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [highestRecords, setHighestRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const isMounted = useRef(true);

  // Extract categories and calculate highest records
  useEffect(() => {
    if (Object.keys(exerciseProgress).length > 0) {
      const allCategories = ['All', ...Object.keys(exerciseProgress)];
      setCategories(allCategories);

      const records = [];

      // If "All" selected, show all categories, else only selected category
      const categoriesToProcess =
        selectedCategory === 'All' ? Object.keys(exerciseProgress) : [selectedCategory];

      categoriesToProcess.forEach((category) => {
        const exercises = exerciseProgress[category];
        const groupedByExercise = {};

        exercises.forEach((record) => {
          const exerciseName = record.exercise;
          if (!groupedByExercise[exerciseName]) {
            groupedByExercise[exerciseName] = [];
          }
          groupedByExercise[exerciseName].push(record);
        });

        Object.entries(groupedByExercise).forEach(([exerciseName, recordsForExercise]) => {
          let maxRecord = null;

          recordsForExercise.forEach((record) => {
            if (!maxRecord || record.weight_per_set > maxRecord.weight_per_set) {
              maxRecord = record;
            }
          });

          if (maxRecord) {
            records.push({
              category,
              exerciseName,
              weight: maxRecord.weight_per_set,
              date: maxRecord.date,
              id: `${category}-${exerciseName}-${maxRecord.date}`,
            });
          }
        });
      });

      setHighestRecords(records);
    }
  }, [exerciseProgress, selectedCategory]);

  // Fetch data on mount
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

    return () => {
      isMounted.current = false;
    };
  }, []);

  const renderExerciseItem = ({ item }) => (
    <View style={styles.exerciseCard}>
      <Text style={styles.categoryText}>{capitalizeWords(item.category)}</Text>
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
      <View style={styles.dropdownWrapper}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
          dropdownIconColor="#E2F163"
        >
          {categories.map((cat) => (
            <Picker.Item key={cat} label={capitalizeWords(cat)} value={cat} />
          ))}
        </Picker>
      </View>
      <View style={styles.contentWrapper}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#B3A0FF" />
          </View>
        ) : (
          <FlatList
            data={highestRecords}
            keyExtractor={(item) => item.id}
            renderItem={renderExerciseItem}
            ListEmptyComponent={renderEmptyList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={false}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={10}
            extraData={loading}
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
  dropdownWrapper: {
    marginHorizontal: 10,
    marginTop: 90,
    borderWidth: 1,
    borderColor: '#B3A0FF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: '#E2F163',
    backgroundColor: '#1a1a1a',
    height: 50,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 20,
    marginTop: 10,
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
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 5,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
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
