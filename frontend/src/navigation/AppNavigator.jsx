
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet } from 'react-native';

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
      <Stack.Navigator initialRouteName={isLoading ? 'Landing' : 'LoadingDrawer'} screenOptions={{ headerShown: false }}>
        {/* Landing Screen */}
        <Stack.Screen name="Landing" component={Landing} />

        {/* Loading Screens */}
        <Stack.Screen name="LoadingDrawer" component={LoadingDrawer} />

        {/* Registration Flow */}
        <Stack.Screen name="Email" component={EmailScreen} />
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
