// src/pages/FoodSearch.js

import React, { useState } from 'react';
import { View, TextInput, Button, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

// Define the API key and base URL
const apiKey = 'jgjeAKwtJHaooaVjBKh2DrgUAyDctF8GZ7rbXvAb';  // Replace with your API key

async function searchFoods() {
  const url = 'https://api.nal.usda.gov/fdc/v1/foods/search';

  const params = {
    query: 'cheddar cheese',  // Example search query
    dataType: ['Foundation', 'SR Legacy'],  // Example data types
    pageSize: 25,  // Number of results per page
    pageNumber: 1,  // Page number to retrieve
  };

  const headers = {
    'x-api-key': apiKey,  // Include the API key in the headers
  };

  try {
    const response = await axios.get(url, { headers, params });
    console.log('Fetched food data:', response.data);
    return response.data.foods || [];
  } catch (error) {
    console.error('Error fetching food data:', error);
    throw error;
  }
}

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
      const foods = await searchFoods(query);
      setFoodResults(foods);
    } catch (err) {
      setError('An error occurred while fetching food data');
    }
    setLoading(false);
  };

  const renderFoodItem = ({ item }) => {
    // Extract important details from the API response
    const description = item.description || 'No description available';
    const calories = item.foodNutrients.find(nutrient => nutrient.nutrientName === 'Energy')?.value || 'N/A';
    const protein = item.foodNutrients.find(nutrient => nutrient.nutrientName === 'Protein')?.value || 'N/A';
    const fat = item.foodNutrients.find(nutrient => nutrient.nutrientName === 'Total lipid (fat)')?.value || 'N/A';
    const carbs = item.foodNutrients.find(nutrient => nutrient.nutrientName === 'Carbohydrate, by difference')?.value || 'N/A';

    return (
      <View style={styles.foodItem}>
        <Text style={styles.foodTitle}>{description}</Text>
        <Text>Calories: {calories} kcal</Text>
        <Text>Protein: {protein} g</Text>
        <Text>Fat: {fat} g</Text>
        <Text>Carbs: {carbs} g</Text>
        <Button
          title="More Details"
          onPress={() => {
            // You can navigate to a new screen with more details if needed
            console.log(`Navigating to details for ${description}`);
          }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search for Food</Text>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={(text) => setQuery(text)}
        placeholder="Search for food..."
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
          keyExtractor={(item) => item.fdcId.toString()}
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
  foodTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FoodSearch;
