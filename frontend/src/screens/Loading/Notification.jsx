import React, { useContext, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { NotificationContext } from '../../components/NotificationContext';
import Icon from 'react-native-vector-icons/Ionicons'; // Make sure to install react-native-vector-icons

const Notification = ({ navigation }) => {
  const { notifications, markAsRead, removeNotification } = useContext(NotificationContext);

  // Filter unique notifications based on date and time
  const uniqueNotifications = Array.from(
    new Map(notifications.map(item => [`${item.time}`, item])).values()
  );

  // Cleanup when the component unmounts
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      console.log('Navigating away from Notification page');
    });

    return unsubscribe;
  }, [navigation]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'reminder':
        return <Icon name="alarm-outline" size={24} color="#896CFE" />;
      case 'achievement':
        return <Icon name="trophy-outline" size={24} color="#FFB347" />;
      case 'workout':
        return <Icon name="fitness-outline" size={24} color="#4CAF50" />;
      case 'alert':
        return <Icon name="alert-circle-outline" size={24} color="#F44336" />;
      default:
        return <Icon name="notifications-outline" size={24} color="#896CFE" />;
    }
  };

  const renderNotificationItems = () => {
    return uniqueNotifications.map((item) => (
      <TouchableOpacity 
        key={item.id}
        style={[styles.notificationItem, !item.read && styles.unreadNotification]}
        onPress={() => markAsRead && markAsRead(item.id)}
      >
        <View style={styles.iconContainer}>
          {getNotificationIcon(item.type || 'default')}
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.notificationText}>{item.message}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => removeNotification && removeNotification(item.id)}
        >
          <Icon name="close-circle" size={22} color="#DDD" />
        </TouchableOpacity>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {uniqueNotifications.length > 0 && (
          <TouchableOpacity>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {uniqueNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="notifications-off-outline" size={70} color="#444" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>We'll notify you when something new arrives</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderNotificationItems()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 20,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    marginBottom: 10
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#FFF',
    letterSpacing: 0.5,
  },
  clearAllText: {
    color: '#896CFE',
    fontSize: 14,
    fontWeight: '600'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: { 
    color: '#FFF', 
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20
  },
  emptySubtext: {
    color: '#777',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center'
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notificationItem: { 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 12, 
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#896CFE',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  contentContainer: {
    flex: 1,
  },
  notificationText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#222', 
    marginBottom: 6,
  },
  timeText: { 
    fontSize: 13, 
    color: '#777', 
    fontWeight: '400',
  },
  deleteButton: {
    padding: 5,
    fontsize: 12,
    fontWeight: '600',
    color: '#999',
    position: 'absolute',
    top: 5,
    right: 5,
  }
});

export default Notification;