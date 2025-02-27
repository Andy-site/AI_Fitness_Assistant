import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Animated, 
         Dimensions, ScrollView, Alert, TextInput, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DateTimePicker from '@react-native-community/datetimepicker';
import notifee, { AndroidImportance, TimestampTrigger, TriggerType } from '@notifee/react-native';
import { NotificationContext } from '../../components/NotificationContext';

const { width } = Dimensions.get('window');

const MealDetails = ({ route }) => {
  const { macronutrients, mealPlan } = route.params;
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const [alarmTime, setAlarmTime] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [reminderDate, setReminderDate] = useState('Today');
  
  // Get the notification context
  const { addNotification } = useContext(NotificationContext);

  const triggerNotification = async (MealName, alarmTimeDisplay) => {
    try {
        console.log("🚀 Trigger Notification Function Called");
        await notifee.requestPermission();
  
        const now = new Date();
        let targetDate = new Date(selectedTime);
  
        // Ensure targetDate is set to the correct local time with today's date
        targetDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
        targetDate.setSeconds(0, 0); // Reset seconds and milliseconds for comparison
  
        // Log the selected time and current time in the same local format
        console.log("📅 Selected Time (Corrected):", targetDate.toLocaleString());
        console.log("⏰ Current Time (Now):", now.toLocaleString());
  
        // Compare the selected time with the current time, adjusting for possible time zone issues
        if (targetDate.getTime() <= now.getTime()) {
            console.error("⛔ Invalid Time: Selected time must be in the future!");
            Alert.alert("Invalid Time", "Selected time must be in the future!");
            return;
        }
  
        targetDate.setSeconds(targetDate.getSeconds() + 5);  // Add a small buffer before triggering the alarm
        console.log("🔔 Scheduling Notification at:", targetDate.toLocaleString());
  
        await notifee.createTriggerNotification(
            {
                title: 'Meal Reminder',
                body: `Don't forget to try: ${MealName}`,
                android: {
                    channelId: 'meal-reminders',
                    importance: AndroidImportance.HIGH,
                    sound: 'alarm',
                    largeIcon: 'ic_launcher',
                    smallIcon: 'ic_notification',
                },
                ios: {
                    categoryId: 'meal-reminder',
                    sound: 'default',
                },
            },
            {
                type: TriggerType.TIMESTAMP,
                timestamp: targetDate.getTime(),
            }
        );
  
        console.log("✅ Notification successfully scheduled.");
        Alert.alert("Reminder Set", `Your alarm is set for ${alarmTimeDisplay}`);
    } catch (error) {
        console.error("🔥 Error setting notification:", error);
        Alert.alert("Notification Error", "Failed to set reminder: " + error.message);
    }
  };
  


useEffect(() => {
  async function setupNotifications() {
    try {
      console.log("🔄 Setting up notification permissions...");
      const permissionStatus = await notifee.requestPermission();

      if (permissionStatus.authorizationStatus === 0) {
        Alert.alert(
          "Notification Permission Required",
          "Please enable notifications in settings to receive meal reminders."
        );
        return;
      }

      console.log("✅ Notification permissions granted.");

      await notifee.createChannel({
        id: 'meal-reminders',
        name: 'Meal Reminders',
        sound: 'alarm',
        importance: AndroidImportance.HIGH,
      });

      console.log("📢 Notification channel created.");

      if (Platform.OS === 'ios') {
        await notifee.setNotificationCategories([
          {
            id: 'meal-reminder',
            actions: [{ id: 'view', title: 'View' }],
          },
        ]);
        console.log("🍏 iOS notification categories set.");
      }
    } catch (error) {
      console.error("⛔ Error setting up notifications:", error);
    }
  }

  setupNotifications();
}, []);


  const renderMealPage = (meal, index) => {
    return (
      <View style={styles.mealPage} key={index}>
        <View style={styles.mealContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.mealTitle}>{meal.meal}</Text>
            <View style={styles.reminderContainer}>
              <TouchableOpacity style={styles.notifyButton} onPress={() => setShowPicker(true)}>
                <Icon name="clock-o" size={20} color="#000" />
                <Text style={styles.notifyButtonText}>Set Reminder</Text>
              </TouchableOpacity>

              {alarmTime && (
                <View style={styles.timeDisplayContainer}>
                  <Text style={styles.timeDisplayText}>Reminder: {reminderDate} at {alarmTime}</Text>
                </View>
              )}

              {showPicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowPicker(false);
                    if (selectedDate) {
                      console.log("📅 Selected Date (Before Correction):", selectedDate.toISOString());
                      const now = new Date();
                      let targetDate = new Date(selectedDate);
                      targetDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
                      targetDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
                      
                      console.log("📅 Selected Date (Corrected):", targetDate.toISOString());

                      if (targetDate.getTime() < now.getTime()) {
                        console.error("⛔ Invalid Time: Selected time has already passed today!");
                        Alert.alert("Invalid Time", "Selected time has already passed today!");
                        return;
                      }

                      setReminderDate('Today');
                      const formattedTime = targetDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                      setAlarmTime(formattedTime);
                      console.log("⏰ Alarm set for:", formattedTime);

                      const currentMeal = mealPlan[activeMealIndex];
                      triggerNotification(currentMeal.meal, `Today at ${formattedTime}`);
                      setSelectedTime(targetDate);
                    }
                  }}
                />
              )}
            </View>
          </View>

          <FlatList
            data={meal.suggestions}
            keyExtractor={(suggestion, i) => i.toString()}
            renderItem={({ item: suggestion }) => (
              <View style={styles.suggestionContainer}>
                <Text style={styles.suggestionText}>{suggestion.name}</Text>
                <Text style={styles.ingredientTitle}>Ingredients:</Text>
                {suggestion.ingredients.map((ingredient, i) => (
                  <Text key={i} style={styles.ingredientText}>- {ingredient}</Text>
                ))}
                <View style={styles.calorieContainer}>
                  <Icon name="fire" size={18} color="red" />
                  <Text style={styles.calorieText}>{suggestion.calories} cal</Text>
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
          <View style ={styles.container}>
            <Text style={styles.text}>Carbohydrates: {macronutrients?.carbohydrates}</Text>
            <Text style={styles.text}>Proteins: {macronutrients?.proteins}</Text>
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
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            setActiveMealIndex(newIndex);
          }}
        >
          {mealPlan.map((meal, index) => renderMealPage(meal, index))}
        </ScrollView>

        {/* Page Indicator Dots */}
        <View style={styles.paginationContainer}>
          {mealPlan.map((_, index) => (
            <View
              key={index}
              style={[styles.paginationDot, index === activeMealIndex ? styles.paginationDotActive : {}]}
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
  timeDisplayContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  timeDisplayText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
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
    shadowOffset: { width: 0, height: 2 },
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
