import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  VirtualizedList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { capitalizeWords } from '../../utils/StringUtils';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import debounce from 'lodash/debounce'; // You'll need to install lodash: npm install lodash

const API_URL = "http://192.168.0.117:8000/api/exercises/";

const ExerciseSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const isMounted = useRef(true);
  const abortController = useRef(null);

  useEffect(() => {
    return () => {
      setFilteredExercises([]);
      setSearchQuery('');
    };
  }, []);
  

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        if (isMounted.current) setFilteredExercises([]);
        return;
      }

      if (isMounted.current) {
        setSearching(true);
        setError(null);
      }
      // Keyboard.dismiss();

      try {
        abortController.current = new AbortController();
        const url = `${API_URL}?name=${encodeURIComponent(query.trim())}`;
        const response = await fetch(url, { signal: abortController.current.signal });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        const filteredData = data.filter((exercise) =>
          exercise.name.toLowerCase().startsWith(query.toLowerCase())
        );

        if (isMounted.current) {
          setFilteredExercises(filteredData);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching exercises:', error);
        if (isMounted.current) {
          setError('Failed to fetch exercises. Please try again.');
        }
      } finally {
        if (isMounted.current) {
          setSearching(false);
        }
      }
    },300), // 300ms debounce delay
    []
  );

  const handleSearch = () => {
    debouncedSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredExercises([]);
    setError(null);
    debouncedSearch.cancel(); // Cancel any pending debounced calls
  };

  const navigateToExerciseDetails = (exercise) => {
    navigation.navigate('ExeDetails', { exercise });
  };

  const getItem = (data, index) => data[index];
  const getItemCount = (data) => data.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <StatusBar barStyle="light-content" />
        
        <Header title="Search Exercises" />
        
        {/* Search Input Section */}
        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <Icon name="search" size={18} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Search for an exercise..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                debouncedSearch(text); // Trigger search on text change
              }}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
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

        {/* Results Section */}
        <View style={styles.resultsContainer}>
          {searching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E2F163" />
              <Text style={styles.loadingText}>Searching exercises...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="exclamation-triangle" size={40} color="#E2F163" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredExercises.length > 0 ? (
            <VirtualizedList
              data={filteredExercises}
              keyExtractor={(item) => `exercise-${item.id || Math.random().toString()}`}
              initialNumToRender={10}
              maxToRenderPerBatch={15}
              windowSize={7}
              removeClippedSubviews={false}
              getItemLayout={(data, index) => ({
                length: 88,
                offset: 88 * index,
                index,
              })}
              getItem={getItem}
              getItemCount={getItemCount}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.exerciseItem}
                  onPress={() => navigateToExerciseDetails(item)}
                >
                  <Text style={styles.exerciseText}>{capitalizeWords(item.name)}</Text>
                  <View style={styles.exerciseDetails}>
                    <Text style={styles.equipmentText}>
                      <Text style={styles.labelText}>Equipment: </Text>
                      {capitalizeWords(item.equipment)}
                    </Text>
                    <Text style={styles.bodyPartText}>
                      <Text style={styles.labelText}>Body Part: </Text>
                      {capitalizeWords(item.category)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="search" size={40} color="#666" />
              <Text style={styles.hintText}>Search for exercises by name</Text>
            </View>
          )}
        </View>
        
        <Footer />
      </KeyboardAvoidingView>
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
  backButtonContainer: {
    paddingHorizontal: 15,
    marginTop: 90,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#e2f163',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop:70,
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
  noResultsText: {
    fontSize: 16,
    color: '#E2F163',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  hintText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
  },
  clearSearchButton: {
    borderWidth: 1,
    borderColor: '#896cfe',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#896cfe',
    fontWeight: 'bold',
    fontSize: 16,
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