import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const RepsAndSets = () => {
  // Initialize state to store sets (each set has 'weight' and 'reps')
  const [sets, setSets] = useState([{ weight: '', reps: '' }]);

  // Handle change in weight or reps
  const handleInputChange = (index, field, value) => {
    const updatedSets = [...sets];
    updatedSets[index][field] = value;
    setSets(updatedSets);
  };

  // Add a new set
  const addSet = () => {
    setSets([...sets, { weight: '', reps: '' }]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sets</Text>

      <ScrollView>
        {sets.map((set, index) => (
          <View key={index} style={styles.setContainer}>
            <Text style={styles.setTitle}>Set {index + 1}</Text>

            <View style={styles.setFields}>
              <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                keyboardType="numeric"
                value={set.weight}
                onChangeText={(text) => handleInputChange(index, 'weight', text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Reps"
                keyboardType="numeric"
                value={set.reps}
                onChangeText={(text) => handleInputChange(index, 'reps', text)}
              />
            </View>

            {/* Add button for more sets */}
            {index === sets.length - 1 && (
              <TouchableOpacity style={styles.addButton} onPress={addSet}>
                <Icon name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.addText}>Add Set</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2F163',
    marginBottom: 20,
    textAlign: 'center',
  },
  setContainer: {
    marginBottom: 20,
  },
  setTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  setFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    width: '45%',
    padding: 10,
    fontSize: 14,
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    borderRadius: 5,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#E2F163',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 10,
  },
});

export default RepsAndSets;
