// File: components/NotificationContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Load notifications from storage when app starts
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem('notifications');
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  // Save notifications to storage whenever they change
  useEffect(() => {
    const saveNotifications = async () => {
      try {
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      } catch (error) {
        console.error('Error saving notifications:', error);
      }
    };

    saveNotifications();
  }, [notifications]);

  // Add a new notification
  const addNotification = (mealName, time, date) => {
    const newNotification = {
      id: Date.now().toString(),
      message: `Don't forget to try: ${mealName}`,
      time: `${date} at ${time}`,
      timestamp: new Date().getTime(),
    };

    setNotifications(prevNotifications => [...prevNotifications, newNotification]);
  };

  // Clear a notification by ID
  const removeNotification = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        removeNotification 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};