
import React, { useEffect, useState, useRef } from 'react';
import { Alert } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import HumanPose from 'react-native-human-pose';
import { useKeepAwake } from '@unsw-gsbme/react-native-keep-awake';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createPoseSession,  completePoseSession } from '../../api/fithubApi';

const { width, height } = Dimensions.get('window');

const calculateAngle = (point1, point2, point3) => {
  if (!point1 || !point2 || !point3) return null;
  const vector1 = { x: point1.x - point2.x, y: point1.y - point2.y };  // Vector from point2 to point1
  const vector2 = { x: point3.x - point2.x, y: point3.y - point2.y }; // Vector from point2 to point3
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y; // Dot product of the vectors A.B = Ax * Bx + Ay * By
  const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2); // Magnitude of vector1 Square root of (Ax^2 + Ay^2)
  const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2); // Magnitude of vector2 Square root of (Bx^2 + By^2)
  if (magnitude1 === 0 || magnitude2 === 0 || isNaN(dotProduct)) return null;
  const cosTheta = Math.min(Math.max(dotProduct / (magnitude1 * magnitude2), -1), 1); // Clamp value of cos Angle from -1 to 1 to avoid NaN from acos
  return Math.acos(cosTheta) * (180 / Math.PI); // Math.acos gives angle in radians. Convert to degrees
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

  const getJoint = (side, name) => landmarks[`${side}${name}`];

  // Extract both sides for Lunge comparison
  const leftHip = getJoint('left', 'Hip');
  const leftKnee = getJoint('left', 'Knee');
  const leftAnkle = getJoint('left', 'Ankle');
  const leftShoulder = getJoint('left', 'Shoulder');

  const rightHip = getJoint('right', 'Hip');
  const rightKnee = getJoint('right', 'Knee');
  const rightAnkle = getJoint('right', 'Ankle');
  const rightShoulder = getJoint('right', 'Shoulder');

  let errorMessage = '';

  if (exercise === 'Squat') {
    const side = landmarks['leftKnee'] && landmarks['rightKnee'] ? 'left' : 'right';
    const hip = getJoint(side, 'Hip');
    const knee = getJoint(side, 'Knee');
    const ankle = getJoint(side, 'Ankle');
    const shoulder = getJoint(side, 'Shoulder');

    const kneeAngle = calculateAngle(hip, knee, ankle);
    const hipAngle = calculateAngle(shoulder, hip, knee);

    if (kneeAngle !== null && hipAngle !== null) {
      if (Math.abs(kneeAngle - 90) < 10 && Math.abs(hipAngle - 90) < 10) {
        errorMessage = feedbackMessages.Squat.perfect;
      } else if (Math.abs(kneeAngle - 90) < 20 && Math.abs(hipAngle - 90) < 20) {
        errorMessage = feedbackMessages.Squat.almostCorrect;
      } else {
        errorMessage = feedbackMessages.Squat.formIncorrect;
      }

      if (kneeAngle < 70 && poseState === 'up') {
        setPoseState('down');
      } else if (kneeAngle > 100 && poseState === 'down') {
        setPoseState('up');
        setRepCount(prev => prev + 1);
      }
    }

  } else if (exercise === 'Lunge') {
    // Calculate knee angles for both legs
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    // Choose front leg 
    const frontKneeAngle = leftKneeAngle < rightKneeAngle ? leftKneeAngle : rightKneeAngle;

    // Torso uprightness 
    const torsoAngle = calculateAngle(leftShoulder, leftHip, rightKnee) || calculateAngle(rightShoulder, rightHip, leftKnee);

    if (frontKneeAngle !== null && torsoAngle !== null) {
      if (Math.abs(frontKneeAngle - 90) < 10 && torsoAngle > 150) {
        errorMessage = feedbackMessages.Lunge.perfect;
      } else if (Math.abs(frontKneeAngle - 90) < 20) {
        errorMessage = feedbackMessages.Lunge.almostCorrect;
      } else {
        errorMessage = feedbackMessages.Lunge.formIncorrect;
      }

      // Repetition detection
      if (frontKneeAngle < 70 && poseState === 'up') {
        setPoseState('down');
      } else if (frontKneeAngle > 100 && poseState === 'down') {
        setPoseState('up');
        setRepCount(prev => prev + 1);
      }
    }
  }

  if (sessionId && landmarks) {
    const feedbackPayload = {
      session: sessionId,
      frame_id: Math.floor(now / 100),
      keypoints_json: JSON.parse(JSON.stringify(landmarks)),
      feedback_notes: errorMessage,
      confidence_score: Number(currentFps) / 30,
      rep_count: repCount,
    };
    console.log("Sending feedback payload:", feedbackPayload);
    
  }

  return errorMessage;
}


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