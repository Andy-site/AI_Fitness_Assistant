import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const { width } = Dimensions.get('window');

const ChoosePose = ({ navigation, route }) => {
  const { mode } = route.params;

  const exercises = [
    { name: 'Squat', color: '#2ECC71' },
    { name: 'Deadlift', color: '#9B59B6' },
    { name: 'Lunge', color: '#F39C12' }
  ];

  return (
    <LinearGradient 
      colors={['#1A1A2E', '#16213E']} 
      style={styles.outerContainer}
    >
      <Header title={`${mode} Mode: Select Exercise`} />
      
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Choose Your Exercise</Text>
        
        <View style={styles.buttonRow}>
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.name}
              style={[styles.selectButton, { backgroundColor: exercise.color }]}
              onPress={() => navigation.navigate('PoseScreen', { 
                mode: mode, 
                exercise: exercise.name 
              })}
            >
              <Text style={styles.buttonText}>{exercise.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <Footer />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
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
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  selectButton: {
    width: width * 0.65,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ChoosePose;