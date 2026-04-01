"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera } from "@react-three/drei";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import * as THREE from "three";

/**
 * Animated Gradient Underline SVG
 */
const AnimatedUnderline = () => (
  <svg 
    className="absolute -bottom-1 left-0 w-full h-3 overflow-visible pointer-events-none"
    viewBox="0 0 400 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M2 10C60 6 140 2 200 4C260 6 340 10 398 8"
      stroke="var(--accent)"
      strokeWidth="3"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ 
        duration: 0.8, 
        delay: 0.6, 
        ease: [0.16, 1, 0.3, 1] 
      }}
    />
  </svg>
);

/**
 * Ambient 3D Orb Component
 */
function AmbientOrb() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time / 4) / 4;
    meshRef.current.rotation.y = time / 8;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.4}>
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

export function Hero() {
  const { scrollY } = useScroll();
  const yTranslate = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [0.12, 0]);

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden py-24 sm:py-32">
      {/* Background Effects */}
      <motion.div 
        style={{ opacity }}
        className="absolute top-0 inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(124,106,255,0.12),transparent)]"
      />
      
      {/* 3D Orb Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30 blur-[40px]">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <Suspense fallback={null}>
            <AmbientOrb />
          </Suspense>
        </Canvas>
      </div>

      <div className="relative z-10 container max-w-5xl px-4 mx-auto text-center">
        {/* Intro Label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-subtle border border-accent-border mb-8 cursor-default"
        >
          <span className="text-xs font-medium text-accent tracking-wide">
            Introducing Venus
          </span>
          <ArrowRight className="w-3 h-3 text-accent" />
        </motion.div>

        {/* H1 Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.04em] text-white leading-[1.1] mb-8"
        >
          Turn 3D models into <br />
          <span className="relative">
            interactive
            <AnimatedUnderline />
          </span> experiences
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-12"
        >
          Upload your GLB file, configure what each object does on click or hover, 
          and publish a shareable link — in minutes.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            className="group w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
          >
            Get started free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
          <button className="w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2 bg-background-elevated hover:bg-background-overlay text-text-primary font-medium rounded-lg transition-all duration-200 border border-border-primary hover:border-border-strong">
            <Play className="w-4 h-4 fill-current" />
            Watch demo
          </button>
        </motion.div>

        {/* Social Proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 text-xs font-medium text-text-tertiary uppercase tracking-widest"
        >
          Trusted by 2,400+ designers, architects, and developers
        </motion.p>
      </div>

      {/* Hero Bottom Mask */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
