import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import EmailScreen from '../screens/EmailScreen';
import PasswordScreen from '../screens/PasswordScreen';
import NameScreen from '../screens/NameScreen';
import AgeScreen from '../screens/AgeScreen';
import HeightScreen from '../screens/HeightScreen';
import WeightScreen from '../screens/WeightScreen';
import GoalScreen from '../screens/GoalScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="EmailScreen">
        <Stack.Screen name="EmailScreen" component={EmailScreen} />
        <Stack.Screen name="PasswordScreen" component={PasswordScreen} />
        <Stack.Screen name="NameScreen" component={NameScreen} />
        <Stack.Screen name="AgeScreen" component={AgeScreen} />
        <Stack.Screen name="HeightScreen" component={HeightScreen} />
        <Stack.Screen name="WeightScreen" component={WeightScreen} />
        <Stack.Screen name="GoalScreen" component={GoalScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
