import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {capitalizeWords} from '../../utils/StringUtils';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const ExeDetails = ({route}) => {
  const {exercise} = route.params;
  const {bodyPart} = route.params;
  const navigation = useNavigation();

  // Calculate estimated time based on the number of secondary muscles
  const calculateEstimatedTime = secondaryMusclesCount => {
    if (secondaryMusclesCount <= 1) return 5; // 5 minutes for one muscle
    return 5 + (secondaryMusclesCount - 1) * 2; // Increase by 2 minutes for each additional muscle
  };

  const estimatedTime = calculateEstimatedTime(
    exercise.secondaryMuscles?.length || 0,
  );

  // Function to handle Start button press, start the exercise session, and navigate to the next screen
  const handleStartPress = () => {
    const startTime = Date.now(); // Record the start time

    // Start the exercise session
    startExerciseSession(startTime);

    // Navigate to the next screen (RepsAndSets)
    navigation.navigate('RepsAndSets', {exercise, startTime, bodyPart});
  };

  // Function to start the exercise session (this function can contain any logic for starting the session)
  const startExerciseSession = startTime => {
    Alert.alert('Session Started', `Starting session for ${exercise.name}!`);
    console.log('Exercise started at:', startTime);
    // Additional logic for starting the session can go here, such as starting a timer
  };

  // Function to handle Add to Favourites
  const handleAddToFavourites = () => {
    Alert.alert(
      'Added to Favourites',
      `${exercise.name} has been added to your favourites!`,
    );
    // Here you would typically call a function to store the exercise in a list of favourites
  };

  // Function to handle Back Arrow Press
  const handleBackPress = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <View style={styles.outerContainer}>
      <Header title="Exercise Info" />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{capitalizeWords(exercise.name)}</Text>
          <TouchableOpacity onPress={handleAddToFavourites} style={styles.heartIconContainer}>
            <Icon name="heart" size={25} color="#896cfe" />
          </TouchableOpacity>
        </View>

        <Text style={styles.details}>
          Equipment: {capitalizeWords(exercise.equipment)}
        </Text>
        <Text style={styles.details}>
          Target: {capitalizeWords(exercise.target)}
        </Text>

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
            ? exercise.secondaryMuscles
                .map(muscle => capitalizeWords(muscle))
                .join(', ')
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

        {/* Start button with clock icon */}
        <TouchableOpacity style={styles.startButton} onPress={handleStartPress}>
          <Text style={styles.startButtonText}>Start</Text>
          <View style={styles.separatorContainer}>
            <Text style={styles.separator}>|</Text>
            <View style={styles.timeContainer}>
              <Icon name="clock-o" size={20} color="#000000" />
              <Text
                style={styles.estimatedTimeText}>{`${estimatedTime} min`}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollViewContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 80,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2F163',
    maxWidth: 300,
  },
  heartIconContainer: {
    paddingLeft: 10,
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
    marginBottom: 30,
  },
  gifImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#E2F163',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 50,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00000',
    paddingHorizontal: 50,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  separator: {
    fontSize: 20,
    color: '#000000',
    marginHorizontal: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimatedTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 5,
  },
});

export default ExeDetails;
