import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import * as Progress from 'react-native-progress';
import { fetchCalorieGoal, fetchUserDetails } from '../../api/fithubApi';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ProgressTracking = () => {
  const [calories, setCalories] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B3A0FF" />
        <Text style={styles.loadingText}>Loading progress data...</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Progress Tracking" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Weight Goal Progress */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Weight Goal Progress</Text>
            
            <View style={styles.goalCard}>
              <View style={styles.goalHeaderRow}>
                <MaterialIcons name="monitor-weight" size={24} color="#E2F163" />
                <Text style={styles.goalTitle}>Current Progress</Text>
              </View>
              <View style={styles.progressRow}>
                <Progress.Circle
                  size={100}
                  progress={weightProgressPercentage / 100}
                  thickness={10}
                  color="#E2F163"
                  unfilledColor="#333"
                  borderWidth={0}
                  showsText
                  formatText={() => `${weightProgressPercentage}%`}
                  textStyle={{ color: '#FFF', fontSize: 18 }}
                />
                <View style={styles.goalStats}>
                  <Text style={styles.goalStatText}>
                    Target: {userData?.goal_weight || '--'} kg
                  </Text>
                  <Text style={styles.goalStatText}>
                    Current: {userData?.weight || '--'} kg
                  </Text>
                  <Text style={styles.goalStatText}>
                    Gained: {weightGained > 0 ? `+${weightGained}` : weightGained} kg
                  </Text>
                  <Text style={styles.goalStatInfoText}>
                    {weightGained > 0 
                      ? "You're making progress!" 
                      : "Keep pushing, you'll get there!"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Calorie Target */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Calorie Target</Text>
            
            <View style={styles.goalCard}>
              <View style={styles.goalHeaderRow}>
                <MaterialIcons name="local-fire-department" size={24} color="#FF6B6B" />
                <Text style={styles.goalTitle}>Daily Requirement</Text>
              </View>
              <View style={styles.calorieProgress}>
                <Progress.Bar
                  progress={progressPercentage / 100}
                  width={null}
                  height={15}
                  color="#FF6B6B"
                  unfilledColor="#333"
                  borderWidth={0}
                  borderRadius={8}
                />
                <View style={styles.calorieStats}>
                  <View style={styles.calorieStat}>
                    <Text style={styles.calorieLabel}>Daily Target</Text>
                    <Text style={styles.calorieValue}>
                      {calories?.weight_gain_calories || '--'} kcal
                    </Text>
                  </View>
                  <View style={styles.calorieStat}>
                    <Text style={styles.calorieLabel}>Timeline Progress</Text>
                    <Text style={styles.calorieValue}>{progressPercentage}%</Text>
                  </View>
                </View>
                <Text style={styles.calorieInfoText}>
                  Consistently consume your daily calorie target to reach your weight goal.
                </Text>
              </View>
            </View>
          </View>

          {/* Timeline Progress */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Goal Timeline</Text>
            
            <View style={styles.goalCard}>
              <View style={styles.goalHeaderRow}>
                <MaterialIcons name="date-range" size={24} color="#B3A0FF" />
                <Text style={styles.goalTitle}>Progress Timeline</Text>
              </View>
              <View style={styles.timelineContainer}>
                <View style={styles.timelineBar}>
                  <View 
                    style={[
                      styles.timelineProgress, 
                      { width: `${progressPercentage}%` }
                    ]} 
                  />
                  {isTodayInTimeline && (
                    <View 
                      style={[
                        styles.todayMarker, 
                        { left: `${progressPercentage}%` }
                      ]} 
                    />
                  )}
                </View>
                <View style={styles.timelineDates}>
                  <Text style={styles.timelineDate}>
                    {startDate.toLocaleDateString()}
                  </Text>
                  <Text style={styles.timelineDate}>
                    {endDate.toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.timelineInfoText}>
                  {isTodayInTimeline
                    ? `You're ${progressPercentage}% through your journey!`
                    : today > endDate
                    ? "You've reached the end of your planned timeline!"
                    : "Your journey will begin soon!"}
                </Text>
              </View>
            </View>
          </View>

          {/* Workout Progress */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Workout Progress</Text>
            
            <View style={styles.goalCard}>
              <View style={styles.goalHeaderRow}>
                <MaterialIcons name="fitness-center" size={24} color="#64DFDF" />
                <Text style={styles.goalTitle}>Workout Consistency</Text>
              </View>
              <View style={styles.workoutStats}>
                <View style={styles.workoutStat}>
                  <Text style={styles.workoutValue}>
                    {userData?.workouts_completed || 0}
                  </Text>
                  <Text style={styles.workoutLabel}>Workouts Completed</Text>
                </View>
                <View style={styles.workoutStat}>
                  <Text style={styles.workoutValue}>
                    {userData?.workout_streak || 0}
                  </Text>
                  <Text style={styles.workoutLabel}>Current Streak</Text>
                </View>
                <View style={styles.workoutStat}>
                  <Text style={styles.workoutValue}>
                    {userData?.avg_workout_duration || 0}
                  </Text>
                  <Text style={styles.workoutLabel}>Avg. Duration (min)</Text>
                </View>
              </View>
              <Text style={styles.workoutInfoText}>
                Keep up your consistency to achieve faster results!
              </Text>
            </View>
          </View>
          
          {/* Tips Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Tips for Success</Text>
            
            <View style={styles.tipCard}>
              <MaterialIcons name="lightbulb" size={24} color="#FFAA5A" />
              <Text style={styles.tipText}>
                Consume protein-rich foods to support muscle growth.
              </Text>
            </View>
            
            <View style={styles.tipCard}>
              <MaterialIcons name="lightbulb" size={24} color="#FFAA5A" />
              <Text style={styles.tipText}>
                Track your meals consistently to ensure you're meeting your calorie goals.
              </Text>
            </View>
            
            <View style={styles.tipCard}>
              <MaterialIcons name="lightbulb" size={24} color="#FFAA5A" />
              <Text style={styles.tipText}>
                Aim for 7-9 hours of quality sleep to optimize recovery and growth.
              </Text>
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
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  goalCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalStats: {
    flex: 1,
    marginLeft: 16,
  },
  goalStatText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 6,
  },
  goalStatInfoText: {
    color: '#B3A0FF',
    fontSize: 14,
    marginTop: 4,
  },
  calorieProgress: {
    width: '100%',
  },
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  calorieStat: {
    alignItems: 'center',
  },
  calorieLabel: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 4,
  },
  calorieValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  calorieInfoText: {
    color: '#AAA',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  timelineContainer: {
    width: '100%',
  },
  timelineBar: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginVertical: 16,
    position: 'relative',
  },
  timelineProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#B3A0FF',
    borderRadius: 5,
  },
  todayMarker: {
    position: 'absolute',
    top: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2F163',
    marginLeft: -10,
    borderWidth: 3,
    borderColor: '#121212',
  },
  timelineDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineDate: {
    color: '#AAA',
    fontSize: 14,
  },
  timelineInfoText: {
    color: '#B3A0FF',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  workoutStat: {
    alignItems: 'center',
    flex: 1,
  },
  workoutValue: {
    color: '#64DFDF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  workoutLabel: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  workoutInfoText: {
    color: '#AAA',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#252525',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  }
});

export default ProgressTracking;