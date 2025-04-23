import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { fetchFoodCategories } from '../../utils/FatSecretUtils'; // Adjust the import path
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Nutrichoices = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchFoodCategories();
    
        // Directly map the data if it's already an array of categories
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error('Unexpected data structure:', data);
        }
      } catch (error) {
        console.error('Error fetching food categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style = {styles.outercontainer}>
      <Header title="food categories"/>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Food Categories</Text>
      {categories.map((category, index) => (
        <View key={index} style={styles.categoryItem}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
        </View>
      ))}
    </ScrollView>
    <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  outercontainer: {
    flex: 1,
    backgroundColor: '#000', // Dark gray background for a clean, gym-like feel
  },
  container: {
    flex: 1,
    padding: 20,
    
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50', // Dark color for titles
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2980B9', // Blue for the loading state
    textAlign: 'center',
  },
  categoryItem: {
    backgroundColor: '#B3A0FF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // For Android shadow support
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000', // Gym-like green color for category names
  },
  categoryDescription: {
    fontSize: 14,
    color: '#fff', // Lighter gray for descriptions
    marginTop: 5,
  },
});

export default Nutrichoices;
