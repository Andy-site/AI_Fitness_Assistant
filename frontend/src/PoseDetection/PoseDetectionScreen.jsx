import '@tensorflow/tfjs-react-native'; // Must be imported before using TensorFlow
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-react-native';

const PoseDetectionScreen = () => {
  useEffect(() => {
    const loadModel = async () => {
      await tf.ready(); // Ensures TensorFlow is initialized
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
      console.log('Pose detection model loaded');
    };

    loadModel();
  }, []);

  return (
    <View>
      <Text>Pose Detection Running...</Text>
    </View>
  );
};

export default PoseDetectionScreen;
