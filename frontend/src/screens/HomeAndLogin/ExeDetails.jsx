import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';  // Updated import statement

// Get device width for responsive sizing
const { width: screenWidth } = Dimensions.get('window');

const Footer = () => {
  return (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>© 2025 Your Company</Text>
    </View>
  );
};

const ExeDetails = ({ route }) => {
  const { exercise } = route.params;

  return (
    <View style={styles.outerContainer}>
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
          <View style={styles.gifContainer}>
            <FastImage
              source={{
                uri: exercise.gifUrl,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              style={styles.gifImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        )}
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    marginBottom:30,
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
    marginBottom: 5,
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
    marginBottom: 20,
  },
  gifContainer: {
    width: screenWidth - 40,
    aspectRatio: 1,
    alignSelf: 'center',
    marginVertical: 20,
  },
  gifImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
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