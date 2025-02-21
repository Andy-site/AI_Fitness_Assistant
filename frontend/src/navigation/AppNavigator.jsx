import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
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




const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>


        <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="Landing" component={Landing}  options={{ headerShown: false }}/>
        <Stack.Screen name="Loading1" component={Loading1}  options={{ headerShown: false }}/>
        <Stack.Screen name="Loading2" component={Loading2}  options={{ headerShown: false }}/>
        <Stack.Screen name="Loading3" component={Loading3} options ={{ headerShown: false }}/>
        <Stack.Screen name="Loading4" component={Loading4} options={{ headerShown: false }}/>
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

        


      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
