import React, {useState, useRef, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  TextInput,
  Platform,

} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DateTimePicker from '@react-native-community/datetimepicker';
import notifee, {
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
  EventType,  // Add this
} from '@notifee/react-native';
import {NotificationContext} from '../../components/NotificationContext';

const {width} = Dimensions.get('window');

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    // User pressed the notification
    console.log('User pressed the notification in the background', detail.notification);
  }
  
  // Return a promise to ensure the background task stays alive until completed
  return Promise.resolve();
});
const MealDetails = ({route}) => {
  const {macronutrients, mealPlan} = route.params;
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const [alarmTime, setAlarmTime] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [reminderDate, setReminderDate] = useState('Today');

  // Get the notification context
  const {addNotification} = useContext(NotificationContext);

  const triggerNotification = async (MealName, alarmTimeDisplay) => {
    try {
      console.log(' Trigger Notification Function Called');
     
      // Create a trigger without TypeScript typing
      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: selectedTime.getTime(),
      };

      // Create the notification
      await notifee.createTriggerNotification(
        {
          title: 'Meal Reminder',
          body: `Its time for you ${MealName}, 
           Enjoy your meal!!`,
          android: {
            channelId: 'meal-reminders',
            importance: AndroidImportance.HIGH,
            sound: 'default',
            vibrationPattern: [500, 1000],
          },
          ios: {
            categoryId: 'meal-reminder',
            sound: 'default',
          },
        },
        trigger,
      );

      console.log(' Notification successfully scheduled.');
      Alert.alert('Reminder Set', `Your alarm is set for ${alarmTimeDisplay}`);
      
    } catch (error) {
      console.error(' Error setting notification:', error);
      Alert.alert(
        'Notification Error',
        'Failed to set reminder: ' + error.message,
      );
    }
  };

  // Keep notification setup only in useEffect, not in triggerNotification
  useEffect(() => {
    async function setupNotifications() {
      try {
        const settings = await notifee.requestPermission();
        if (settings.authorizationStatus !== 1) {
          // Use exact comparison
          Alert.alert(
            'Notification Permission Required',
            'Please enable notifications in settings to receive meal reminders.',
          );
          return false;
        }

        await notifee.createChannel({
          id: 'meal-reminders',
          name: 'Meal Reminders',
          sound: 'alarm',
          importance: AndroidImportance.HIGH,
        });

        if (Platform.OS === 'ios') {
          await notifee.setNotificationCategories([
            {
              id: 'meal-reminder',
              actions: [{id: 'view', title: 'View'}],
            },
          ]);
        }
        return true;
      } catch (error) {
        console.error(' Error setting up notifications:', error);
        return false;
      }
    }

    setupNotifications();

    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.PRESS:
          console.log('User pressed notification', detail.notification);
          break;
        case EventType.TRIGGER:
          console.log('Notification triggered', detail.notification);
          break;
        case EventType.DELIVERED:
          console.log('Notification delivered', detail.notification);
          break;
      }
    });

      return () => {
        unsubscribe();
      };
  }, []);

  const renderMealPage = (meal, index) => {
    return (
      <View style={styles.mealPage} key={index}>
        <View style={styles.mealContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.mealTitle}>{meal.meal}</Text>
            <View style={styles.reminderContainer}>
              <TouchableOpacity
                style={styles.notifyButton}
                onPress={() => setShowPicker(true)}>
                <Icon name="clock-o" size={20} color="#000" />
                <Text style={styles.notifyButtonText}>Set Reminder</Text>
              </TouchableOpacity>

                {showPicker && (
                <DateTimePicker
                mode="time"
                display="default"
                
                value={selectedTime}
                onChange={(event, selectedDate) => {
                  // Don't set showPicker to false immediately
                  // We'll handle it based on the action
                  // Get current time for comparison
                    const now = new Date();

                  if (event.type === "dismissed") {
                    // User canceled the picker
                    console.log(' User cancelled the time picker.');
                    setShowPicker(false);
                    return;
                  }

                  
              
                  // Clone the selected date
                  const targetDate = new Date(selectedDate);
              
                  // Set the date part to today
                  targetDate.setFullYear(now.getFullYear());
                  targetDate.setMonth(now.getMonth());
                  targetDate.setDate(now.getDate());
              
                  // Check if the time is in the past
                  if (targetDate <= now) {
                    setTimeout(() => {
                      Alert.alert(
                        'Invalid Time',
                        'Selected time must be in the future!',
                      );
                    }, 100);
                    setShowPicker(false); // Close picker on invalid time
                    return;
                  }
              
                  // Format time for display
                  const formattedTime = targetDate.toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  });
              
                  setAlarmTime(formattedTime);
                  setSelectedTime(targetDate);
              
                  const currentMeal = mealPlan[activeMealIndex];
                  triggerNotification(
                    currentMeal.meal,
                    `Today at ${formattedTime}`,
                  );
                  
                  // Now close the picker after everything is done
                  setShowPicker(false);
                }}
              />
              )}
            </View>
          </View>

          <FlatList
            data={meal.suggestions}
            keyExtractor={(suggestion, i) => i.toString()}
            renderItem={({item: suggestion}) => (
              <View style={styles.suggestionContainer}>
                <Text style={styles.suggestionText}>{suggestion.name}</Text>
                <Text style={styles.ingredientTitle}>Ingredients:</Text>
                {suggestion.ingredients.map((ingredient, i) => (
                  <Text key={i} style={styles.ingredientText}>
                    - {ingredient}
                  </Text>
                ))}
                <View style={styles.calorieContainer}>
                  <Icon name="fire" size={18} color="red" />
                  <Text style={styles.calorieText}>
                    {suggestion.calories} cal
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <Header title="Meal Plan" />
      <View style={styles.innercontainer}>
        {/* Macronutrients Overview */}
        <View style={styles.macronutrientCard}>
          <Text style={styles.sectionTitle1}>Macronutrient</Text>
          <View style={styles.container}>
            <Text style={styles.text}>
              Carbohydrates: {macronutrients?.carbohydrates}
            </Text>
            <Text style={styles.text}>
              Proteins: {macronutrients?.proteins}
            </Text>
            <Text style={styles.text}>Fats: {macronutrients?.fats}</Text>
          </View>
        </View>

        {/* Horizontal Scrollable Meal Plan */}
        <Text style={styles.sectionTitle}>Your Meal Plan</Text>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={event => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.x / width,
            );
            setActiveMealIndex(newIndex);
          }}>
          {mealPlan.map((meal, index) => renderMealPage(meal, index))}
        </ScrollView>

        {/* Page Indicator Dots */}
        <View style={styles.paginationContainer}>
          {mealPlan.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeMealIndex ? styles.paginationDotActive : {},
              ]}
            />
          ))}
        </View>
      </View>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  innercontainer: {
    flex: 1,
    marginTop: 60,
    padding: 15,
    marginBottom: 40,
  },
  macronutrientCard: {
    padding: 10,
    backgroundColor: '#896cfe',
    marginBottom: 20,
  },
  sectionTitle1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    textAlign: 'center',
  },
  mealPage: {
    width: width - 40, // Account for container padding
    paddingRight: 10,
  },
  titleContainer: {
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Push the meal title to the left and button to the right
    alignItems: 'center', // Align items vertically centered
    marginBottom: 10,
    backgroundColor: '#896cfe',
  },
  mealContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#896cfe',
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  suggestionContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#eef5ff',
    borderRadius: 8,
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  ingredientTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  ingredientText: {
    marginTop: 3,
    fontSize: 14,
    marginLeft: 10,
    color: '#555',
  },

  calorieContainer: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },
  calorieText: {
    fontSize: 14,
    marginLeft: 5,
    color: 'red',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#555',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#e2f163',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  text: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
    fontWeight: '500',
  },
  container: {
    backgroundColor: '#eef5ff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
  },
  reminderContainer: {
    flexDirection: 'row', // Ensures icon and text are in a row
    alignItems: 'center', // Aligns items vertically centered
  },
  notifyButton: {
    flexDirection: 'row', // Arranges icon and text in a row
    alignItems: 'center',
    backgroundColor: '#e2f163',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  notifyButtonText: {
    marginLeft: 5, // Adds space between the icon and the text
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
});

export default MealDetails;
