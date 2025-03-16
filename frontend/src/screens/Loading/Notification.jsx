import React, { useContext, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { NotificationContext } from '../../components/NotificationContext';

const Notification = ({ navigation }) => {
  const { notifications } = useContext(NotificationContext);

  // Filter unique notifications based on date and time
  const uniqueNotifications = Array.from(
    new Map(notifications.map(item => [`${item.time}`, item])).values()
  );

  // Cleanup when the component unmounts
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      // You can handle cleanup here or reset state if necessary
      console.log('Navigating away from Notification page');
    });

    // Cleanup the listener when the component unmounts
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.innerContainer}>
      
      {uniqueNotifications.length === 0 ? (
        <Text style={styles.emptyText}>No reminders set.</Text>
      ) : (
        <FlatList
          data={uniqueNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationItem}>
              <Text style={styles.notificationText}>{item.message}</Text>
              <Text style={styles.timeText}>{item.time}</Text>
              
            </View>
          )}
        />
      )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 15, 
    backgroundColor: '#1a1a1a', // Dark background for gym app feel
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#896CFE',  // Highlight color from your gym theme
    textAlign: 'center', 
    marginBottom: 20 
  },
  emptyText: { 
    color: '#fff', 
    textAlign: 'center', 
    marginTop: 20, 
    fontSize: 16 
  },
  notificationItem: { 
    backgroundColor: '#2E2E2E', // Dark card for notification items 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#3A3A3A',
  },
  notificationText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#fff', 
    textAlign: 'center' 
  },
  timeText: { 
    fontSize: 14, 
    color: '#bbb', 
    textAlign: 'center', 
    marginTop: 5 
  },
});

export default Notification;
