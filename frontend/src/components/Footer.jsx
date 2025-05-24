import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Footer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const isNavigating = useRef(false);

  const homeScreens = ['Home'];
  const workoutScreens = [
    'Workout', 'Exercises', 'RepsAndSets', 'ExerciseSearch',
    'ExerciseEquipment', 'FavoriteExercises', 'CreateLibrary',
    'LibraryDetails', 'SetExerciseLibrary', 'ExeDetails',
  ];
  const poseScreens = ['LandPose', 'PoseScreen', 'ChoosePose', 'PoseNavigation', 'Instructions', 'PoseHistory', 'CalorieVisualization'];
  const nutritionScreens = ['MealSugg', 'LandNutri', 'Nutrichoices', 'MealDetails', 'CreateNutri', 'FoodSearch'];
  const dashboardScreens = ['Dashboard', 'Progress', 'WorkoutCalendar', 'ProgressTracking', 'Visualization', 'EditProfile', 'LogoutScreen', 'Notification'];

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  if (isKeyboardVisible) return null;

  const currentRoute = route.name;

  const isActiveTab = (screens) => screens.includes(currentRoute);
  const iconColor = (screens) => (isActiveTab(screens) ? '#e2f163' : '#fff');
  const iconSize = (screens, base) => (isActiveTab(screens) ? base + 3 : base);

  const refreshOrNavigateToHome = () => {
    if (!isNavigating.current) {
      isNavigating.current = true;
      if (currentRoute === 'Home') {
        // Trigger a re-render by pushing Home with a different key or params
        navigation.navigate('Home', { refresh: Date.now() }); // Send a changing param
      } else {
        navigation.navigate('Home');
      }
      setTimeout(() => {
        isNavigating.current = false;
      }, 300);
    }
  };

  return (
    <View style={styles.footer}>
      {/* Home Tab */}
      <TouchableOpacity style={styles.footerIconButton} onPress={refreshOrNavigateToHome}>
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
      </TouchableOpacity>

      {/* Workout Tab */}
      <TouchableOpacity style={styles.footerIconButton} onPress={() => navigation.navigate('Workout')}>
        <MaterialCommunityIcons
          name="arm-flex"
          size={iconSize(workoutScreens, 33)}
          color={iconColor(workoutScreens)}
        />
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
