import React, { useState, useEffect } from 'react';
import {
  View, Text, ActivityIndicator, StyleSheet, ScrollView,
  Alert, TouchableOpacity, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { capitalizeWords } from '../../utils/StringUtils';
import {
  fetchUserDetails,
  fetchBackendMeals,
  saveMealPlanToBackend,
  fetchMealHistory 
} from '../../api/fithubApi';

const dietaryRestrictions = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo'];

const LandNutri = () => {
  const navigation = useNavigation();

  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [mealHistory, setMealHistory] = useState([]);
const [page, setPage] = useState(1);
const ITEMS_PER_PAGE = 10;
const [selectedMeal, setSelectedMeal] = useState(null);
const [mealDetailsVisible, setMealDetailsVisible] = useState(false);
  const [dietaryRestriction, setDietaryRestriction] = useState('None');
  const [targetWeight, setTargetWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('Moderate');

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const user = await fetchUserDetails();
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

   const loadMealHistory = async () => {
  try {
    const history = await fetchMealHistory();
    console.log('Fetched meal history:', history);
    setMealHistory(history);
    setPage(1); // Reset to first page on reload
  } catch (error) {
    console.error('Error fetching meal history:', error);
  }
};
    getUserDetails();
    loadMealHistory();
  
  }, []);

  const paginatedMeals = mealHistory.slice(
  (page - 1) * ITEMS_PER_PAGE,
  page * ITEMS_PER_PAGE
);
console.log("Selected Meal in Modal:", selectedMeal);

const totalCount = mealHistory.length;
const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);


  const getNutritionAdvice = async () => {
    if (!userId) return;

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      const existing = await fetchBackendMeals(today);

      if (existing && existing.length > 0) {
        navigation.navigate('MealDetails', {
          macronutrients: {},
          mealPlan: existing,
          dietaryRestriction,
        });
        return;
      }

      const options = {
        method: 'POST',
        url: 'https://ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com/nutritionAdvice',
        params: { noqueue: '1' },
        headers: {
          'x-rapidapi-key': 'cd885471a8mshe716357a6b4de6ap15f168jsn9658f7fd57d7',
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
        suggestions: item.suggestions.map(suggestion => ({
          name: suggestion.name || 'Unknown Meal',
          ingredients: suggestion.ingredients || [],
          calories: suggestion.calories || 0,
        })),
        dietary_restriction: dietaryRestriction,
        is_consumed: false,
      }));

      await saveMealPlanToBackend(formattedMealPlan, today);

      navigation.navigate('MealDetails', {
        macronutrients: response.data.result?.macronutrients || {},
        mealPlan: formattedMealPlan,
        dietaryRestriction,
        fetchedFromAPI: true,
      });

    } catch (error) {
      console.error(' Nutrition Advice Error:', error.response?.data || error.message);
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

       <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Meal History</Text>

{paginatedMeals.length === 0 ? (
  <Text style={{ color: '#fff', marginTop: 10 }}>No meals found.</Text>
) : (
  paginatedMeals.map((meal, index) => (
    <View key={index} style={styles.mealCard}>
      <TouchableOpacity onPress={() => {
  setSelectedMeal(meal);
  setMealDetailsVisible(true);
}}>
  <Text style={styles.mealTitle}>{meal.name}</Text>

      <Text style={styles.mealDesc}>{meal.meal} - {meal.calories} cal</Text>
      <Text style={styles.mealDesc}>Consumed Date - {new Date(meal.created_at).toLocaleDateString()}</Text>
</TouchableOpacity>
    </View>
  ))
)}


<View style={styles.paginationContainer}>
  <TouchableOpacity
    onPress={() => setPage(prev => Math.max(prev - 1, 1))}
    disabled={page === 1}
    style={[
      styles.pageButton,
      page === 1 && styles.disabledButton
    ]}
  >
    <Text style={styles.pageButtonText}>Previous</Text>
  </TouchableOpacity>

  <Text style={styles.pageIndicator}>
    Page {page} of {totalPages}
  </Text>

  <TouchableOpacity
    onPress={() => setPage(prev => Math.min(prev + 1, totalPages))}
    disabled={page === totalPages}
    style={[
      styles.pageButton,
      page === totalPages && styles.disabledButton
    ]}
  >
    <Text style={styles.pageButtonText}>Next</Text>
  </TouchableOpacity>
</View>

      </ScrollView>
      {mealDetailsVisible && (
  <Modal
    animationType="slide"
    transparent={true}
    visible={mealDetailsVisible}
    onRequestClose={() => setMealDetailsVisible(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => setMealDetailsVisible(false)}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>✕</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#000' }}>
  {selectedMeal?.meal} - {selectedMeal?.name}
</Text>


        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Ingredients:</Text>
        <ScrollView style={{ maxHeight: 150, width: '100%' }}>
          {(selectedMeal?.ingredients || []).map((ing, idx) => (
            <Text key={idx} style={{ color: '#333', marginBottom: 4 }}>• {ing}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
)}

      <Footer />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outercontainer: {
    flex: 1,
    backgroundColor: '#222',
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
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  width: '90%',
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
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
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  mealCard: {
  marginTop: 10,
  padding: 15,
  backgroundColor: '#fff',
  borderRadius: 8,
},
mealTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 4,
  color:'#b3a0ff',
},
mealDesc: {
  fontSize: 14,
  fontWeight: 'normal',
  
},
paginationContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginVertical: 15,
  backgroundColor: '#333',
  padding: 10,
  borderRadius: 10,
},
pageButton: {
  backgroundColor: '#e2f163',
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 8,
},
pageButtonText: {
  fontWeight: 'bold',
  color: '#000',
},
pageIndicator: {
  color: '#fff',
  fontSize: 14,
},
disabledButton: {
  opacity: 0.4,
},

});

export default LandNutri;
