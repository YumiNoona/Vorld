"use client";

import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  Float, 
  Sphere, 
  PerspectiveCamera, 
  Environment,
  Text,
  Html
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import * as THREE from "three";
import { cn } from "@/lib/utils";

/**
 * 🔮 The Centerpiece: Refractive Glass Orb
 * Implements high-fidelity transmission and internal lighting
 */
function RefractiveOrb() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y += 0.003;
    // Subtle float
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.1;
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.8}>
        <meshPhysicalMaterial
          roughness={0.05}
          metalness={0.1}
          transmission={0.9}
          thickness={1.5}
          color="#ffffff"
          ior={1.5}
          reflectivity={0.5}
          iridescence={0.3}
          iridescenceIOR={1.3}
          sheen={1}
          sheenColor="#3B82F6"
          envMapIntensity={3}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
        {/* Point light inside the sphere */}
        <pointLight color="#3B82F6" intensity={8} distance={3} decay={2} />
      </Sphere>

      {/* Outer Glow / Rim Effect */}
      <pointLight position={[-5, 5, 5]} color="#ffffff" intensity={2} />
    </group>
  );
}

/**
 * 🏟️ Scenic Ground Platform
 */
function Platform() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <circleGeometry args={[4, 64]} />
      <meshStandardMaterial 
        color="#111111" 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
}

export function Hero() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <section className="relative h-screen w-full bg-[#080808] overflow-hidden flex flex-col items-center justify-center">
      
      {/* --- Minimalist Navigation Overlay --- */}
      <div className="fixed top-12 right-12 z-[100]">
        <button 
          onClick={() => setIsNavOpen(!isNavOpen)}
          className="p-3 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-all duration-300"
        >
          {isNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-[#080808]/95 backdrop-blur-2xl flex flex-col items-center justify-center space-y-8"
          >
            {["Docs", "How it Works", "Contact", "About"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  href={`/${item.toLowerCase().replace(/ /g, '-')}`}
                  onClick={() => setIsNavOpen(false)}
                  className="text-4xl md:text-6xl font-bold text-white/40 hover:text-white transition-colors duration-300 tracking-tighter"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Cinematic Branding (BEHIND THE ORB) --- */}
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50 mb-12"
        >
          Professional 3D Engine
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-white text-center whitespace-nowrap leading-none select-none px-4"
          style={{ fontSize: "var(--text-display)" }}
        >
          SHAPE THE <br /> VIRTUAL WORLD
        </motion.h1>
      </div>

      {/* --- The Glass Orb Stage --- */}
      <div className="absolute inset-0 z-10">
        <Canvas 
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={10} />
          
          <Suspense fallback={null}>
             <RefractiveOrb />
             <Platform />
          </Suspense>

          {/* Depth Ground Shadow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.4} />
          </mesh>
        </Canvas>
      </div>

      {/* --- Centerpiece Grounding Disk (CSS Version for shadow) --- */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-0 pointer-events-none"
        style={{ 
          width: "55vmin", 
          height: "55vmin", 
          background: "#111111",
          boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
          opacity: 0.5
        }}
      />

      {/* --- CTA Layer (ABOVE THE ORB) --- */}
      <div className="absolute bottom-24 left-0 right-0 z-20 flex items-center justify-center gap-6">
        <Link
          href="/signup"
          className="px-8 py-3.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-[11px] font-bold text-white/70 hover:text-white hover:border-white/50 transition-all duration-300 uppercase tracking-[0.2em] group flex items-center gap-2"
        >
          Start for Free
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/login"
          className="px-8 py-3.5 rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 text-[11px] font-bold text-white/40 hover:text-white uppercase tracking-[0.2em]"
        >
          Log in
        </Link>
      </div>

      {/* --- Footer Branding --- */}
      <div className="absolute bottom-12 right-12 opacity-25 pointer-events-none select-none">
        <span className="text-[11px] font-medium tracking-widest text-white uppercase italic">
          Vorld &copy; 2026 / Next-Gen 3D
        </span>
      </div>

    </section>
  );
}
