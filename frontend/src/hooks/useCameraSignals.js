import { useEffect, useRef, useState } from "react";

/**
 * Hook for camera-driven interaction signals.
 *
 * For hackathon demo:
 * - Actually opens the webcam (so you can show it in the UI).
 * - Signals are currently driven by keyboard shortcuts:
 *   P = pinchDetected
 *   H = headTiltDetected
 *   D = distracted
 *
 * Replace the keyboard handlers with MediaPipe / TF.js detectors that
 * call setPinchDetected(true), setHeadTiltDetected(true), setDistracted(true).
 */
export function useCameraSignals() {
  const videoRef = useRef(null);
  const [pinchDetected, setPinchDetected] = useState(false);
  const [headTiltDetected, setHeadTiltDetected] = useState(false);
  const [distracted, setDistracted] = useState(false);

  // Camera setup
  useEffect(() => {
    let stream;
    async function enableCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Could not access camera", err);
      }
    }
    enableCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Keyboard-based mock signals (for demo)
  useEffect(() => {
    function handleKeydown(e) {
      if (e.key.toLowerCase() === "p") {
        setPinchDetected(true);
      }
      if (e.key.toLowerCase() === "h") {
        setHeadTiltDetected(true);
      }
      if (e.key.toLowerCase() === "d") {
        setDistracted(true);
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  // Utility to reset one-shot signals after acting on them
  function resetSignals() {
    setPinchDetected(false);
    setHeadTiltDetected(false);
    // we leave distracted as is until the UI clears it
  }

  return {
    videoRef,
    pinchDetected,
    headTiltDetected,
    distracted,
    resetSignals,
    setDistracted
  };
}
