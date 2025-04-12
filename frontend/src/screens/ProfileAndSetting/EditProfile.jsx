import React, { useState, useEffect , useRef} from 'react';
import { View, TextInput, Button, Image, Modal, StyleSheet, TouchableOpacity, Alert,Text, KeyboardAvoidingView, Platform, ScrollView, alert} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { fetchUserDetails, logout, updateUserProfile } from '../../api/fithubApi';
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
  const goalWeightRef = useRef(null);
  const [goalDuration, setGoalDuration] = useState('1'); // Default to 1 month
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
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
   navigation.navigate('LogoutScreen'); // Navigate to the login screen
  };

  const handleImageResponse = (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.error('ImagePicker Error: ', response.errorMessage);
    } else if (response.assets && response.assets.length > 0) {
      const selectedImage = response.assets[0];
      setProfileImage({
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.fileName,
      });
      console.log('Image selected:', selectedImage);
    }
    setIsModalVisible(false); // Close the modal after selecting an image
  };

  const openCamera = () => {
    launchCamera({ mediaType: 'photo' }, handleImageResponse);
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo' }, handleImageResponse);
  };

  // Update the handleSubmit function with better error handling:
  const handleSubmit = async () => {
    if (!firstName || !lastName || !age || !height || !weight || !goal) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
  
    try {
      setLoading(true);
      
      // Validate goal weight based on goal type before making API call
      if (goal === 'Weight Loss' && parseFloat(goalWeight) >= parseFloat(weight)) {
        Alert.alert(
          'Invalid Goal Weight',
          'For weight loss, goal weight must be less than your current weight.'
        );
        return;
      }
  
      if (goal === 'Weight Gain' && parseFloat(goalWeight) <= parseFloat(weight)) {
        Alert.alert(
          'Invalid Goal Weight',
          'For weight gain, goal weight must be greater than your current weight.'
        );
        return;
      }
  
      const formattedGoalDuration = `${goalDuration} ${parseInt(goalDuration) === 1 ? 'month' : 'months'}`;
    
    const formData = new FormData();
    formData.append('first_name', firstName.trim());
    formData.append('last_name', lastName.trim());
    formData.append('age', age.toString());
    formData.append('height', height.toString());
    formData.append('weight', weight.toString());
    formData.append('goal', goal);
    formData.append('goal_duration', formattedGoalDuration); // Send formatted duration
    formData.append('activity_level', activityLevel);

    if (goalWeight) {
      formData.append('goal_weight', goalWeight.toString());
    }

    if (profileImage?.uri) {
      formData.append('profile_photo', {
        uri: Platform.OS === 'android' ? profileImage.uri : profileImage.uri.replace('file://', ''),
        type: 'image/jpeg',
        name: 'profile_photo.jpg'
      });
    }

    // Debug log to check what's being sent
    console.log('Sending form data:', Object.fromEntries(formData._parts));

    const response = await updateUserProfile(formData);
    
    if (response) {
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    }

  } catch (error) {
    console.error('Profile Update Error:', error);
    
    // Handle specific validation errors
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.goal_duration) {
        Alert.alert('Error', `Goal Duration: ${errorData.goal_duration[0]}`);
        return;
      }
    }
    
    // Handle generic errors
    Alert.alert(
      'Update Failed',
      error.message || 'Failed to update profile. Please try again.'
    );
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
              onPress={() => setIsModalVisible(true)} // Open the modal
              style={styles.profileImageButton}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
              ) : (
                <Text style={styles.addPhotoText}>+ Add Photo</Text>
              )}
              <View style={styles.editIconOverlay}>
                <MaterialIcons name="photo-camera-back" size={20} color="#b3a0ff" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {/* Input Fields */}
            {[
              { label: 'First Name', value: firstName, setValue: setFirstName },
              { label: 'Last Name', value: lastName, setValue: setLastName },
              { label: 'Age', value: age, setValue: setAge, keyboardType: 'numeric' },
              { label: 'Height(cm)', value: height, setValue: setHeight, keyboardType: 'numeric' },
              { label: 'Weight(Kg)', value: weight, setValue: setWeight, keyboardType: 'numeric' },
              
                { 
                  label: 'Goal Weight(Kg)', 
                  value: goalWeight, 
                  setValue: (text) => {
                    // Only allow numeric input with up to 2 decimal places
                    if (text === '' || /^\d*\.?\d{0,2}$/.test(text)) {
                      setGoalWeight(text);
                    }
                  },
                  keyboardType: 'numeric',
                  ref: goalWeightRef,
                  placeholder: 'Enter target weight in kg',
                  editable: goal !== 'Maintain', // Disable if goal is Maintain
                  style: [
                    styles.input,
                    goal === 'Maintain' && styles.disabledInput,
                    parseFloat(goalWeight) >= parseFloat(weight) && goal === 'Weight Loss' && styles.errorInput,
                    parseFloat(goalWeight) <= parseFloat(weight) && goal === 'Weight Gain' && styles.errorInput
                  ]
                }
              ].map((item, index) => (
                <View style={styles.inputGroup} key={index}>
                  <Text style={styles.inputLabel}>{item.label}:</Text>
                  <TextInput
                    ref={item.ref}
                    placeholder={item.placeholder || item.label}
                    value={item.value}
                    onChangeText={item.setValue}
                    keyboardType={item.keyboardType || 'default'}
                    style={[styles.input, item.style]}
                    editable={item.editable !== false}
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

        {/* Modal for Image Picker Options */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Image</Text>
              <TouchableOpacity style={styles.modalButton} onPress={openCamera}>
                <Text style={styles.modalButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={openGallery}>
                <Text style={styles.modalButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#e2f163',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF5252',
  },
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
