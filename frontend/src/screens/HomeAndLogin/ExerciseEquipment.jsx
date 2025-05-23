import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  VirtualizedList,
  Picker, // for dropdown functionality
} from 'react-native';
import { capitalizeWords } from '../../utils/StringUtils';

const API_URL = "http://192.168.0.117:8000/api/exercises/";

const ExerciseByEquipment = () => {
  const [exercises, setExercises] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setExercises(data);
      extractEquipmentList(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractEquipmentList = (data) => {
    const uniqueEquipment = [...new Set(data.map(item => item.equipment))];
    setEquipmentList(uniqueEquipment);
  };

  const filterExercisesByEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    setModalVisible(false);
  };

  const getItem = (data, index) => data[index];
  const getItemCount = (data) => data.length;

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.filterButtonText}>{selectedEquipment || "Select Equipment"}</Text>
        </TouchableOpacity>
        {/* Dropdown Button */}
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.dropdownButton}>
          <Text style={styles.dropdownText}>▼</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E2F163" style={styles.loader} />
      ) : (
        <VirtualizedList
          data={exercises.filter(ex => !selectedEquipment || ex.equipment === selectedEquipment)}
          keyExtractor={(item, index) => `exercise-${index}`}
          initialNumToRender={10}
          maxToRenderPerBatch={15}
          windowSize={7}
          removeClippedSubviews
          getItem={getItem}
          getItemCount={getItemCount}
          renderItem={({ item }) => (
            <View style={styles.exerciseItem}>
              <Text style={styles.exerciseText}>{capitalizeWords(item.name)}</Text>
              <Text style={styles.equipmentText}>Equipment: {capitalizeWords(item.equipment)}</Text>
              <Text style={styles.equipmentText}>Body Part: {capitalizeWords(item.category)}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.noResultsText}>No exercises found</Text>}
        />
      )}

      {/* Equipment Selection Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <VirtualizedList
              data={equipmentList}
              keyExtractor={(item, index) => `equipment-${index}`}
              initialNumToRender={10}
              maxToRenderPerBatch={15}
              windowSize={7}
              removeClippedSubviews
              getItem={getItem}
              getItemCount={getItemCount}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => filterExercisesByEquipment(item)}>
                  <Text style={styles.modalText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#222', padding: 15 },
  filterContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  filterButton: { backgroundColor: '#E2F163', padding: 10, borderRadius: 8, alignItems: 'center', flex: 1 },
  filterButtonText: { color: '#000', fontWeight: 'bold' },
  dropdownButton: { marginLeft: 10 },
  dropdownText: { fontSize: 24, color: '#E2F163', fontWeight: 'bold' },
  loader: { marginTop: 20 },
  exerciseItem: { backgroundColor: '#B3A0FF', padding: 10, marginBottom: 10, borderRadius: 8 },
  exerciseText: { fontSize: 16, color: '#000', fontWeight: 'bold' },
  equipmentText: { fontSize: 14, color: '#e2f163' },
  noResultsText: { color: '#FFF', textAlign: 'center', marginTop: 20 },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#222', padding: 20, borderRadius: 10, marginHorizontal: 30 },
  modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#444' },
  modalText: { color: '#FFF', fontSize: 16 },
  closeButton: { backgroundColor: '#E2F163', padding: 10, marginTop: 10, borderRadius: 8, alignItems: 'center' },
  closeButtonText: { color: '#000', fontWeight: 'bold' },
});

export default ExerciseByEquipment;
