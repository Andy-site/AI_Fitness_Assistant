import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import  MaterialIcons  from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { fetchUserDetails } from '../../api/fithubApi';

const { width } = Dimensions.get('window');

const PoseNavigation = ({ navigation }) => {
    const [name, setName] = useState('User');
    
    useEffect(() => {
      const fetchData = async () => {
        const userDetails = await fetchUserDetails();
        if (userDetails) {
          setName(userDetails.first_name+' '+userDetails.last_name);
        }
      };
      fetchData();
    }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Pose Training" />

      <View style={styles.welcomeTextContainer}>
        <Text style={styles.welcomeText}>Welcome Fitness Enthusiast,</Text>
        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.motivation}>
          "Proper posture is the foundation of every strong movement."
        </Text>
      </View>

      <ScrollView style={styles.cardsContainer}>
        <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('ChoosePose')}>
          <View style={[styles.cardIcon, { backgroundColor: 'rgba(226, 241, 99, 0.2)' }]}>
            <MaterialIcons name="accessibility-new" size={28} color="#E2F163" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Choose Pose</Text>
            <Text style={styles.cardDescription}>Start pose-based workouts with guidance</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#B3A0FF" style={styles.cardArrow} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => navigation.navigate('CalorieVisualization')}
        >
          <View style={[styles.cardIcon, { backgroundColor: 'rgba(100, 149, 237, 0.2)' }]}>
            <MaterialIcons name="bar-chart" size={28} color="#6495ED" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Calorie Burn Chart</Text>
            <Text style={styles.cardDescription}>Visualize your weekly calorie burn</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#B3A0FF" style={styles.cardArrow} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => navigation.navigate('PoseHistory')}
        >
          <View style={[styles.cardIcon, { backgroundColor: 'rgba(255, 193, 7, 0.2)' }]}>
            <MaterialIcons name="history" size={28} color="#FFC107" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Pose History</Text>
            <Text style={styles.cardDescription}>Review sets, reps, and calorie data</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#B3A0FF" style={styles.cardArrow} />
        </TouchableOpacity>
      </ScrollView>

      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  welcomeTextContainer: {
    marginTop: 70,
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    color: '#aaa',
    fontSize: 18,
    marginBottom: 4,
  },
  userName: {
    color: '#E2F163',
    fontSize: 24,
    fontWeight: '700',
  },
  motivation: {
    marginTop: 12,
    fontStyle: 'italic',
    fontSize: 16,
    color: '#ccc',
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2e',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    elevation: 3,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cardDescription: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 2,
  },
  cardArrow: {
    marginLeft: 10,
  },
});

export default PoseNavigation;
