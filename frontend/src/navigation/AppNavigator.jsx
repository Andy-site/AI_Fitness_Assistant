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

import HomeScreen from '../screens/HomeAndLogin/HomeScreen';
import ForgotPassword1 from '../screens/Login/ForgotPassword1';
import ForgotPassword2 from '../screens/Login/ForgotPassword2';
import ForgotPassword3 from '../screens/Login/ForgotPassword3';

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
        <Stack.Screen name="Email" component= { EmailScreen } />
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


        <Stack.Screen name="Home" component={HomeScreen} />


      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
