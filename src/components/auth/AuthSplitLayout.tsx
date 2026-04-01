"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { motion } from "framer-motion";
import Link from "next/link";

function AmbientOrb() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[1, 64, 64]} scale={2.4}>
        <MeshDistortMaterial
          color="#7c6aff"
          speed={3}
          distort={0.4}
          radius={1}
          metalness={0.6}
          roughness={0.2}
          emissive="#7c6aff"
          emissiveIntensity={0.2}
        />
      </Sphere>
    </Float>
  );
}

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      {/* Left: 3D Scene */}
      <div className="hidden lg:block relative flex-1 bg-[#0d0d0d] border-r border-border-primary overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 blur-[40px]">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <Suspense fallback={null}>
              <AmbientOrb />
            </Suspense>
          </Canvas>
        </div>
        
        {/* Logo Link */}
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group z-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent group-hover:scale-110 transition-transform">
            <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
          <span className="text-xl font-semibold tracking-tight text-white">Vorld</span>
        </Link>

        {/* Floating Quote */}
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg font-medium text-text-secondary leading-relaxed italic"
          >
            "The professional choice for interactive 3D web experiences."
          </motion.p>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-8 left-8 lg:hidden">
           <Link href="/" className="flex items-center gap-2 group">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent group-hover:scale-110 transition-transform">
                <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
           </Link>
        </div>
        <div className="w-full max-w-md mx-auto space-y-8">
           {children}
        </div>
      </div>
    </div>
  );
}
