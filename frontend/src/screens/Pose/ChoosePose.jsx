import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const { width } = Dimensions.get('window');

const ChoosePose = ({ navigation }) => {


  // Removed the Lunge exercise
  const exercises = [
    { name: 'Squat' },
    { name: 'Deadlift' },
  ];

  return (
    <View style={styles.outerContainer}>
      {/* Header title */}
      <Header title="Choose Exercise" />

      <View style={styles.container}>
        <Text style={styles.sectionTitle}> Select Exercise</Text>

        <View style={styles.buttonRow}>
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.name}
              style={styles.selectButton}
              onPress={() => navigation.navigate('PoseScreen', {
                exercise: exercise.name
              })}
            >
              <Text style={styles.buttonText}>{exercise.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#222', // Dark background color
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2F163',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  selectButton: {
    width: width * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 15,
    elevation: 5,
    backgroundColor:'#e2f163',
    marginBottom: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ChoosePose;
