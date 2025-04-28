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
import { fetchWorkoutDates, fetchExerciseProgress } from '../../api/fithubApi';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { capitalizeWords } from '../../utils/StringUtils';

const WorkoutCalendar = () => {
  const [workoutDates, setWorkoutDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [exerciseProgress, setExerciseProgress] = useState({});

  // Format date to YYYY-MM-DD string
  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch workout dates
        const workoutResponse = await fetchWorkoutDates();
        setWorkoutDates(workoutResponse);
        
        // Fetch exercise progress
        const exerciseData = await fetchExerciseProgress();
        setExerciseProgress(exerciseData.exercise_progress);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper: Get exercises on selected date
  const getExercisesForSelectedDate = () => {
    const selectedDateString = formatDate(selectedDate);
    const exercisesOnDate = [];

    Object.keys(exerciseProgress).forEach((exerciseName) => {
      const records = exerciseProgress[exerciseName];
      records.forEach((record) => {
        if (record.date === selectedDateString) {
          exercisesOnDate.push({
            exerciseName,
            ...record,
          });
        }
      });
    });

    return exercisesOnDate;
  };

  // Check if date is a workout date
  const isWorkoutDate = (date) => {
    const formattedDate = formatDate(date);
    return workoutDates.includes(formattedDate);
  };

  // Generate dates for the month view
  const generateMonthDates = () => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, monthIndex, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Get the last day of the month
    const lastDay = new Date(year, monthIndex + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Create array for calendar grid
    const daysArray = [];
    
    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null);
    }
    
    // Add actual dates
    for (let i = 1; i <= totalDays; i++) {
      daysArray.push(new Date(year, monthIndex, i));
    }
    
    return daysArray;
  };

  const changeMonth = (increment) => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setMonth(newMonth);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B3A0FF" />
        <Text style={styles.loadingText}>Loading workout calendar...</Text>
      </View>
    );
  }

  const today = new Date();
  const monthDates = generateMonthDates();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Workout Calendar" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Calendar View */}
          <View style={styles.calendarContainer}>
            {/* Month Navigation */}
            <View style={styles.monthNavContainer}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
                <MaterialIcons name="chevron-left" size={24} color="#B3A0FF" />
              </TouchableOpacity>
              <Text style={styles.monthYearText}>
                {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
                <MaterialIcons name="chevron-right" size={24} color="#B3A0FF" />
              </TouchableOpacity>
            </View>

            {/* Weekday Headers */}
            <View style={styles.weekdayHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <Text key={index} style={styles.weekdayText}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {monthDates.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.emptyDay} />;
                }

                const isToday = formatDate(date) === formatDate(today);
                const isSelected = formatDate(date) === formatDate(selectedDate);
                const hasWorkout = isWorkoutDate(date);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      isToday && styles.today,
                      isSelected && styles.selectedDay,
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      isToday && styles.todayText,
                      isSelected && styles.selectedDayText,
                    ]}>
                      {date.getDate()}
                    </Text>
                    {hasWorkout && <View style={styles.workoutDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected Date Info */}
          <View style={styles.selectedDateInfo}>
            <Text style={styles.selectedDateHeader}>
              Selected: {selectedDate.toDateString()}
            </Text>
            
            {isWorkoutDate(selectedDate) && (
              <View style={styles.workoutIndicator}>
                <MaterialIcons name="fitness-center" size={18} color="#E2F163" />
                <Text style={styles.workoutText}>Workout Performed</Text>
              </View>
            )}

            {/* Exercises for Selected Date */}
            <View style={styles.exercisesContainer}>
              <Text style={styles.exercisesSectionHeader}>
                <MaterialIcons name="assignment" size={18} color="#B3A0FF" />
                {' '}Exercises on This Day
              </Text>
              
              {getExercisesForSelectedDate().length > 0 ? (
                getExercisesForSelectedDate().map((exercise, index) => (
                  <View key={index} style={styles.exerciseCard}>
                    <Text style={styles.exerciseName}>
                      {capitalizeWords(exercise.exerciseName)}
                    </Text>
                    
                    <View style={styles.detailRow}>
                      <MaterialIcons name="fitness-center" size={16} color="#E2F163" />
                      <Text style={styles.exerciseDetail}> Sets: {exercise.sets}</Text>
                    </View>
                  
                    <View style={styles.detailRow}>
                      <MaterialIcons name="repeat" size={16} color="#E2F163" />
                      <Text style={styles.exerciseDetail}> Reps: {exercise.reps_per_set}</Text>
                    </View>
                  
                    <View style={styles.detailRow}>
                      <MaterialIcons name="fitness-center" size={16} color="#E2F163" />
                      <Text style={styles.exerciseDetail}> Weight: {exercise.weight_per_set} kg</Text>
                    </View>
                  
                    <View style={styles.detailRow}>
                      <MaterialIcons name="whatshot" size={16} color="#fff" />
                      <Text style={styles.exerciseVolume}>
                        Total Volume: {exercise.total_volume} kg
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noExercisesText}>
                  No exercises logged on this day.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#B3A0FF',
    marginTop: 10,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    marginBottom: 70,
  },
  content: {
    padding: 16,
    marginTop: 70, // To account for header
    marginBottom: 20,
  },
  calendarContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 18,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#fff',
  },
  monthNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#252525',
    borderRadius: 10,
    padding: 8,
  },
  navButton: {
    padding: 5,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#333',
  },
  monthYearText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingVertical: 8,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  weekdayText: {
    color: '#B3A0FF',
    fontSize: 14,
    width: 40,
    textAlign: 'center',
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    backgroundColor: '#151515',
    borderRadius: 10,
    padding: 5,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  calendarDayText: {
    color: '#FFF',
    fontSize: 16,
  },
  today: {
    backgroundColor: 'rgba(179, 160, 255, 0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B3A0FF',
  },
  todayText: {
    color: '#E2F163',
    fontWeight: 'bold',
  },
  selectedDay: {
    backgroundColor: '#B3A0FF',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#000',
    fontWeight: 'bold',
  },
  workoutDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2F163',
    marginTop: 3,
  },
  selectedDateInfo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 18,
    elevation: 4,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderLeftWidth: 2,
    borderLeftColor: '#fff',
  },
  selectedDateHeader: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  workoutIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(226, 241, 99, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  workoutText: {
    color: '#E2F163',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  exercisesContainer: {
    marginTop: 10,
  },
  exercisesSectionHeader: {
    color: '#B3A0FF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    backgroundColor: '#252525',
    padding: 10,
    borderRadius: 8,
  },
  exerciseCard: {
    backgroundColor: '#b3a0ff',
    padding: 12,
    marginBottom: 5,
    borderRadius: 10,
    elevation: 2,
    
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  
    paddingVertical: 3,
  },
  exerciseDetail: {
    fontSize: 15,
    color: '#E2F163',
  },
  exerciseVolume: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  noExercisesText: {
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#222',
    borderRadius: 8,
  },
});

export default WorkoutCalendar;