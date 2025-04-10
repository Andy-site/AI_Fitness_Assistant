import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Image, Modal, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { fetchUserDetails, logout, updateUserProfile } from '../../api/fithubApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';

const API_BASE_URL = 'http://192.168.0.117:8000/';

const EditProfile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('Maintain');
  const [goalWeight, setGoalWeight] = useState(''); // Added state for Goal Weight
  const [goalDuration, setGoalDuration] = useState('1'); // Default to 1 month
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

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
        setGoalWeight(userData.goal_weight ? userData.goal_weight.toString() : ''); // Load Goal Weight
        setGoalDuration(userData.goal_duration ? userData.goal_duration.split(' ')[0] : '1'); // Extract the number of months
        setActivityLevel(userData.activity_level || 'moderate');

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

  const handleLogout = async () => {
    try {
      await logout();
      alert('You have been logged out successfully.');
      navigation.replace('LoginScreen');
    } catch (error) {
      console.error('Error during logout:', error.message || error);
      alert('Failed to log out. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !age || !height || !weight || !goal || !goalDuration || !activityLevel) {
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
      goal_weight: parseFloat(goalWeight), // Include Goal Weight
      goal_duration: `${goalDuration} ${parseInt(goalDuration) === 1 ? 'month' : 'months'}`,
      activity_level: activityLevel,
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
            {/* Input Fields */}
            {[
              { label: 'First Name', value: firstName, setValue: setFirstName },
              { label: 'Last Name', value: lastName, setValue: setLastName },
              { label: 'Age', value: age, setValue: setAge, keyboardType: 'numeric' },
              { label: 'Height', value: height, setValue: setHeight, keyboardType: 'numeric' },
              { label: 'Weight', value: weight, setValue: setWeight, keyboardType: 'numeric' },
              { label: 'Goal Weight', value: goalWeight, setValue: setGoalWeight, keyboardType: 'numeric' }, // Added Goal Weight
            ].map((item, index) => (
              <View style={styles.inputGroup} key={index}>
                <Text style={styles.inputLabel}>{item.label}:</Text>
                <TextInput
                  placeholder={item.label}
                  value={item.value}
                  onChangeText={item.setValue}
                  keyboardType={item.keyboardType || 'default'}
                  style={styles.input}
                />
              </View>
            ))}

            {/* Picker for Goal */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal:</Text>
              <Picker
                selectedValue={goal}
                onValueChange={(itemValue) => setGoal(itemValue)}
                style={styles.picker}>
                <Picker.Item label="Weight Loss" value="Weight Loss" />
                <Picker.Item label="Weight Gain" value="Weight Gain" />
              </Picker>
            </View>

            {/* Picker for Goal Duration */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal Duration:</Text>
              <Picker
                selectedValue={goalDuration}
                onValueChange={(itemValue) => setGoalDuration(itemValue)}
                style={styles.picker}>
                {Array.from({ length: 12 }, (_, i) => (
                  <Picker.Item key={i} label={`${i + 1} Month${i > 0 ? 's' : ''}`} value={`${i + 1}`} />
                ))}
              </Picker>
            </View>

            {/* Picker for Activity Level */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Level:</Text>
              <Picker
                selectedValue={activityLevel}
                onValueChange={(itemValue) => setActivityLevel(itemValue)}
                style={styles.picker}>
                <Picker.Item label="Sedentary (little or no exercise)" value="sedentary" />
                <Picker.Item label="Lightly Active (light exercise 1-3 days/week)" value="light" />
                <Picker.Item label="Moderately Active (moderate exercise 3-5 days/week)" value="moderate" />
                <Picker.Item label="Very Active (hard exercise 6-7 days/week)" value="active" />
              </Picker>
            </View>
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
  scrollContainer: { flex: 1, marginBottom: 10, marginTop: 70, marginBottom: 70 },
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
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff', // White background for input fields
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  picker: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff', // White background for Picker
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
  editIcon: { marginLeft: 'auto' },
  submitButton: {
    backgroundColor: '#E2F163',
    paddingVertical: 10,
    width: '50%',
    borderRadius: 25,
    marginTop: 20,
    alignSelf: 'center',
  },
  submitButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EditProfile;
