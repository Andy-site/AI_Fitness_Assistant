
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import HumanPose from 'react-native-human-pose';
import { useKeepAwake } from '@unsw-gsbme/react-native-keep-awake';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createPoseSession, sendPoseFeedback, completePoseSession } from '../../api/fithubApi';

const { width, height } = Dimensions.get('window');

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
  const [personDetected, setPersonDetected] = useState(false);
  const [fps, setFps] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [poseState, setPoseState] = useState('up');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const lastFrameTime = useRef(Date.now());
  const [isBackCamera, setIsBackCamera] = useState(false);

  const feedbackMessages = {
    Squat: {
      formIncorrect: "Adjust your form",
      almostCorrect: "Great squat form! Just a little adjustment needed",
      perfect: "Perfect squat form! Keep it up!",
      sideways: "Please turn to face the camera for better analysis"
    },
    Lunge: {
      formIncorrect: "Step deeper and keep your torso upright",
      almostCorrect: "Nice lunge! Slight tweak in depth or alignment needed",
      perfect: "Excellent lunge form!",
      sideways: "Keep your profile visible to the camera"
    },
   
  };

  const checkPoseAccuracy = (poses) => {
    const now = Date.now();
    const delta = now - lastFrameTime.current;
    const currentFps = (1000 / delta).toFixed(1);
    setFps(currentFps);
    lastFrameTime.current = now;

    const bestPose = poses
      .filter(p => p.pose?.keypoints && Object.keys(p.pose).length > 5)
      .sort((a, b) => (b.pose?.score || 0) - (a.pose?.score || 0))[0];

    if (!bestPose || !bestPose.pose) {
      setPersonDetected(false);
      return 'No person detected';
    }

    setPersonDetected(true);
    const landmarks = bestPose.pose;

    const getValidSide = (landmarks) => {
      const sides = ['right', 'left'];
      for (const side of sides) {
        const required = ['Hip', 'Knee', 'Ankle', 'Shoulder'];
        const allPresent = required.every(j => landmarks[`${side}${j}`]);
        if (allPresent) return side;
      }
      return null;
    };

    const side = getValidSide(landmarks);
    if (!side) return 'Ensure full body is visible';

    const getJoint = (name) => landmarks[`${side}${name}`];
    const hip = getJoint('Hip');
    const knee = getJoint('Knee');
    const ankle = getJoint('Ankle');
    const shoulder = getJoint('Shoulder');
    const toe = getJoint('FootIndex');

    const kneeAngle = calculateAngle(hip, knee, ankle);
    const hipAngle = calculateAngle(shoulder, hip, knee);

    let errorMessage = '';
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
    }

    if (sessionId && hip && knee && ankle) {
      const feedbackPayload = {
        session: sessionId,
        frame_id: Math.floor(now / 100),
        keypoints_json: JSON.parse(JSON.stringify(landmarks)),
        feedback_notes: errorMessage,
        confidence_score: Number(currentFps) / 30,
      };
      console.log("Sending feedback payload:", feedbackPayload);
      sendPoseFeedback(feedbackPayload).catch(err => console.warn('Pose feedback failed:', err.response?.data || err.message));
    }

    return errorMessage;
  };

  const onPoseDetected = (pose) => {
    if (!isRecording) return;
    const error = checkPoseAccuracy(pose);
    setPoseError(error);
  };

  const toggleCamera = () => setIsBackCamera(!isBackCamera);

  const handleStartStopSession = async () => {
    if (!isRecording) {
      try {
        const session = await createPoseSession(exercise);
        setSessionId(session.id);
        setIsRecording(true);
      } catch (error) {
        const message = error?.response?.data?.detail || error?.message || 'Could not start session';
        Alert.alert('Error', message);
      }
    } else {
      try {
        await completePoseSession(sessionId);
        setIsRecording(false);
        Alert.alert('Session Completed', `You completed ${repCount} reps`);
      } catch (error) {
        Alert.alert('Error', error.response?.data?.detail || 'Could not stop session');
      }
    }
  };

  return (
    <View style={styles.container}>
      <HumanPose
        height={height}
        width={width}
        enableKeyPoints={true}
        enableSkeleton={true}
        isBackCamera={isBackCamera}
        color={'0,255,0'}
        onPoseDetected={onPoseDetected}
        estimation={{
          frameRate: 30,
          modelConfig: {
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.75,
            quantBytes: 2,
          },
        }}
      />

      <View style={styles.overlayTop}>
        <Text style={styles.overlayText}>FPS: {fps} | Reps: {repCount}</Text>
        <Text style={styles.overlayText}>{poseError}</Text>
      </View>

      <TouchableOpacity style={styles.floatingButton} onPress={handleStartStopSession}>
        <View style={styles.iconCircle}>
          <MaterialIcons
            name={isRecording ? 'stop' : 'play-arrow'}
            size={40}
            color="#fff"
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cameraToggle} onPress={toggleCamera}>
        <MaterialIcons name="flip-camera-android" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginVertical: 2,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    zIndex: 10,
  },
  iconCircle: {
    backgroundColor: '#000',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraToggle: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 25,
  },
});

export default PoseScreen;