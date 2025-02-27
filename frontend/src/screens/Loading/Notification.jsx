import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { NotificationContext } from '../../components/NotificationContext';

const Notification = () => {
  const { notifications } = useContext(NotificationContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meal Reminders</Text>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No reminders set.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationItem}>
              <Text style={styles.notificationText}>{item.message}</Text>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#000' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 },
  emptyText: { color: '#fff', textAlign: 'center', marginTop: 20 },
  notificationItem: { backgroundColor: '#eef5ff', padding: 10, borderRadius: 8, marginBottom: 10 },
  notificationText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  timeText: { fontSize: 14, color: '#555', textAlign: 'center', marginTop: 5 },
});

export default Notification;
