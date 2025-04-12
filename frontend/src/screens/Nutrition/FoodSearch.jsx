import React, { useState } from 'react';
import { View, TextInput, Button, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';

const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

const FoodSearch = () => {
  const [query, setQuery] = useState('');
  const [foodResults, setFoodResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/search.php?s=${query}`);
      if (response.data.meals) {
        setFoodResults(response.data.meals);
      } else {
        setFoodResults([]);
        setError('No results found');
      }
    } catch (err) {
      console.error('Error fetching food data:', err);
      if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        setError('An error occurred while fetching food data');
      }
    }
    setLoading(false);
  };

  const renderFoodItem = ({ item }) => {
    return (
      <View style={styles.foodItem}>
        <Image source={{ uri: item.strMealThumb }} style={styles.foodImage} />
        <Text style={styles.foodTitle}>{item.strMeal}</Text>
        <Text>Category: {item.strCategory}</Text>
        <Text>Area: {item.strArea}</Text>
        <Button
          title="More Details"
          onPress={() => {
            console.log(`Navigating to details for ${item.strMeal}`);
          }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search for Meals</Text>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={(text) => setQuery(text)}
        placeholder="Search for meals..."
      />

      <Button
        title={loading ? 'Searching...' : 'Search'}
        onPress={handleSearch}
        disabled={loading}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={foodResults}
          keyExtractor={(item) => item.idMeal.toString()}
          renderItem={renderFoodItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  foodItem: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  foodImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginBottom: 10,
  },
  foodTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
});

export default FoodSearch;