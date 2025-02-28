import './gesture-handler';
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
<<<<<<< HEAD
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet } from 'react-native';
=======
import React from 'react';
import EmailScreen from '../screens/Register/EmailScreen';
import PasswordScreen from '../screens/Register/PasswordScreen';
import NameScreen from '../screens/Register/NameScreen';
import AgeScreen from '../screens/Register/AgeScreen';
import HeightScreen from '../screens/Register/HeightScreen';
import WeightScreen from '../screens/Register/WeightScreen';
import GoalScreen from '../screens/Register/GoalScreen';
import RegisterScreen from '../screens/Register/RegisterScreen';
import Landing from '../screens/Loading/Landing';
import Loading1 from '../screens/Loading/Loading1';
import Loading2 from '../screens/Loading/Loading2';
import Loading3 from '../screens/Loading/Loading3';
import Loading4 from '../screens/Loading/Loading4';
import LoginScreen from '../screens/Login/LoginScreen';

import Home from '../screens/HomeAndLogin/HomeScreen';
import ForgotPassword1 from '../screens/Login/ForgotPassword1';
import ForgotPassword2 from '../screens/Login/ForgotPassword2';
import ForgotPassword3 from '../screens/Login/ForgotPassword3';
>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d

<<<<<<< HEAD
// Import Registration Screens
import EmailScreen from '../screens/register/EmailScreen';
import PasswordScreen from '../screens/register/PasswordScreen';
import NameScreen from '../screens/register/NameScreen';
import AgeScreen from '../screens/register/AgeScreen';
import HeightScreen from '../screens/register/HeightScreen';
import WeightScreen from '../screens/register/WeightScreen';
import GoalScreen from '../screens/register/GoalScreen';
import RegisterScreen from '../screens/register/RegisterScreen';

// Import Loading Screens
import Landing from '../screens/Loading/Landing';
import Loading1 from '../screens/Loading/Loading1';
import Loading2 from '../screens/Loading/Loading2';
import Loading3 from '../screens/Loading/Loading3';
import Loading4 from '../screens/Loading/Loading4';

// Create Navigators
=======
import Workout from '../screens/HomeAndLogin/Workout';
import Exercises from '../screens/HomeAndLogin/Exercises';
import ExeDetails from '../screens/HomeAndLogin/ExeDetails';
import RepsAndSets from '../screens/HomeAndLogin/RepsAndSets';
import CreateLibrary from '../screens/HomeAndLogin/CreateLibrary';
import SetExerciseLibrary from '../screens/HomeAndLogin/SetExerciseLibrary';
import LibraryDetails from '../screens/HomeAndLogin/LibraryDetails';


import LandNutri from '../screens/Nutrition/LandNutri';
import MealSugg from '../screens/Nutrition/MealSugg';
import Nutrichoices from '../screens/Nutrition/Nutrichoices';
import MealDetails from '../screens/Nutrition/MealDetails';




import Notification from '../screens/Loading/Notification';




>>>>>>> b6897e0c166e38dcc801765204eb7b10bbe1f9f7
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigator for Loading Screens
const LoadingDrawer = () => {
  return (
    <Drawer.Navigator initialRouteName="Loading1">
      <Drawer.Screen name="Loading1" component={Loading1} />
      <Drawer.Screen name="Loading2" component={Loading2} />
      <Drawer.Screen name="Loading3" component={Loading3} />
      <Drawer.Screen name="Loading4" component={Loading4} />
    </Drawer.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  // Navigate after a delay for the landing page
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Set 2-second delay

    return () => clearTimeout(timer); // Clean up the timer
  }, []);

  return (
    <NavigationContainer>
<<<<<<< HEAD
<<<<<<< HEAD
      <Stack.Navigator initialRouteName={isLoading ? 'Landing' : 'LoadingDrawer'} screenOptions={{ headerShown: false }}>
        {/* Landing Screen */}
        <Stack.Screen name="Landing" component={Landing} />

        {/* Loading Screens */}
        <Stack.Screen name="LoadingDrawer" component={LoadingDrawer} />

        {/* Registration Flow */}
        <Stack.Screen name="Email" component={EmailScreen} />
=======
      <Stack.Navigator initialRouteName="LoginScreen">
=======


        <Stack.Navigator initialRouteName="LoginScreen">
>>>>>>> b6897e0c166e38dcc801765204eb7b10bbe1f9f7
        <Stack.Screen name="Landing" component={Landing}  options={{ headerShown: false }}/>
        <Stack.Screen name="Loading1" component={Loading1}  options={{ headerShown: false }}/>
        <Stack.Screen name="Loading2" component={Loading2}  options={{ headerShown: false }}/>
        <Stack.Screen name="Loading3" component={Loading3} options ={{ headerShown: false }}/>
        <Stack.Screen name="Loading4" component={Loading4} options={{ headerShown: false }}/>
<<<<<<< HEAD
        <Stack.Screen name="Email" component= { EmailScreen } />
>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d
        <Stack.Screen name="PasswordScreen" component={PasswordScreen} />
        <Stack.Screen name="NameScreen" component={NameScreen} />
        <Stack.Screen name="AgeScreen" component={AgeScreen} />
        <Stack.Screen name="HeightScreen" component={HeightScreen} />
        <Stack.Screen name="WeightScreen" component={WeightScreen} />
        <Stack.Screen name="GoalScreen" component={GoalScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword1" component={ForgotPassword1} />
        <Stack.Screen name="ForgotPassword2" component={ForgotPassword2} />
        <Stack.Screen name="ForgotPassword3" component={ForgotPassword3} />
=======
        <Stack.Screen name="Email" component= { EmailScreen } options={{ headerShown: false }} />
        <Stack.Screen name="PasswordScreen" component={PasswordScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="NameScreen" component={NameScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="AgeScreen" component={AgeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="HeightScreen" component={HeightScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="WeightScreen" component={WeightScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="GoalScreen" component={GoalScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ForgotPassword1" component={ForgotPassword1} options={{ headerShown: false }}/>
        <Stack.Screen name="ForgotPassword2" component={ForgotPassword2} options={{ headerShown: false }}/>
        <Stack.Screen name="ForgotPassword3" component={ForgotPassword3} options={{ headerShown: false }}/>
>>>>>>> b6897e0c166e38dcc801765204eb7b10bbe1f9f7


        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }}/>
        <Stack.Screen name="Workout" component={Workout} options={{ headerShown: false }}/>
        <Stack.Screen name="Exercises" component={Exercises} options={{ headerShown: false }}/>
        <Stack.Screen name="ExeDetails" component={ExeDetails} options={{ headerShown: false }}/>
        <Stack.Screen name="RepsAndSets" component={RepsAndSets} options={{ headerShown: false }}/>
        <Stack.Screen name="CreateLibrary" component={CreateLibrary} options={{ headerShown: false }}/>
        <Stack.Screen name="LibraryDetails" component={LibraryDetails} options={{ headerShown: false}}/>
        <Stack.Screen name="SetExerciseLibrary" component={SetExerciseLibrary} options={{ headerShown:false}}/>

        <Stack.Screen name="LandNutri" component={LandNutri} options={{ headerShown: false }}/>
        <Stack.Screen name="MealSugg" component={MealSugg} options={{ headerShown: false }}/>
        <Stack.Screen name="Nutrichoices" component={Nutrichoices} options={{ headerShown: false }}/>
        <Stack.Screen name="MealDetails" component={MealDetails} options={{ headerShown: false }}/>


        <Stack.Screen name="Notification" component={Notification} options={{ headerShown: false}}/>


      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

// Styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#232323',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E2F163',
  },
});
