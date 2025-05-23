import React, { useState, useEffect, useRef } from 'react';
import {
  View, TextInput, Image, Modal, StyleSheet, TouchableOpacity, Alert, Text,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { fetchUserDetails, updateUserProfile } from '../../api/fithubApi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

// const API_BASE_URL = 'http://192.168.0.117:8000/';
const API_BASE_URL = 'http://localhost:8000/';

const EditProfile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('Maintain');
  const [goalWeight, setGoalWeight] = useState('');
  const [goalDuration, setGoalDuration] = useState('1');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const navigation = useNavigation();

  const [fieldStates, setFieldStates] = useState({
    firstName: true,
    lastName: true,
    age: true,
    height: true,
    weight: true,
    goalWeight: goal !== 'Maintain',
  });

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
        setGoalWeight(userData.goal_weight ? userData.goal_weight.toString() : '');
        setGoalDuration(userData.goal_duration ? userData.goal_duration.split(' ')[0] : '1');
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

  useEffect(() => {
    setFieldStates(prev => ({
      ...prev,
      goalWeight: goal !== 'Maintain',
    }));
  }, [goal]);

  const toggleFieldEditable = (fieldName) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleImageResponse = (response) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      console.error('ImagePicker Error: ', response.errorMessage);
      return;
    }
    if (response.assets && response.assets.length > 0) {
      const selectedImage = response.assets[0];
      setProfileImage({
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.fileName,
      });
    }
    setIsModalVisible(false);
  };

  const openCamera = () => {
    launchCamera({ mediaType: 'photo' }, handleImageResponse);
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo' }, handleImageResponse);
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !age || !height || !weight || !goal) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      if (goal === 'Weight Loss' && parseFloat(goalWeight) >= parseFloat(weight)) {
        Alert.alert('Invalid Goal Weight', 'For weight loss, goal weight must be less than your current weight.');
        return;
      }

      if (goal === 'Weight Gain' && parseFloat(goalWeight) <= parseFloat(weight)) {
        Alert.alert('Invalid Goal Weight', 'For weight gain, goal weight must be greater than your current weight.');
        return;
      }

      const formattedGoalDuration = `${goalDuration} month`;
      const formData = new FormData();
      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      formData.append('age', age.toString());
      formData.append('height', height.toString());
      formData.append('weight', weight.toString());
      formData.append('goal', goal);
      formData.append('goal_duration', formattedGoalDuration);
      formData.append('activity_level', activityLevel);
      if (goalWeight) formData.append('goal_weight', goalWeight.toString());
      if (profileImage?.uri) {
        formData.append('profile_photo', {
          uri: Platform.OS === 'android' ? profileImage.uri : profileImage.uri.replace('file://', ''),
          type: 'image/jpeg',
          name: 'profile_photo.jpg',
        });
      }

      const response = await updateUserProfile(formData);
      if (response) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      }

    } catch (error) {
      console.error('Profile Update Error:', error);
      Alert.alert('Update Failed', error.message || 'Failed to update profile. Please try again.');
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
            <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.profileImageButton}>
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
            {[
  { label: 'First Name', value: firstName, setValue: setFirstName, key: 'firstName' },
  { label: 'Last Name', value: lastName, setValue: setLastName, key: 'lastName' },
  { label: 'Age', value: age, setValue: setAge, keyboardType: 'numeric', key: 'age' },
  { label: 'Height(cm)', value: height, setValue: setHeight, keyboardType: 'numeric', key: 'height' },
  { label: 'Weight(Kg)', value: weight, setValue: setWeight, keyboardType: 'numeric', key: 'weight' },
  {
    label: 'Goal Weight(Kg)',
    value: goalWeight,
    setValue: (text) => {
      if (text === '' || /^\d*\.?\d{0,2}$/.test(text)) setGoalWeight(text);
    },
    keyboardType: 'numeric',
    key: 'goalWeight',
    editable: goal !== 'Maintain',
    style: [
      goal === 'Maintain' && styles.disabledInput,
      parseFloat(goalWeight) >= parseFloat(weight) && goal === 'Weight Loss' && styles.errorInput,
      parseFloat(goalWeight) <= parseFloat(weight) && goal === 'Weight Gain' && styles.errorInput
    ]
  }
].map((item, index) => (
  <View style={styles.inputGroup} key={index}>
    <Text style={styles.inputLabel}>{item.label}:</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        placeholder={item.placeholder || item.label}
        value={item.value}
        onChangeText={item.setValue}
        keyboardType={item.keyboardType || 'default'}
        style={[
          styles.input,
          item.style,
          !fieldStates[item.key] && styles.disabledInput,
        ]}
        editable={fieldStates[item.key]}
      />
      <TouchableOpacity onPress={() => toggleFieldEditable(item.key)} style={styles.inlineEditIcon}>
        <MaterialIcons name={fieldStates[item.key] ? 'edit' : 'edit'} size={22} color="#b3a0ff" />
      </TouchableOpacity>
    </View>
  </View>
))}


            {/* Pickers */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal:</Text>
              <Picker
                selectedValue={goal}
                onValueChange={(itemValue) => setGoal(itemValue)}
                style={styles.picker}
              >
                
                <Picker.Item label="Weight Loss" value="Weight Loss" />
                <Picker.Item label="Weight Gain" value="Weight Gain" />
              </Picker>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal Duration:</Text>
              <Picker
                selectedValue={goalDuration}
                onValueChange={(itemValue) => setGoalDuration(itemValue)}
                style={styles.picker}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <Picker.Item key={i} label={`${i + 1} Month${i > 0 ? 's' : ''}`} value={`${i + 1}`} />
                ))}
              </Picker>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Level:</Text>
              <Picker
                selectedValue={activityLevel}
                onValueChange={(itemValue) => setActivityLevel(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Sedentary" value="sedentary" />
                <Picker.Item label="Light" value="light" />
                <Picker.Item label="Moderate" value="moderate" />
                <Picker.Item label="Active" value="active" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </ScrollView>

        <Footer />

        {/* Modal */}
        <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Image</Text>
              <TouchableOpacity style={styles.modalButton} onPress={openCamera}>
                <Text style={styles.modalButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={openGallery}>
                <Text style={styles.modalButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
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
  container: { flex: 1, backgroundColor: '#222' },
  scrollContainer: { flex: 1, marginTop: 70, marginBottom: 70 },
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
  inputGroup: { marginVertical: 8 },
  inputLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 5,
  borderColor: '#ddd',
  borderWidth: 1,
},

inlineEditIcon: {
  paddingHorizontal: 8,
  paddingVertical: 6,
  justifyContent: 'center',
  alignItems: 'center',
  borderLeftWidth: 1,
  borderColor: '#ccc',
},

  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  disabledInput: {
    backgroundColor: '#dcdcdc',
    color: '#888',
  },
  errorInput: {
    borderColor: '#FF5252',
  },
  iconButton: {
    marginLeft: 8,
    padding: 6,
    backgroundColor: '#e2f163',
    borderRadius: 6,
  },
  picker: {
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
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
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 10,
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
