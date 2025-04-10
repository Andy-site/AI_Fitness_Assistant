import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Image, Modal, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { fetchUserDetails, updateUserProfile } from '../../api/fithubApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';


const API_BASE_URL = 'http://192.168.0.117:8000/';

const EditProfile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('Maintain');
  const [goalWeight, setGoalWeight] = useState('');
  const [goalDuration, setGoalDuration] = useState('1 month');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null); // State to track focused input
  
  const navigation = useNavigation(); // Get the navigation object

  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        setLoading(true);
        const userData = await fetchUserDetails();
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        setAge(userData.age ? userData.age.toString() : '');
        setHeight(userData.height ? userData.height.toString() : '');
        setWeight(userData.weight ? userData.weight.toString() : '');
        setGoal(userData.goal || 'Maintain');
        setGoalDuration(userData.goal_duration || '1 month');

        if (userData.profile_photo) {
          setProfileImage({
            uri: userData.profile_photo.startsWith('http')
              ? userData.profile_photo
              : `${API_BASE_URL}${userData.profile_photo}`,
          });
        }
      } catch (error) {
        console.error('Error loading user details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserDetails();
  }, []);

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleImageResponse = (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
    } else {
      const source = { uri: response.assets[0].uri };
      setProfileImage(source);
      setImagePickerVisible(false);
    }
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !age || !height || !weight || !goal || !goalDuration) {
      alert('Please fill in all fields.');
      return;
    }

    const updatedUserData = {
      first_name: firstName,
      last_name: lastName,
      age: parseInt(age, 10),
      height: parseFloat(height),
      weight: parseFloat(weight),
      goal: goal,
      goal_duration: goalDuration,
      goal_weight: parseFloat(goalWeight) || null, // Ensure it's null if no goal weight is set
    };

    try {
      setLoading(true);
      const updatedData = await updateUserProfile(updatedUserData, profileImage);
      await AsyncStorage.setItem('user_details', JSON.stringify(updatedData));
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error.message);
      alert('Failed to update profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    navigation.navigate('LogoutScreen'); // Navigate to LogoutScreen
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header title="Profile" />

        <ScrollView style={styles.scrollContainer}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity
              onPress={() => {
                launchImageLibrary({ mediaType: 'photo' }, handleImageResponse);
              }}
              style={styles.profileImageButton}>
              {profileImage ? (
                <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
              ) : (
                <Text style={styles.addPhotoText}>+ Add Photo</Text>
              )}
              <View style={styles.editIconOverlay}>
                <MaterialIcons name="edit" size={20} color="#B3A0FF" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {[ 
              { label: 'First Name', value: firstName, setValue: setFirstName, field: 'firstName' },
              { label: 'Last Name', value: lastName, setValue: setLastName, field: 'lastName' },
              { label: 'Age', value: age, setValue: setAge, field: 'age', keyboardType: 'numeric' },
              { label: 'Height', value: height, setValue: setHeight, field: 'height', keyboardType: 'numeric' },
              { label: 'Weight', value: weight, setValue: setWeight, field: 'weight', keyboardType: 'numeric' },
              { label: 'Goal', value: goal, setValue: setGoal, field: 'goal', dropdown: true, options: ['Weight Loss', 'Weight Gain'] },
              { label: 'Goal Duration', value: goalDuration, setValue: setGoalDuration, field: 'goalDuration', dropdown: true, options: ['1 month', '2 months', '3 months', '4 months', '5 months', '6 months', '7 months', '8 months', '9 months', '10 months', '11 months', '12 months'] },
            ].map((item, index) => (
              <View style={styles.inputGroup} key={index}>
                <Text style={styles.inputLabel}>{item.label}:</Text>
                <View style={styles.inputWrapper}>
                  {item.dropdown ? (
                    <Picker
                      selectedValue={item.value}
                      onValueChange={item.setValue}
                      style={styles.picker}>
                      {item.options.map((option, idx) => (
                        <Picker.Item key={idx} label={option} value={option} />
                      ))}
                    </Picker>
                  ) : (
                    <TextInput
                      placeholder={item.label}
                      value={item.value}
                      onChangeText={item.setValue}
                      keyboardType={item.keyboardType || 'default'}
                      onFocus={() => handleFocus(item.field)}
                      onBlur={handleBlur}
                      style={styles.input}
                    />
                  )}
                  <MaterialIcons
                    name="edit"
                    size={20}
                    color={focusedField === item.field ? '#E2F163' : '#B3A0FF'}
                    style={styles.editIcon}
                  />
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Update Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleLogout}>
            <Text style={styles.submitButtonText}>Log out</Text>
          </TouchableOpacity>
        </ScrollView>
        <Footer />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContainer: { flex: 1, marginBottom: 10, marginTop: 70 },
  profileImage: { width: 130, height: 130, borderRadius: 75 },
  addPhotoText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  profileImageContainer: { alignItems: 'center', marginVertical: 20 },
  profileImageButton: {
    backgroundColor: '#B3A0FF',
    borderRadius: 75,
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  editIconOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 5,
  },
  formContainer: { paddingHorizontal: 20, backgroundColor: '#B3A0FF' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, justifyContent: 'space-between' },
  inputLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold', width: '25%' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
    width: '75%',
  },
  input: { flex: 1, padding: 10, fontSize: 16, color: '#000' },
  picker: { 
    flex: 1, 
    padding: 1, 
    fontSize: 20, 
    color: '#000', 
    borderColor: '#ddd',  // Adding border color
    borderWidth: 1,       // Adding border width
    borderRadius: 5,      // Optional: to match other input fields' rounded corners
  },
  editIcon: { marginLeft: 'auto' },
  submitButton: {
    backgroundColor: '#E2F163',
    paddingVertical: 10,
    width: '50%',
    borderRadius: 25,
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: '50',
  },
  submitButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


export default EditProfile;
