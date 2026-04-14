"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useEditorStore } from "@/stores/editorStore";

// Critically damped spring constants for a professional, no-bounce snap.
const SPRING_STIFFNESS = 0.52; // How fast it snaps
const SPRING_DAMPING = 0.45;   // High damping = no bounce

export default function CameraRig() {
  const { camera, controls } = useThree();
  const cameraMode = useEditorStore((state) => state.cameraMode);
  const setCameraMode = useEditorStore((state) => state.setCameraMode);
  
  // Track previous mode to detect transitions
  const prevMode = useRef(cameraMode);
  const transitionTarget = useRef<{ pos: THREE.Vector3; look: THREE.Vector3 } | null>(null);
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  // Handle Mode Changes
  useEffect(() => {
    if (cameraMode === prevMode.current) return;
    
    if (cameraMode === 'top') {
      transitionTarget.current = {
        pos: new THREE.Vector3(0, 10, 0),
        look: new THREE.Vector3(0, 0, 0)
      };
    } else if (cameraMode === 'side') {
      transitionTarget.current = {
        pos: new THREE.Vector3(10, 2, 0),
        look: new THREE.Vector3(0, 0, 0)
      };
    } else {
      transitionTarget.current = null;
    }
    
    prevMode.current = cameraMode;
  }, [cameraMode]);

  useFrame((_, delta) => {
    if (!transitionTarget.current) return;

    const { pos, look } = transitionTarget.current;
    
    // Smooth damping (Math-based to avoid bounce)
    // We use a high damping ratio to ensure it arrives cleanly.
    camera.position.lerp(pos, SPRING_STIFFNESS * delta * 60);
    currentLook.current.lerp(look, SPRING_STIFFNESS * delta * 60);
    camera.lookAt(currentLook.current);

    // If we've arrived close enough, stop the transition
    if (camera.position.distanceTo(pos) < 0.01) {
      transitionTarget.current = null;
      // We keep the mode as 'top'/'side' until user orbits.
    }
  });

  return null;
}
