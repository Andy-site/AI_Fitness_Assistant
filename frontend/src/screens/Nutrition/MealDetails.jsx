import React, { useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView, Alert, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import PushNotification from 'react-native-push-notification';  // Import the notification library
import Header from '../../components/Header';  // Adjust path if necessary
import Footer from '../../components/Footer';  // Adjust path if necessary
import DateTimePicker from '@react-native-community/datetimepicker';  // Import the date picker

const { width } = Dimensions.get('window');

const MealDetails = ({ route }) => {
  const { macronutrients, mealPlan } = route.params;
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const [alarmTime, setAlarmTime] = useState('');
  const [isAm, setIsAm] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Function to trigger a notification
  const triggerNotification = (MealName, alarmTime) => {
    const currentTime = new Date().toLocaleTimeString();

    PushNotification.localNotificationSchedule({
      title: "Meal Suggestion",
      message: `Don't forget to try: ${MealName}`,
      date: new Date(Date.now() + 1000 * 10), // Schedule for 10 seconds from now
      playSound: true,
      soundName: 'Alarm.wav', // Alarm sound
      priority: 'high',
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      vibrate: true,
      vibration: 300,
    });

    Alert.alert("Reminder Set", `Your alarm is set for ${alarmTime}. Current time is: ${currentTime}`);
  };

  // Render individual meal page
  const renderMealPage = (meal, index) => {
    return (
      <View style={styles.mealPage} key={index}>
        <View style={styles.mealContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.mealTitle}>{meal.meal}</Text>
            <View style={styles.reminderContainer}>
              {/* Time picker button */}
              <TouchableOpacity
                style={styles.notifyButton}
                onPress={() => setShowPicker(true)} // Show the date picker when clicked
              >
                <Icon name="clock-o" size={20} color="#000" />
                <Text style={styles.notifyButtonText}>Set Reminder</Text>
              </TouchableOpacity>
              {/* DateTimePicker */}
              {showPicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowPicker(false); // Hide picker after selection
                    if (selectedDate) {
                      setSelectedTime(selectedDate); // Update time when selected
                      setAlarmTime(selectedDate.toLocaleTimeString()); // Set alarm time in hh:mm format
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
              <Animated.View 
                style={styles.suggestionContainer}
                entering={Animated.FadeInRight}
              >
                <Text style={styles.suggestionText}>
                   {suggestion.name}
                </Text> 
                
                <View
                  style={{
                    borderBottomColor: 'black',
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  }}
                />
                {/* Ingredients List */}
                <Text style={styles.ingredientTitle}>Ingredients:</Text>
                {suggestion.ingredients.map((ingredient, i) => (
                  <Text key={i} style={styles.ingredientText}>
                    - {ingredient}
                  </Text>
                ))}
                {/* Calories with Icon */}
                <View style={styles.calorieContainer}>
                  <Icon name="fire" size={18} color="red" />
                  <Text style={styles.calorieText}>{suggestion.calories} cal</Text>
                </View>
              </Animated.View>
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
