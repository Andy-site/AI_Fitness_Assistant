import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, Alert, ActivityIndicator, 
  TouchableOpacity, ToastAndroid, Modal, BackHandler, VirtualizedList, StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAuthToken, createWorkoutLibrary, getWorkoutLibraries, deleteWorkoutLibrary } from '../../api/fithubApi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const CreateLibrary = () => {
  const [libraryName, setLibraryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [libraries, setLibraries] = useState([]);
  const [fetchingLibraries, setFetchingLibraries] = useState(false);
  const [token, setToken] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = await getAuthToken();
        setToken(authToken);
        if (authToken) {
          await fetchLibraries(authToken);
        }
      } catch (error) {
        console.error('Error fetching token or libraries:', error);
        setError(error.message || 'Failed to fetch token or libraries');
      }
    };
    fetchData();
  }, []);

  const fetchLibraries = async (authToken) => {
    try {
      setFetchingLibraries(true);
      const data = await getWorkoutLibraries(authToken);
      setLibraries(data);
    } catch (error) {
      console.error('Error fetching libraries:', error);
      setError(error.message || 'Failed to fetch libraries');
    } finally {
      setFetchingLibraries(false);
    }
  };

  const handleCreateLibrary = async () => {
    const trimmedName = libraryName.trim().toLowerCase();
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a library name.');
      return;
    }

    const existingLibrary = libraries.find(lib => lib.name.toLowerCase() === trimmedName);
    if (existingLibrary) {
      Alert.alert('Error', 'Duplicate Name not allowed.');
      return;
    }

    try {
      setLoading(true);
      await createWorkoutLibrary({ name: libraryName }, token);
      setLibraryName('');
      await fetchLibraries(token);
      ToastAndroid.show('Library created successfully!', ToastAndroid.SHORT);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create library.');
      setError(error.message || 'Failed to create library');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLibrary = async (libraryId) => {
    Alert.alert(
      'Delete Library',
      'Are you sure you want to delete this library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkoutLibrary(libraryId, token);
              Alert.alert('Success', 'Library deleted successfully!');
              await fetchLibraries(token);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete library.');
              setError(error.message || 'Failed to delete library');
            }
          },
        },
      ]
    );
  };

  const handleLibraryPress = (libraryId, libraryName) => {
    navigation.navigate('LibraryDetails', { libraryId, libraryName, token });
  };

  const handleEditLibrary = (libraryId, libraryName) => {
    navigation.navigate('SetExerciseLibrary', { libraryId, libraryName });
  };

  useEffect(() => {
    const backAction = () => {
      if (modalVisible) {
        setModalVisible(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
    };
  }, [modalVisible]);

  // VirtualizedList Functions
  const getItem = (data, index) => data[index];
  const getItemCount = (data) => data.length;

  return (
    <View style={styles.outercontainer}>
      <Header title="Your Library" backscreen={'Workout'} />
      <View style={styles.container}>
        <View style={styles.libraryHeader}>
          <Text style={styles.label}>My Libraries</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.addButton}>
            <View style={styles.row}>
              <Icon name="plus" size={20} color="#fff" />
              <Text style={styles.addButtonText}> Create New</Text>
              {/* You can change the text if needed */}
            </View>
          </TouchableOpacity>
        </View>

        {fetchingLibraries ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : libraries.length === 0 ? (
          <Text style={styles.noData}>No libraries found.</Text>
        ) : (
          <VirtualizedList
            data={libraries}
            initialNumToRender={5}
            keyExtractor={item => item.id.toString()}
            getItem={getItem}
            getItemCount={getItemCount}
            renderItem={({item}) => (
              <View style={styles.libraryItem}>
                <TouchableOpacity
                  onPress={() => handleLibraryPress(item.id, item.name)}>
                  <Text style={styles.libraryText}>{item.name}</Text>
                </TouchableOpacity>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditLibrary(item.id, item.name)}>
                    <Icon name="edit" size={20} color="#e2f163" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteLibrary(item.id)}>
                    <Icon name="trash" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        {/* Modal for Create Library */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.label}>Library Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter library name"
                value={libraryName}
                onChangeText={setLibraryName}
              />
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'space-between',
                  marginTop: 20,
                }}>
                <TouchableOpacity
                  style={styles.CreateButton}
                  onPress={handleCreateLibrary}
                  disabled={loading}>
                  <Text style={styles.createButtonText}>
                    {loading ? 'Creating...' : 'Confirm'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeModalText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
    outercontainer: {
      flex: 1,
      backgroundColor: '#000000',
    },
    
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      backgroundColor: '#000',
      marginTop: 70,
    },
    label: {
      fontSize: 18,
      marginBottom: 10,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
    },
    input: {
      height: 40,
      borderColor: '#000',
      color: '#000',
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 10,
      width: '100%',
      borderRadius: 5,
      backgroundColor: '#fff',
    },
    separator: {
      marginVertical: 20,
    },
    noData: {
      textAlign: 'center',
      fontSize: 16,
      color: 'white',
    },
    libraryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    libraryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      alignItems: 'center',
    },
    libraryText: {
      fontSize: 16,
      color: 'white',
      fontWeight: 'bold',
      flex: 1,
    },
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: '#007bff',
      padding: 8,
      borderRadius: 5,
      marginHorizontal: 5,
    },
    deleteButton: {
      backgroundColor: 'red',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
      backgroundColor: '#896cfe',
      padding: 30,
      borderRadius: 10,
      width: '80%',
      alignItems: 'center',
    },
    addButton: {
        backgroundColor: '#896cfe', // Background color for the button
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row', // To align icon and text in a row
        alignItems: 'center', // Vertically centers the icon and text
        justifyContent: 'center', // Centers the content
      },
      row: {
        flexDirection: 'row', // Aligns items in a row
        alignItems: 'center', // Centers items vertically
      },
      addButtonText: {
        color: '#fff', // Text color
        fontSize: 16, // Font size
        marginLeft: 5, // Adds space between the icon and the text
      },
    CreateButton: {
      backgroundColor: '#e2f163',
      padding: 10,
      borderRadius: 5,
      width: '45%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeModalButton: {
      backgroundColor: '#ff0000',
      padding: 10,
      borderRadius: 5,
      width: '45%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeModalText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    createButtonText: {
      color: '#000',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
    },
    errorText: {
      fontSize: 16,
      color: 'red',
    },
  });

export default CreateLibrary;
