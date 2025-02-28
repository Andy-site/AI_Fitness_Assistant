import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const MealDetail = ({ meal }) => (
  <ScrollView style={styles.container}>
    <Text style={styles.header}>{meal.name}</Text>
    <Text style={styles.subHeader}>Ingredients:</Text>
    <Text style={styles.text}>{meal.ingredients}</Text>
    <Text style={styles.subHeader}>Instructions:</Text>
    <Text style={styles.text}>{meal.instructions}</Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#212020',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2F163',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E2F163',
    marginTop: 20,
  },
  text: {
    fontSize: 14,
    color: '#E2F163',
  },
});

export default MealDetail;
