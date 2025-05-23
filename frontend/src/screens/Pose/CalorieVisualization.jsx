import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, Dimensions, StyleSheet, Button, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import { getCaloriesByPose } from '../../api/fithubApi'; // Adjust to your path
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import NextButton from '../../components/NextButton';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#1E2923',
  backgroundGradientTo: '#08130D',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: () => '#E2F163',
  propsForDots: {
    r: '4',
    strokeWidth: '1',
    stroke: '#fff',
  },
};

const getWeekRange = date => {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(start.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return [start, end];
};

const formatDate = date => date.toISOString().split('T')[0]; // YYYY-MM-DD

const CaloriesByPoseScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [poseDataByType, setPoseDataByType] = useState({});
  const [hasData, setHasData] = useState(true);

  const fetchData = async (date) => {
    const [start, end] = getWeekRange(date);
    const startDate = formatDate(start);
    const endDate = formatDate(end);
    const result = await getCaloriesByPose(startDate, endDate);

    if (!result.data || result.data.length === 0) {
      setPoseDataByType({});
      setHasData(false);
      return;
    }

    const grouped = {};
    result.data.forEach(item => {
      if (!grouped[item.pose_type]) grouped[item.pose_type] = [];
      grouped[item.pose_type].push(item);
    });

    const formatted = {};
    Object.keys(grouped).forEach(poseType => {
      const sorted = grouped[poseType].sort((a, b) => new Date(a.date) - new Date(b.date));
      formatted[poseType] = {
        labels: sorted.map(i => i.date.slice(5)), // MM-DD
        data: sorted.map(i => i.calories_burned),
      };
    });

    setPoseDataByType(formatted);
    setHasData(true);
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const onDateChange = (event, newDate) => {
    setShowPicker(false);
    if (newDate && newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const [weekStart, weekEnd] = getWeekRange(selectedDate);

  return (
    <View style={{ flex: 1, backgroundColor: '#222' }}>
        <Header title="Visualization from Pose" />
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        📅 {formatDate(weekStart)} — {formatDate(weekEnd)}
      </Text>

      <View style={styles.filterWrapper}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowPicker(true)}>
          <Text style={styles.filterText}>Add Filter</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            value={selectedDate}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      {hasData ? (
        Object.entries(poseDataByType).map(([poseType, chartData]) => (
          <View key={poseType} style={styles.chartWrapper}>
            <Text style={styles.chartTitle}>{poseType} Calories</Text>
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: [{
                  data: chartData.data,
                  color: () => poseType === 'Squat' ? '#8e44ad' : poseType === 'Lunges' ? '#3498db' : 'orange',
                  strokeWidth: 2,
                }],
                legend: [`${poseType} Calories`],
              }}
              width={screenWidth - 20}
              height={260}
              yAxisSuffix=" cal"
              yLabelsOffset={12}
              chartConfig={chartConfig}
              bezier
              style={styles.chartStyle}
            />
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>🚫 No data available for this week.</Text>
      )}
    </ScrollView>
    <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000'
    marginTop: 80,
    marginBottom: 50,

  },
  header: {
    fontSize: 20,
    color: '#E2F163',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
    filterButton: {
        backgroundColor: '#E2F163',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        fontSize: 20,
    },
    filterText: {
        color: '#000',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
  filterWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chartWrapper: {
    marginBottom: 40,
    alignItems: 'center',
  },
  chartTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  chartStyle: {
    borderRadius: 16,
  },
  noDataText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default CaloriesByPoseScreen;
