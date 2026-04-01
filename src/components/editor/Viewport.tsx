"use client";

import React, { Suspense, useRef, useEffect } from "react";
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

const MODEL_URL = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/shoe/model.gltf";

function EditorModel() {
  const { nodes, materials } = useGLTF(MODEL_URL) as any;
  const { selectedMesh, setSelectedMesh } = useEditorStore();
  
  return (
    <group dispose={null} scale={2}>
      {Object.entries(nodes).map(([name, node]: [string, any]) => {
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
      })}
    </group>
  );
}

export function Viewport() {
  const { setSelectedMesh } = useEditorStore();

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, preserveDrawingBuffer: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
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
            
            <Stage environment="studio" intensity={0.5} contactShadow={false} adjustCamera={false}>
              <EditorModel />
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
          <meshShadowMaterial transparent opacity={0.4} />
        </mesh>
      </Canvas>
    </div>
  );
}
