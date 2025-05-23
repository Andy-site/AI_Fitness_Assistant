import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {
  fetchWorkoutDates,
  fetchExerciseProgress,
  fetchBackendMealsInRange,
} from '../../api/fithubApi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { capitalizeWords } from '../../utils/StringUtils';

const WorkoutCalendar = () => {
  const [workoutDates, setWorkoutDates] = useState([]);
  const [mealDates, setMealDates] = useState([]);
  const [mealProgress, setMealProgress] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [exerciseProgress, setExerciseProgress] = useState({});

  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  };

  const loadMealsForMonth = async () => {
  const mealsByDate = {};
  const mealDateList = [];

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const today = new Date();
  const endDay = lastDay > today ? today : lastDay;

  const startDateStr = formatDate(firstDay);
  const endDateStr = formatDate(endDay);

  try {
    const rawMeals = await fetchBackendMealsInRange(startDateStr, endDateStr);

    console.log('📦 Raw meals fetched:', rawMeals);

    rawMeals.forEach((meal) => {
      if (!meal.is_consumed) return;

      // Extract date safely
      const createdAt = meal.created_at || '';
      const date = createdAt.includes('T') ? createdAt.split('T')[0] : null;

      if (!date) {
        console.warn('⚠️ Meal missing or invalid created_at:', meal);
        return;
      }

      if (!mealsByDate[date]) mealsByDate[date] = [];

      mealsByDate[date].push({
        meal: meal.meal || 'Unknown',
        name: meal.name || 'Unnamed',
        calories: meal.calories || 0,
      });

      if (!mealDateList.includes(date)) {
        mealDateList.push(date);
      }
    });

    console.log(' Processed mealsByDate:', mealsByDate);
    console.log(' Meal date markers:', mealDateList);

    setMealProgress(mealsByDate);
    setMealDates(mealDateList);
  } catch (error) {
    console.error(' Failed to fetch and process meals:', error);
  }
};

const getGroupedMealsForSelectedDate = () => {
  const dateStr = formatDate(selectedDate);
  const meals = mealProgress[dateStr] || [];

  // Group meals by meal type
  const grouped = meals.reduce((acc, meal) => {
    const type = capitalizeWords(meal.meal || 'Other');
    if (!acc[type]) acc[type] = [];
    acc[type].push(meal);
    return acc;
  }, {});

  console.log(' Grouped meals for selected date:', grouped);
  return grouped;
};


  const getExercisesForSelectedDate = () => {
  const dateStr = formatDate(selectedDate);
  const allExercises = [];

  Object.keys(exerciseProgress).forEach((cat) => {
    exerciseProgress[cat].forEach((e) => {
      if (e.date === dateStr) {
        allExercises.push({ ...e, exerciseName: e.exercise });
      }
    });
  });

  // Deduplicate by exercise name, keep entry with highest set number
  const uniqueByName = {};
  allExercises.forEach((ex) => {
    const name = ex.exerciseName;
    if (!uniqueByName[name] || ex.sets > uniqueByName[name].sets) {
      uniqueByName[name] = ex;
    }
  });

  return Object.values(uniqueByName);
};


  const fetchData = async () => {
    try {
      setLoading(true);
      const workoutResponse = await fetchWorkoutDates();
      setWorkoutDates(workoutResponse);
      const exerciseData = await fetchExerciseProgress();
      setExerciseProgress(exerciseData.exercise_progress);
      await loadMealsForMonth();
    } catch (error) {
      console.error('❌ Error loading calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month]);

  const onDayPress = (date) => setSelectedDate(date);
  const isWorkoutDate = (date) => workoutDates.includes(formatDate(date));
  const isMealDate = (date) => mealDates.includes(formatDate(date));

  const generateMonthDates = () => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysArray = [];
    for (let i = 0; i < firstDay.getDay(); i++) daysArray.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push(new Date(year, monthIndex, i));
    }
    return daysArray;
  };

  const changeMonth = (inc) => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() + inc);
    setMonth(newMonth);
  };

  const today = new Date();
  const monthDates = generateMonthDates();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B3A0FF" />
        <Text style={styles.loadingText}>Loading workout calendar...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Workout Calendar" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.calendarContainer}>
            <View style={styles.monthNavContainer}>
              <TouchableOpacity style={styles.navButton} onPress={() => changeMonth(-1)}>
                <Text style={{ color: '#fff' }}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.monthYearText}>
                {month.toLocaleString('default', { month: 'long' })} {month.getFullYear()}
              </Text>
              <TouchableOpacity style={styles.navButton} onPress={() => changeMonth(1)}>
                <Text style={{ color: '#fff' }}>{'>'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
              {monthDates.map((date, index) => {
                if (!date) return <View key={`empty-${index}`} style={styles.emptyDay} />;
                const dateStr = formatDate(date);
                const isToday = dateStr === formatDate(today);
                const isSelected = dateStr === formatDate(selectedDate);
                const hasWorkout = isWorkoutDate(date);
                const hasMeal = isMealDate(date);

                return (
                  <TouchableOpacity
  key={index}
  style={[
    styles.calendarDay,
    isSelected && styles.selectedDay
  ]}
  onPress={() => onDayPress(date)}
>
  <Text
    style={[
      styles.calendarDayText,
      isSelected && styles.selectedDayText,
      isToday && styles.todayText
    ]}
  >
    {date.getDate()}
  </Text>
  {hasWorkout && <View style={styles.workoutDot} />}
  {hasMeal && <View style={styles.mealDot} />}
</TouchableOpacity>

                );
              })}
            </View>
          </View>

          {/* Selected Day Detail Section */}
          <View style={styles.selectedDateInfo}>
            <Text style={styles.selectedDateHeader}>
              Selected: {selectedDate.toDateString()}
            </Text>

            {/* Exercises */}
            <Text style={styles.exercisesSectionHeader}>Exercises</Text>
            {getExercisesForSelectedDate().length > 0 ? (
              getExercisesForSelectedDate().map((ex, i) => (
                <View key={i} style={styles.exerciseCard}>
                  <Text style={styles.exerciseName}>{capitalizeWords(ex.exerciseName)}</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.exerciseDetail}>
                      Sets: {ex.sets} | Reps: {ex.reps_per_set} | Weight: {ex.weight_per_set} kg
                    </Text>
                  </View>
                  <Text style={styles.exerciseVolume}>Total Volume: {ex.total_volume} kg</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noExercisesText}>No exercises on this day.</Text>
            )}

            {/* Meals */}
            {/* Meals */}
<Text style={[styles.exercisesSectionHeader, { color: '#FFA726' }]}>Meals</Text>
{Object.keys(getGroupedMealsForSelectedDate()).length > 0 ? (
  Object.entries(getGroupedMealsForSelectedDate()).map(([mealType, meals], index) => (
    <View key={index} style={{ marginBottom: 10 }}>
      <Text style={{ color: '#FFA726', fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
        {mealType}
      </Text>
      {meals.map((meal, i) => (
        <View key={i} style={{ backgroundColor: '#444', padding: 12, marginBottom: 5, borderRadius: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFF' }}>
            {capitalizeWords(meal.name)}
          </Text>
          <Text style={{ fontSize: 14, color: '#ccc' }}>Calories: {meal.calories}</Text>
        </View>
      ))}
    </View>
  ))
) : (
  <Text style={{ color: '#888' }}>No meals logged on this day.</Text>
)}

          </View>
        </View>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#222' },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222',
  },
  loadingText: { color: '#B3A0FF', marginTop: 10, fontSize: 16 },
  scrollView: { flex: 1, marginBottom: 70 },
  content: { padding: 16, marginTop: 70, marginBottom: 20 },
  calendarContainer: {
    backgroundColor: '#1A1A1A', borderRadius: 15, padding: 18,
    marginBottom: 20, elevation: 5, borderLeftWidth: 2, borderLeftColor: '#fff',
  },
  monthNavContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 15, backgroundColor: '#252525',
    borderRadius: 10, padding: 8,
  },
  navButton: {
    padding: 5, width: 36, height: 36, alignItems: 'center',
    justifyContent: 'center', borderRadius: 18, backgroundColor: '#333',
  },
  monthYearText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  calendarGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start',
    backgroundColor: '#151515', borderRadius: 10, padding: 5,
  },
 calendarDay: {
  width: '14.28%',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 5,
  borderRadius: 20,
},

  emptyDay: { width: '14.28%', aspectRatio: 1 },
calendarDayText: {
  color: '#FFF',
  fontSize: 16,
},
  mealDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFA726', marginTop: 3 },
  todayText: { color: '#E2F163', fontWeight: 'bold' },
selectedDay: {
  borderWidth: 2,
  borderColor: '#B3A0FF',
  borderRadius: 20,
  padding: 5,
  backgroundColor: 'transparent',
  shadowColor: '#FFFFFF',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.3,
  shadowRadius: 2,
  elevation: 4, 
},
selectedDayText: {
  color: '#fff',
  fontWeight: 'bold',
},
  workoutDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E2F163', marginTop: 3 },
  selectedDateInfo: {
    backgroundColor: '#1A1A1A', borderRadius: 15, padding: 18, elevation: 4,
    borderLeftWidth: 2, borderLeftColor: '#fff',
  },
  selectedDateHeader: { color: '#FFF', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  exercisesSectionHeader: {
    color: '#B3A0FF', fontSize: 16, fontWeight: '600',
    marginBottom: 12, backgroundColor: '#252525', padding: 10, borderRadius: 8,
  },
  exerciseCard: { backgroundColor: '#b3a0ff', padding: 12, marginBottom: 5, borderRadius: 10 },
  exerciseName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  exerciseDetail: { fontSize: 15, color: '#E2F163' },
  exerciseVolume: { fontSize: 15, color: '#FFFFFF', fontWeight: 'bold' },
  noExercisesText: {
    color: '#888', marginTop: 10, textAlign: 'center', padding: 20,
    backgroundColor: '#222', borderRadius: 8,
  },
});

export default WorkoutCalendar;
