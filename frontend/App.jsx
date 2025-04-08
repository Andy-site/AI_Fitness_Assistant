import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { NotificationProvider } from './src/components/NotificationContext';
import Toast from 'react-native-toast-message'; // Import Toast component

const App = () => {
  return (
    <NotificationProvider>
      <AppNavigator />
      <Toast /> 
    </NotificationProvider>
  );
};

export default App;
