import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { NotificationProvider } from './src/components/NotificationCOntext'; // Ensure the correct path

const App = () => {
  return (
    <NotificationProvider>
      <AppNavigator />
    </NotificationProvider>
  );
};

export default App;
