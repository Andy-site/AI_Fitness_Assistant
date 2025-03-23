import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HumanPose from 'react-native-human-pose';

const PoseScreen = () => {
  const [noOfSquats, setNoOfSquats] = useState(0);
  const [hasSit, setHasSit] = useState(false);
  const [hasStand, setHasStand] = useState(false);

  const onPoseDetected = (pose) => {
    console.log('leftHip', pose[0]?.pose?.leftHip?.y);
    console.log('leftAnkle', pose[0]?.pose?.leftAnkle?.y);
    
    if (
      pose[0]?.pose?.leftHip?.confidence > 0.5 &&
      pose[0]?.pose?.leftAnkle?.confidence > 0.5
    ) {
      if (
        Math.abs(pose[0]?.pose?.leftHip?.y - pose[0]?.pose?.leftAnkle?.y) < 400
      ) {
        setHasSit(true);
        setHasStand(false);
      }
      if (hasSit) {
        if (
          Math.abs(pose[0]?.pose?.leftHip?.y - pose[0]?.pose?.leftAnkle?.y) > 400
        ) {
          setHasStand(true);
          setHasSit(false);
        }
      }
    }
  };

  useEffect(() => {
    if (hasStand) {
      setNoOfSquats((prev) => prev + 1);
    }
  }, [hasStand]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Human Pose</Text>
      <HumanPose
        height={500}
        width={400}
        enableKeyPoints={true}
        flipHorizontal={false}
        isBackCamera={false}
        color={'255, 0, 0'}
        onPoseDetected={onPoseDetected}
      />
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          No of Squats: {noOfSquats}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  counterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 10,
  },
  counterText: {
    textAlign: 'center',
    fontSize: 20,
  },
});

export default PoseScreen;