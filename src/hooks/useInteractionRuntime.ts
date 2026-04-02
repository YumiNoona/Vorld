import * as THREE from "three";
import { useViewerStore } from "@/stores/viewerStore";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

interface MeshState {
  mesh: THREE.Mesh;
  targetScale?: THREE.Vector3;
  targetColor?: THREE.Color;
  targetEmissive?: THREE.Color;
  mixer?: THREE.AnimationMixer;
  originalScale?: THREE.Vector3;
  originalColor?: THREE.Color;
  originalEmissive?: THREE.Color;
  hasClonedMaterial?: boolean;
}

export function useInteractionRuntime() {
  const setInfoPanel = useViewerStore((state: any) => state.setInfoPanel);
  const stateMap = useRef<Map<string, MeshState>>(new Map());
  const toggleStates = useRef<Map<string, boolean>>(new Map());
  const cameraTargetPos = useRef<THREE.Vector3 | null>(null);
  
  const { camera, controls, gl } = useThree() as any;

  useFrame((_, delta) => {
    // Camera Lerp
    if (cameraTargetPos.current) {
       camera.position.lerp(cameraTargetPos.current, 5 * delta);
       const dist = camera.position.distanceTo(cameraTargetPos.current);
       if (dist < 0.01 && controls) {
          controls.enabled = true;
          cameraTargetPos.current = null;
       }
    }

    stateMap.current.forEach((data) => {
      // Scale lerp
      if (data.targetScale) {
        data.mesh.scale.lerp(data.targetScale, delta * 8);
      }
      
      // Color lerp
      if (data.targetColor && data.mesh.material) {
         const mat = data.mesh.material as any;
         if (mat.color) {
            mat.color.lerp(data.targetColor, delta * 8);
         }
      }

      // Emissive lerp
      if (data.targetEmissive && data.mesh.material) {
         const mat = data.mesh.material as any;
         if (mat.emissive) {
            mat.emissive.lerp(data.targetEmissive, delta * 8);
         }
      }

      // Animation Mixer
      if (data.mixer) {
         data.mixer.update(delta);
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
  const runSequence = async (mesh: THREE.Mesh, actions: any[], triggerOrigin: string) => {
     if (!actions || actions.length === 0) return;
     
     const state = getOrCreateState(mesh);

     // Safety material branch off
     if (!state.hasClonedMaterial && mesh.material) {
        mesh.material = (mesh.material as THREE.Material).clone();
        state.originalColor = (mesh.material as any).color?.clone();
        state.originalEmissive = (mesh.material as any).emissive?.clone();
        state.originalScale = mesh.scale.clone();
        state.hasClonedMaterial = true;
     }

     for (const action of actions) {
        const config = action.config || {};
        const durationMs = (config.duration || 0.2) * 1000;

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
               let root: any = mesh;
               while (root.parent && (!root.animations || root.animations.length === 0)) {
                  root = root.parent;
               }
               
               const clips = root.animations || [];
               const clip = clips.find((c: any) => c.name === clipName);
               
               if (clip) {
                  if (!state.mixer) state.mixer = new THREE.AnimationMixer(mesh);
                  const action = state.mixer.clipAction(clip);
                  
                  if (config.loop === false) {
                     action.setLoop(THREE.LoopOnce, 1);
                     action.clampWhenFinished = true;
                  }
                  
                  action.reset().fadeIn(0.2).play();
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
        }
     }
  };

  const runInteraction = (
    mesh: THREE.Mesh,
    interactions: any[],
    trigger: "click" | "hover" | "unhover"
  ) => {
    if (!interactions || interactions.length === 0) return;
    
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
          }
       } else {
          runSequence(mesh, int.actions || [], trigger);
       }
    }
  };

  return { runInteraction };
}
