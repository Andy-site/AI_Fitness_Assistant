import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

const LandNutri = () => {
  const [loading, setLoading] = useState(false);
  const [nutritionAdvice, setNutritionAdvice] = useState(null);

  const getNutritionAdvice = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        'https://ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com/nutritionAdvice?noqueue=1',
        {
          goal: 'Gain weight',
          dietary_restrictions: ['Vegetarian'],
          current_weight: 80,
          target_weight: 70,
          daily_activity_level: 'Moderate',
          lang: 'en',
        },
        {
          headers: {
            'x-rapidapi-key': 'ccdb0b4d36msh5724ca5f32971b5p19b47bjsnf46d81526b76',
            'x-rapidapi-host': 'ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Nutrition Advice:', JSON.stringify(response.data, null, 2)); // Logs the entire response
      setNutritionAdvice(response.data); // Store the response in state
    } catch (error) {
      console.error('Error fetching nutrition advice:', error);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition Page</Text>
      <Button title="Get Nutrition Advice" onPress={getNutritionAdvice} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        nutritionAdvice && (
          <ScrollView style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Nutrition Advice Result</Text>

            {/* Display the result */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Goal</Text>
              <Text>{nutritionAdvice.result?.goal}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Calories</Text>
              <Text>{nutritionAdvice.result?.calories_per_day} kcal</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text>{nutritionAdvice.result?.description}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Exercise Name</Text>
              <Text>{nutritionAdvice.result?.exercise_name}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Macronutrients</Text>
              <Text>Carbs: {nutritionAdvice.result?.macronutrients?.carbohydrates}</Text>
              <Text>Fats: {nutritionAdvice.result?.macronutrients?.fats}</Text>
              <Text>Proteins: {nutritionAdvice.result?.macronutrients?.proteins}</Text>
            </View>

            {/* Display meal suggestions */}
            {nutritionAdvice?.result?.meal_suggestions?.map((meal, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>Meal Suggestion {index + 1}</Text>
                {/* Assuming each meal is an object, display relevant details here */}
                {meal && typeof meal === 'object' ? (
                  Object.entries(meal).map(([key, value], idx) => (
                    <Text key={idx}>
                      {key}: {JSON.stringify(value)} {/* To show the value of each key */}
                    </Text>
                  ))
                ) : (
                  <Text>{JSON.stringify(meal)}</Text> // Fallback for non-object meals
                )}
              </View>
            ))}
          </ScrollView>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultContainer: {
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default LandNutri;
