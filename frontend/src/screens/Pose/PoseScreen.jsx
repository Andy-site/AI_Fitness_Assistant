import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity , ScrollView} from 'react-native';
import HumanPose from 'react-native-human-pose';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useKeepAwake } from '@unsw-gsbme/react-native-keep-awake';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const calculateAngle = (point1, point2, point3) => {
  if (!point1 || !point2 || !point3) return null;
  
  const vector1 = {
    x: point1.x - point2.x,
    y: point1.y - point2.y
  };
  const vector2 = {
    x: point3.x - point2.x,
    y: point3.y - point2.y
  };

  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
  const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
  const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);

  // Ensure we don't divide by zero or get NaN
  if (magnitude1 === 0 || magnitude2 === 0 || isNaN(dotProduct)) return null;

  const cosTheta = Math.min(Math.max(dotProduct / (magnitude1 * magnitude2), -1), 1);
  const angleRad = Math.acos(cosTheta);
  return angleRad * (180 / Math.PI);
};

const PoseScreen = ({ route }) => {
  const { mode, exercise } = route.params;
  useKeepAwake();

  const [poseError, setPoseError] = useState('');
  const [currentPose, setCurrentPose] = useState(null);
  const [isBackCamera, setIsBackCamera] = useState(false);
  const [personDetected, setPersonDetected] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [lastFeedbackTime, setLastFeedbackTime] = useState(0);

  // Exercise-specific angle ranges
  const exerciseAngles = {
    Squat: {
      kneeAngle: { beginner: { min: 70, max: 110 }, pro: { min: 85, max: 95 } },
      hipAngle: { beginner: { min: 50, max: 130 }, pro: { min: 70, max: 110 } }
    },
    Deadlift: {
      backAngle: { beginner: { min: 30, max: 60 }, pro: { min: 40, max: 50 } },
      kneeAngle: { beginner: { min: 120, max: 160 }, pro: { min: 135, max: 145 } }
    }
  };

  // Feedback messages
  const feedbackMessages = {
    Squat: {
      kneeAngleTooSmall: "Bend your knees more for proper squat depth",
      kneeAngleTooLarge: "Don't bend your knees too much, maintain control",
      hipAngleTooSmall: "Lower your hips more for proper form",
      hipAngleTooLarge: "Keep your back more upright",
      almostCorrect: "Great squat form! Just a little adjustment needed",
      perfect: "Perfect squat form! Keep it up!",
      sideways: "Please turn to face the camera for better analysis"
    },
    Deadlift: {
      backAngleTooSmall: "Keep your back more upright",
      backAngleTooLarge: "Bend forward a bit more from your hips",
      kneeAngleTooSmall: "Bend your knees less, hinge at the hips",
      kneeAngleTooLarge: "Bend your knees slightly more for proper form",
      almostCorrect: "Great deadlift form! Minor adjustments needed",
      perfect: "Excellent deadlift technique! Maintain this form",
      sideways: "Turn to show your side profile for better deadlift analysis"
    }
  };

  const checkPoseAccuracy = (pose) => {
    // Return early if no pose data
    if (!pose || !pose[0]?.pose) {
      setPersonDetected(false);
      return 'No person detected';
    }
    
    setPersonDetected(true);
    const landmarks = pose[0].pose;
    let errorMessage = '';
    let debugData = {};
  
    const isWithinRange = (angle, range) => {
      if (angle === null) return false;
      return angle >= range.min && angle <= range.max;
    };
  
    // Rate limit feedback to prevent flickering
    const now = Date.now();
    if (now - lastFeedbackTime < 500) {
      return poseError;
    }
    setLastFeedbackTime(now);
  
    // Check if we have enough landmarks to work with
    const hasEnoughLandmarks = landmarks.leftHip && landmarks.leftKnee && 
                              landmarks.leftAnkle && landmarks.leftShoulder;
    
    if (!hasEnoughLandmarks) {
      return 'Please ensure your full body is visible';
    }
  
    switch (exercise) {
      case 'Squat':
        // Check if user is sideways (for squats we want front view)
        if (landmarks.leftShoulder && landmarks.rightShoulder) {
          const shoulderDiff = Math.abs(landmarks.leftShoulder.x - landmarks.rightShoulder.x);
          
          if (shoulderDiff < 0.05) { // Small difference means they're likely sideways
            return feedbackMessages.Squat.sideways;
          }
        }
  
        if (landmarks.leftHip && landmarks.leftKnee && landmarks.leftAnkle) {
          // Calculate the angle between hip, knee, and ankle
          const kneeAngle = calculateAngle(
            landmarks.leftHip,
            landmarks.leftKnee,
            landmarks.leftAnkle
          );
          
          debugData.kneeAngle = kneeAngle?.toFixed(2);
  
          // Calculate hip angle
          const hipAngle = calculateAngle(
            landmarks.leftKnee,
            landmarks.leftHip,
            landmarks.leftShoulder
          );
          
          debugData.hipAngle = hipAngle?.toFixed(2);
          
          const kneeRange = exerciseAngles.Squat.kneeAngle[mode.toLowerCase()];
          const hipRange = exerciseAngles.Squat.hipAngle[mode.toLowerCase()];
          
          // Provide specific feedback based on angles
          if (kneeAngle !== null && !isWithinRange(kneeAngle, kneeRange)) {
            if (kneeAngle < kneeRange.min) {
              errorMessage = feedbackMessages.Squat.kneeAngleTooSmall;
            } else {
              errorMessage = feedbackMessages.Squat.kneeAngleTooLarge;
            }
          } else if (hipAngle !== null && !isWithinRange(hipAngle, hipRange)) {
            if (hipAngle < hipRange.min) {
              errorMessage = feedbackMessages.Squat.hipAngleTooSmall;
            } else {
              errorMessage = feedbackMessages.Squat.hipAngleTooLarge;
            }
          } 
          // If very close to correct
          else if ((kneeAngle && Math.abs(kneeAngle - ((kneeRange.min + kneeRange.max)/2)) < 5) &&
                   (hipAngle && Math.abs(hipAngle - ((hipRange.min + hipRange.max)/2)) < 5)) {
            errorMessage = feedbackMessages.Squat.almostCorrect;
          } else {
            errorMessage = feedbackMessages.Squat.perfect;
          }
        }
        break;
  
      case 'Deadlift':
        // For deadlift we want side view
        if (landmarks.leftShoulder && landmarks.rightShoulder) {
          const shoulderDiff = Math.abs(landmarks.leftShoulder.x - landmarks.rightShoulder.x);
          
          if (shoulderDiff > 0.15) { // Large difference means they're likely facing the camera
            return feedbackMessages.Deadlift.sideways;
          }
        }
        
        if (landmarks.leftShoulder && landmarks.leftHip && landmarks.leftKnee) {
          // Calculate back angle (angle between shoulder, hip, and knee)
          const backAngle = calculateAngle(
            landmarks.leftShoulder,
            landmarks.leftHip,
            landmarks.leftKnee
          );
          
          debugData.backAngle = backAngle?.toFixed(2);
          
          // Calculate knee angle
          const kneeAngle = calculateAngle(
            landmarks.leftHip,
            landmarks.leftKnee,
            landmarks.leftAnkle
          );
          
          debugData.kneeAngle = kneeAngle?.toFixed(2);
          
          const backRange = exerciseAngles.Deadlift.backAngle[mode.toLowerCase()];
          const kneeRange = exerciseAngles.Deadlift.kneeAngle[mode.toLowerCase()];
          
          // Provide specific feedback
          if (backAngle !== null && !isWithinRange(backAngle, backRange)) {
            if (backAngle < backRange.min) {
              errorMessage = feedbackMessages.Deadlift.backAngleTooSmall;
            } else {
              errorMessage = feedbackMessages.Deadlift.backAngleTooLarge;
            }
          } else if (kneeAngle !== null && !isWithinRange(kneeAngle, kneeRange)) {
            if (kneeAngle < kneeRange.min) {
              errorMessage = feedbackMessages.Deadlift.kneeAngleTooSmall;
            } else {
              errorMessage = feedbackMessages.Deadlift.kneeAngleTooLarge; 
            }
          }
          // If very close to correct
          else if ((backAngle && Math.abs(backAngle - ((backRange.min + backRange.max)/2)) < 5) &&
                   (kneeAngle && Math.abs(kneeAngle - ((kneeRange.min + kneeRange.max)/2)) < 5)) {
            errorMessage = feedbackMessages.Deadlift.almostCorrect;
          } else {
            errorMessage = feedbackMessages.Deadlift.perfect;
          }
        }
        break;
    }
    
    setDebugInfo(debugData);
    return errorMessage;
  };
  
  const onPoseDetected = (pose) => {
    const error = checkPoseAccuracy(pose);
    setPoseError(error);
    setCurrentPose(pose);
  };

  const toggleCamera = () => {
    setIsBackCamera(!isBackCamera);
  };


  return (
    <View style={styles.outerContainer}>
      <Header title={`${mode} ${exercise} Pose`} />
  
      <ScrollView contentContainerStyle={styles.container}>
        {/* Feedback Container */}
        <View style={styles.feedbackContainer}>
          {!personDetected ? (
            <Text style={styles.errorText}>No person detected</Text>
          ) : poseError.includes("Perfect") || poseError.includes("Excellent") ? (
            <Text style={styles.successText}>{poseError}</Text>
          ) : poseError.includes("Great") || poseError.includes("almost") ? (
            <Text style={styles.almostText}>{poseError}</Text>
          ) : (
            <Text style={styles.errorText}>{poseError}</Text>
          )}
        </View>
  
        {/* Camera View with Overlay Button */}
        <View style={styles.cameraContainer}>
          <HumanPose
            height={350}
            width={350}
            enableKeyPoints={true}
            flipHorizontal={false}
            enableSkeleton={true}
            isBackCamera={isBackCamera}
            color={'0, 255, 0'}
            onPoseDetected={onPoseDetected}
            estimation={{
              frameRate: 'max',
              modelConfig: {
                architecture: 'MobileNetV1',
                outputStride: 16,
                multiplier: 0.5,
                quantBytes: 2
              }
            }}
          />
          
          {/* Camera Switch Button - Overlaid on bottom right of camera view */}
          <TouchableOpacity style={styles.cameraButton} onPress={toggleCamera}>
            <MaterialIcons name="flip-camera-android" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        {/* Debug Info */}
        {mode === 'Pro' && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            {Object.entries(debugInfo).map(([key, value]) => (
              <Text key={key} style={styles.debugText}>
                {key}: {value}°
              </Text>
            ))}
          </View>
        )}
        
        {/* Exercise Tips */}
        <ScrollView style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>
            {exercise === 'Squat' ? 'Squat Tips:' : 'Deadlift Tips:'}
          </Text>
          {exercise === 'Squat' ? (
            <>
              <Text style={styles.tipText}>• Keep weight in your heels</Text>
              <Text style={styles.tipText}>• Keep your chest up</Text>
              <Text style={styles.tipText}>• Track knees over toes</Text>
            </>
          ) : (
            <>
              <Text style={styles.tipText}>• Maintain neutral spine</Text>
              <Text style={styles.tipText}>• Push through your heels</Text>
              <Text style={styles.tipText}>• Keep the bar close to your body</Text>
            </>
          )}
        </ScrollView>
      </ScrollView>
      
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
    padding: 15,
    alignItems: 'center',
    marginTop: 70, // Adjusted to accommodate the button
    marginBottom:50,
  },
  cameraContainer: {
    position: 'relative', // This allows absolute positioning of children
    width: 350,
    height: 350,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  buttonText: {
    color: '#FFF',
    marginLeft: 5,
    fontWeight: '600',
  },
  feedbackContainer: {
    width: '100%',
    paddingVertical: 10,
    marginTop: 15,
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
    width: '95%',
  },
  almostText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    width: '95%',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '700',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    width: '95%',
  },
  debugContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    alignSelf: 'centre',
    alignitems:'center'
  },
  debugTitle: {
    color: 'white',
    fontWeight: '700',
    marginBottom: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
  },
  tipsContainer: {
    width: '100%',
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  tipsTitle: {
    color: 'white',
    fontWeight: '700',
    marginBottom: 5,
    fontSize: 16,
  },
  tipText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 3,
  }
});

export default PoseScreen;