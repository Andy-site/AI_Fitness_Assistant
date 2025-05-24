import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const { width } = Dimensions.get('window');

const instructionData = {
  Squat: {
    gif: require('../../assets/Gifs/Squat.gif'),
    instructions: [
      'Keep your feet shoulder-width apart',
      'Lower down as if sitting back into a chair',
      'Keep your back straight and knees behind toes',
      'Push through your heels to return up',
    ],
  },
  Lunge: {
    gif: require('../../assets/Gifs/Lunges.gif'),
    instructions: [
      'Step forward with one leg',
      'Lower your hips until both knees are bent at 90 degrees',
      'Keep the front knee above the ankle',
      'Push back to the starting position',
    ],
  },
};

const Instructions = ({ navigation, route }) => {
  const { exercise } = route.params;
  const { gif, instructions } = instructionData[exercise];

  return (
    <SafeAreaView style={styles.outerContainer}>
      <Header title="Exercise Instructions" />

      <View style={styles.container}>
        <FastImage
          source={gif}
          style={styles.gif}
          resizeMode={FastImage.resizeMode.contain}
        />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text style={styles.sectionTitle}>Instructions for {exercise}</Text>
          {instructions.map((line, index) => (
            <Text key={index} style={styles.instruction}>
              {index + 1}. {line}
            </Text>
          ))}

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('PoseScreen', { exercise })}
          >
            <Text style={styles.startButtonText}>Start Exercise</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#222',
  },
  container: {
    flex: 1,
    padding: 20,
    marginTop: 70,
    alignItems: 'center',
  },
  scrollContainer: {
    width: '100%',
  },
  gif: {
    width: width * 0.9,
    height: 240,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#000',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2F163',
    marginBottom: 20,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 5,
  },
  startButton: {
    marginTop: 30,
    backgroundColor: '#E2F163',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignSelf: 'center',
    elevation: 5,
  },
  startButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Instructions;
