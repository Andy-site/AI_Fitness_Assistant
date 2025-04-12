import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import React, { useEffect, useState } from 'react';
import IconButton from '../../components/IconButton';
import ExerciseCard from '../../components/ExerciseCard';
import * as Progress from 'react-native-progress';
import { fetchCalorieGoal, fetchUserDetails } from '../../api/fithubApi';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Dashboard = () => {
  const [calories, setCalories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

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
              console.error('Error fetching data:', error);
              setError('Failed to load data');
          } finally {
              setLoading(false);
          }
      };

      fetchData();
  }, []);

  if (error) {
      return (
          <View style={styles.container}>
              <Text style={styles.errorText}>{error}</Text>
          </View>
      );
  }

  
    
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => navigation.navigate('EditProfile')}
            >
                <MaterialIcons name="person" size={24} color="#E2F163" />
                <Text style={styles.profileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
        
    {/* Enhanced Calorie Goals Section */}
<View style={styles.goalsContainer}>
  <Text style={styles.sectionHeader}>Your Progress</Text>
  
  {loading ? (
    <ActivityIndicator size="small" color="#B3A0FF" />
  ) : calories ? (
    <>
      {/* Weight Goal Progress Card */}
      <View style={styles.goalCard}>
        <View style={styles.goalHeaderRow}>
          <MaterialIcons name="monitor-weight" size={24} color="#E2F163" />
          <Text style={styles.goalTitle}>Weight Goal Progress</Text>
        </View>
        
        <View style={styles.progressRow}>
          <Progress.Circle
            size={80}
            progress={0.3} // Calculate this based on actual progress
            thickness={8}
            color="#E2F163"
            unfilledColor="#333"
            borderWidth={0}
            showsText
            formatText={() => `30%`}
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
              Remaining: {calories.goal_duration_days || '--'} days
            </Text>
          </View>
        </View>
      </View>

      {/* Calorie Adjustment Card */}
      <View style={styles.goalCard}>
        <View style={styles.goalHeaderRow}>
          <MaterialIcons name="local-fire-department" size={24} color="#FF6B6B" />
          <Text style={styles.goalTitle}>Calorie Target</Text>
        </View>
        
        <View style={styles.calorieProgress}>
          <Progress.Bar
            progress={0.6} // Calculate this based on actual progress
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
                {calories.weight_loss_calories || calories.weight_gain_calories || '--'} kcal
              </Text>
            </View>
            <View style={styles.calorieStat}>
              <Text style={styles.calorieLabel}>Total Adjustment</Text>
              <Text style={styles.calorieValue}>
                {calories.total_calorie_adjustment || '--'} kcal
              </Text>
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
            <View style={styles.timelineDot} />
            <View style={styles.timelineLine} />
            <View style={[styles.timelineDot, { backgroundColor: '#E2F163' }]} />
          </View>
          <View style={styles.timelineDates}>
            <Text style={styles.timelineDate}>Start: {new Date().toLocaleDateString()}</Text>
            <Text style={styles.timelineDate}>
              End: {new Date(Date.now() + calories.goal_duration_days * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </>
  ) : (
    <Text style={styles.errorText}>No goal data available</Text>
  )}
  </View>
  <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => navigation.navigate('EditProfile')}
            >
                <MaterialIcons name="person" size={24} color="#E2F163" />
                <Text style={styles.profileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
  </View>
  )
}
const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#212020',
  },
  goalsContainer: {
    padding: 20,
    backgroundColor: '#212020',
  },

  // Cards
  goalCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  timelineCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    padding: 15,
  },

  // Headers
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E2F163',
    marginBottom: 20,
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

  // Progress Elements
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalStats: {
    flex: 1,
    marginLeft: 20,
  },
  calorieProgress: {
    marginTop: 10,
  },

  // Text Styles
  goalStatText: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 5,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
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

  // Profile Button
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 10,
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileButtonText: {
    color: '#E2F163',
    fontSize: 16,
    fontWeight: '600',
  },

  // Timeline
  timeline: {
    marginTop: 10,
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

  // Calorie Stats
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  calorieStat: {
    alignItems: 'center',
  },
});

export default Dashboard;