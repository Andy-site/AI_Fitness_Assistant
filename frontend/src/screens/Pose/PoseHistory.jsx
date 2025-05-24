import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { fetchFullFitnessHistory } from '../../api/fithubApi';
import  Header  from '../../components/Header';
import Footer from '../../components/Footer';


const PoseHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState('Squat');

  useEffect(() => {
  const loadAllHistory = async () => {
    const res = await fetchFullFitnessHistory();
    const logs = res
      .filter(entry => entry.pose_sets.length > 0)
      .map(entry => ({ date: entry.date, sets: entry.pose_sets }));

    setHistory(logs);
    setLoading(false);
  };
  loadAllHistory();
}, []);


  if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingIcon}>⏳</Text>
      <Text style={styles.loadingText}>Loading your exercise history...</Text>
      <ActivityIndicator size="large" color="#E2F163" />
    </View>
  );
}

  return (
    <View style={styles.outerContainer} >
      <Header title="Pose History" />

    <ScrollView style={styles.container}>
      <Text style={styles.header}>📊 Set & Rep History</Text>

      {/* Toggle Exercise Filter */}
      <View style={styles.toggleRow}>
        {['Squat', 'Lunges'].map(exercise => (
          <TouchableOpacity
            key={exercise}
            style={[
              styles.toggleButton,
              selectedExercise === exercise && styles.toggleSelected,
            ]}
            onPress={() => setSelectedExercise(exercise)}
          >
            <Text
              style={[
                styles.toggleText,
                selectedExercise === exercise && styles.toggleTextSelected,
              ]}
            >
              {exercise}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cards */}
      {history.map((entry, idx) => {
        const filteredSets = entry.sets.filter(s => s.exercise === selectedExercise);
        if (filteredSets.length === 0) return null;

        return (
          <View key={idx} style={styles.card}>
            <Text style={styles.cardDate}>{entry.date}</Text>
            {filteredSets.map((set, i) => (
              <View key={i} style={styles.cardContent}>
                <Text style={styles.exerciseIcon}>
                  {set.exercise === 'Squat' ? '🦵' : '🏋️'}
                </Text>
                <View style={styles.details}>
                  <Text style={styles.exerciseText}>
                    {set.exercise} ~ Set {set.set_number}
                  </Text>
                  <View style={styles.badgeRow}>
                    <Text style={styles.badge}>🔥 {set.calories_burned} cal</Text>
                    <Text style={styles.badge}>💪 {set.reps} reps</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
    <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#222',
    },
  container: { padding: 16, backgroundColor: '#111' , marginTop: 70, marginBottom: 50},
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#E2F163',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  toggleSelected: {
    backgroundColor: '#E2F163',
  },
  toggleText: {
    color: '#ccc',
    fontSize: 14,
  },
  loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#111',
  padding: 20,
},
loadingIcon: {
  fontSize: 35,
  marginBottom: 10,
},
loadingText: {
  color: '#ccc',
  fontSize: 16,
  marginBottom: 10,
},

  toggleTextSelected: {
    color: '#111',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  cardDate: {
    color: '#E2F163',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  exerciseText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    backgroundColor: '#333',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 13,
    color: '#ccc',
    overflow: 'hidden',
    marginRight: 10,
  },
});

export default PoseHistory;
