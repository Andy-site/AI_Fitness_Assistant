import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import * as Progress from 'react-native-progress';
import { fetchCalorieGoal, fetchUserDetails, fetchWorkoutStats } from '../../api/fithubApi';
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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const userResponse = await fetchUserDetails();
        const calorieResponse = await fetchCalorieGoal();
        const workoutData = await fetchWorkoutStats();
        setUserData(userResponse);
        setCalories(calorieResponse);
        setWorkoutStats(workoutData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const getTargetCalories = () => {
    const goalType = (userData?.goal || '').toLowerCase();
    if (!calories) return 1800;

    switch (goalType) {
      case 'weight gain':
        return calories.weight_gain_calories ?? 1800;
      case 'weight loss':
        return calories.weight_loss_calories ?? 1800;
      case 'maintain':
        return calories.maintenance_calories ?? 1800;
      default:
        return 1800;
    }
  };

  const getGoalLabel = () => {
    const goalType = (userData?.goal || '').toLowerCase();
    switch (goalType) {
      case 'weight gain':
        return 'Weight Gain';
      case 'weight loss':
        return 'Weight Loss';
      case 'maintain':
        return 'Maintenance';
      default:
        return 'Calorie Goal';
    }
  };

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

  const startDate = userData?.created_at ? new Date(userData.created_at) : new Date();
  const durationDays = calories?.goal_duration_days || 0;
  const endDate = new Date(startDate.getTime() + durationDays * 86400000);
  const today = new Date();
  const totalDays = (endDate - startDate) / 86400000;
  const elapsedDays = (today - startDate) / 86400000;
  const timelineProgress = Math.min((elapsedDays / totalDays) * 100, 100).toFixed(1);
  const isTodayInTimeline = today >= startDate && today <= endDate;

  const goalWeight = userData?.goal_weight || 1;
  const currentWeight = userData?.estimated_weight || 0;
  const initialWeight = userData?.weight || 0;
  const weightDelta = currentWeight - initialWeight;
  const weightTargetDelta = goalWeight - initialWeight;
  const weightProgress = weightTargetDelta === 0 ? 0 : (weightDelta / weightTargetDelta);
  const weightProgressPercentage = Math.min(Math.max(weightProgress * 100, 0), 100);
  const validProgress = isNaN(weightProgressPercentage) ? 0 : parseFloat(weightProgressPercentage.toFixed(2));
  const remainingProgress = parseFloat((100 - validProgress).toFixed(2));

  const pieData = [
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

        {/* Calorie Target Section - Now at the Top */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Calorie Target</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeaderRow}>
              <MaterialIcons name="local-fire-department" size={24} color="#FF6B6B" />
              <Text style={styles.goalTitle}>{getGoalLabel()} Target</Text>
            </View>

            <Text style={styles.goalSubText}>
              {(() => {
                const goal = (userData?.goal || '').toLowerCase();
                if (goal === 'weight loss') return "To lose weight, aim to stay under this daily target.";
                if (goal === 'weight gain') return "To gain weight, aim to exceed this daily target.";
                if (goal === 'maintain') return "To maintain your weight, match this target consistently.";
                return "Your personalized daily calorie goal.";
              })()}
            </Text>

            <View style={styles.circleChartContainer}>
              <Progress.Circle
                progress={1}
                size={140}
                thickness={12}
                showsText={true}
                color="#FF6B6B"
                unfilledColor="#333"
                borderWidth={0}
                textStyle={{
                  color: '#FF6B6B',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}
                formatText={() => `${getTargetCalories()} kcal`}
              />
              <Text style={{ color: '#AAA', marginTop: 10 }}>Daily Calorie Goal</Text>
            </View>

            <Text style={styles.calorieInfoText}>
              Log meals to stay on track and help personalize future plans.
            </Text>
          </View>
        </View>

        {/* Weight Goal Progress */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Weight Goal Progress</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeaderRow}>
              <MaterialIcons name="monitor-weight" size={24} color="#E2F163" />
              <Text style={styles.goalTitle}>Weight Journey</Text>
            </View>
            <View style={styles.pieChartWithStats}>
              <PieChart
                data={pieData}
                width={screenWidth * 0.8}
                height={180}
                chartConfig={{ color: () => `rgba(0, 0, 0, 1)` }}
                accessor={'population'}
                backgroundColor={'transparent'}
                paddingLeft={'15'}
                absolute
              />
              <View style={styles.goalStats}>
                <Text style={styles.goalStatText}>Starting Weight: {initialWeight} kg</Text>
                <Text style={styles.goalStatText}>Current Weight: {currentWeight} kg</Text>
                <Text style={styles.goalStatText}>Target Weight: {goalWeight} kg</Text>
                <Text style={styles.goalStatInfoText}>
                  {weightDelta === 0
                    ? "You haven't changed your weight since starting."
                    : weightDelta > 0
                      ? `Progress: +${weightDelta.toFixed(2)} kg`
                      : `Progress: -${Math.abs(weightDelta).toFixed(2)} kg`}
                </Text>
                <Text style={{ color: '#E2F163', fontWeight: 'bold', marginTop: 8 }}>
                  Percentage: {weightProgressPercentage.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Timeline */}
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

        {/* Workout Stats */}
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
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#222' },
  scrollView: { marginTop:55,flex: 1, marginBottom: 60 },
  content: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' },
  loadingText: { color: '#FFF', marginTop: 10 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#FF6B6B' },
  sectionContainer: { marginBottom: 24 },
  sectionHeader: { fontSize: 20, color: '#FFF', marginBottom: 12, fontWeight: 'bold' },
  goalCard: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16 },
  goalHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  goalTitle: { color: '#FFF', marginLeft: 8, fontSize: 18, fontWeight: '600' },
  goalSubText: { color: '#DDD', fontSize: 14, marginBottom: 10 },
  circleChartContainer: { alignItems: 'center', marginVertical: 20 },
  pieChartWithStats: { alignItems: 'center', marginBottom: 20 },
  pieChartContainer: { marginBottom: 20 },
  goalStats: { width: '100%', paddingHorizontal: 20, alignItems: 'flex-start' },
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
  workoutStats: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  workoutStat: { alignItems: 'center' },
  workoutValue: { fontSize: 20, fontWeight: 'bold', color: '#64DFDF' },
  workoutLabel: { fontSize: 14, color: '#AAA' },
});

export default ProgressTracking;
