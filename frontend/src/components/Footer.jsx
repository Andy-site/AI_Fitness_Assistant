import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Keyboard, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Footer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Screen groupings for tab highlighting
  const homeScreens = [
    'Home',
    
  ];

  const workoutScreens = [
    'Workout',
    'Exercises',
    'RepsAndSets',
    'ExerciseSearch',
    'ExerciseEquipment',
    'FavoriteExercises',
    'CreateLibrary',
    'LibraryDetails',
    'SetExerciseLibrary',
    'ExeDetails',
  ];

  const poseScreens = [
    'LandPose',
    'PoseScreen',
    'ChoosePose',
    'ChooseDifficulty',
  ];

  const nutritionScreens = [
    'MealSugg',
    'LandNutri',
    'Nutrichoices',
    'MealDetails',
    'CreateNutri',
    'FoodSearch',
  ];

  const dashboardScreens = [
    'Dashboard',
    'Progress',
    'WorkoutCalendar',
    'ProgressTracking',
    'Visualization',
    'EditProfile',
    'LogoutScreen',
    'Notification',
  ];

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  if (isKeyboardVisible) return null;

  const currentRoute = route.name;
  const isActiveTab = (screens) => screens.includes(currentRoute);
  const iconColor = (screens) => (isActiveTab(screens) ? '#e2f163' : '#fff');
  const iconSize = (screens, base) => (isActiveTab(screens) ? base + 3 : base);

  return (
    <View style={styles.footer}>
      {/* Home Tab */}
      <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}>
        <Image
          source={require('../assets/Images/Home.png')}
          style={[
            styles.footerIconImage,
            {
              tintColor: iconColor(homeScreens),
              width: iconSize(homeScreens, 30),
              height: iconSize(homeScreens, 30),
            },
          ]}
          resizeMode="contain"
        />
        <Text style={styles.footerLabel}>Home</Text>
      </TouchableOpacity>

      {/* Pose Tab */}
      <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('LandPose')}>
        <Image
          source={require('../assets/Images/Scan2.png')}
          style={[
            styles.footerIconImage,
            {
              tintColor: iconColor(poseScreens),
              width: iconSize(poseScreens, 30),
              height: iconSize(poseScreens, 30),
            },
          ]}
          resizeMode="contain"
        />
        <Text style={styles.footerLabel}>Pose</Text>
      </TouchableOpacity>

      {/* Workout Tab */}
      <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('Workout')}>
        <MaterialCommunityIcons
          name="arm-flex"
          size={iconSize(workoutScreens, 33)}
          color={iconColor(workoutScreens)}
        />
        <Text style={styles.footerLabel}>Workout</Text>
      </TouchableOpacity>

      {/* Nutrition Tab */}
      <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('MealSugg')}>
        <Image
          source={require('../assets/Images/Apple.png')}
          style={[
            styles.footerIconImage,
            {
              tintColor: iconColor(nutritionScreens),
              width: iconSize(nutritionScreens, 30),
              height: iconSize(nutritionScreens, 30),
            },
          ]}
          resizeMode="contain"
        />
        <Text style={styles.footerLabel}>Nutrition</Text>
      </TouchableOpacity>

      {/* Dashboard Tab */}
      <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('Dashboard')}>
        <Image
          source={require('../assets/Images/Setting.png')}
          style={[
            styles.footerIconImage,
            {
              tintColor: iconColor(dashboardScreens),
              width: iconSize(dashboardScreens, 30),
              height: iconSize(dashboardScreens, 30),
            },
          ]}
          resizeMode="contain"
        />
        <Text style={styles.footerLabel}>Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    height: 70,
    backgroundColor: '#B3A0FF',
    borderTopWidth: 1,
    borderTopColor: '#7C57FF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  footerIconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerIconImage: {
    width: 30,
    height: 30,
  },
  footerLabel: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
  },
});

export default Footer;
