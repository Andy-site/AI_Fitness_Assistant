import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  VirtualizedList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DateTimePicker from '@react-native-community/datetimepicker';
import notifee, {
  AndroidImportance,
  TriggerType,
  EventType,
} from '@notifee/react-native';
import { NotificationContext } from '../../components/NotificationContext';
import { fetchMealPlan, saveMealPlanToBackend, bulkUpdateMealConsumedStatus, fetchBackendMeals } from '../../api/fithubApi';
import { ToastAndroid } from 'react-native';

const { width } = Dimensions.get('window');

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('User pressed the notification in the background', detail.notification);
  }
  return Promise.resolve();
});

const MealDetails = ({ route }) => {
  const { macronutrients, mealPlan: initialMealPlan, dietaryRestriction, fetchedFromAPI: isFromAPI = false } = route.params;
const [fetchedFromAPI, setFetchedFromAPI] = useState(isFromAPI);

  const [mealPlan, setMealPlan] = useState(initialMealPlan);
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [reminderDate, setReminderDate] = useState('Today');
  const pickerKey = useRef(0);
 

  const { addNotification } = useContext(NotificationContext);

  const triggerNotification = async (MealName, alarmTimeDisplay, newSelectedTime) => {
    try {
      const now = new Date();
      if (newSelectedTime <= now) {
        Alert.alert('Invalid Time', 'Selected time must be in the future.');
        return;
      }

      await notifee.createTriggerNotification(
        {
          title: 'Meal Reminder',
          body: `It's time for you ${MealName}, Enjoy your meal!`,
          android: {
            channelId: 'meal-reminders',
            importance: AndroidImportance.HIGH,
            sound: 'alarm',
            vibrationPattern: [500, 1000],
          },
          ios: {
            categoryId: 'meal-reminder',
            sound: 'alarm.wav',
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: newSelectedTime.getTime(),
        }
      );

      addNotification(MealName, alarmTimeDisplay, reminderDate);
      Alert.alert('Reminder Set', `Your alarm is set for ${alarmTimeDisplay}`);
    } catch (error) {
      Alert.alert('Notification Error', 'Failed to set reminder: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchAndSetMeals = async () => {
      try {
        const backendMeals = await fetchBackendMeals();
        const updatedMealPlan = backendMeals.map(meal => ({
          meal: meal.meal,
          suggestions: meal.suggestions || [{
            name: meal.name || 'Unknown Meal',
            ingredients: meal.ingredients || [],
            calories: meal.calories || 0
          }],
          is_consumed: meal.is_consumed,
          dietary_restriction: meal.dietary_restriction,
          id: meal.id,
        }));
  
        setMealPlan(updatedMealPlan);
        setFetchedFromAPI(false); // backend source
        console.log('Synced backend meals:', JSON.stringify(updatedMealPlan, null, 2));
      } catch (error) {
        console.error('Error syncing backend meals:', error);
        Alert.alert('Error', 'Failed to load backend meals.');
      }
    };
  
    fetchAndSetMeals();
  }, []);
  
  
  

  useEffect(() => {
    const updateConsumedStatusForToday = async () => {
      try {
        const today = new Date();
        const todayDate = today.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
  
        // Fetch meal plans for today from the backend
        const response = await fetchMealPlan();
        const fetchedMealPlan = (response?.data || []).map((meal) => ({
          id: meal.id,
          meal: meal.meal,
          suggestions: meal.suggestions || [],
          is_consumed: meal.is_consumed,
          created_at: meal.created_at,
        }));
  
        // Filter meals for today
        const todayMeals = fetchedMealPlan.filter((meal) => {
          const mealDate = meal.created_at?.split('T')[0]; // Extract date from created_at
          return mealDate === todayDate;
        });
  
        // Match meal names and mark as consumed
        const updates = todayMeals.map((meal) => ({
          id: meal.id,
          is_consumed: true, // Mark as consumed
        }));
  
        // Send updates to the backend
        if (updates.length > 0) {
          await bulkUpdateMealConsumedStatus(updates);
          console.log('Updated consumed status for today\'s meals:', updates);
  
          // Update the local state
          const updatedMealPlan = mealPlan.map((meal) => {
            const matchedMeal = updates.find((update) => update.id === meal.id);
            if (matchedMeal) {
              return { ...meal, is_consumed: true };
            }
            return meal;
          });
  
          setMealPlan(updatedMealPlan);
          console.log('Updated Meal Plan:', JSON.stringify(updatedMealPlan, null, 2));
        }
      } catch (error) {
        console.error('Error updating consumed status for today\'s meals:', error.message);
        Alert.alert('Error', 'Failed to update consumed status for today\'s meals.');
      }
    };
  
    updateConsumedStatusForToday();
  }, []);

  
  
  const toggleConsumedStatus = async (index) => {
    const updatedMealPlan = [...mealPlan];
    const meal = updatedMealPlan[index];
  
    // Ensure the meal has an id
    if (!meal.id) {
      Alert.alert('Error', 'Meal ID is missing. Cannot update status.');
      return;
    }
  
    // Toggle the status locally
    meal.is_consumed = !meal.is_consumed;
  
    try {
      // Save the updated meal plan to the backend first
      await saveMealPlanToBackend(updatedMealPlan);
  
      // Make an API call to update the backend
      await bulkUpdateMealConsumedStatus([{ id: meal.id, is_consumed: meal.is_consumed }]);
  
      // Update the local state only after a successful API call
      setMealPlan(updatedMealPlan);
  
    } catch (error) {
      // Revert the change locally if the API call fails
      meal.is_consumed = !meal.is_consumed;
      Alert.alert('Error', 'Failed to update meal status in the backend.');
    }
  };

  useEffect(() => {
    const saveMealPlan = async () => {
      try {
        if (fetchedFromAPI) {
          console.log('Saving newly generated meal plan to backend...');
          await saveMealPlanToBackend(mealPlan);
        } else {
          console.log('Meal plan fetched from backend — skipping save.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to save meal plan: ' + error.message);
      }
    };
  
    saveMealPlan();
  }, [mealPlan, fetchedFromAPI]);
  
  
  useEffect(() => {
    async function setupNotifications() {
      try {
        const settings = await notifee.requestPermission();
        if (settings.authorizationStatus !== 1) {
          Alert.alert(
            'Notification Permission Required',
            'Please enable notifications in settings to receive meal reminders.'
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
              actions: [{ id: 'view', title: 'View' }],
            },
          ]);
        }
        return true;
      } catch (error) {
        console.error('Error setting up notifications:', error);
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

    return () => unsubscribe();
  }, []);

  const renderMealPage = (meal, index) => {
  const suggestions = Array.isArray(meal.suggestions) ? meal.suggestions : [];

  return (
    <View style={styles.mealPage} key={meal.id || index}>
      <View style={styles.mealContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.mealTitle}>{meal.meal}</Text>
          <View style={styles.reminderContainer}>
            <TouchableOpacity
              style={styles.notifyButton}
              onPress={() => setShowPicker(true)}
            >
              <Icon name="clock-o" size={20} color="#000" />
              <Text style={styles.notifyButtonText}>Reminder</Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                key={pickerKey.current}
                mode="time"
                display="default"
                value={selectedTime}
                onChange={(event, selectedDate) => {
                  if (event.type === 'dismissed') {
                    setShowPicker(false);
                    return;
                  }

                  const now = new Date();
                  const targetDate = new Date(selectedDate);
                  targetDate.setFullYear(now.getFullYear());
                  targetDate.setMonth(now.getMonth());
                  targetDate.setDate(now.getDate());

                  setSelectedTime(targetDate);
                  pickerKey.current += 1;

                  const currentMeal = mealPlan[activeMealIndex];
                  const alarmTimeDisplay = `Today at ${targetDate.toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}`;

                  triggerNotification(currentMeal.meal, alarmTimeDisplay, targetDate);
                  setShowPicker(false);
                }}
              />
            )}
          </View>
        </View>

        {suggestions.length > 0 ? (
          <VirtualizedList
            data={suggestions}
            keyExtractor={(suggestion, i) => suggestion.id || i.toString()}
            renderItem={({ item: suggestion }) => (
              <View style={styles.suggestionContainer}>
                <View style={styles.suggestionRow}>
                  <Text style={styles.suggestionText}>{suggestion.name}</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      meal.is_consumed ? styles.toggleButtonActive : {},
                    ]}
                    onPress={() => {
                      toggleConsumedStatus(index);

                      ToastAndroid.show(
                        `${meal.name || 'Meal'} marked as ${meal.is_consumed ? 'Consumed' : 'Not Consumed'}`,
                        ToastAndroid.SHORT
                      );
                    }}
                  >
                    <Icon
                      name={meal.is_consumed ? 'check-circle' : 'circle-o'}
                      size={20}
                      color={meal.is_consumed ? '#000' : '#000'}
                    />
                    <Text style={styles.toggleButtonText}>
                      {meal.is_consumed ? 'Consumed' : 'Not Consumed'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.ingredientTitle}>Ingredients:</Text>
                {suggestion.ingredients.map((ingredient, i) => (
                  <Text key={i} style={styles.ingredientText}>
                    - {ingredient}
                  </Text>
                ))}
                <View style={styles.calorieContainer}>
                  <Icon name="fire" size={18} color="red" />
                  <Text style={styles.calorieText}>{suggestion.calories} cal</Text>
                </View>
              </View>
            )}
            getItemCount={() => suggestions.length}
            getItem={(data, index) => data[index]}
          />
        ) : (
          <Text style={{ padding: 10, fontStyle: 'italic' }}>No meal suggestions available.</Text>
        )}
      </View>
    </View>
  );
};


  return (
    <View style={styles.outerContainer}>
      <Header title="Meal Plan" />
      <View style={styles.innercontainer}>
        <View style={styles.macronutrientCard}>
          <Text style={styles.sectionTitle1}>Macronutrient</Text>
          <View style={styles.container}>
            <Text style={styles.text}>Carbohydrates: {macronutrients?.carbohydrates || '50%'}</Text>
            <Text style={styles.text}>Proteins: {macronutrients?.proteins|| '30%'}</Text>
            <Text style={styles.text}>Fats: {macronutrients?.fats||'20%'}</Text>
          </View>
        </View>

        <View style={styles.rowSlider}>
          <Text style={styles.sectionTitle}>Your Meal Plan</Text>
          
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            if (newIndex >= 0 && newIndex < mealPlan.length) {
              setActiveMealIndex(newIndex);
            }
          }}
        >
          {mealPlan.map((meal, index) => renderMealPage(meal, index))}
        </ScrollView>

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
  outerContainer: { flex: 1, backgroundColor: '#222' },
  innercontainer: { flex: 1, marginTop: 60, padding: 15, marginBottom: 40 },
  macronutrientCard: { padding: 10, backgroundColor: '#B3A0FF', marginBottom: 20 },
  sectionTitle1: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#fff', textAlign: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#fff', textAlign: 'center' },
  rowSlider: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  bulkUpdateButton: { backgroundColor: '#e2f163', padding: 10, width: '40%', borderRadius: 5, alignItems: 'center' },
  bulkUpdateButtonText: { color: '#000', fontSize: 16 },
  container: { backgroundColor: '#eef5ff', padding: 10, borderRadius: 10, marginBottom: 10 },
  text: { fontSize: 16, color: '#000', marginBottom: 5, fontWeight: '500' },
  mealPage: { width: width - 40, paddingRight: 10 },
  mealContainer: { flex: 1, padding: 20, backgroundColor: '#B3A0FF' },
  titleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  mealTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  reminderContainer: { flexDirection: 'row', alignItems: 'center' },
  notifyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2f163', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  notifyButtonText: { marginLeft: 5, fontSize: 14, color: '#000' },
  suggestionContainer: { marginBottom: 10, padding: 10, backgroundColor: '#eef5ff', borderRadius: 8 },
  suggestionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  suggestionText: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
  toggleButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, borderWidth: 1, borderColor: '#000' },
  toggleButtonActive: { backgroundColor: '#e2f163', borderColor: '#000' },
  toggleButtonText: { marginLeft: 5, fontSize: 14, color: '#000' },
  ingredientTitle: { fontSize: 15, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  ingredientText: { fontSize: 14, marginLeft: 10, color: '#555', marginTop: 3 },
  calorieContainer: { flexDirection: 'row', marginTop: 5, alignItems: 'flex-end', alignSelf: 'flex-end' },
  calorieText: { fontSize: 14, marginLeft: 5, color: 'red' },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 15, marginBottom: 15 },
  paginationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#555', marginHorizontal: 5 },
  paginationDotActive: { backgroundColor: '#e2f163', width: 12, height: 12, borderRadius: 6 },
});

export default MealDetails;
