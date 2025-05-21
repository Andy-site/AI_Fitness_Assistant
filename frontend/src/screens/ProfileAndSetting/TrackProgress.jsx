import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions
} from 'react-native';
import * as Progress from 'react-native-progress';
import { fetchCalorieGoal, fetchUserDetails,  fetchWorkoutStats } from '../../api/fithubApi';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ProgressTracking = () => {
  const [calories, setCalories] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [workoutStats, setWorkoutStats] = useState(null);
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [workoutError, setWorkoutError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const userResponse = await fetchUserDetails();
        const calorieResponse = await fetchCalorieGoal();
        setUserData(userResponse);
        setCalories(calorieResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    const fetchWorkoutData = async () => {
      try {
        setWorkoutLoading(true);
        

        // fetchWorkoutStats returns workout summary stats
        const workoutData = await fetchWorkoutStats();
   setWorkoutStats(workoutData);   
      } catch (err) {
        console.error('Workout stats error:', err);
        setWorkoutError('Failed to load workout stats');
      } finally {
        setWorkoutLoading(false);
      }
    };

    fetchInitialData();
    fetchWorkoutData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B3A0FF" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Progress Tracking" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <Footer />
      </View>
    );
  }

  // Progress Calculations
  const startDate = userData?.created_at ? new Date(userData.created_at) : new Date();
  const durationDays = calories?.goal_duration_days || 0;
  const endDate = new Date(startDate.getTime() + durationDays * 86400000);
  const today = new Date();
  const totalDays = (endDate - startDate) / 86400000;
  const elapsedDays = (today - startDate) / 86400000;
  const timelineProgress = Math.min((elapsedDays / totalDays) * 100, 100).toFixed(1);
  const isTodayInTimeline = today >= startDate && today <= endDate;

  // Weight Goal Progress
  const goalWeight = userData?.goal_weight || 1;
  const currentWeight = userData?.estimated_weight || 0;
  const initialWeight = userData?.weight || 0;
  const weightDelta = currentWeight - initialWeight;
  const weightTargetDelta = goalWeight - initialWeight;
  const weightProgress = weightTargetDelta === 0 ? 0 : (weightDelta / weightTargetDelta);
  const weightProgressPercentage = Math.min(Math.max(weightProgress * 100, 0), 100);
  const validProgress = isNaN(weightProgressPercentage) ? 0 : parseFloat(weightProgressPercentage.toFixed(2));
  const remainingProgress = parseFloat((100 - validProgress).toFixed(2));

  const data = [
    {
      name: 'Progress',
      population: validProgress,
      color: '#FF6384',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Remaining',
      population: remainingProgress,
      color: '#FFCE56',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Progress Tracking" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

        {/* Weight Progress */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Weight Goal Progress</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeaderRow}>
              <MaterialIcons name="monitor-weight" size={24} color="#E2F163" />
              <Text style={styles.goalTitle}>Weight Journey</Text>
            </View>
            <View style={styles.pieChartWithStats}>
              <View style={styles.pieChartContainer}>
                <PieChart
                  data={data}
                  width={screenWidth * 0.8}
                  height={180}
                  chartConfig={{
                    color: () => `rgba(0, 0, 0, 1)`,
                  }}
                  accessor={'population'}
                  backgroundColor={'transparent'}
                  paddingLeft={'15'}
                  absolute
                />
              </View>

              {/* Stats below pie chart */}
              <View style={styles.goalStats}>
                <Text style={styles.goalStatText}>Starting Weight: {initialWeight} kg</Text>
                <Text style={styles.goalStatText}>Current Weight: {currentWeight} kg</Text>
                <Text style={styles.goalStatText}>Target Weight: {goalWeight} kg</Text>
                <Text style={styles.goalStatInfoText}>
                  {weightDelta === 0
                    ? "You haven't changed your weight since starting."
                    : weightDelta > 0
                      ? `Progress: +${weightDelta.toFixed(2)} kg `
                      : `Progress: -${Math.abs(weightDelta).toFixed(2)} kg`}
                </Text>
                <Text style={{ color: '#E2F163', fontWeight: 'bold', marginTop: 8 }}>
                  Percentage: {weightProgressPercentage.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Calorie Intake */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Calorie Target</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeaderRow}>
              <MaterialIcons name="local-fire-department" size={24} color="#FF6B6B" />
              <Text style={styles.goalTitle}>Daily Calorie Target</Text>
            </View>
            <Progress.Bar
              progress={timelineProgress / 100}
              width={null}
              height={15}
              color="#FF6B6B"
              unfilledColor="#333"
              borderWidth={0}
              borderRadius={8}
            />
            <View style={styles.calorieStats}>
              <Text style={styles.goalStatText}>
                Target: {calories?.weight_gain_calories || '--'} kcal/day
              </Text>
              <Text style={styles.goalStatText}>
                Progress: {timelineProgress}%
              </Text>
            </View>
            <Text style={styles.calorieInfoText}>
              Log meals daily to stay on track with your calorie intake.
            </Text>
          </View>
        </View>

        {/* Timeline Progress */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Timeline</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeaderRow}>
              <MaterialIcons name="date-range" size={24} color="#B3A0FF" />
              <Text style={styles.goalTitle}>Journey Timeline</Text>
            </View>
            <View style={styles.timelineBar}>
              <View style={[styles.timelineProgress, { width: `${timelineProgress}%` }]} />
              {isTodayInTimeline && (
                <View style={[styles.todayMarker, { left: `${timelineProgress}%` }]} />
              )}
            </View>
            <View style={styles.timelineDates}>
              <Text style={styles.timelineDate}>{startDate.toLocaleDateString()}</Text>
              <Text style={styles.timelineDate}>{endDate.toLocaleDateString()}</Text>
            </View>
            <Text style={styles.timelineInfoText}>
              {isTodayInTimeline
                ? `You’re ${timelineProgress}% through your plan!`
                : today > endDate
                  ? 'You’ve reached your goal timeline!'
                  : 'Your journey will begin soon.'}
            </Text>
          </View>
        </View>

        {/* Workout Progress */}
        <View style={styles.workoutStats}>
          {workoutStats ? (
  <>
    <View style={styles.workoutStat}>
      <Text style={styles.workoutValue}>{workoutStats.workouts_completed}</Text>
      <Text style={styles.workoutLabel}>Completed</Text>
    </View>
    <View style={styles.workoutStat}>
      <Text style={styles.workoutValue}>{workoutStats.workout_streak}</Text>
      <Text style={styles.workoutLabel}>Streak</Text>
    </View>
    <View style={styles.workoutStat}>
      <Text style={styles.workoutValue}>{workoutStats.avg_workout_duration.toFixed(1)}</Text>
      <Text style={styles.workoutLabel}>Avg (min)</Text>
    </View>
  </>
) : (
  <Text>No workout stats available</Text>
)}

        </View>

        {/* Tips */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Tips for Success</Text>
          {[
            'Eat high-protein meals post-workout.',
            'Sleep 7–9 hours to enhance recovery.',
            'Track your daily meals.',
            'Stay hydrated throughout the day.',
          ].map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <MaterialIcons name="lightbulb" size={24} color="#FFAA5A" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollView: { flex: 1 , marginBottom:30},
  content: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  loadingText: { color: '#FFF', marginTop: 10 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#FF6B6B' },
  sectionContainer: { marginBottom: 24 },
  sectionHeader: { fontSize: 20, color: '#FFF', marginBottom: 12, fontWeight: 'bold' },
  goalCard: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16 },
  goalHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  goalTitle: { color: '#FFF', marginLeft: 8, fontSize: 18, fontWeight: '600' },
  pieChartWithStats: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pieChartContainer: {
    marginBottom: 20,
  },
  goalStats: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  goalStatText: { color: '#FFF', marginBottom: 6 },
  goalStatInfoText: { color: '#B3A0FF', fontSize: 14, marginTop: 6 },
  calorieStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  calorieInfoText: { color: '#AAA', fontSize: 14, marginTop: 16 },
  timelineBar: { height: 10, backgroundColor: '#333', borderRadius: 5, position: 'relative', marginVertical: 12 },
  timelineProgress: { position: 'absolute', height: '100%', backgroundColor: '#B3A0FF', borderRadius: 5 },
  todayMarker: {
    position: 'absolute', top: -5, width: 20, height: 20, borderRadius: 10, backgroundColor: '#E2F163',
    marginLeft: -10, borderWidth: 3, borderColor: '#121212',
  },
  timelineDates: { flexDirection: 'row', justifyContent: 'space-between' },
  timelineDate: { color: '#AAA', fontSize: 12 },
  timelineInfoText: { color: '#B3A0FF', marginTop: 10, fontWeight: '600' },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  workoutStat: { alignItems: 'center' },
  workoutValue: { fontSize: 20, fontWeight: 'bold', color: '#64DFDF' },
  workoutLabel: { fontSize: 14, color: '#AAA' },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#272727',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  tipText: { color: '#FFD700', marginLeft: 8, fontSize: 14, flex: 1 },
});

export default ProgressTracking;
