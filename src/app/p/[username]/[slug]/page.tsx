"use client";

import React, { Suspense, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  Stage, 
  useGLTF, 
  Html,
  ContactShadows,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Info, MousePointer2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const MODEL_URL = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/shoe/model.gltf";

// Sample data that would normally come from Supabase Storage (JSON)
const MESH_DATA: Record<string, { label: string; description: string }> = {
  "mesh_0": { label: "Sole", description: "Durable rubber sole for maximum grip." },
  "mesh_1": { label: "Upper", description: "Breathable mesh upper for all-day comfort." },
  "mesh_2": { label: "Laces", description: "Performance laces that stay tied." },
};

function ViewerModel({ activeMesh, onMeshClick }: { activeMesh: string | null; onMeshClick: (name: string) => void }) {
  const { nodes } = useGLTF(MODEL_URL) as any;

  return (
    <group dispose={null} scale={2}>
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
                  emissive="var(--accent)" 
                  emissiveIntensity={0.5} 
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

export default function PublishedViewer({ params }: { params: { username: string, slug: string } }) {
  const [activeMesh, setActiveMesh] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleMeshClick = (name: string) => {
    if (MESH_DATA[name]) {
      setActiveMesh(name);
      setShowInfo(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0d0d0d] overflow-hidden">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
        
        <Suspense fallback={<Html center><div className="loader" /></Html>}>
          <ViewerModel activeMesh={activeMesh} onMeshClick={handleMeshClick} />
          <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={10} blur={2.5} far={0.8} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls 
          enableZoom={true} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.5}
          autoRotate={!activeMesh}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Info Panel Overlay */}
      <AnimatePresence>
        {showInfo && activeMesh && MESH_DATA[activeMesh] && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-6 right-6 w-80 p-6 rounded-2xl bg-background-surface/80 backdrop-blur-xl border border-border-strong shadow-2xl z-50"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent-subtle border border-accent-border flex items-center justify-center text-accent">
                <Info className="w-5 h-5" />
              </div>
              <button 
                onClick={() => setShowInfo(false)}
                className="text-text-tertiary hover:text-white p-1 transition-colors"
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
            <button className="w-full h-10 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all">
              Learn more
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Branding / Footer */}
      <div className="absolute bottom-6 left-6 flex items-center gap-2">
         <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
            <span className="text-[10px] text-text-tertiary">Built with</span>
            <div className="flex items-center gap-1">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-accent">
                  <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
               </svg>
               <span className="text-[11px] font-bold text-white tracking-tight">Venus</span>
            </div>
         </div>
      </div>

      {/* Share / Open Link (Floating) */}
      <div className="absolute top-6 left-6">
         <button className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-black/60 transition-all">
            <ExternalLink className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}
