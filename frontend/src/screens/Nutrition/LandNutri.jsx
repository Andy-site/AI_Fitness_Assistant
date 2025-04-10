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
import Icon from 'react-native-vector-icons/FontAwesome';

const activityLevels = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'];
const dietaryRestrictions = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo'];

const LandNutri = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [nutritionAdvice, setNutritionAdvice] = useState(null);

  // User details state
  const [firstName, setFirstName] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goal, setGoal] = useState('');

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
        }
      } catch (error) {
        console.error('Error retrieving user details:', error);
      }
    };

    getUserDetails();
  }, []);

  // Validate Target Weight
  const validateTargetWeight = () => {
    const current = parseFloat(currentWeight);
    const target = parseFloat(targetWeight);

    if (!targetWeight) {
      Alert.alert("Missing Target Weight", "Please enter your target weight.");
      return false;
    }

    if (goal === 'Gain weight' && target <= current) {
      Alert.alert("Invalid Target Weight", "For weight gain, target weight must be higher than current weight.");
      return false;
    }
    
    if (goal === 'Lose weight' && target >= current) {
      Alert.alert("Invalid Target Weight", "For weight loss, target weight must be lower than current weight.");
      return false;
    }

    return true;
  };

  // Fetch nutrition advice
  const getNutritionAdvice = async () => {
    if (!validateTargetWeight()) return;
  
    setLoading(true);
    
    try {
      const response = await axios.post(
        'https://ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com/nutritionAdvice?noqueue=1',
        {
          goal,
          dietary_restrictions: [dietaryRestriction],
          current_weight: parseFloat(currentWeight),
          target_weight: parseFloat(targetWeight),
          daily_activity_level: activityLevel,
          lang: 'en',
        },
        {
          headers: {
            'x-rapidapi-key': '3ad4a2f8admsh440268a18f36360p163235jsne9d005b72609',
            'x-rapidapi-host': 'ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com',
            'Content-Type': 'application/json',
          },
        }
      );
      
      setNutritionAdvice(response.data);
    } catch (error) {
      if (error.response?.status === 429) {
        console.error("Too many requests, please wait before trying again.");
        Alert.alert("Rate Limit Exceeded", "You've made too many requests. Try again later.");
      } else {
        console.error('Error fetching nutrition advice:', error);
        Alert.alert("Error", "Failed to fetch nutrition advice. Please try again later.");
      }
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
        </View>

        <TouchableOpacity style={styles.button1} onPress={()=>
          navigation.navigate('CreateNutri', { 
            firstName, 
            currentWeight, 
            goal, 
          })
        }>
          <Icon name = "plus" size={20} color= "#000000" />
          <Text style={styles.buttonText}>Create Meal Plan</Text>
        </TouchableOpacity>
        
        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>Enter Target Weight:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter target weight (kg)"
            value={targetWeight}
            onChangeText={setTargetWeight}
          />

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

          <Text style={styles.sectionTitle}>Select Daily Activity Level:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={activityLevel}
              onValueChange={(itemValue) => setActivityLevel(itemValue)}
              style={styles.picker}
            >
              {activityLevels.map((level, index) => (
                <Picker.Item key={index} label={level} value={level} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Fetch Nutrition Advice */}
        <TouchableOpacity style={styles.button} onPress={getNutritionAdvice}>
          <Text style={styles.buttonText}>Get Nutrition Advice</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#B3A0FF" />}

        {/* Display Nutrition Advice */}
        {!loading && nutritionAdvice && nutritionAdvice.result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Nutrition Advice Result</Text>
            <Text>Goal: {nutritionAdvice.result?.goal}</Text>
            <Text>Daily Calories: {nutritionAdvice.result?.calories_per_day} kcal</Text>

            <View style={{ alignItems: 'center', marginTop: 15 }}>
              <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MealDetails', {
                  macronutrients: nutritionAdvice.result?.macronutrients,
                  mealPlan: nutritionAdvice.result?.meal_suggestions
                })}>
                <Text style={styles.buttonText}>View Meal Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
