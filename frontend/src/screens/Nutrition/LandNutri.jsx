import React, { useState, useEffect } from 'react';
import { 
  View, Text, ActivityIndicator, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity, KeyboardAvoidingView, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { capitalizeWords } from '../../utils/StringUtils';


const dietaryRestrictions = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo'];

const LandNutri = () => {
  const navigation = useNavigation();
  

  // User details state
  const [firstName, setFirstName] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);


  // User inputs
  const [dietaryRestriction, setDietaryRestriction] = useState('None');
  const [targetWeight, setTargetWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('Moderate');

  // Fetch user details from AsyncStorage
  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('user_details');
        if (userDetails) {
          const user = JSON.parse(userDetails);
          setFirstName(user.first_name || 'User');
          setCurrentWeight(user.weight ? String(user.weight) : '');
          setGoal(user.goal || '');
          setActivityLevel(capitalizeWords(user.activity_level));
          setTargetWeight(user.goal_weight ? String(user.goal_weight) : '');
        }
      } catch (error) {
        console.error('Error retrieving user details:', error);
      }
    };

    getUserDetails();
  }, []);

  const getNutritionAdvice = async () => {
    setLoading(true);
  
    const options = {
      method: 'POST',
      url: 'https://ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com/nutritionAdvice',
      params: { noqueue: '1' },
      headers: {
        'x-rapidapi-key': '823eb87dafmsh4f6cc51c44be9d0p1b6da0jsn4dc884f6b5f8',
        'x-rapidapi-host': 'ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
      data: {
        goal,
        dietary_restrictions: [dietaryRestriction],
        current_weight: parseFloat(currentWeight),
        target_weight: parseFloat(targetWeight),
        daily_activity_level: activityLevel,
        lang: 'en',
      },
    };
  
    try {
      const response = await axios.request(options);
      console.log('API Response:', response.data);
  
      // Navigate directly to MealDetails with the API response
      navigation.navigate('MealDetails', {
        macronutrients: response.data.result?.macronutrients || {},
        mealPlan: response.data.result?.meal_suggestions || [],
      });
    } catch (error) {
      console.error('Error fetching nutrition advice:', error);
      Alert.alert('Error', 'Failed to fetch nutrition advice. Please try again later.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.outercontainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <Header title="Nutrition Advice"/>
      <ScrollView style={styles.container}>
        <View style={styles.userInfo}>
          <Text style={styles.title}>Welcome, {firstName}!</Text>
          <Text>Current Weight: {currentWeight} kg</Text>
          <Text>Goal: {goal}</Text>
          <Text>Target Weight: {targetWeight} kg</Text>
          <Text>Activity Level: {activityLevel}</Text>
        </View>

        
        {/* Input Fields */}
        <View style={styles.inputContainer}>
         

          <Text style={styles.sectionTitle}>Select Dietary Restriction:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={dietaryRestriction}
              onValueChange={(itemValue) => setDietaryRestriction(itemValue)}
              style={styles.picker}
            >
              {dietaryRestrictions.map((option, index) => (
                <Picker.Item key={index} label={option} value={option} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Fetch Nutrition Advice */}
        <TouchableOpacity 
  style={[styles.button, loading && { opacity: 0.6 }]} 
  onPress={getNutritionAdvice} 
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator size="small" color="#000" />
  ) : (
    <Text style={styles.buttonText}>Plan Details</Text>
  )}
</TouchableOpacity>


       
      </ScrollView>
      <Footer/>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outercontainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    padding: 10,
    marginTop: 70,
    marginBottom: 70,
  },
  userInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#eef',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
    backgroundColor: '#B3A0FF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    padding: 15,
    marginTop: 5,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eef5ff',
    borderRadius: 10,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#e2f163',
    padding: 15,
    borderRadius: 10,
    maxWidth: '70%',
    alignSelf: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
    marginBottom: 10,
  },
  button1: {
    backgroundColor: '#e2f163',
    padding: 15,
    borderRadius: 10,
    maxWidth: '50%',
    alignSelf: 'flex-end',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    marginBottom: 10,
    flexDirection: 'row',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default LandNutri;
