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
  Environment,
  TransformControls
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

// Asset Disposal Helper
const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
  if (Array.isArray(material)) {
    material.forEach(m => m.dispose());
  } else {
    material.dispose();
  }
};

const IndividualMesh = React.memo(function IndividualMesh({
  uuid,
  name,
  node,
  onSelect,
  meshMap,
  interactions,
  previewMode,
  renderMode,
  visible = true,
  isSelected,
  isPrimary
}: {
  uuid: string;
  name: string;
  node: THREE.Mesh;
  onSelect: (uuid: string, modifiers: { ctrl?: boolean, shift?: boolean }) => void;
  meshMap: React.MutableRefObject<Record<string, THREE.Mesh>>;
  interactions: Interaction[];
  previewMode: boolean;
  renderMode: RenderMode;
  visible?: boolean;
  isSelected?: boolean;
  isPrimary?: boolean;
}) {
  const { runInteraction } = useInteractionRuntime();
  const originalMaterial = useRef<THREE.Material | THREE.Material[]>(node.material);
  const [currentMaterial, setCurrentMaterial] = useState<THREE.Material | THREE.Material[]>(node.material);

  useEffect(() => {
    // Render Mode Logic: Use explicit modes
    let nextMaterial: THREE.Material | THREE.Material[];

    if (renderMode === 'solid') {
      nextMaterial = new THREE.MeshStandardMaterial({ color: '#888888', roughness: 0.5, metalness: 0 });
    } else if (renderMode === 'wireframe') {
      if (Array.isArray(originalMaterial.current)) {
        nextMaterial = originalMaterial.current.map(m => {
          const clone = m.clone() as any;
          clone.wireframe = true;
          return clone;
        });
      } else {
        const clone = (originalMaterial.current as THREE.Material).clone() as any;
        clone.wireframe = true;
        nextMaterial = clone;
      }
    } else {
      nextMaterial = originalMaterial.current;
    }

    setCurrentMaterial(nextMaterial);

    // Cleanup cloned materials to prevent leaks
    return () => {
      if (nextMaterial !== originalMaterial.current) {
        disposeMaterial(nextMaterial);
      }
    };
  }, [renderMode]);

  return (
    <Select enabled={isSelected}>
      <mesh
        ref={(ref) => {
          // eslint-disable-next-line react-hooks/immutability
          if (ref) meshMap.current[uuid] = ref;
        }}
        geometry={node.geometry}
        material={currentMaterial}
        matrix={node.matrixWorld}
        matrixAutoUpdate={true} // Allow gizmo to move it
        visible={visible}
        onClick={(e) => {
          e.stopPropagation();
          if (previewMode) {
            runInteraction(meshMap.current[uuid], interactions, "click");
          } else {
            onSelect(uuid, { 
              ctrl: e.ctrlKey || e.metaKey, 
              shift: e.shiftKey 
            });
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          if (previewMode) {
            runInteraction(meshMap.current[uuid], interactions, "hover");
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
          if (previewMode) {
            runInteraction(meshMap.current[uuid], interactions, "unhover");
          }
        }}
        castShadow
        receiveShadow
      />
    </Select>
  );
});

function SceneManager({ url }: { url: string }) {
  const { scene, nodes, animations } = useGLTF(url) as unknown as GLTFResult;
  const selectMesh = useEditorStore((state) => state.selectMesh);
  const selectedMeshes = useEditorStore((state) => state.selectedMeshes);
  const hiddenMeshes = useEditorStore((state) => state.hiddenMeshes);
  const isolatedId = useEditorStore((state) => state.isolatedId);
  const interactionsStore = useEditorStore((state) => state.interactions);
  const previewMode = useEditorStore((state) => state.previewMode);
  const setAnimations = useEditorStore((state) => state.setAnimations);
  const renderMode = useEditorStore((state) => state.renderMode);
  const cameraMode = useEditorStore((state) => state.cameraMode);
  const meshMap = useRef<Record<string, THREE.Mesh>>({});
  
  const { camera, controls } = useThree() as { camera: THREE.PerspectiveCamera, controls: any };

  // Sync animations
  useEffect(() => {
    if (animations && animations.length > 0) {
      setAnimations(animations.map((a: THREE.AnimationClip) => a.name));
    } else {
      setAnimations([]);
    }
  }, [animations, setAnimations]);

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

    // eslint-disable-next-line react-hooks/immutability
    camera.near = finalDistance / 100;

    // eslint-disable-next-line react-hooks/immutability
    camera.far = finalDistance * 10;

    camera.updateProjectionMatrix();
  }, [camera, finalDistance]);

  // 3. Controls Management (Full Reset)
  useEffect(() => {
    if (!controls) return;
    
    if (cameraMode === 'free') {
      // eslint-disable-next-line react-hooks/immutability
      controls.enabled = true;
      // eslint-disable-next-line react-hooks/immutability
      controls.enableRotate = true;
      // eslint-disable-next-line react-hooks/immutability
      controls.enablePan = true;
      // eslint-disable-next-line react-hooks/immutability
      controls.enableZoom = true;
      // eslint-disable-next-line react-hooks/immutability
      controls.minPolarAngle = 0;
      // eslint-disable-next-line react-hooks/immutability
      controls.maxPolarAngle = Math.PI;
    } else {
      // eslint-disable-next-line react-hooks/immutability
      controls.enabled = true;
      // eslint-disable-next-line react-hooks/immutability
      controls.enableRotate = false;
      // eslint-disable-next-line react-hooks/immutability
      controls.enablePan = true;
      // eslint-disable-next-line react-hooks/immutability
      controls.enableZoom = true;

      // lock vertical rotation
      // eslint-disable-next-line react-hooks/immutability
      controls.minPolarAngle = controls.maxPolarAngle;
    }
    controls.update();
  }, [controls, cameraMode]);

  // 4. Camera Positioning (Mode Based)
  useEffect(() => {
    if (!scene || !camera || !finalDistance) return;
    if (cameraMode === 'free') return;

    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const targetPos = new THREE.Vector3();
    const upVec = new THREE.Vector3(0, 1, 0);

    if (cameraMode === 'top') {
      targetPos.set(center.x, center.y + finalDistance, center.z);
      upVec.set(0, 0, -1);
    } else if (cameraMode === 'side') {
      targetPos.set(center.x + finalDistance, center.y, center.z);
      upVec.set(0, 1, 0);
    }

    camera.position.copy(targetPos);
    camera.up.copy(upVec);
    camera.lookAt(center);

    if (controls) {
      controls.target.copy(center);
      controls.update();
    }
  }, [cameraMode, scene, camera, controls, finalDistance]);

  const meshEntries = useMemo(
    () => Object.entries(nodes).filter(([, node]: [string, any]) => node.isMesh),
    [nodes]
  );

  const handleSelect = React.useCallback(
    (uuid: string, modifiers: { ctrl?: boolean, shift?: boolean }) => {
      selectMesh(uuid, modifiers);
    },
    [selectMesh]
  );

  const primarySelection = useEditorStore((state) => state.primarySelection);
  const [gizmoMode, setGizmoMode] = useState<"translate" | "rotate" | "scale">("translate");

  // Focus Logic (Smooth Lerp)
  const [targetState, setTargetState] = useState<{ pos: THREE.Vector3, target: THREE.Vector3 } | null>(null);

  useFrame((state, delta) => {
    if (targetState) {
      state.camera.position.lerp(targetState.pos, 0.1);
      if (controls) {
        controls.target.lerp(targetState.target, 0.1);
        controls.update();
      }
      if (state.camera.position.distanceTo(targetState.pos) < 0.01) {
        setTargetState(null);
      }
    }
  });

  const focusSelection = () => {
    if (selectedMeshes.size === 0) return;
    const box = new THREE.Box3();
    let hasValid = false;
    selectedMeshes.forEach(uuid => {
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
    // Correct framing distance: maxDim * 1.5
    const distance = maxDim * 1.5 || 5;

    const direction = new THREE.Vector3().subVectors(camera.position, controls?.target || new THREE.Vector3()).normalize();
    const pos = center.clone().add(direction.multiplyScalar(distance));
    
    setTargetState({ pos, target: center });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      
      switch (e.key.toLowerCase()) {
        case "w": setGizmoMode("translate"); break;
        case "e": setGizmoMode("rotate"); break;
        case "r": setGizmoMode("scale"); break;
        case "f": focusSelection(); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMeshes, camera, controls]);

  return (
    <group dispose={null} scale={2}>
      {meshEntries.map(([name, node]) => {
        const mesh = node as THREE.Mesh;
        const isSelected = selectedMeshes.has(mesh.uuid);
        const isPrimary = primarySelection === mesh.uuid;
        const isVisible = isolatedId ? isolatedId === mesh.uuid : !hiddenMeshes.has(mesh.uuid);
        return (
          <IndividualMesh
            key={mesh.uuid}
            uuid={mesh.uuid}
            name={name}
            node={mesh}
            onSelect={handleSelect}
            meshMap={meshMap}
            interactions={interactionsStore[mesh.uuid] || interactionsStore[name] || []}
            previewMode={previewMode}
            renderMode={renderMode}
            visible={isVisible}
            isSelected={isSelected}
            isPrimary={isPrimary}
          />
        );
      })}

      {primarySelection && meshMap.current[primarySelection] && !previewMode && (
        <TransformControls
          object={meshMap.current[primarySelection]}
          mode={gizmoMode}
          enabled={cameraMode === 'free'}
          onMouseDown={() => {
            if (controls) controls.enabled = false;
            if (meshMap.current[primarySelection]) {
              meshMap.current[primarySelection].userData.isDragging = true;
            }
          }}
          onMouseUp={() => {
            if (controls) controls.enabled = true;
            if (meshMap.current[primarySelection]) {
              meshMap.current[primarySelection].userData.isDragging = false;
            }
          }}
        />
      )}
    </group>
  );
}

export function Viewport() {
  console.count("Viewport render");
  const modelPath = useEditorStore((state) => state.modelPath);
  const savedCamera = useEditorStore((state) => state.camera);
  const setSelectedMeshes = useEditorStore((state) => state.setSelectedMeshes);
  const previewMode = useEditorStore((state) => state.previewMode);

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
      <div className="w-full h-full flex items-center justify-center bg-bg-secondary">
        <p className="text-text-secondary text-xs uppercase font-bold tracking-widest animate-pulse">
          Initializing Engine...
        </p>
      </div>
    );
  }

  return (
    <EditorContextMenu>
      <div className="w-full h-full cursor-grab active:cursor-grabbing outline-none" tabIndex={0}>
        <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          preserveDrawingBuffer: true,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          // Technical Fix: Correct Shadow Map
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={savedCamera.position}
          fov={45}
        />
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1.5}
          castShadow
        />

        <Suspense fallback={null}>
          <Selection>
            <EffectComposer multisampling={0} autoClear={false}>
              {previewMode ? <></> : (
                <Outline
                  visibleEdgeColor={0x10b981}
                  hiddenEdgeColor={0x10b981}
                  edgeStrength={useEditorStore.getState().selectedMeshes.size <= 20 ? 3 : 0}
                  width={1.5}
                />
              )}
            </EffectComposer>

            <Stage
              environment="studio"
              intensity={0.5}
              shadows={false}
              adjustCamera={false}
            >
              <SceneManager url={modelUrl} />
            </Stage>
          </Selection>

          <ContactShadows
            position={[0, -0.8, 0]}
            opacity={0.4}
            scale={10}
            blur={2.5}
            far={0.8}
          />
          <Environment preset="city" />
          <BakeShadows />
        </Suspense>

        <OrbitControls
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          target={cameraTarget}
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
