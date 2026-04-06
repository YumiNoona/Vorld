"use client";

import React, { Suspense, useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  Stage, 
  useGLTF, 
  PerspectiveCamera,
  BakeShadows,
  ContactShadows,
  Environment
} from "@react-three/drei";
import { Selection, Select, EffectComposer, Outline, selectionContext } from "@react-three/postprocessing";
import * as THREE from "three";
import { useEditorStore, RenderMode, CameraMode, Interaction } from "@/stores/editorStore";
import { createClient } from "@/lib/supabase/client";
import { useInteractionRuntime } from "@/hooks/useInteractionRuntime";
import { EditorContextMenu } from "./EditorContextMenu";

type GLTFResult = {
  nodes: Record<string, THREE.Object3D>;
  materials: Record<string, THREE.Material>;
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
};

const EMPTY_INTERACTIONS: Interaction[] = [];

// Surgical Warning Silence (For a clean terminal)
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const msg = args[0];
    if (typeof msg === "string" && (
      msg.includes("THREE.THREE.Clock") || 
      msg.includes("PCFSoftShadowMap") || 
      msg.includes("X4122")
    )) return;
    originalWarn(...args);
  };
  
  const originalLog = console.log;
  console.log = (...args) => {
    const msg = args[0];
    if (typeof msg === "string" && msg.includes("X4122")) return;
    originalLog(...args);
  };
}

// Asset Disposal Helper
const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
  if (Array.isArray(material)) {
    material.forEach(m => m.dispose());
  } else {
    material.dispose();
  }
};

// (IndividualMesh removed in favor of scene traversal for total stability and hierarchical correctness)

function SceneManager({ url }: { url: string }) {
  const { scene, nodes, animations } = useGLTF(url) as unknown as GLTFResult;
  const {
    selectMesh,
    selectedMeshes,
    hiddenMeshes,
    isolatedId,
    interactions: interactionsStore,
    previewMode,
    setAnimations,
    renderMode,
    cameraMode,
    toggleMeshVisibility, 
    toggleIsolate,
    renameMesh
  } = useEditorStore();
  
  const meshMap = useRef<Record<string, THREE.Mesh>>({});
  
  const { camera, controls, scene: threeScene } = useThree() as { camera: THREE.PerspectiveCamera, controls: any, scene: THREE.Scene };

  // Sync animations (Guarded)
  useEffect(() => {
    const animationNames = (animations || []).map((a: THREE.AnimationClip) => a.name);
    const currentStoreAnims = useEditorStore.getState().animations;
    if (JSON.stringify(currentStoreAnims) !== JSON.stringify(animationNames)) {
      useEditorStore.getState().setAnimations(animationNames);
    }
  }, [animations]);

  const [finalDistance, setFinalDistance] = useState<number | null>(null);

  // 1. Scene Analysis & Distance Calculation
  useEffect(() => {
    if (!scene || !camera) return;
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distance = (maxDim / 2) / Math.tan(fov / 2);
    setFinalDistance(distance * 1.2);
  }, [scene, camera]);

  // 2. Camera Projection Stability
  useEffect(() => {
    if (!camera || !finalDistance) return;

    const near = finalDistance / 100;
    const far = finalDistance * 10;

    if (camera.near !== near || camera.far !== far) {
      // eslint-disable-next-line react-hooks/immutability
      camera.near = near;
      // eslint-disable-next-line react-hooks/immutability
      camera.far = far;
      camera.updateProjectionMatrix();
    }
  }, [camera, finalDistance]);

  // 3. Camera Positioning (Trigger Based)
  useEffect(() => {
    if (!scene || !camera || !finalDistance || cameraMode === 'free') return;

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const targetPos = new THREE.Vector3();
    const upVec = new THREE.Vector3(0, 1, 0);

    if (cameraMode === 'top') {
      targetPos.set(center.x, center.y + finalDistance, center.z);
      upVec.set(0, 0, -1);
    } else if (cameraMode === 'side') {
      targetPos.set(center.x, center.y, center.z + finalDistance);
      upVec.set(0, 1, 0);
    }

    setTargetState({ pos: targetPos, target: center });
  }, [cameraMode, scene, camera, finalDistance]);

  const { runInteraction } = useInteractionRuntime();

  // Focus Logic (Smooth Lerp)
  const [targetState, setTargetState] = useState<{ pos: THREE.Vector3, target: THREE.Vector3 } | null>(null);

  useFrame((state) => {
    if (targetState) {
      state.camera.position.lerp(targetState.pos, 0.08); // Relaxed LERP for smoother feel
      if (controls) {
        controls.target.lerp(targetState.target, 0.08);
        controls.update();
      }
      if (state.camera.position.distanceTo(targetState.pos) < 0.01) {
        setTargetState(null);
      }
    }
  });

  const focusSelection = () => {
    const selectedIds = useEditorStore.getState().selectedMeshes;
    if (selectedIds.size === 0) return;
    
    const box = new THREE.Box3();
    let hasValid = false;
    selectedIds.forEach(uuid => {
      const mesh = meshMap.current[uuid];
      if (mesh) {
        box.expandByObject(mesh);
        hasValid = true;
      }
    });

    if (!hasValid) return;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 1.5 || 5;

    const direction = new THREE.Vector3().subVectors(camera.position, controls?.target || new THREE.Vector3()).normalize();
    const pos = center.clone().add(direction.multiplyScalar(distance));
    
    setTargetState({ pos, target: center });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key.toLowerCase() === "f") focusSelection();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera, controls]);

  // 5. Hierarchy Synchronization & Overrides
  useEffect(() => {
    if (!scene) return;
    
    // Stable synchronization loop
    scene.traverse((node: any) => {
      if (node.isMesh) {
        // Apply Visibility (Isolation / Hiding)
        const isVisible = isolatedId 
          ? isolatedId === node.uuid 
          : !hiddenMeshes.has(node.uuid);
        node.visible = isVisible;

        // Apply Render Mode Materials
        if (renderMode === 'solid') {
           if (!node.userData.originalMaterial) node.userData.originalMaterial = node.material;
           node.material = new THREE.MeshStandardMaterial({ color: '#888888', roughness: 0.5, metalness: 0 });
        } else if (renderMode === 'wireframe') {
           if (!node.userData.originalMaterial) node.userData.originalMaterial = node.material;
           node.material = (node.userData.originalMaterial || node.material).clone();
           node.material.wireframe = true;
        } else {
           if (node.userData.originalMaterial) {
              node.material = node.userData.originalMaterial;
           }
        }

        // Apply Selection Highlighting (Emissive Glow Fallback)
        const isSelected = selectedMeshes.has(node.uuid);
        if (isSelected) {
           node.material.emissive = node.material.emissive || new THREE.Color(0,0,0);
           node.material.emissive.set('#10b981');
           node.material.emissiveIntensity = 1.0; // Brighter for certainty
        } else if (node.material.emissive) {
           node.material.emissive.set('#000000');
           node.material.emissiveIntensity = 0;
        }

        // Setup mesh map for focus/interactivity
        meshMap.current[node.uuid] = node;
      }
    });
  }, [scene, hiddenMeshes, isolatedId, renderMode, selectedMeshes]);

  return (
    <group dispose={null}>
      <primitive 
        object={scene} 
        onClick={(e: any) => {
          if (!e.object.isMesh) return;
          e.stopPropagation();
          
          const mesh = e.object;
          if (previewMode) {
            const interactions = interactionsStore[mesh.uuid] || interactionsStore[mesh.name] || EMPTY_INTERACTIONS;
            runInteraction(mesh, interactions, "click");
          } else {
            selectMesh(mesh.uuid, mesh.name, { 
              ctrl: e.ctrlKey || e.metaKey, 
              shift: e.shiftKey 
            });
          }
        }}
        onPointerOver={(e: any) => {
          if (!e.object.isMesh) return;
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          if (previewMode) {
             const mesh = e.object;
             const interactions = interactionsStore[mesh.uuid] || interactionsStore[mesh.name] || EMPTY_INTERACTIONS;
             runInteraction(mesh, interactions, "hover");
          }
        }}
        onPointerOut={(e: any) => {
          document.body.style.cursor = "auto";
          if (previewMode && e.object.isMesh) {
             const mesh = e.object;
             const interactions = interactionsStore[mesh.uuid] || interactionsStore[mesh.name] || EMPTY_INTERACTIONS;
             runInteraction(mesh, interactions, "unhover");
          }
        }}
      />
    </group>
  );
}

// Sub-component for Highlights to optimize renders
function SelectionHighlights() {
  const selectedMeshes = useEditorStore((state) => state.selectedMeshes);
  const { scene } = useThree();
  const [selectedObjects, setSelectedObjects] = useState<THREE.Object3D[]>([]);

  useEffect(() => {
    const next: THREE.Object3D[] = [];
    scene.traverse((child) => {
       if (child.type === 'Mesh' && selectedMeshes.has(child.uuid)) {
         next.push(child);
       }
    });
    setSelectedObjects(next);
  }, [selectedMeshes, scene]);

  if (selectedObjects.length === 0) return null;

  return (
    <>
      <EffectComposer autoClear={false}>
        <Outline
          selection={selectedObjects}
          visibleEdgeColor={0x10b981}
          edgeStrength={10}
          width={2}
        />
      </EffectComposer>
      {selectedObjects.map((obj) => (
        <primitive 
          key={`box-${obj.uuid}`} 
          object={new THREE.BoxHelper(obj, '#10b981')} 
          attach="none"
          onUpdate={(self: any) => self.update()}
        />
      ))}
    </>
  );
}

export function Viewport() {
  const modelPath = useEditorStore((state) => state.modelPath);
  const savedCamera = useEditorStore((state) => state.camera);
  const setSelectedMeshes = useEditorStore((state) => state.setSelectedMeshes);
  const previewMode = useEditorStore((state) => state.previewMode);
  const targetName = useEditorStore((state) => state.primarySelectionName);

  const modelUrl = useMemo(() => {
    if (!modelPath) return null;
    const client = createClient();
    return client.storage.from("models").getPublicUrl(modelPath).data.publicUrl;
  }, [modelPath]);

  const cameraTarget = useMemo(
    () => new THREE.Vector3(...savedCamera.target),
    [savedCamera.target]
  );

  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0b0f14]">
        <p className="text-text-secondary text-xs uppercase font-bold tracking-widest animate-pulse">
          Initializing Engine...
        </p>
      </div>
    );
  }

  return (
    <EditorContextMenu>
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none" 
        tabIndex={0}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          preserveDrawingBuffer: true,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.setClearColor("#0b0f14", 1);
        }}
      >
        <color attach="background" args={['#0b0f14']} />
        <PerspectiveCamera
          makeDefault
          position={savedCamera.position}
          fov={45}
        />
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        <Suspense fallback={null}>
          <SceneManager url={modelUrl} />
          {!previewMode && <SelectionHighlights />}

          <ContactShadows
            position={[0, -0.05, 0]}
            opacity={0.4}
            scale={20}
            blur={1.5}
            far={10}
            resolution={1024}
          />
          <Environment preset="city" />
          <BakeShadows />
        </Suspense>

        <OrbitControls
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          target={cameraTarget}
          onStart={() => {
            // Free the camera mode as soon as the user interacts
            useEditorStore.getState().setCameraMode('free');
          }}
          onEnd={(e: any) => {
            const pos = e.target.object.position;
            const tar = e.target.target;
            useEditorStore.getState().setCamera(
              [pos.x, pos.y, pos.z],
              [tar.x, tar.y, tar.z]
            );
          }}
        />
      </Canvas>
    </div>
    </EditorContextMenu>
  );
}
