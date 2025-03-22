// File: components/NotificationContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee from '@notifee/react-native';


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
  
  // Save notifications whenever they change
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

  // Remove expired notifications automatically
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.timestamp > currentTime)
      );
    }, 60000); // Checks every 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Add a new notification (Only unique reminders)
  const addNotification = async (mealName, time, date) => {
    const notificationId = Date.now().toString(); // Unique ID
  
    // Convert the date and time to a timestamp
    const notificationTime = new Date(`${date} ${time}`).getTime();
    const currentTime = new Date().getTime();
  
    if (notificationTime <= currentTime) {
      console.error("Cannot schedule a notification for a past time.");
      return;
    }
  
    const newNotification = {
      id: notificationId, 
      message: `Don't forget to try: ${mealName}`,
      time: `${date} at ${time}`,
      timestamp: notificationTime,
    };
    console.log(newNotification);
  
    setNotifications(prevNotifications => {
      const isDuplicate = prevNotifications.some(
        notification => notification.message === newNotification.message && notification.time === newNotification.time
      );
      return isDuplicate ? prevNotifications : [...prevNotifications, newNotification];
    });
  
    // 🔔 Schedule Notification with Notifee
    await notifee.createTriggerNotification(
      {
        id: notificationId, // Same ID as AsyncStorage
        title: 'Meal Reminder',
        body: newNotification.message,
        android: {
          channelId: 'meal-reminders',
          pressAction: {
            id: 'default',
          },
        },
      },
      {
        type: notifee.TriggerType.TIMESTAMP,
        timestamp: notificationTime, // 
      }
    );
    console.log(`🎉 Notification (ID: ${notificationId}) scheduled successfully!`);
  };
  
  

  // Clear a notification by ID
  const removeNotification = async (id) => {
    try {
      console.log(`Removing notification with ID: ${id}`);
      
      // Cancel the Notifee notification
      await notifee.cancelNotification(id);
  
      // Remove from local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
    } catch (error) {
      console.error('Error removing notification:', error);
    }
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
