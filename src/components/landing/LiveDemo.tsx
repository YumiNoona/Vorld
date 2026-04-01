"use client";

import React, { Suspense, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  Stage, 
  useGLTF, 
  Html,
  ContactShadows,
  PerspectiveCamera,
  BakeShadows,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Info, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";
import * as THREE from "three";

// A more stable sample GLB from official Khronos Group samples
const MODEL_URL = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF/MaterialsVariantsShoe.gltf";

function ShoeModel({ activeMesh, onMeshClick }: { activeMesh: string | null; onMeshClick: (name: string) => void }) {
  // We use a try-catch pattern or a simple null check because useGLTF is a hook
  const { nodes, materials } = useGLTF(MODEL_URL) as any;
  const group = useRef<THREE.Group>(null!);

  if (!nodes) return (
    <mesh scale={0.5}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
    </mesh>
  );

  return (
    <group ref={group} dispose={null} scale={1.5} position={[0, -0.5, 0]}>
      {Object.entries(nodes).map(([name, node]: [string, any]) => {
        if (node.isMesh) {
          const isActive = activeMesh === name;
          return (
            <mesh
              key={name}
              geometry={node.geometry}
              material={node.material}
              onClick={(e) => {
                e.stopPropagation();
                onMeshClick(name);
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
            >
              {isActive && (
                <meshStandardMaterial 
                  attach="material" 
                  {...node.material} 
                  emissive="#3b82f6" 
                  emissiveIntensity={0.8} 
                />
              )}
            </mesh>
          );
        }
        return null;
      })}
    </group>
  );
}

// Updated MESH_DATA for the Khronos Shoe model
const MESH_DATA: Record<string, { label: string; description: string }> = {
  "Shoe": { label: "Main Body", description: "Premium technical mesh for enhanced performance." },
  "Sole": { label: "Performance Sole", description: "Multi-density foam for maximum energy return." },
  "Laces": { label: "Tech Laces", description: "Integrated lacing system for a locked-in feel." },
};

export function LiveDemo() {
  const [activeMesh, setActiveMesh] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState(false);

  const handleMeshClick = (name: string) => {
    setActiveMesh(name);
    setShowInfo(true);
  };

  return (
    <section className="py-24 sm:py-32 bg-background-subtle relative overflow-hidden border-t border-border-primary">
      <div className="container max-w-7xl px-4 mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent-border mb-6"
          >
             <MousePointer2 className="w-3.5 h-3.5 text-accent" />
             <span className="text-xs font-bold text-accent tracking-widest uppercase">Live Demo</span>
          </motion.div>
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">
            See it in action
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Interact with the model below. Click any part to see how Vorld handles mesh-level configuration.
          </p>
        </div>

        {/* Demo Experience Window */}
        <div className="relative w-full max-w-5xl mx-auto aspect-[16/9] bg-[#0d0d0d] rounded-2xl border border-border-strong overflow-hidden shadow-2xl">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-text-tertiary gap-4">
              <span className="text-sm">Failed to load 3D Demo. Check your connection.</span>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-lg text-accent text-xs hover:bg-accent/20 transition-all font-bold uppercase tracking-wider"
              >
                Retry Loading
              </button>
            </div>
          ) : (
            <Canvas shadows onError={() => setError(true)}>
              <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
              <ambientLight intensity={0.8} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
              
              <Suspense fallback={<Html center><span className="text-text-tertiary whitespace-nowrap bg-black/50 px-3 py-1 rounded-full text-xs">Entering Metaverse...</span></Html>}>
                <ShoeModel activeMesh={activeMesh} onMeshClick={handleMeshClick} />
                <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={10} blur={2.5} far={0.8} />
                <BakeShadows />
              </Suspense>

              <OrbitControls 
                enableZoom={false} 
                minPolarAngle={Math.PI / 4} 
                maxPolarAngle={Math.PI / 1.5}
                autoRotate={!activeMesh}
                autoRotateSpeed={0.5}
              />
            </Canvas>
          )}

          {/* Mesh Badges Overlay */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            {Object.entries(MESH_DATA).map(([id, data]) => (
              <button
                key={id}
                onClick={() => handleMeshClick(id)}
                className={cn(
                  "px-4 h-9 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm",
                  activeMesh === id 
                    ? "bg-accent border-accent text-white shadow-glow" 
                    : "bg-background-elevated/40 backdrop-blur-md border-border-primary text-text-secondary hover:border-border-strong hover:text-white"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", activeMesh === id ? "bg-white" : "bg-text-tertiary")} />
                {data.label}
              </button>
            ))}
          </div>

          {/* Info Panel Overlay */}
          <AnimatePresence>
            {showInfo && activeMesh && MESH_DATA[activeMesh] && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-6 right-6 w-72 p-6 rounded-xl bg-background-surface/80 backdrop-blur-xl border border-border-strong shadow-2xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-subtle border border-accent-border flex items-center justify-center text-accent">
                    <Info className="w-5 h-5" />
                  </div>
                  <button 
                    onClick={() => setShowInfo(false)}
                    className="text-text-tertiary hover:text-white p-1"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <h4 className="text-lg font-medium text-white mb-2">
                  {MESH_DATA[activeMesh].label}
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  {MESH_DATA[activeMesh].description}
                </p>
                <button className="w-full h-10 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all duration-200">
                  Learn more
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint Overlay */}
          {!activeMesh && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-text-tertiary text-xs bg-background/20 backdrop-blur-sm px-4 py-2 rounded-full">
               <MousePointer2 className="w-3.5 h-3.5" />
               Click a mesh to explore
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
