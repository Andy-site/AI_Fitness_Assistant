import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as Progress from 'react-native-progress';
import { fetchCalorieGoal, fetchUserDetails, fetchWorkoutDates } from '../../api/fithubApi';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DateTimePicker from '@react-native-community/datetimepicker';

const Dashboard = () => {
  const [calories, setCalories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [workoutDates, setWorkoutDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const navigation = useNavigation();

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

        // Fetch user details
        const userResponse = await fetchUserDetails();
        setUserData(userResponse);

        // Fetch calorie goals
        const calorieResponse = await fetchCalorieGoal();
        setCalories(calorieResponse);

        // Fetch workout dates
        const workoutResponse = await fetchWorkoutDates(); // Fetch workout dates from the backend
        setWorkoutDates(workoutResponse); // Store as array of date strings
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onDateChange = (event, selectedDate) => {
    setCalendarVisible(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#B3A0FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Parse the user's creation date
  const startDate = userData?.created_at ? new Date(userData.created_at) : new Date();
  const endDate = new Date(
    startDate.getTime() + (calories?.goal_duration_days || 0) * 24 * 60 * 60 * 1000
  );

  // Calculate progress
  const today = new Date();
  const totalDuration = (endDate - startDate) / (1000 * 60 * 60 * 24); // Total duration in days
  const elapsedDuration = (today - startDate) / (1000 * 60 * 60 * 24); // Elapsed duration in days
  const progressPercentage = Math.min((elapsedDuration / totalDuration) * 100, 100).toFixed(1);

  // Determine if today falls within the timeline
  const isTodayInTimeline = today >= startDate && today <= endDate;
  
  // Calculate weight progress
  const weightGained = userData?.weight - userData?.goal_weight;
  const weightProgressPercentage = Math.min(
    ((userData?.weight - userData?.goal_weight) / (userData?.goal_weight - userData?.weight)) * 100,
    100
  ).toFixed(1);

  // Create calendar month dates
  const monthDates = generateMonthDates();

  return (
    <View style={styles.container}>
      <Header title="Dashboard" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.goalsContainer}>
          <View style={styles.Header}>
          <Text style={styles.sectionHeader}>Your Progress</Text>
          <View stlye={styles.iconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.editbut}>
                <Icon name="user-circle-o" size={24} color="#000" marginRight='5' />
                <Text style={styles.edit}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          
            </View>
          

          {/* Custom Calendar View */}
          <View style={styles.calendarContainer}>
            <Text style={styles.sectionHeader}>Workout Streaks</Text>
            
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

            {/* Date Picker (hidden) - Used for native date selection if needed */}
            {calendarVisible && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            {/* Selected Date Info */}
            <View style={styles.selectedDateInfo}>
              <Text style={styles.selectedDateText}>
                Selected: {selectedDate.toDateString()}
              </Text>
              {isWorkoutDate(selectedDate) && (
                <View style={styles.workoutIndicator}>
                  <MaterialIcons name="fitness-center" size={18} color="#FF6B6B" />
                  <Text style={styles.workoutText}>Workout completed</Text>
                </View>
              )}
            </View>
          </View>

          {/* Weight Goal Progress */}
          <View style={styles.goalCard}>
            <View style={styles.goalHeaderRow}>
              <MaterialIcons name="monitor-weight" size={24} color="#E2F163" />
              <Text style={styles.goalTitle}>Weight Goal Progress</Text>
            </View>
            <View style={styles.progressRow}>
              <Progress.Circle
                size={80}
                progress={weightProgressPercentage / 100}
                thickness={8}
                color="#E2F163"
                unfilledColor="#333"
                borderWidth={0}
                showsText
                formatText={() => `${weightProgressPercentage}%`}
                textStyle={{ color: '#FFF', fontSize: 16 }}
              />
              <View style={styles.goalStats}>
                <Text style={styles.goalStatText}>
                  Target: {userData?.goal_weight || '--'} kg
                </Text>
                <Text style={styles.goalStatText}>
                  Current: {userData?.weight || '--'} kg
                </Text>
                <Text style={styles.goalStatText}>
                  Gained: {weightGained || '--'} kg
                </Text>
              </View>
            </View>
          </View>

          {/* Calorie Target */}
          <View style={styles.goalCard}>
            <View style={styles.goalHeaderRow}>
              <MaterialIcons name="local-fire-department" size={24} color="#FF6B6B" />
              <Text style={styles.goalTitle}>Calorie Target</Text>
            </View>
            <View style={styles.calorieProgress}>
              <Progress.Bar
                progress={progressPercentage / 100}
                width={null}
                height={12}
                color="#FF6B6B"
                unfilledColor="#333"
                borderWidth={0}
                borderRadius={6}
              />
              <View style={styles.calorieStats}>
                <View style={styles.calorieStat}>
                  <Text style={styles.calorieLabel}>Daily Target</Text>
                  <Text style={styles.calorieValue}>
                    {calories?.weight_gain_calories || '--'} kcal
                  </Text>
                </View>
                <View style={styles.calorieStat}>
                  <Text style={styles.calorieLabel}>Progress</Text>
                  <Text style={styles.calorieValue}>{progressPercentage}%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timelineCard}>
            <View style={styles.timelineHeader}>
              <MaterialIcons name="calendar-today" size={20} color="#B3A0FF" />
              <Text style={styles.timelineTitle}>Goal Timeline</Text>
            </View>
            <View style={styles.timeline}>
              <View style={styles.timelineProgress}>
                {/* Start Date Marker */}
                <View style={styles.timelineDot} />
                <View style={styles.timelineLine} />

                {/* Today's Date Marker */}
                {isTodayInTimeline && (
                  <>
                    <View style={[styles.timelineDot, { backgroundColor: '#FF6B6B' }]} />
                    <View style={styles.timelineLine} />
                  </>
                )}

                {/* End Date Marker */}
                <View style={[styles.timelineDot, { backgroundColor: '#E2F163' }]} />
              </View>
              <View style={styles.timelineDates}>
                <Text style={styles.timelineDate}>
                  Start: {startDate.toLocaleDateString()}
                </Text>
                {isTodayInTimeline && (
                  <Text style={styles.timelineDate}>
                    Today: {today.toLocaleDateString()}
                  </Text>
                )}
                <Text style={styles.timelineDate}>
                  End: {endDate.toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212020',
  },
  scrollView: {
    flex: 1,
    marginBottom: 70,
  },
  goalsContainer: {
    marginTop: 70,
    padding: 20,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E2F163',
    marginBottom: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  calendarContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  monthNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  Header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    padding: 5,
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
  },
  weekdayText: {
    color: '#B3A0FF',
    fontSize: 14,
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
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
    color: '#212020',
    fontWeight: 'bold',
  },
  workoutDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B6B',
    marginTop: 3,
  },
  selectedDateInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  selectedDateText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  workoutIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  workoutText: {
    color: '#FF6B6B',
    marginLeft: 5,
    fontSize: 14,
  },
  goalCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  editbut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#e2f163',
    borderRadius: 15,
  },
  edit: {
    color: '#000',
    // backgroundColor:'#e2f163',
    fontSize: 16,
    fontWeight: '600',
  },

  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
  goalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalStats: {
    flex: 1,
    marginLeft: 20,
  },
  goalStatText: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 5,
  },
  calorieProgress: {
    marginTop: 10,
  },
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  calorieStat: {
    alignItems: 'center',
  },
  calorieLabel: {
    color: '#B3A0FF',
    fontSize: 12,
    marginBottom: 5,
  },
  calorieValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timelineCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    padding: 15,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 10,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timelineProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#B3A0FF',
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#444',
    marginHorizontal: 5,
  },
  timelineDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineDate: {
    color: '#B3A0FF',
    fontSize: 12,
  },
});

export default Dashboard;