import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Image, Modal, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { fetchUserDetails, updateUserProfile } from '../../api/fithubApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const EditProfile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);

  useEffect(() => {
    fetchUserDetailsFromStorage();
  }, []);

  const fetchUserDetailsFromStorage = async () => {
    try {
      setLoading(true);
      const storedUserDetails = await AsyncStorage.getItem('user_details');
      if (storedUserDetails) {
        const userData = JSON.parse(storedUserDetails);
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        setAge(userData.age ? userData.age.toString() : '');
        setHeight(userData.height ? userData.height.toString() : '');
        setWeight(userData.weight ? userData.weight.toString() : '');
        setGoal(userData.goal || '');
        if (userData.profile_image) {
          setProfileImage({ uri: userData.profile_image });
        }
      } else {
        const fetchedUserDetails = await fetchUserDetails();
        setFirstName(fetchedUserDetails.first_name || '');
        setLastName(fetchedUserDetails.last_name || '');
        setAge(fetchedUserDetails.age ? fetchedUserDetails.age.toString() : '');
        setHeight(fetchedUserDetails.height ? fetchedUserDetails.height.toString() : '');
        setWeight(fetchedUserDetails.weight ? fetchedUserDetails.weight.toString() : '');
        setGoal(fetchedUserDetails.goal || '');
        if (fetchedUserDetails.profile_image) {
          setProfileImage({ uri: fetchedUserDetails.profile_image });
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching user details:', error);
    }
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !age || !height || !weight || !goal) {
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

  const pickImage = () => {
    setImagePickerVisible(true);
  };

  const imagePickerOptions = {
    mediaType: 'photo',
    quality: 1,
    maxWidth: 800,
    maxHeight: 800,
  };

  const handleImageResponse = (response) => {
    if (response.didCancel) return;
    if (response.error) {
      console.error('Image Picker Error:', response.error);
      return;
    }
    if (response.assets && response.assets.length > 0) {
      setProfileImage({ uri: response.assets[0].uri });
    }
    setImagePickerVisible(false);
  };

  // Edit icon component
  const EditIcon = () => (
    <Text style={styles.editIcon}>✏️</Text>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header title="Update User Info" />
        
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.profileImageButton}>
            {profileImage ? (
              <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
            ) : (
              <Text style={styles.addPhotoText}>+ Add Photo</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name:</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                placeholder="First Name" 
                value={firstName} 
                onChangeText={setFirstName} 
                style={styles.input} 
              />
              <EditIcon />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name:</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                placeholder="Last Name" 
                value={lastName} 
                onChangeText={setLastName} 
                style={styles.input} 
              />
              <EditIcon />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age:</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                placeholder="Age" 
                value={age} 
                onChangeText={setAge} 
                keyboardType="numeric" 
                style={styles.input} 
              />
              <EditIcon />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Height:</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                placeholder="Height (cm)" 
                value={height} 
                onChangeText={setHeight} 
                keyboardType="numeric" 
                style={styles.input} 
              />
              <EditIcon />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight:</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                placeholder="Weight (kg)" 
                value={weight} 
                onChangeText={setWeight} 
                keyboardType="numeric" 
                style={styles.input} 
              />
              <EditIcon />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Goal:</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                placeholder="Goal" 
                value={goal} 
                onChangeText={setGoal} 
                style={styles.input} 
              />
              <EditIcon />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Update Profile</Text>
        </TouchableOpacity>

        <Footer />

        {/* Modal for Image Picker */}
        <Modal transparent={true} visible={imagePickerVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Image Source</Text>
              <TouchableOpacity style={styles.modalButton} onPress={() => launchCamera(imagePickerOptions, handleImageResponse)}>
                <Text style={styles.modalButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => launchImageLibrary(imagePickerOptions, handleImageResponse)}>
                <Text style={styles.modalButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setImagePickerVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  profileImageContainer: { 
    alignItems: 'center', 
    marginVertical: 20 
  },
  profileImageButton: { 
    backgroundColor: '#E2F163', 
    padding: 20, 
    borderRadius: 50, 
    width: 120, 
    height: 120, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  profileImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 50 
  },
  addPhotoText: { 
    fontSize: 16, 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  formContainer: { 
    paddingHorizontal: 20, 
    backgroundColor: '#896cfe' 
  },
  inputGroup: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 8,
    justifyContent: 'space-between'
  },
  inputLabel: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold',
    width: '25%'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
    width: '75%'
  },
  input: { 
    height: 50, 
    paddingLeft: 10, 
    fontSize: 16,
    flex: 1
  },
  editIcon: {
    fontSize: 18,
    paddingHorizontal: 10,
    color: '#333'
  },
  submitButton: { 
    backgroundColor: '#E2F163', 
    paddingVertical: 15, 
    borderRadius: 25, 
    marginTop: 20, 
    marginHorizontal: 20,
    alignItems: 'center'
  },
  submitButtonText: { 
    color: '#000', 
    fontSize: 18, 
    fontWeight: 'bold'
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 10, 
    marginHorizontal: 40 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  modalButton: { 
    backgroundColor: '#E2F163', 
    padding: 15, 
    borderRadius: 10, 
    marginVertical: 5, 
    alignItems: 'center' 
  },
  modalButtonText: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  modalCancelButton: { 
    alignItems: 'center', 
    marginTop: 10 
  },
  modalCancelText: { 
    fontSize: 16, 
    color: '#FF0000' 
  },
});

export default EditProfile;