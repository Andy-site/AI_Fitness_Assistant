import React, { useState, useEffect } from 'react';
import { 
  View, Text, Button, ActivityIndicator, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import NextButton from '../../components/NextButton';

const activityLevels = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'];

const LandNutri = () => {
  const navigation = useNavigation(); // Ensure navigation is available
  const [loading, setLoading] = useState(false);
  const [nutritionAdvice, setNutritionAdvice] = useState(null);
  const [dietaryOptions, setDietaryOptions] = useState([]);
  const [goalOptions, setGoalOptions] = useState([]);

  // User details state
  const [firstName, setFirstName] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goal, setGoal] = useState('');

  // User inputs
  const [dietaryRestriction, setDietaryRestriction] = useState('');
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
            'x-rapidapi-key': '36a41b8259msh924bc2b06e3845dp15dd8fjsn33da3c418fd1',
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
    <View style={styles.outercontainer}>
      <Header title="Nutrition Advice"/>
      <ScrollView style={styles.container}>
        <View style={styles.userInfo}>
          <Text style={styles.title}>Welcome, {firstName}!</Text>
          <Text>Current Weight: {currentWeight} kg</Text>
          <Text>Goal: {goal}</Text>
        </View>

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
          <TextInput
            style={styles.input}
            placeholder="Enter dietary restriction"
            value={dietaryRestriction}
            onChangeText={setDietaryRestriction}
          />
        </View>

        {/* Activity Level Selection */}
        <Text style={styles.sectionTitle}>Select Daily Activity Level:</Text>
        <View style={styles.toggleContainer}>
          {activityLevels.map((level) => (
            <TouchableOpacity 
              key={level} 
              style={[styles.toggleButton, activityLevel === level && styles.toggleButtonSelected]}
              onPress={() => setActivityLevel(level)}
            >
              <Text style={styles.toggleButtonText}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fetch Nutrition Advice */}
        <TouchableOpacity style={styles.button} onPress={getNutritionAdvice}>
  <Text style={styles.buttonText}>Get Nutrition Advice</Text>
</TouchableOpacity>


        {loading && <ActivityIndicator size="large" color="#896cfe" />}

        {/* Display Nutrition Advice */}
        {!loading && nutritionAdvice && (
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
    </View>
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
    marginTop:70,
    marginBottom:70,
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
    backgroundColor:'#896cfe',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    backgroundColor:'#fff'
  },
  toggleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#896cfe',
  },
  toggleButtonSelected: {
    backgroundColor: '#fff',
    color:'#000',
    borderWidth: 5,
    borderColor: '#896cfe',
    
  },
  toggleButtonText: {
    color: '#000',
    fontWeight:500,
    textAlign:'center',
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
      maxWidth: '50%',
      alignSelf: 'center',
      alignItems:'center',
      borderWidth:2,
      borderColor:'#000',
    },
    buttonText: {
      color: '#000',
      fontWeight: 'bold',
    },

    
});

export default LandNutri;
