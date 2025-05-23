import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ToastAndroid,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchProgressData } from '../../api/fithubApi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const screenWidth = Dimensions.get("window").width;

// Utility to get weekly start dates for a given month
function getWeeksInMonth(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks = [];
  let current = new Date(firstDay);

  while (current <= lastDay) {
    weeks.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

// Determine current week index (1-based)
function getCurrentWeekIndex(date) {
  const weeks = getWeeksInMonth(date.getFullYear(), date.getMonth());
  for (let i = 0; i < weeks.length; i++) {
    const start = new Date(weeks[i]);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    if (date >= start && date <= end) return i + 1;
  }
  return 1;
}

// Calculate week start date from index
function getStartDateOfMonthWeek(year, month, weekIndex) {
  const weeks = getWeeksInMonth(year, month);
  return weeks[weekIndex - 1] || new Date(year, month, 1);
}

const ProgressVisualization = () => {
  const today = new Date();
  const [period, setPeriod] = useState('month');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekIndex(today));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState(today);
  const [showTempDatePicker, setShowTempDatePicker] = useState(false);

  const showNotification = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      console.log('Notification:', message);
    }
  };

  useEffect(() => {
    setLoading(true);

    const week = getCurrentWeekIndex(selectedDate);
    setSelectedWeek(week);

    const fetchDate = getStartDateOfMonthWeek(selectedDate.getFullYear(), selectedDate.getMonth(), week);
    const fetchDateStr = fetchDate.toISOString().split('T')[0];

    if (fetchDate > new Date()) {
      showNotification("Cannot fetch future week data.");
      setData(null);
      setLoading(false);
      return;
    }

    fetchProgressData(period, fetchDateStr, week.toString())
      .then(json => {
        const noRealData =
          !json ||
          !json.daily_data ||
          json.daily_data.length === 0 ||
          json.daily_data.every(
            d =>
              (d.workout_calories_burned === 0 || d.workout_calories_burned === null) &&
              (d.meal_calories_consumed === 0 || d.meal_calories_consumed === null)
          );

        if (noRealData) {
          setData(null);
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching progress data:', error);
        showNotification('Failed to fetch progress data. Please try again.');
        setData(null);
        setLoading(false);
      });

  }, [selectedDate]);

  const applyFilters = () => {
    setSelectedDate(tempDate);
    setFilterModalVisible(false);
  };

  const clearFilters = () => {
    const now = new Date();
    setSelectedDate(now);
    setTempDate(now);
    setFilterModalVisible(false);
  };

  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Progress</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Icon name="times" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <Text style={styles.filterLabel}>Select Month and Year</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowTempDatePicker(true)}
          >
            <Text style={styles.datePickerText}>
              {tempDate.toLocaleString('default', { month: 'long' })} {tempDate.getFullYear()}
            </Text>
          </TouchableOpacity>
          {showTempDatePicker && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={(event, date) => {
                setShowTempDatePicker(false);
                if (date) setTempDate(date);
              }}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.applyFilterButton} onPress={applyFilters}>
              <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your progress visualization...</Text>
      </View>
    );
  }

  const dailyData = data?.daily_data || [];
  const labels = dailyData.map(d => new Date(d.date).getDate().toString());

  const futureStartIndex = dailyData.findIndex(d => new Date(d.date) > today);

  const caloriesBurned = dailyData.map(d => d.workout_calories_burned || 0);
  const caloriesConsumed = dailyData.map(d => d.meal_calories_consumed || 0);
  const caloriesBalance = caloriesBurned.map((burned, i) => burned - caloriesConsumed[i]);

  const avgBurned = dailyData.length
    ? Math.round(caloriesBurned.reduce((a, b) => a + b, 0) / caloriesBurned.length)
    : 0;
  const avgConsumed = dailyData.length
    ? Math.round(caloriesConsumed.reduce((a, b) => a + b, 0) / caloriesConsumed.length)
    : 0;
  const avgBalance = dailyData.length
    ? Math.round(caloriesBalance.reduce((a, b) => a + b, 0) / caloriesBalance.length)
    : 0;

  const chartConfigs = (color) => ({
    backgroundColor: "#000",
    backgroundGradientFrom: "#1A1A1A",
    backgroundGradientTo: "#000",
    decimalPlaces: 0,
    color: (opacity = 1) => `${color}${Math.round(opacity * 255).toString(16)}`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForDots: {
      r: "3",
      strokeWidth: "2",
      stroke: color,
    },
  });

  return (
    <View style={styles.screenContainer}>
      <Header title="Progress Visualization" />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.selectedFilters}>
          Showing: {selectedDate.toLocaleString('default', { month: 'long' })} {selectedDate.getFullYear()} - Week {selectedWeek}
        </Text>

        <TouchableOpacity
          style={styles.openFilterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.openFilterButtonText}>Open Filters</Text>
        </TouchableOpacity>

        {!data && (
          <Text style={styles.noDataText}>
            No data available for the selected period. Try another filter or start logging your activities!
          </Text>
        )}

        {data && (
          <>
            <Text style={styles.chartLabel}>Calories Burned (Workouts)</Text>
            <LineChart
              data={{ labels, datasets: [{ data: caloriesBurned }] }}
              width={screenWidth - 20}
              height={260}
              yAxisSuffix=" cal"
              chartConfig={chartConfigs('#E2F163')}
              style={styles.chartStyle}
              bezier
              fromZero
            />

            <Text style={[styles.chartLabel, { marginTop: 25 }]}>Calories Consumed (Meals)</Text>
            <LineChart
              data={{ labels, datasets: [{ data: caloriesConsumed }] }}
              width={screenWidth - 20}
              height={260}
              yAxisSuffix=" cal"
              chartConfig={chartConfigs('#B3A0FF')}
              style={styles.chartStyle}
              bezier
              fromZero
            />

            <Text style={[styles.chartLabel, { marginTop: 25 }]}>Calories Balance (Burned - Consumed)</Text>
            <LineChart
              data={{ labels, datasets: [{ data: caloriesBalance }] }}
              width={screenWidth - 20}
              height={260}
              yAxisSuffix=" cal"
              chartConfig={chartConfigs('#FFA500')}
              style={styles.chartStyle}
              bezier
              fromZero
            />

            {/* Combined Chart from CalorieVisualization */}
<Text style={[styles.chartLabel, { marginTop: 25 }]}>
  🔥 Weekly Overview (Burned vs Consumed vs Net)
</Text>
<LineChart
  data={{
    labels: labels,
    datasets: [
      {
        data: caloriesBurned,
        color: () => 'tomato',
        strokeWidth: 2,
      },
      {
        data: caloriesConsumed,
        color: () => '#3498db',
        strokeWidth: 2,
      },
      {
        data: caloriesBalance,
        color: () => 'green',
        strokeWidth: 2,
      },
    ],
    legend: ['Burned', 'Consumed', 'Net'],
  }}
  width={screenWidth - 20}
  height={260}
  yAxisSuffix=" cal"
  yLabelsOffset={12}
  chartConfig={{
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
  }}
  bezier
  style={styles.chartStyle}
/>


            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>Average Calories Burned: <Text style={styles.highlight}>{avgBurned} cal</Text></Text>
              <Text style={styles.summaryText}>Average Calories Consumed: <Text style={styles.highlight}>{avgConsumed} cal</Text></Text>
              <Text style={styles.summaryText}>Average Balance: <Text style={[styles.highlight, { color: avgBalance >= 0 ? '#E2F163' : '#FF6B6B' }]}>{avgBalance} cal</Text></Text>
            </View>
          </>
        )}
      </ScrollView>
      <Footer />
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#222',
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
    marginTop: 50,
    marginBottom: 70,
  },
  selectedFilters: {
    color: '#E2F163',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  openFilterButton: {
    backgroundColor: '#B3A0FF',
    paddingVertical: 10,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  openFilterButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  chartLabel: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartStyle: {
    borderRadius: 12,
  },
  summaryContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  summaryText: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 2,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#E2F163',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#E2F163',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000a',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#121212',
    borderRadius: 15,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#E2F163',
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterLabel: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
  },
  datePickerButton: {
    backgroundColor: '#222',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerText: {
    color: '#B3A0FF',
    fontSize: 16,
  },
  modalActions: {
    marginTop: 25,
  },
  applyFilterButton: {
    backgroundColor: '#E2F163',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  applyFilterButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProgressVisualization;
