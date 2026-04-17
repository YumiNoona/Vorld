import * as THREE from "three";
import { useViewerStore } from "@/stores/viewerStore";
import React, { Suspense, useEffect, useState, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Interaction, InteractionAction } from "@/stores/editorStore";

interface InteractionData {
  id: string;
  emissive?: { color: THREE.Color; intensity: number };
  scale?: number;
  labelIds?: string[];
  audioSrc?: string;
  position?: THREE.Vector3;
}

interface MeshState {
  mesh: THREE.Mesh;
  // Precomputed Statics
  worldCenter: THREE.Vector3;
  worldQuaternion: THREE.Quaternion;
  bounds: THREE.Box3;
  isDynamic?: boolean;
  
  // Resolution Engine
  interactionData: Map<string, InteractionData>;
  activationOrder: string[]; 
  activeInteractions: Set<string>;
  currentAudioOwner: string | null;
  labelsByInteraction: Map<string, string[]>;

  // Shared Targets (Interpolated)
  targetScale: THREE.Vector3;
  targetColor: THREE.Color;
  targetEmissive: THREE.Color;
  targetEmissiveIntensity: number;
  targetPosition?: THREE.Vector3;

  // Persistence Originals
  originalScale: THREE.Vector3;
  originalColor: THREE.Color;
  originalEmissive: THREE.Color;
  originalEmissiveIntensity: number;
  originalPosition: THREE.Vector3;
  originalRoughness: number;
  originalMetalness: number;
  hasClonedMaterial: boolean;
  mixer?: THREE.AnimationMixer;
}

export function useInteractionRuntime() {
  const setInfoPanel = useViewerStore((state) => state.setInfoPanel);
  const addLabel = useViewerStore((state) => state.addLabel);
  const clearLabels = useViewerStore((state) => state.clearLabels);
  const environmentPreset = useViewerStore((state) => state.environmentPreset);
  const setEnvironmentPreset = useViewerStore((state) => state.setEnvironmentPreset);
  
  const stateMap = useRef<Map<string, MeshState>>(new Map());
  const toggleStates = useRef<Map<string, boolean>>(new Map());
  const runningMap = useRef<Map<string, boolean>>(new Map());
  const isAnimating = useRef(false);
  const isCancelled = useRef(false);
  const isSceneReady = useRef(false);
  const cameraTargetPos = useRef<THREE.Vector3 | null>(null);
  const audioPlayToken = useRef(0);
  
  // Studio Audio System
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioFadeRaf = useRef<number | null>(null);
  
  const { camera, controls, scene: threeScene } = useThree() as { camera: THREE.PerspectiveCamera, controls: any, scene: THREE.Scene, gl: THREE.WebGLRenderer };

  useEffect(() => {
    isCancelled.current = false;
    audioRef.current = new Audio();
    return () => {
      isCancelled.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      }
      if (audioFadeRaf.current) cancelAnimationFrame(audioFadeRaf.current);
    };
  }, []);

  useFrame((state, delta) => {
    if (!isSceneReady.current) return;

    // Camera Lerp
    if (cameraTargetPos.current) {
       camera.position.lerp(cameraTargetPos.current, 5 * delta);
       const dist = camera.position.distanceTo(cameraTargetPos.current);
       if (dist < 0.01 && controls) {
          // eslint-disable-next-line react-hooks/immutability
          controls.enabled = true;
          cameraTargetPos.current = null;
       }
    }

    stateMap.current.forEach((data) => {
      // Skinned mesh / Dynamic update guard
      if (data.isDynamic) {
        data.mesh.updateMatrixWorld(true);
        data.bounds.setFromObject(data.mesh);
        data.mesh.getWorldPosition(data.worldCenter);
      }

      // Delta-scaled lerps for consistency (Always lerp to resolved targets)
      data.mesh.scale.lerp(data.targetScale, delta * 8);
      
      const mat = data.mesh.material as THREE.MeshStandardMaterial;
      if (mat && mat.color) {
        mat.color.lerp(data.targetColor, delta * 8);
      }

      if (mat && mat.emissive) {
        mat.emissive.lerp(data.targetEmissive, delta * 8);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, data.targetEmissiveIntensity, delta * 8);
        mat.needsUpdate = true;
      }

      if (data.targetPosition) {
        data.mesh.position.lerp(data.targetPosition, delta * 8);
      }

      if (data.mixer) {
        data.mixer.update(delta);
      }
    });

    // Particle cleanup: decay and remove
    const toRemove: string[] = [];
    threeScene.traverse((child: any) => {
      if (child.userData?.__particleBurst) {
        child.userData.__particleAge = (child.userData.__particleAge || 0) + delta;
        if (child.userData.__particleAge > child.userData.__particleDuration) {
          toRemove.push(child.uuid);
        } else {
          // Animate particles outward and fade
          const progress = child.userData.__particleAge / child.userData.__particleDuration;
          const positions = child.geometry.attributes.position;
          const velocities = child.userData.__velocities;
          if (positions && velocities) {
            for (let i = 0; i < positions.count; i++) {
              positions.setXYZ(
                i,
                positions.getX(i) + velocities[i * 3] * delta,
                positions.getY(i) + velocities[i * 3 + 1] * delta - delta * 0.5, // gravity
                positions.getZ(i) + velocities[i * 3 + 2] * delta
              );
            }
            positions.needsUpdate = true;
          }
          (child.material as THREE.PointsMaterial).opacity = 1 - progress;
        }
      }
    });
    toRemove.forEach(uuid => {
      const obj = threeScene.getObjectByProperty('uuid', uuid);
      if (obj) {
        obj.removeFromParent();
        (obj as any).geometry?.dispose();
        (obj as any).material?.dispose();
      }
    });
  });

  const rebuildMeshState = (mesh: THREE.Mesh) => {
    const state = stateMap.current.get(mesh.uuid);
    if (!state) return;

    // 1. Reset to base state for the reconstruction pass
    let finalScaleMult = 1.0;
    let finalColor = state.originalColor.clone();
    let finalEmissive = state.originalEmissive.clone();
    let finalEmissiveIntensity = state.originalEmissiveIntensity;
    
    const EPS = 1e-4;

    // 2. Aggregate from active interactions in activation order
    state.activationOrder.forEach((id) => {
      const data = state.interactionData.get(id);
      if (!data) return;

      // Color/Emissive: Last-writer wins (temporal sequence)
      if (data.emissive) {
        finalEmissive = data.emissive.color.clone();
        finalEmissiveIntensity = data.emissive.intensity;
      }

      // Scale: baseScale * max(activeScales)
      // Tie-break: if within EPS, the more recent interaction (current ID) persists
      if (data.scale !== undefined) {
        if (Math.abs(data.scale - finalScaleMult) > EPS) {
          finalScaleMult = Math.max(finalScaleMult, data.scale);
        } else {
          // Tie-break: Prefer most recent activation
          finalScaleMult = data.scale;
        }
      }
    });

    // 3. Atomic Assignment of resolved targets
    state.targetScale = state.originalScale.clone().multiplyScalar(finalScaleMult);
    state.targetColor = finalColor;
    state.targetEmissive = finalEmissive;
    state.targetEmissiveIntensity = finalEmissiveIntensity;
  };

  const registerMesh = (mesh: THREE.Mesh) => {
    if (stateMap.current.has(mesh.uuid)) return;

    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    const worldCenter = new THREE.Vector3();
    box.getCenter(worldCenter);

    const worldQuaternion = new THREE.Quaternion();
    mesh.getWorldQuaternion(worldQuaternion);

    const mat = mesh.material as any;
    const state: MeshState = {
      mesh,
      worldCenter,
      worldQuaternion,
      bounds: box,
      isDynamic: !!(mesh as any).isSkinnedMesh || !!(mesh as any).skeleton,
      interactionData: new Map(),
      activationOrder: [],
      activeInteractions: new Set(),
      currentAudioOwner: null,
      labelsByInteraction: new Map(),
      targetScale: mesh.scale.clone(),
      targetColor: mat.color?.clone() || new THREE.Color("#ffffff"),
      targetEmissive: mat.emissive?.clone() || new THREE.Color("#000000"),
      targetEmissiveIntensity: mat.emissiveIntensity || 0,
      originalScale: mesh.scale.clone(),
      originalColor: mat.color?.clone() || new THREE.Color("#ffffff"),
      originalEmissive: mat.emissive?.clone() || new THREE.Color("#000000"),
      originalEmissiveIntensity: mat.emissiveIntensity || 0,
      originalPosition: mesh.position.clone(),
      originalRoughness: mat.roughness || 0.5,
      originalMetalness: mat.metalness || 0,
      hasClonedMaterial: false,
    };

    stateMap.current.set(mesh.uuid, state);
  };

  const getOrCreateState = (mesh: THREE.Mesh) => {
    if (!stateMap.current.has(mesh.uuid)) {
      registerMesh(mesh);
    }
    return stateMap.current.get(mesh.uuid)!;
  };

  const revertInteraction = (mesh: THREE.Mesh, interactionId: string) => {
    const state = stateMap.current.get(mesh.uuid);
    if (!state) return;

    // 1. Remove from temporal records
    state.activeInteractions.delete(interactionId);
    state.activationOrder = state.activationOrder.filter(id => id !== interactionId);
    state.interactionData.delete(interactionId);

    // 2. Surgical UI Cleanup (Labels)
    const labelIds = state.labelsByInteraction.get(interactionId);
    if (labelIds) {
      labelIds.forEach(id => {
        useViewerStore.getState().removeLabel(id);
      });
      state.labelsByInteraction.delete(interactionId);
    }

    // 3. Audio Ownership Cleanup
    if (state.currentAudioOwner === interactionId && audioRef.current) {
      audioRef.current.pause();
      state.currentAudioOwner = null;
    }

    // 4. Pure Rebuild (Atomic)
    rebuildMeshState(mesh);
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // The engine processor!
  const runSequence = async (mesh: THREE.Mesh, actions: InteractionAction[], triggerOrigin: string, interactionId: string) => {
    if (!actions || actions.length === 0 || isCancelled.current) return;
    if (runningMap.current.get(mesh.uuid)) return;

    mesh.userData.isAnimating = true;
    runningMap.current.set(mesh.uuid, true);

    try {
      const state = getOrCreateState(mesh);
      const seqId = (mesh.userData.sequenceId || 0) + 1;
      mesh.userData.sequenceId = seqId;

      // 1. Canonical Activation Order Guard (Deterministic Priority)
      state.activationOrder = state.activationOrder.filter(id => id !== interactionId);
      state.activationOrder.push(interactionId);
      state.activeInteractions.add(interactionId);

      const interactionData: InteractionData = { id: interactionId, labelIds: [] };
      state.interactionData.set(interactionId, interactionData);

      // 2. Material Ownership Guard (Prevent Shader Hitches/Cross-talk)
      const mat = mesh.material as any;
      if (mat && (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial)) {
        if (!mat.userData.__cloned || mat.userData.__owner !== mesh.uuid) {
          const cloned = mat.clone();
          cloned.userData.__cloned = true;
          cloned.userData.__owner = mesh.uuid;
          mesh.material = cloned;
        }
      }

      for (const action of actions) {
        if (isCancelled.current || mesh.userData.sequenceId !== seqId) break;

        const config = action.config || {};
        const durationMs = (config.duration || 0.2) * 1000;
        
        // Spec: Instant ≠ parallel. It fires and continues, but preserves dispatch order.
        const isInstant = ["label_pin", "audio", "info_panel", "url", "set_environment", "toggle"].includes(action.type);

        const runtimeAction = {
          run: async () => {
            switch (action.type) {
              case "highlight":
                interactionData.emissive = { 
                  color: new THREE.Color(config.color || "#ffffff"),
                  intensity: state.originalEmissiveIntensity 
                };
                rebuildMeshState(mesh);
                await wait(durationMs);
                break;

              case "glow":
                interactionData.emissive = { 
                  color: new THREE.Color(config.color || "#ffffff"),
                  intensity: config.intensity ?? 2.0 
                };
                rebuildMeshState(mesh);
                await wait(durationMs);
                break;

              case "scale":
                interactionData.scale = config.value ?? 1.1;
                rebuildMeshState(mesh);
                await wait(durationMs);
                break;

              case "audio":
                if (triggerOrigin !== "click") break;
                const audio = audioRef.current;
                if (!audio || !config.src) break;

                const token = ++audioPlayToken.current;
                state.currentAudioOwner = interactionId;

                audio.pause();
                audio.currentTime = 0;
                if (audio.src.startsWith("blob:")) URL.revokeObjectURL(audio.src);

                try {
                  audio.src = config.src;
                  audio.loop = config.loop ?? false;
                  await audio.play();
                  // Async win/race guard
                  if (token !== audioPlayToken.current) audio.pause();
                } catch (e) {
                  console.warn("Audio failure:", e);
                }
                break;

              case "label_pin":
                const id = `label_${mesh.uuid}_${interactionId}_${action.id}`;
                interactionData.labelIds?.push(id);
                
                // Spec: Normal-based offset for stability at grazing angles
                const up = new THREE.Vector3(0, 1, 0).applyQuaternion(state.worldQuaternion);
                const size = state.bounds.getSize(new THREE.Vector3());
                const pos = state.worldCenter.clone().add(up.multiplyScalar(size.y * 0.5 + 0.01));

                addLabel({
                  id,
                  meshUuid: mesh.uuid,
                  text: config.text || "Label",
                  fontSize: config.fontSize ?? 14,
                  backgroundColor: config.backgroundColor || "#000000",
                  position: pos.toArray() as [number, number, number],
                });
                
                // Track for surgical removal
                const existingLabels = state.labelsByInteraction.get(interactionId) || [];
                state.labelsByInteraction.set(interactionId, [...existingLabels, id]);
                break;

              case "info_panel":
                setInfoPanel({
                  title: config.title,
                  description: config.body,
                  imageUrl: config.imageUrl,
                  ctaLabel: config.ctaLabel,
                  ctaUrl: config.ctaUrl,
                  layout: config.layout || "top"
                });
                break;

              case "url":
                if (config.url && config.url !== "https://") window.open(config.url, "_blank");
                break;

              case "camera_focus":
                if (controls) controls.enabled = false;
                cameraTargetPos.current = state.worldCenter.clone().add(new THREE.Vector3(0, 2, 5));
                await wait(durationMs || 1000);
                break;

              case "animation":
                const clipName = config.clip;
                if (!clipName) break;
                let root: THREE.Object3D = mesh;
                while (root.parent && (!(root as any).animations || (root as any).animations.length === 0)) {
                  root = root.parent;
                }
                const clips = (root as any).animations || [];
                const clip = clips.find((c: any) => c.name === clipName);
                if (clip) {
                  if (!state.mixer) state.mixer = new THREE.AnimationMixer(mesh);
                  const animAction = state.mixer.clipAction(clip);
                  if (config.loop === false) {
                    animAction.setLoop(THREE.LoopOnce, 1);
                    animAction.clampWhenFinished = true;
                  }
                  animAction.reset().fadeIn(0.2).play();
                  await wait(durationMs || clip.duration * 1000);
                }
                break;

              case "set_environment":
                setEnvironmentPreset(config.preset || "city");
                break;

              case "particle_burst": {
                const count = Math.min(config.count ?? 20, 50);
                const pSize = config.size ?? 0.05;
                const color = config.color || "#10b981";
                const origin = state.worldCenter.clone();

                const positions = new Float32Array(count * 3);
                const velocities = new Float32Array(count * 3);

                for (let i = 0; i < count; i++) {
                  positions[i * 3] = origin.x;
                  positions[i * 3 + 1] = origin.y;
                  positions[i * 3 + 2] = origin.z;
                  velocities[i * 3] = (Math.random() - 0.5) * 3;
                  velocities[i * 3 + 1] = Math.random() * 2 + 1;
                  velocities[i * 3 + 2] = (Math.random() - 0.5) * 3;
                }

                const geom = new THREE.BufferGeometry();
                geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
                const points = new THREE.Points(geom, new THREE.PointsMaterial({
                  color: new THREE.Color(color),
                  size: pSize,
                  transparent: true,
                  opacity: 1,
                  depthWrite: false,
                }));

                points.userData.__particleBurst = true;
                points.userData.__particleAge = 0;
                points.userData.__particleDuration = config.duration ?? 1.0;
                points.userData.__velocities = velocities;
                threeScene.add(points);
                break;
              }

              case "reveal_hidden": {
                const targetName = config.targetMeshName;
                if (!targetName) break;
                let targetMesh: THREE.Mesh | null = null;
                threeScene.traverse((child: any) => {
                  if (child.isMesh && child.name === targetName) targetMesh = child;
                });

                if (targetMesh) {
                  const tm = targetMesh as THREE.Mesh;
                  registerMesh(tm); // Ensure it has a state
                  tm.visible = true;
                  const tState = stateMap.current.get(tm.uuid);
                  if (tState && config.animationType === "scale_in") {
                    tm.scale.set(0,0,0);
                    tState.targetScale = tState.originalScale.clone();
                  }
                }
                break;
              }
            }
          }
        };

        if (isInstant) {
          runtimeAction.run();
        } else {
          await runtimeAction.run();
        }
      }
    } finally {
      runningMap.current.set(mesh.uuid, false);
      mesh.userData.isAnimating = false;
    }
  };

  const runInteraction = (
    mesh: THREE.Mesh,
    interactions: Interaction[],
    trigger: "click" | "hover" | "unhover"
  ) => {
    if (!isSceneReady.current) return;
    if (!interactions || interactions.length === 0 || isCancelled.current) return;
    if (mesh.userData.isDragging) return;

    const relevantInts = interactions.filter(i => {
       if (trigger === "unhover") return i.trigger === "onHover" && i.revertOnLeave;
       if (trigger === "hover") return i.trigger === "onHover";
       if (trigger === "click") return i.trigger === "onClick";
    });

    for (const int of relevantInts) {
       if (int.conditions?.once && mesh.userData[`triggered_${int.id}`]) continue;
       mesh.userData[`triggered_${int.id}`] = true;

       if (trigger === "click") {
          const state = stateMap.current.get(mesh.uuid);
          // Deterministic Toggle Logic
          if (state && state.activeInteractions.has(int.id)) {
             revertInteraction(mesh, int.id);
          } else {
             runSequence(mesh, int.actions || [], trigger, int.id);
          }
       } else if (trigger === "unhover") {
          revertInteraction(mesh, int.id);
       } else {
          runSequence(mesh, int.actions || [], trigger, int.id);
       }
    }
  };

  const resetAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src.startsWith("blob:")) URL.revokeObjectURL(audioRef.current.src);
    }
    if (audioFadeRaf.current) cancelAnimationFrame(audioFadeRaf.current);
    
    clearLabels();
    setEnvironmentPreset("city"); 
    isSceneReady.current = false;

    stateMap.current.forEach((state) => {
      state.activeInteractions.clear();
      state.activationOrder = [];
      state.interactionData.clear();
      state.currentAudioOwner = null;
      state.labelsByInteraction.clear();
      rebuildMeshState(state.mesh);
      if (state.mixer) state.mixer.stopAllAction();
      state.mesh.userData.isAnimating = false;
      runningMap.current.set(state.mesh.uuid, false);
    });
  };

  const setIsSceneReady = (val: boolean) => {
    isSceneReady.current = val;
  };

  return { runInteraction, resetAll, registerMesh, setIsSceneReady };
};
