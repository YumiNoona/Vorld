"use client";

import React, { Suspense, useRef, useEffect, useMemo } from "react";
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
import { Selection, Select, EffectComposer, Outline } from "@react-three/postprocessing";
import * as THREE from "three";
import { useEditorStore } from "@/stores/editorStore";
import { createClient } from "@/lib/supabase/client";

function EditorModel({ url }: { url: string }) {
  const { nodes, materials } = useGLTF(url) as any;
  const { selectedMesh, setSelectedMesh } = useEditorStore();
  
  return (
    <group dispose={null} scale={2}>
      {useMemo(() => Object.entries(nodes).map(([name, node]: [string, any]) => {
        if (node.isMesh) {
          const isSelected = selectedMesh === name;
          return (
            <Select key={name} enabled={isSelected}>
              <mesh
                geometry={node.geometry}
                material={node.material}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMesh(name);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  document.body.style.cursor = "auto";
                }}
                castShadow
                receiveShadow
              />
            </Select>
          );
        }
        return null;
      }), [nodes, selectedMesh, setSelectedMesh])}
    </group>
  );
}

export function Viewport() {
  const supabase = createClient();
  const { modelPath, setSelectedMesh } = useEditorStore();

  const modelUrl = useMemo(() => {
    if (!modelPath) return null;
    const client = createClient();
    if (!client) return null;
    return client.storage.from('models').getPublicUrl(modelPath).data.publicUrl;
  }, [modelPath]);

  const { camera: savedCamera } = useEditorStore();

  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background-subtle">
        <p className="text-text-tertiary uppercase font-bold tracking-widest animate-pulse">Loading Model...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, preserveDrawingBuffer: true }}>
        <PerspectiveCamera makeDefault position={savedCamera.position} fov={45} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
        
        <Suspense fallback={null}>
          <Selection>
            <EffectComposer multisampling={8} autoClear={false}>
              <Outline 
                blur 
                edgeStrength={100} 
                width={1000} 
                visibleEdgeColor={0x7c6aff} 
                hiddenEdgeColor={0x7c6aff} 
              />
            </EffectComposer>
            
            <Stage environment="studio" intensity={0.5} shadows={false} adjustCamera={false}>
              <EditorModel url={modelUrl} />
            </Stage>
          </Selection>
          
          <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={10} blur={2.5} far={0.8} />
          <Environment preset="city" />
          <BakeShadows />
        </Suspense>

        <OrbitControls 
          makeDefault 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.5} 
          target={new THREE.Vector3(...savedCamera.target)}
          onEnd={(e: any) => {
            const pos = e.target.object.position;
            const tar = e.target.target;
            
            // Avoid circular updates by checking for significant changes
            const currentCamera = useEditorStore.getState().camera;
            const posChanged = 
              Math.abs(pos.x - currentCamera.position[0]) > 0.01 ||
              Math.abs(pos.y - currentCamera.position[1]) > 0.01 ||
              Math.abs(pos.z - currentCamera.position[2]) > 0.01;
            
            const tarChanged = 
              Math.abs(tar.x - currentCamera.target[0]) > 0.01 ||
              Math.abs(tar.y - currentCamera.target[1]) > 0.01 ||
              Math.abs(tar.z - currentCamera.target[2]) > 0.01;

            if (posChanged || tarChanged) {
              useEditorStore.getState().setCamera(
                [pos.x, pos.y, pos.z],
                [tar.x, tar.y, tar.z]
              );
            }
          }}
        />
        
        {/* Deselect on click away */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -1, 0]} 
          receiveShadow 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMesh(null);
          }}
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial transparent opacity={0} color="#000" />
        </mesh>
      </Canvas>
    </div>
  );
}
