import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const CreateNutri = () => {
  const [searchTerm, setSearchTerm] = useState(''); // User input for searching
  const [recipes, setRecipes] = useState([]); // Search results for recipes
  const [loading, setLoading] = useState(false); // Loading state
  const [accessToken, setAccessToken] = useState(null); // OAuth 2.0 Access Token
  const isMounted = useRef(true); // Track component mounting state

  // Cleanup function to set isMounted to false when the component is unmounted
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  

      
              const clientID = '74b47e4faae14e88bb83121de55b6efa';
              const clientSecret = 'e2c89f9a679541dc804ac51beec9e391';
              const authorize = async () => {
                try {
                
              
                  const formData = new URLSearchParams();
                  formData.append('grant_type', 'client_credentials');
                  formData.append('client_id', clientID);
                  formData.append('client_secret', clientSecret);
              
                  const response = await fetch('https://oauth.fatsecret.com/connect/token', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(), // Ensure it's a string, not FormData object
                  });
              
                  const data = await response.json();
                  
              
                  if (data.access_token) {
                    setAccessToken(data.access_token);
                    
                  } else {
                    Alert.alert('Error', 'Failed to retrieve access token.');
                  }
                } catch (error) {
                  console.error('Error fetching access token:', error);
                }
              };
              
            
    useEffect(()=>{
        authorize();
    }
    )
  // Step 2: Making API requests with the access token
  const fetchRecipes = async (searchTerm) => {
    if (!searchTerm) {
      Alert.alert('Missing Search Term', 'Please enter a search term.');
      return;
    }
  
    if (!accessToken) {
      Alert.alert('Authentication Error', 'Access token is not available.');
      console.log('Access token is missing!'); // Debugging log
      return;
    }
  
    setLoading(true);
    
  
    try {
      const response = await axios.get(
        'https://platform.fatsecret.com/rest/recipes/search/v3',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          params: {
            method: 'recipes.search.v3',
            search_expression: searchTerm,
            format: 'json',
            max_results: 10,
            page_number: 0,
          },
        }
      );
  
      console.log('API Response:', response.data); // Debugging log
  
      if (isMounted.current) {
        setRecipes(response.data.recipes?.recipe || []);
        
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.recipeCard}>
      <Text style={styles.recipeName}>{item.recipe_name}</Text>
      <Text style={styles.recipeDescription}>{item.recipe_description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.outerContainer}>
      <Header title="Create Plan"/>
      <View style={styles.container}>
        <Text style={styles.title}>Create Your Custom Diet Plan</Text>

        <TextInput
          style={styles.input}
          placeholder="Search for a recipe or food category"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <Button title="Search" onPress={() => fetchRecipes(searchTerm)} disabled={loading} />

        {loading ? <Text>Loading...</Text> : null}

        <FlatList
          data={recipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.recipe_id.toString()}
          style={styles.recipeList}
        />
      </View>
      <Footer/>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    marginTop: 70,
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  recipeCard: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#555',
  },
  recipeList: {
    marginTop: 20,
  },
});

export default CreateNutri;
