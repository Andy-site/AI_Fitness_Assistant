import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

const CameraScreen = () => {
    const cameraPermission = Camera.getCameraPermissionStatus();
    const device = useCameraDevice('front');

    const newCameraPermission =async()=>{
        const status = await Camera.requestCameraPermission()};
     const { hasPermission } = useCameraPermission();
     
     if (!hasPermission) return <PermissionsPage />
     if (device == null) return <ActivityIndicator />

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraScreen;
