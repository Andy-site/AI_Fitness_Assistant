import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Image, Alert, Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'; // Import image picker methods
import { updateUserProfile } from '../../api/fithubApi';

const EditProfile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  // Function to validate image size
  const validateImageSize = (uri) => {
    return new Promise((resolve, reject) => {
      if (uri) {
        // Check the file size
        fetch(uri)
          .then((response) => response.blob())
          .then((blob) => {
            if (blob.size <= MAX_IMAGE_SIZE) {
              resolve(true);
            } else {
              reject('Image size exceeds the 5MB limit');
            }
          })
          .catch(() => reject('Failed to get image size'));
      } else {
        reject('No image selected');
      }
    });
  };

  // Function to pick image from gallery or camera
  const pickImage = (source) => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: false,
      maxWidth: 800, // Optional, resize the image if it's too large
      maxHeight: 800, // Optional, resize the image if it's too large
    };

    if (source === 'camera') {
      launchCamera(options, handleImageResponse);
    } else if (source === 'gallery') {
      launchImageLibrary(options, handleImageResponse);
    }
  };

  // Handle image picker response
  const handleImageResponse = async (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
    } else {
      const { uri } = response.assets[0];

      try {
        // Validate image size
        await validateImageSize(uri);
        setProfileImage(response.assets[0]);
      } catch (error) {
        Alert.alert('Error', error);
      }
    }
  };

  // Submit function to update user profile
  const handleSubmit = async () => {
    const userData = {
      first_name: firstName,
      last_name: lastName,
      age: parseInt(age),
      height: parseFloat(height),
      weight: parseFloat(weight),
      goal: goal,
    };

    try {
      const response = await updateUserProfile(userData, profileImage);
      Alert.alert('Profile updated successfully', `Welcome, ${response.first_name}`);
    } catch (error) {
      Alert.alert('Error updating profile', error.message || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <View style={styles.formContainer}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
        <Text style={styles.label}>Age</Text>
        <TextInput
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.label}>Height</Text>
        <TextInput
          placeholder="Height"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.label}>Weight</Text>
        <TextInput
          placeholder="Weight"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.label}>Goal</Text>
        <TextInput
          placeholder="Goal"
          value={goal}
          onChangeText={setGoal}
          style={styles.input}
        />
      </View>
      
      {/* Profile Image */}
      {profileImage && (
        <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
      )}

      <View style={styles.buttonContainer}>
        <Button title="Open Camera" onPress={() => pickImage('camera')} />
        <Button title="Upload Photo" onPress={() => pickImage('gallery')} />
        <Button title="Update Profile" onPress={handleSubmit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Black background
  },
  formContainer: {
    width: '80%',
    backgroundColor: '#B3A0FF', // Purple container background
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#232323',
    fontWeight: '500',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 50,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingLeft: 10,
    fontSize: 16,
    color: '#232323',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 20,
  },
});

export default EditProfile;
