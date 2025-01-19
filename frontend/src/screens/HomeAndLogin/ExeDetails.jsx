import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import FastImage from '@d11/react-native-fast-image'; // Import FastImage from the correct package

// Footer Component (can be a simple footer or any custom footer component)
const Footer = () => {
  return (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>© 2025 Your Company</Text>
    </View>
  );
};

const ExeDetails = ({ route }) => {
  const { exercise } = route.params; // Get the exercise data passed from the previous screen

  return (
    <View style={styles.outerContainer}> {/* Outer container wrapping everything */}
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{exercise.name}</Text>
        <Text style={styles.details}>Equipment: {exercise.equipment}</Text>
        <Text style={styles.details}>Target: {exercise.target}</Text>

        <Text style={styles.instructionsTitle}>Instructions:</Text>
        {exercise.instructions.map((step, index) => (
          <Text key={index} style={styles.instructionText}>
            {index + 1}. {step}
          </Text>
        ))}

        <Text style={styles.secondaryMusclesTitle}>Secondary Muscles:</Text>
        <Text style={styles.secondaryMusclesText}>
          {exercise.secondaryMuscles.join(', ')}
        </Text>

        {exercise.gifUrl && (
          <FastImage
            source={{ uri: exercise.gifUrl }} // Pass the GIF URL
            style={styles.gifImage}
            resizeMode={FastImage.resizeMode.cover} // Set the resize mode to 'cover'
          />
        )}
      </ScrollView>

      {/* Footer section */}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2F163',
    marginBottom: 10,
  },
  details: {
    fontSize: 16,
    color: '#E2F163',
    marginBottom: 10,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  secondaryMusclesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  secondaryMusclesText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  gifImage: {
    marginTop: 20,
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  footerContainer: {
    padding: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#E2F163',
    fontSize: 14,
  },
});

export default ExeDetails;
