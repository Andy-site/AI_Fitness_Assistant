import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const MealCard = ({ meal, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(meal)}>
      <View style={styles.mealCard}>
        <Text style={styles.mealName}>{meal.food_name}</Text>
        {meal.nutrition ? (
          <View style={styles.nutritionContainer}>
            <Text>Calories: {meal.nutrition.calories}</Text>
            <Text>Protein: {meal.nutrition.protein}g</Text>
            <Text>Fat: {meal.nutrition.fat}g</Text>
            <Text>Sodium: {meal.nutrition.sodium}mg</Text>
            {/* Add other nutrition facts as needed */}
          </View>
        ) : (
          <Text>Loading Nutrition...</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E2F163',
  },
  mealDetails: {
    fontSize: 14,
    color: '#E2F163',
  },
});

export default MealCard;
