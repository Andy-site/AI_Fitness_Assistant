import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import HumanPose from 'react-native-human-pose';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useKeepAwake } from '@unsw-gsbme/react-native-keep-awake';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const calculateAngle = (point1, point2, point3) => {
  if (!point1 || !point2 || !point3) return null;
  const vector1 = { x: point1.x - point2.x, y: point1.y - point2.y };
  const vector2 = { x: point3.x - point2.x, y: point3.y - point2.y };
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
  const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
  const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
  if (magnitude1 === 0 || magnitude2 === 0 || isNaN(dotProduct)) return null;
  const cosTheta = Math.min(Math.max(dotProduct / (magnitude1 * magnitude2), -1), 1);
  return Math.acos(cosTheta) * (180 / Math.PI);
};

const PoseScreen = ({ route }) => {
  const { exercise } = route.params;
  useKeepAwake();

  const [poseError, setPoseError] = useState('');
  const [currentPose, setCurrentPose] = useState(null);
  const [isBackCamera, setIsBackCamera] = useState(false);
  const [personDetected, setPersonDetected] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [lastFeedbackTime, setLastFeedbackTime] = useState(0);
  const [fps, setFps] = useState(0);
  const lastFrameTime = useRef(Date.now());
  const [repCount, setRepCount] = useState(0);
  const [poseState, setPoseState] = useState('up');

  const feedbackMessages = {
    Squat: {
      formIncorrect: "Adjust your form",
      almostCorrect: "Great squat form! Just a little adjustment needed",
      perfect: "Perfect squat form! Keep it up!",
      sideways: "Please turn to face the camera for better analysis"
    },
    Deadlift: {
      formIncorrect: "Adjust your form",
      almostCorrect: "Great deadlift form! Minor adjustments needed",
      perfect: "Excellent deadlift technique! Maintain this form",
      sideways: "Turn to show your side profile for better deadlift analysis"
    }
  };

  const getJoint = (side, name, landmarks) => {
    return landmarks[`${side}${name}`] || landmarks[`${side === 'left' ? 'right' : 'left'}${name}`];
  };

  const checkPoseAccuracy = (pose) => {
    const now = Date.now();
    const delta = now - lastFrameTime.current;
    setFps((1000 / delta).toFixed(1));
    lastFrameTime.current = now;

    if (!pose || !pose[0]?.pose) {
      setPersonDetected(false);
      return 'No person detected';
    }

    setPersonDetected(true);
    const landmarks = pose[0].pose;
    let errorMessage = '';
    let debugData = {};
    if (now - lastFeedbackTime < 250) return poseError;
    setLastFeedbackTime(now);

    const rightHip = getJoint('right', 'Hip', landmarks);
    const rightKnee = getJoint('right', 'Knee', landmarks);
    const rightAnkle = getJoint('right', 'Ankle', landmarks);
    const rightShoulder = getJoint('right', 'Shoulder', landmarks);
    const rightToe = getJoint('right', 'FootIndex', landmarks);
    const rightEar = getJoint('right', 'Ear', landmarks);

    if (!rightHip || !rightKnee || !rightAnkle || !rightShoulder || !rightToe) return 'Please ensure your full body is visible';

    const kneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const hipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);
    const ankleAngle = calculateAngle(rightKnee, rightAnkle, rightToe);
    const spineAngle = calculateAngle(rightShoulder, rightHip, rightAnkle);
    const neckAngle = rightEar && calculateAngle(rightEar, rightShoulder, rightHip);

    debugData.kneeAngle = kneeAngle?.toFixed(2);
    debugData.hipAngle = hipAngle?.toFixed(2);
    debugData.ankleAngle = ankleAngle?.toFixed(2);
    debugData.spineAngle = spineAngle?.toFixed(2);
    if (neckAngle) debugData.neckAngle = neckAngle?.toFixed(2);

    if (kneeAngle !== null && hipAngle !== null) {
      if (Math.abs(kneeAngle - 90) < 10 && Math.abs(hipAngle - 90) < 10) {
        errorMessage = feedbackMessages[exercise].perfect;
      } else if (Math.abs(kneeAngle - 90) < 20 && Math.abs(hipAngle - 90) < 20) {
        errorMessage = feedbackMessages[exercise].almostCorrect;
      } else {
        errorMessage = feedbackMessages[exercise].formIncorrect;
      }

      if (kneeAngle < 70 && poseState === 'up') {
        setPoseState('down');
      } else if (kneeAngle > 100 && poseState === 'down') {
        setPoseState('up');
        setRepCount(prev => prev + 1);
      }
    } else {
      errorMessage = 'Calculating angles...';
    }

    setDebugInfo(debugData);
    return errorMessage;
  };

  const onPoseDetected = (pose) => {
    const error = checkPoseAccuracy(pose);
    setPoseError(error);
    setCurrentPose(pose);
  };

  const toggleCamera = () => setIsBackCamera(!isBackCamera);

  return (
    <View style={styles.outerContainer}>
      <Header title={`${exercise} Pose`} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.feedbackContainer}>
          {!personDetected ? (
            <Text style={styles.errorText}>No person detected</Text>
          ) : poseError.toLowerCase().includes("perfect") ? (
            <Text style={styles.successText}>{poseError}</Text>
          ) : poseError.toLowerCase().includes("great") || poseError.toLowerCase().includes("almost") ? (
            <Text style={styles.almostText}>{poseError}</Text>
          ) : (
            <Text style={styles.errorText}>{poseError}</Text>
          )}
        </View>

        <Text style={{ color: 'white', fontSize: 14, marginBottom: 10 }}>FPS: {fps} | Reps: {repCount}</Text>

        <View style={styles.cameraContainer}>
          <HumanPose
            height={350}
            width={350}
            enableKeyPoints={true}
            enableSkeleton={true}
            isBackCamera={isBackCamera}
            color={'0,255,0'}
            onPoseDetected={onPoseDetected}
            estimation={{
              frameRate: 30,
              modelConfig: {
                architecture: 'MobileNetV1',
                outputStride: 8,
                multiplier: 0.75,
                quantBytes: 2
              }
            }}
          />
          <TouchableOpacity style={styles.cameraButton} onPress={toggleCamera}>
            <MaterialIcons name="flip-camera-android" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          {Object.entries(debugInfo).map(([key, value]) => (
            <Text key={key} style={styles.debugText}>{key}: {value}°</Text>
          ))}
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#B3A0FF' },
  container: { flex: 1, padding: 15, alignItems: 'center', marginTop: 70, marginBottom: 50 },
  cameraContainer: { position: 'relative', width: 350, height: 350 },
  cameraButton: {
    position: 'absolute', bottom: 15, right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  feedbackContainer: { width: '100%', paddingVertical: 10, marginTop: 15, marginBottom: 5, alignItems: 'center', borderRadius: 10 },
  errorText: {
    color: '#FF6B6B', fontSize: 16, fontWeight: '600', backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10, borderRadius: 8, textAlign: 'center', width: '95%',
  },
  almostText: {
    color: '#FFA500', fontSize: 16, fontWeight: '600', backgroundColor: 'rgba(255, 165, 0, 0.1)',
    padding: 10, borderRadius: 8, textAlign: 'center', width: '95%',
  },
  successText: {
    color: '#4CAF50', fontSize: 18, fontWeight: '700', backgroundColor: 'rgba(76, 175, 80, 0.2)',
    padding: 10, borderRadius: 8, textAlign: 'center', width: '95%',
  },
  debugContainer: {
    marginTop: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, alignItems: 'center'
  },
  debugTitle: { color: 'white', fontWeight: '700', marginBottom: 5 },
  debugText: { color: 'white', fontSize: 12 }
});

export default PoseScreen;
