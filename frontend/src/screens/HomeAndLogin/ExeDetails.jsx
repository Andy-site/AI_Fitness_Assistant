import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { capitalizeWords } from '../../utils/StringUtils';
import Footer from '../../components/Footer';

const screenWidth = Dimensions.get('window').width;

const ExeDetails = ({ route }) => {
  const { exercise } = route.params;

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{capitalizeWords(exercise.name)}</Text>
        <Text style={styles.details}>Equipment: {capitalizeWords(exercise.equipment)}</Text>
        <Text style={styles.details}>Target: {capitalizeWords(exercise.target)}</Text>

        <Text style={styles.instructionsTitle}>Instructions:</Text>
        {exercise.instructions?.length > 0 ? (
          exercise.instructions.map((step, index) => (
            <Text key={index} style={styles.instructionText}>
              {index + 1}. {step}
            </Text>
          ))
        ) : (
          <Text style={styles.noDataText}>No instructions available.</Text>
        )}

        <Text style={styles.secondaryMusclesTitle}>Secondary Muscles:</Text>
        <Text style={styles.secondaryMusclesText}>
          {exercise.secondaryMuscles?.length > 0
            ? exercise.secondaryMuscles.map(muscle => capitalizeWords(muscle)).join(', ')
            : 'No secondary muscles specified.'}
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
    marginBottom: 30,
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
    textAlign: 'center',
  },
  details: {
    fontSize: 16,
    color: '#E2F163',
    marginBottom: 5,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
    marginBottom: 5,
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 10,
    marginBottom: 10,
  },
  secondaryMusclesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
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
    marginBottom:100,
  },
  gifImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
  },
});

export default ExeDetails;
