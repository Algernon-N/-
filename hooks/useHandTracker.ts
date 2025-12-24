
import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface HandData {
  gesture: 'pinched' | 'open' | 'none';
  x: number;
  y: number;
  rotationX: number;
  rotationY: number;
}

export const useHandTracker = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [handData, setHandData] = useState<HandData>({
    gesture: 'none',
    x: 0,
    y: 0,
    rotationX: 0,
    rotationY: 0
  });
  const [isReady, setIsReady] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    const initMP = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });
      setIsReady(true);
    };
    initMP();

    return () => {
      handLandmarkerRef.current?.close();
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const predict = () => {
      if (
        handLandmarkerRef.current &&
        videoRef.current &&
        videoRef.current.readyState >= 2
      ) {
        const results = handLandmarkerRef.current.detectForVideo(videoRef.current, performance.now());
        
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          
          // Use index tip (8) and thumb tip (4) to detect pinch
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];
          const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) +
            Math.pow(thumbTip.y - indexTip.y, 2) +
            Math.pow(thumbTip.z - indexTip.z, 2)
          );

          // Use point 9 as reference for position
          const refPoint = landmarks[9];
          
          const gesture = distance < 0.05 ? 'pinched' : 'open';
          
          setHandData({
            gesture,
            x: refPoint.x,
            y: refPoint.y,
            // Map 0-1 to something more useful for rotation
            rotationX: (refPoint.y - 0.5) * Math.PI,
            rotationY: (refPoint.x - 0.5) * Math.PI * 2
          });
        } else {
          setHandData(prev => ({ ...prev, gesture: 'none' }));
        }
      }
      animationFrameId = requestAnimationFrame(predict);
    };

    if (isReady) {
      predict();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isReady, videoRef]);

  return { handData, isReady };
};
