import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const { width } = Dimensions.get('window');

const ChooseDifficulty = ({ navigation }) => {
  const modes = [
    { name: 'Beginner', color: '#E2F163' },
    { name: 'Pro', color: '#E2F163' }
  ];

  return (
    <View style={styles.outerContainer}>
      <Header title="Select Difficulty" />
      
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Choose Your Difficulty</Text>
        
        <View style={styles.buttonRow}>
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.name}
              style={[styles.selectButton, { backgroundColor: mode.color }]}
              onPress={() => navigation.navigate('ChoosePose', { mode: mode.name })}
            >
              <Text style={styles.buttonText}>{mode.name}</Text>
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
    backgroundColor: '#16213E', // You can keep the background color here if desired
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
    justifyContent: 'space-around',
    width: '100%',
  },
  selectButton: {
    width: width * 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ChooseDifficulty;
