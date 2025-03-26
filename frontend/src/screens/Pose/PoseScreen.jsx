import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HumanPose from 'react-native-human-pose';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useKeepAwake } from '@unsw-gsbme/react-native-keep-awake';

const calculateAngle = (point1, point2, point3) => {
  const vector1 = {
    x: point1.x - point2.x,
    y: point1.y - point2.y
  };
  const vector2 = {
    x: point3.x - point2.x,
    y: point3.y - point2.y
  };

  const dotProduct = vector1.x * vector2.x + vector2.y * vector2.y;
  const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
  const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);

  const angleRad = Math.acos(dotProduct / (magnitude1 * magnitude2));
  return angleRad * (180 / Math.PI);
};

const PoseScreen = ({ route }) => {
  const { mode, exercise } = route.params;
  useKeepAwake();

  const [poseError, setPoseError] = useState('');
  const [currentPose, setCurrentPose] = useState(null);

  // Exercise-specific angle ranges
  const exerciseAngles = {
    Squat: {
      kneeAngle: { beginner: { min: 70, max: 110 }, pro: { min: 85, max: 95 } },
      hipAngle: { beginner: { min: 50, max: 130 }, pro: { min: 70, max: 110 } }
    },
    Deadlift: {
      backAngle: { beginner: { min: 30, max: 60 }, pro: { min: 40, max: 50 } },
      kneeAngle: { beginner: { min: 120, max: 160 }, pro: { min: 135, max: 145 } }
    },
    Lunge: {
      frontKneeAngle: { beginner: { min: 60, max: 120 }, pro: { min: 80, max: 100 } },
      backKneeAngle: { beginner: { min: 120, max: 180 }, pro: { min: 140, max: 160 } }
    }
  };

  const checkPoseAccuracy = (pose) => {
    if (!pose[0]?.pose) return '';
  
    const landmarks = pose[0].pose;
    let errorMessage = '';
  
    const isWithinRange = (angle, range) => angle >= range.min && angle <= range.max;
  
    // Detect if the user is facing sideways
    if (exercise === 'Squat') {
      if (landmarks.leftKnee && landmarks.rightKnee) {
        const kneeDiff = Math.abs(landmarks.leftKnee.x - landmarks.rightKnee.x);
        
        const sidewaysThreshold = 0.05; // Adjust based on camera calibration
  
        if (kneeDiff < sidewaysThreshold) {
          return 'You are facing sideways, please adjust your position!';
        }
      }
    }
  
    switch (exercise) {
      case 'Squat':
      if (landmarks.leftHip && landmarks.leftKnee && landmarks.leftAnkle) {
        // Calculate the angle between hip, knee, and ankle for the left leg
        const kneeAngle = calculateAngle(
          landmarks.leftHip,
          landmarks.leftKnee,
          landmarks.leftAnkle
        );

        // Check if the knee angle is within the correct range for the selected mode (Beginner or Pro)
        if (!isWithinRange(kneeAngle, exerciseAngles.Squat.kneeAngle[mode.toLowerCase()])) {
          errorMessage = `Knee angle (${kneeAngle.toFixed(2)}°) is not optimal`;
        }

        // Optionally, you can add more checks for the hip and ankle angles:
        if (landmarks.leftHip && landmarks.leftKnee && landmarks.leftAnkle) {
          const hipAngle = calculateAngle(
            landmarks.leftKnee,
            landmarks.leftHip,
            landmarks.leftAnkle
          );

          // Check if the hip angle is within the correct range for the selected mode (Beginner or Pro)
          if (!isWithinRange(hipAngle, exerciseAngles.Squat.hipAngle[mode.toLowerCase()])) {
            errorMessage = `Hip angle (${hipAngle.toFixed(2)}°) is not optimal`;
          }
        }
      }
      break;
  
      case 'Deadlift':
        if (landmarks.leftShoulder && landmarks.leftHip && landmarks.leftKnee) {
          const backAngle = calculateAngle(
            landmarks.leftShoulder,
            landmarks.leftHip,
            landmarks.leftKnee
          );
  
          if (!isWithinRange(backAngle, exerciseAngles.Deadlift.backAngle[mode.toLowerCase()])) {
            errorMessage = `Back angle (${backAngle.toFixed(2)}°) is not optimal`;
          }
        }
        break;
  
      case 'Lunge':
        if (landmarks.leftHip && landmarks.leftKnee && landmarks.leftAnkle) {
          const frontKneeAngle = calculateAngle(
            landmarks.leftHip,
            landmarks.leftKnee,
            landmarks.leftAnkle
          );
  
          if (!isWithinRange(frontKneeAngle, exerciseAngles.Lunge.frontKneeAngle[mode.toLowerCase()])) {
            errorMessage = `Front knee angle (${frontKneeAngle.toFixed(2)}°) is not optimal`;
          }
        }
        break;
    }
  
    return errorMessage;
  };
  

  const onPoseDetected = (pose) => {
    const error = checkPoseAccuracy(pose);
    setPoseError(error);
    setCurrentPose(pose);
  };

  return (
    <View style={styles.outerContainer}>
      <Header title={`${mode} ${exercise} Pose`} />
      
      <View style={styles.container}>
        {/* Error Message or Success Message */}
        <View style={styles.feedbackContainer}>
          {poseError ? (
            <Text style={styles.errorText}>{poseError}</Text>
          ) : (
            <Text style={styles.successText}>✅ Your posture is correct!</Text>
          )}
        </View>

        {/* Pose Detection */}
        <HumanPose
          height={350}
          width={350}
          enableKeyPoints={true}
          flipHorizontal={false}
          enableSkeleton={true}
          isBackCamera={false}
          color={'0, 255, 0'}
          onPoseDetected={onPoseDetected}
        />
      </View>
      
      <Footer />
   </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#896cfe',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  feedbackContainer: {
    width: '100%',
    paddingVertical: 10,
    marginTop:50,
    marginBottom: 5,
    alignItems: 'center',
    borderRadius: 10,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '700',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
  },
});

export default PoseScreen;
