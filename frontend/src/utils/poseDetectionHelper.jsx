// project-root/utils/poseDetectionHelper.js
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@mediapipe/pose';

export const initializeDetector = async (setDetector) => {
  const model = poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: 'mediapipe',
    modelType: 'full',
  };
  const detector = await poseDetection.createDetector(model, detectorConfig);
  setDetector(detector);
};