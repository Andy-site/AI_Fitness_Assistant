import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList, // Changed from VirtualizedList to FlatList
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Added useFocusEffect
import Icon from 'react-native-vector-icons/FontAwesome';
import { capitalizeWords } from '../../utils/StringUtils';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { fetchExercises, checkFavoriteStatus } from '../../api/fithubApi';

const ExerciseSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [favoriteExercises, setFavoriteExercises] = useState({});
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isMounted = useRef(true);

  // Replace useEffect with useFocusEffect for better navigation handling
  useFocusEffect(
    React.useCallback(() => {
      // This runs when screen comes into focus
      setSearchQuery('');
      setFilteredExercises([]);
      setError(null);
      setFavoriteExercises({});
      
      return () => {
        // This runs when screen goes out of focus
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      };
    }, [])
  );

  // Component mount/unmount handling
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredExercises([]);
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        handleSearch();
      }
    }, 500);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [searchQuery]);

  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery || !isMounted.current) {
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const exercisesData = await fetchExercises(null, null, trimmedQuery, 1, 20);

      if (!isMounted.current) return;

      if (exercisesData && exercisesData.results) {
        const filteredData = exercisesData.results.filter((exercise) =>
          exercise.name.toLowerCase().startsWith(trimmedQuery.toLowerCase())
        );
        setFilteredExercises(filteredData);
      } else {
        setFilteredExercises([]);
        setError('No exercises found.');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      if (isMounted.current) {
        setError('Failed to fetch exercises. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setSearching(false);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredExercises([]);
    setError(null);
  };

    const navigateToExerciseDetails = async (exercise) => {
        if (isMounted.current) {
          navigation.navigate('ExeDetails', { 
            exerciseName: exercise.name, 
            bodyPart: exercise.category, 
          });
        }
    };

  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.exerciseItem}
      onPress={() => navigateToExerciseDetails(item)}
    >
      <Text style={styles.exerciseText}>{capitalizeWords(item.name)}</Text>
      <View style={styles.exerciseDetails}>
        <Text style={styles.equipmentText}>
          <Text style={styles.labelText}>Equipment: </Text>{capitalizeWords(item.equipment)}
        </Text>
        <Text style={styles.bodyPartText}>
          <Text style={styles.labelText}>Body Part: </Text>{capitalizeWords(item.category)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (searching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E2F163" />
          <Text style={styles.loadingText}>Searching exercises...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={40} color="#E2F163" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (filteredExercises.length > 0) {
      return (
        <FlatList
          ref={listRef}
          data={filteredExercises}
          keyExtractor={(item) => `exercise-${item.id || item.name.replace(/\s+/g, '-').toLowerCase()}`}
          renderItem={renderExerciseItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          removeClippedSubviews={false} // Important to set this false
          keyboardShouldPersistTaps="handled"
        />
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Icon name="search" size={40} color="#666" />
        <Text style={styles.hintText}>Search for exercises by name</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <Header title="Search Exercises" />
        
        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <Icon name="search" size={18} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Search for an exercise..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearIcon}>
                <Icon name="times-circle" size={18} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={handleSearch}
            disabled={!searchQuery.trim()}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsContainer}>
          {renderContent()}
        </View>
        
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
  searchContainer: {
    flexDirection: 'row',
    marginTop: 70,
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  clearIcon: {
    padding: 5,
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 16,
    height: '100%',
  },
  searchButton: {
    backgroundColor: '#e2f163',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  searchButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContent: {
    padding: 15,
    paddingBottom: 80, // Extra padding for footer
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#E2F163',
    fontSize: 16,
    marginTop: 15,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  hintText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
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
});

export default ExerciseSearch;