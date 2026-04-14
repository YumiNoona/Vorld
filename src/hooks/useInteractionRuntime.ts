import * as THREE from "three";
import { useViewerStore } from "@/stores/viewerStore";
import React, { Suspense, useEffect, useState, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Interaction, InteractionAction } from "@/stores/editorStore";

interface MeshState {
  mesh: THREE.Mesh;
  targetScale?: THREE.Vector3;
  targetColor?: THREE.Color;
  targetEmissive?: THREE.Color;
  targetPosition?: THREE.Vector3;
  mixer?: THREE.AnimationMixer;
  originalScale?: THREE.Vector3;
  originalColor?: THREE.Color;
  originalEmissive?: THREE.Color;
  originalPosition?: THREE.Vector3;
  originalRoughness?: number;
  originalMetalness?: number;
  hasClonedMaterial?: boolean;
}

export function useInteractionRuntime() {
  const setInfoPanel = useViewerStore((state) => state.setInfoPanel);
  const addLabel = useViewerStore((state) => state.addLabel);
  const setEnvironmentPreset = useViewerStore((state) => state.setEnvironmentPreset);
  const stateMap = useRef<Map<string, MeshState>>(new Map());
  const toggleStates = useRef<Map<string, boolean>>(new Map());
  const runningMap = useRef<Map<string, boolean>>(new Map());
  const isAnimating = useRef(false);
  const isCancelled = useRef(false);
  const cameraTargetPos = useRef<THREE.Vector3 | null>(null);
  
  const { camera, controls, scene: threeScene } = useThree() as { camera: THREE.PerspectiveCamera, controls: any, scene: THREE.Scene, gl: THREE.WebGLRenderer };

  useEffect(() => {
    isCancelled.current = false;
    return () => {
      isCancelled.current = true;
    };
  }, []);

  useFrame((state, delta) => {
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
      // Delta-scaled lerps for consistency
      if (data.targetScale) {
        data.mesh.scale.lerp(data.targetScale, delta * 8);
      }
      
      if (data.targetColor && data.mesh.material) {
         const mat = data.mesh.material as THREE.MeshStandardMaterial;
         if (mat.color) {
            mat.color.lerp(data.targetColor, delta * 8);
         }
      }

      if (data.targetEmissive && data.mesh.material) {
         const mat = data.mesh.material as THREE.MeshStandardMaterial;
         if (mat.emissive) {
            mat.emissive.lerp(data.targetEmissive, delta * 8);
         }
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

  const getOrCreateState = (mesh: THREE.Mesh) => {
    if (!stateMap.current.has(mesh.uuid)) {
      stateMap.current.set(mesh.uuid, { mesh });
    }
    return stateMap.current.get(mesh.uuid)!;
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // The engine processor!
  const runSequence = async (mesh: THREE.Mesh, actions: InteractionAction[], triggerOrigin: string) => {
    if (!actions || actions.length === 0 || isCancelled.current) return;
    if (runningMap.current.get(mesh.uuid)) return;

    // Per-mesh animation guard: allow parallel animations on different objects
    if (mesh.userData.isAnimating) return;
    mesh.userData.isAnimating = true;
    runningMap.current.set(mesh.uuid, true);

    try {
      const state = getOrCreateState(mesh);

      // Baseline position storage (one-time sync)
      if (!mesh.userData.originalPosition) {
        mesh.userData.originalPosition = mesh.position.clone();
      }

      // Safety material branch off — clone material before mutating
      if (!state.hasClonedMaterial && mesh.material) {
        const oldMaterial = mesh.material as THREE.Material;
        mesh.material = oldMaterial.clone();
        oldMaterial.dispose(); // Explicitly dispose to prevent GPU memory leak
        
        const mat = mesh.material as THREE.MeshStandardMaterial;
        state.originalColor = mat.color?.clone();
        state.originalEmissive = mat.emissive?.clone();
        state.originalScale = mesh.scale.clone();
        state.originalPosition = (mesh.userData.originalPosition as THREE.Vector3).clone();
        state.originalRoughness = mat.roughness;
        state.originalMetalness = mat.metalness;
        state.hasClonedMaterial = true;
      }

      for (const action of actions) {
        if (isCancelled.current) break;

        const config = action.config || {};
        const durationMs = (config.duration || 0.2) * 1000;

        const runtimeAction = {
          run: async () => {
            switch (action.type) {
              case "highlight":
                state.targetColor = new THREE.Color(config.color || "#ffffff");
                await wait(durationMs);
                break;

              case "glow":
                state.targetEmissive = new THREE.Color(config.color || "#ffffff");
                await wait(durationMs);
                break;

              case "scale":
                const s = config.value ?? 1.1;
                if (state.originalScale) {
                  state.targetScale = state.originalScale.clone().multiplyScalar(s);
                }
                await wait(durationMs);
                break;

              case "audio":
                // Browser Safety: Only allow audio on click
                if (triggerOrigin !== "click") {
                  console.warn("Audio skipped: Browser requires user gesture (Click) to play audio.");
                  break;
                }

                if (config.src && config.src.trim() !== "") {
                  try {
                    const audio = new Audio(config.src);
                    audio.volume = config.volume ?? 1;
                    audio.loop = config.loop ?? false;
                    await audio.play();
                  } catch (err) {
                    console.warn("Audio playback failed:", err);
                  }
                }
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
                if (config.url && config.url !== "https://") {
                  window.open(config.url, "_blank");
                }
                break;

              case "camera_focus":
                // eslint-disable-next-line react-hooks/immutability
                if (controls) controls.enabled = false;

                const box = new THREE.Box3().setFromObject(mesh);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                const defaultOffset = [0, size.y * 0.5, Math.max(size.x, size.y, size.z) * 2];
                const o = config.offset || defaultOffset;

                const targetPos = center.clone().add(new THREE.Vector3(o[0], o[1], o[2]));
                cameraTargetPos.current = targetPos;
                await wait(durationMs || 1000);
                // reset happens in useFrame check
                break;

              case "animation":
                const clipName = config.clip;
                if (!clipName) break;

                // Find animations in the mesh or parents
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

              case "toggle":
                const key = config.stateKey || `toggle_${action.id}`;
                const current = toggleStates.current.get(key) || false;
                const nextState = !current;

                toggleStates.current.set(key, nextState);

                const branchingActions = nextState
                  ? (config.states?.on || [])
                  : (config.states?.off || []);

                await runSequence(mesh, branchingActions, triggerOrigin);
                break;

              // ── NEW INTERACTION TYPES ──

              case "explode_view": {
                // Direction from model center to mesh center
                const meshBox = new THREE.Box3().setFromObject(mesh);
                const meshCenter = meshBox.getCenter(new THREE.Vector3());

                // Find model root center
                let modelRoot: THREE.Object3D = mesh;
                while (modelRoot.parent && modelRoot.parent.type !== "Scene") {
                  modelRoot = modelRoot.parent;
                }
                const modelBox = new THREE.Box3().setFromObject(modelRoot);
                const modelCenter = modelBox.getCenter(new THREE.Vector3());

                let direction: THREE.Vector3;
                const dist = config.distance ?? 0.5;

                if (config.direction === "x") {
                  direction = new THREE.Vector3(dist, 0, 0);
                } else if (config.direction === "y") {
                  direction = new THREE.Vector3(0, dist, 0);
                } else if (config.direction === "z") {
                  direction = new THREE.Vector3(0, 0, dist);
                } else {
                  // Auto: direction from model center to mesh center
                  direction = meshCenter.clone().sub(modelCenter).normalize().multiplyScalar(dist);
                }

                state.targetPosition = (mesh.userData.originalPosition as THREE.Vector3).clone().add(direction);
                await wait(durationMs);
                break;
              }

              case "material_swap": {
                // Clone material to avoid mutating shared materials
                if (!state.hasClonedMaterial && mesh.material) {
                  const oldMat = mesh.material as THREE.Material;
                  mesh.material = oldMat.clone();
                  oldMat.dispose(); // Critical: Dispose old material when swapping to prevent leaks
                  state.hasClonedMaterial = true;
                }
                const mat = mesh.material as THREE.MeshStandardMaterial;
                if (config.color) {
                  state.targetColor = new THREE.Color(config.color);
                }
                if (config.roughness !== undefined) {
                  mat.roughness = config.roughness;
                }
                if (config.metalness !== undefined) {
                  mat.metalness = config.metalness;
                }
                mat.needsUpdate = true;
                await wait(durationMs);
                break;
              }

              case "label_pin": {
                const meshBox2 = new THREE.Box3().setFromObject(mesh);
                const meshCenter2 = meshBox2.getCenter(new THREE.Vector3());
                const meshSize2 = meshBox2.getSize(new THREE.Vector3());

                // Offset based on config position
                let labelPos: [number, number, number];
                const offset2 = meshSize2.y * 0.6;
                if (config.position === "right") {
                  labelPos = [meshCenter2.x + meshSize2.x * 0.6, meshCenter2.y, meshCenter2.z];
                } else if (config.position === "left") {
                  labelPos = [meshCenter2.x - meshSize2.x * 0.6, meshCenter2.y, meshCenter2.z];
                } else {
                  // top
                  labelPos = [meshCenter2.x, meshCenter2.y + offset2, meshCenter2.z];
                }

                addLabel({
                  id: `label_${mesh.uuid}_${action.id}`,
                  meshUuid: mesh.uuid,
                  text: config.text || "Label",
                  fontSize: config.fontSize ?? 14,
                  backgroundColor: config.backgroundColor || "#000000",
                  position: labelPos,
                });
                break;
              }

              case "particle_burst": {
                // Optimization: Cap particles
                const count = Math.min(config.count ?? 20, 50);
                const pSize = config.size ?? 0.05;
                const color = config.color || "#10b981";

                const meshBox3 = new THREE.Box3().setFromObject(mesh);
                const origin = meshBox3.getCenter(new THREE.Vector3());

                const positions = new Float32Array(count * 3);
                const velocities = new Float32Array(count * 3);

                for (let i = 0; i < count; i++) {
                  positions[i * 3] = origin.x;
                  positions[i * 3 + 1] = origin.y;
                  positions[i * 3 + 2] = origin.z;

                  // Random outward velocity
                  velocities[i * 3] = (Math.random() - 0.5) * 3;
                   // eslint-disable-next-line react-hooks/immutability
                  velocities[i * 3 + 1] = Math.random() * 2 + 1;
                  velocities[i * 3 + 2] = (Math.random() - 0.5) * 3;
                }

                const geom = new THREE.BufferGeometry();
                geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

                const particleMat = new THREE.PointsMaterial({
                  color: new THREE.Color(color),
                  size: pSize,
                  transparent: true,
                  opacity: 1,
                  depthWrite: false,
                });

                const points = new THREE.Points(geom, particleMat);
                points.userData.__particleBurst = true;
                points.userData.__particleAge = 0;
                points.userData.__particleDuration = config.duration ?? 1.0;
                points.userData.__velocities = velocities;

                threeScene.add(points);
                await wait(durationMs);
                break;
              }

              case "reveal_hidden": {
                const targetName = config.targetMeshName;
                if (!targetName) break;

                let targetMesh: THREE.Mesh | null = null;
                threeScene.traverse((child: any) => {
                  if (child.isMesh && child.name === targetName) {
                    targetMesh = child;
                  }
                });

                if (!targetMesh) break;
                const tm = targetMesh as THREE.Mesh;

                // Ensure material is cloned before mutating
                const oldTMat = tm.material as THREE.Material;
                tm.material = oldTMat.clone();
                const tmMat = tm.material as THREE.MeshStandardMaterial;
                tmMat.transparent = true;

                const animType = config.animationType || "fade";

                if (animType === "fade") {
                  tmMat.opacity = 0;
                  tm.visible = true;
                   // eslint-disable-next-line react-hooks/immutability
                  const steps = 20;
                  const stepTime = durationMs / steps;
                  for (let i = 1; i <= steps; i++) {
                    await wait(stepTime);
                    tmMat.opacity = i / steps;
                  }
                } else if (animType === "scale_in") {
                  tm.scale.set(0.01, 0.01, 0.01);
                  tm.visible = true;
                  const targetScale = new THREE.Vector3(1, 1, 1);
                  const tState = getOrCreateState(tm);
                  tState.targetScale = targetScale;
                  await wait(durationMs);
                } else if (animType === "slide_up") {
                  const origY = tm.position.y;
                  tm.position.y = origY - 1;
                  tmMat.opacity = 0;
                  tm.visible = true;
                   // eslint-disable-next-line react-hooks/immutability
                  const steps2 = 20;
                  const stepTime2 = durationMs / steps2;
                  for (let i = 1; i <= steps2; i++) {
                    await wait(stepTime2);
                    tm.position.y = origY - 1 + (i / steps2);
                    tmMat.opacity = i / steps2;
                  }
                }
                break;
              }

              case "set_environment": {
                const preset = config.preset || "city";
                setEnvironmentPreset(preset);
                break;
              }
            }
          }
        };

        await runtimeAction.run();
        if (isCancelled.current) break;
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
    if (!interactions || interactions.length === 0 || isCancelled.current) return;
    
    // Global lock: Disable interaction triggers if gizmo is active (managed in Viewport via state)
    if (mesh.userData.isDragging) return;

    // Global animation guard for click spam
    if (trigger === "click" && isAnimating.current) return;
    
    const relevantInts = interactions.filter(i => {
       if (trigger === "unhover") return i.trigger === "onHover" && i.revertOnLeave;
       if (trigger === "hover") return i.trigger === "onHover";
       if (trigger === "click") return i.trigger === "onClick";
    });

    for (const int of relevantInts) {
       if (int.conditions?.once && mesh.userData[`triggered_${int.id}`]) {
          continue;
       }
       mesh.userData[`triggered_${int.id}`] = true;

       if (trigger === "unhover") {
          const state = stateMap.current.get(mesh.uuid);
          if (state) {
             if (state.originalColor) state.targetColor = state.originalColor.clone();
             if (state.originalEmissive) state.targetEmissive = state.originalEmissive.clone();
             if (state.originalScale) state.targetScale = state.originalScale.clone();
             if (state.originalPosition) state.targetPosition = state.originalPosition.clone();
             // Restore material properties
             if (state.hasClonedMaterial && state.mesh.material) {
               const mat = state.mesh.material as THREE.MeshStandardMaterial;
               if (state.originalRoughness !== undefined) mat.roughness = state.originalRoughness;
               if (state.originalMetalness !== undefined) mat.metalness = state.originalMetalness;
             }
          }
       } else {
          runSequence(mesh, int.actions || [], trigger);
       }
    }
  };

  return { runInteraction };
}
