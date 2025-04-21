import React, { useState, useEffect } from 'react';
import { 
  View, Text, ActivityIndicator, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {picker} from '@react-native-picker/picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { capitalizeWords } from '../../utils/StringUtils';
import { fetchMealPlan, fetchUserDetails, saveMealPlanToBackend } from '../../api/fithubApi';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const dietaryRestrictions = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo'];

const LandNutri = () => {
  const navigation = useNavigation();

  // User details state
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);

  // User inputs
  const [dietaryRestriction, setDietaryRestriction] = useState('None');
  const [targetWeight, setTargetWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('Moderate');

 
    useEffect(() => {
      const getUserDetails = async () => {
        try {
          const user = await fetchUserDetails(); // already returns object
          console.log('User details:', user); // check if user object is valid
    
          if (user && user.id) {
            setUserId(user.id);
            setFirstName(user.first_name || 'User');
            setCurrentWeight(user.weight ? String(user.weight) : '');
            setGoal(user.goal || '');
            setActivityLevel(capitalizeWords(user.activity_level));
            setTargetWeight(user.goal_weight ? String(user.goal_weight) : '');
          } else {
            console.warn('User data missing or incomplete:', user);
          }
        } catch (error) {
          console.error('Error retrieving user details:', error);
        }
      };
    
      getUserDetails();
    }, []);
    

    const getNutritionAdvice = async () => {
      console.log('Button pressed. User ID:', userId);
      if (!userId) return;
    
      setLoading(true);
    
      try {
        const today = new Date().toISOString().split('T')[0];
        console.log('Checking backend meal plans for date:', today);
    
        const existing = await fetchMealPlan();
    
        if (existing && existing.length > 0) {
          const transformedMeals = existing.map(item => ({
            meal: item.meal,
            suggestions: [{
              name: item.name,
              ingredients: item.ingredients || [],
              calories: item.calories || 0,
            }],
            is_consumed: item.is_consumed,
            dietary_restriction: item.dietary_restriction,
          }));
    
          console.log('✅ Fetched from backend. Not saving again.');
          navigation.navigate('MealDetails', {
            macronutrients: {}, // Optional: replace with actual macros
            mealPlan: transformedMeals,
            dietaryRestriction,
          });
    
          return; // ⛔️ Prevent saving again
        }
    
        // No existing data — fetch from external API
        console.log('🔄 Fetching new meal plan from external API...');
    
        const options = {
          method: 'POST',
          url: 'https://ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com/nutritionAdvice',
          params: { noqueue: '1' },
          headers: {
            'x-rapidapi-key': 'YOUR_API_KEY',
            'x-rapidapi-host': 'ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com',
            'Content-Type': 'application/json',
          },
          data: {
            goal,
            dietary_restriction: [dietaryRestriction],
            current_weight: parseFloat(currentWeight),
            target_weight: parseFloat(targetWeight),
            daily_activity_level: activityLevel,
            lang: 'en',
          },
        };
    
        const response = await axios.request(options);
        const suggestions = response.data.result?.meal_suggestions || [];
    
        const formattedMealPlan = suggestions.map(item => ({
          meal: item.meal,
          suggestions: [{
            name: item.name,
            ingredients: item.ingredients,
            calories: item.calories || 0,
          }],
          dietary_restriction: dietaryRestriction,
          is_consumed: false,
        }));
    
        // ✅ Add log here before saving
        console.log('📦 Saving NEW meal plan to backend:', JSON.stringify(formattedMealPlan, null, 2));
    
        await saveMealPlanToBackend(formattedMealPlan);
    
        navigation.navigate('MealDetails', {
          macronutrients: response.data.result?.macronutrients || {},
          mealPlan: formattedMealPlan,
          dietaryRestriction,
          fetchedFromAPI: true, // add this
        });
        
    
      } catch (error) {
        console.error('❌ Nutrition Advice Error:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to get meal plan.');
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
      <Header title="Nutrition Advice" />
      <ScrollView style={styles.container}>
        <View style={styles.userInfo}>
          <Text style={styles.title}>Welcome, {firstName}!</Text>
          <Text>Current Weight: {currentWeight} kg</Text>
          <Text>Goal: {goal}</Text>
          <Text>Target Weight: {targetWeight} kg</Text>
          <Text>Activity Level: {activityLevel}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>Select Dietary Restriction:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={dietaryRestriction}
              onValueChange={setDietaryRestriction}
              style={styles.picker}
            >
              {dietaryRestrictions.map((opt, i) => (
                <Picker.Item key={i} label={opt} value={opt} />
              ))}
            </Picker>
          </View>
        </View>

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
      <Footer />
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
