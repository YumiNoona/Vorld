"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, MoreVertical, LayoutGrid, Box, User, CreditCard, ChevronDown, CheckCircle2, TrendingUp, Globe, MousePointer2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * 🎨 Color Tokens (Derived from reference image but adapted for Vorld)
 */
const COLORS = {
  bg: "#06080d",
  glass: "rgba(15, 18, 25, 0.4)",
  border: "rgba(255, 255, 255, 0.08)",
  accent: "var(--accent)", // #F59E0B
  accentGlow: "rgba(245, 158, 11, 0.15)",
  vibrantPurple: "#4f46e5",
  vibrantIndigo: "#6366f1",
};

/**
 * 📊 Mini Line Chart SVG Component
 */
const LineChart = () => (
  <svg viewBox="0 0 200 80" className="w-full h-full">
    <defs>
      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
      </linearGradient>
    </defs>
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      d="M0 60C20 50 40 70 60 40C80 10 100 50 120 30C140 10 160 30 200 20"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M0 60C20 50 40 70 60 40C80 10 100 50 120 30C140 10 160 30 200 20V80H0V60Z"
      fill="url(#lineGradient)"
    />
    <circle cx="120" cy="30" r="4" fill="var(--accent)" stroke="white" strokeWidth="2" />
  </svg>
);

/**
 * 📊 Mini Bar Chart SVG Component
 */
const BarChart = () => (
  <div className="flex items-end justify-between h-20 gap-1.5 px-2">
    {[40, 60, 30, 80, 50, 70, 45].map((h, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        animate={{ height: `${h}%` }}
        transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
        className={cn(
          "w-3 rounded-full",
          i === 3 ? "bg-[--accent]" : "bg-white/20"
        )}
      />
    ))}
  </div>
);

/**
 * 🧊 Glass Card Wrapper
 */
const GlassCard = ({ children, className, delay = 0, yOffset = 0 }: { children: React.ReactNode; className?: string; delay?: number; yOffset?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 + yOffset }}
    whileInView={{ opacity: 1, y: yOffset }}
    transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    viewport={{ once: true }}
    className={cn(
      "backdrop-blur-3xl bg-[#0f1219]/40 border border-white/5 shadow-2xl rounded-2xl p-5 overflow-hidden ring-1 ring-white/5",
      className
    )}
  >
    {children}
  </motion.div>
);

export function HighFidelityHero() {
  return (
    <section className="relative min-h-screen bg-[#06080d] flex flex-col items-center justify-center overflow-hidden py-32 px-4 select-none">
      {/* Background Radial Glows */}
      <div className="absolute top-0 inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_60%)]" />
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_50%)]" />
        <div className="absolute bottom-0 right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05),transparent_60%)]" />
      </div>

      {/* Abstract Glowing Ribbons (Styled SVGs) */}
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
         <svg className="absolute w-[800px] h-[800px] top-[-100px] left-[-200px] rotate-[-20deg]" viewBox="0 0 800 800">
            <motion.path 
              d="M100 400C100 400 300 100 500 400S900 700 900 400" 
              stroke="#6366f1" 
              strokeWidth="120" 
              className="blur-[100px]"
              strokeLinecap="round" 
              fill="none" 
            />
         </svg>
         <svg className="absolute w-[800px] h-[800px] bottom-[-200px] right-[-200px] rotate-[30deg]" viewBox="0 0 800 800">
            <motion.path 
              d="M100 400C100 400 300 700 500 400S900 100 900 400" 
              stroke="#F59E0B" 
              strokeWidth="80" 
              className="blur-[120px]"
              strokeLinecap="round" 
              fill="none" 
            />
         </svg>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
        {/* Creator Avatar Group */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative"
        >
          <div className="flex items-center -space-x-4">
             {[1,2,3].map(i => (
               <div key={i} className="w-12 h-12 rounded-full border-2 border-[#06080d] bg-[--surface-raised] flex items-center justify-center text-[--accent] overflow-hidden shadow-xl ring-4 ring-white/5 relative z-10">
                  <User className="w-5 h-5" />
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Avatar" />
               </div>
             ))}
          </div>
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#06080d] z-20 shadow-lg" 
          />
        </motion.div>

        {/* Hero Text */}
        <div className="text-center max-w-3xl mb-16 px-4">
           <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.05]"
           >
             Next-Gen 3D <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--accent] via-yellow-200 to-white">Web Platform</span>
           </motion.h1>
           <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-slate-400 font-medium mb-12 leading-relaxed"
           >
             Join the revolution of interactive web experiences. Vorld empowers creators <br className="hidden sm:block" />
             to build, optimize, and share 3D models with technical precision and zero friction.
           </motion.p>
           <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
           >
              <Link
                href="/signup"
                className="h-14 px-10 bg-[--accent] hover:brightness-110 text-black font-bold rounded-2xl flex items-center gap-3 mx-auto transition-all shadow-[0_20px_40px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95"
              >
                 Get Started Now
                 <ArrowRight className="w-5 h-5" />
              </Link>
           </motion.div>
        </div>

        {/* Dashboard Grid Container */}
        <div className="relative w-full h-[600px] hidden lg:block">
           {/* Card 1: Total Performance (Top Left) */}
           <GlassCard className="absolute top-[0%] left-[5%] w-72" delay={0.3} yOffset={-40}>
              <div className="flex items-center justify-between mb-4">
                 <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Active Worlds</span>
                 <TrendingUp className="w-4 h-4 text-[--accent]" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">4,325</div>
              <div className="h-20 w-full">
                 <LineChart />
              </div>
           </GlassCard>

           {/* Card 2: Income (Center Left) */}
           <GlassCard className="absolute top-[45%] left-[12%] w-64" delay={0.5} yOffset={30}>
              <div className="flex items-center justify-between mb-4">
                 <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Asset Usage</span>
                 <div className="flex gap-1">
                   <div className="w-2 h-2 rounded-full bg-[--accent]" />
                   <div className="w-2 h-2 rounded-full bg-white/10" />
                 </div>
              </div>
              <BarChart />
           </GlassCard>

           {/* Card 3: Profile (Top Right) */}
           <GlassCard className="absolute top-[5%] right-[8%] w-80 p-4" delay={0.4} yOffset={-20}>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop" alt="User" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">Sona Sowndharyalakshmi</div>
                    <div className="text-xs text-white/40 truncate">@sonasowndharya</div>
                 </div>
                 <button className="p-2 hover:bg-white/5 rounded-lg text-white/30 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                 </button>
              </div>
           </GlassCard>

           {/* Card 4: Wallet/Status (Center Right - Yellow) */}
           <motion.div
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.6, duration: 0.8 }}
             viewport={{ once: true }}
             className="absolute top-[40%] right-[15%] w-56 h-72 bg-[--accent] rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between overflow-hidden group rotate-[3deg]"
           >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center text-black">
                 <LayoutGrid className="w-6 h-6" />
              </div>
              <div className="relative z-10">
                 <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-1">Storage used</p>
                 <div className="text-4xl font-black text-black leading-none mb-4">18.73 <span className="text-xl">GB</span></div>
                 <div className="text-xs font-mono text-black/60 bg-black/5 px-2 py-1 rounded inline-block">0x1f **** c8622</div>
              </div>
           </motion.div>

           {/* Card 5: Balance (Bottom Right - Glass Frost) */}
           <GlassCard className="absolute top-[55%] right-[5%] w-64 bg-white/5 saturate-[200%] backdrop-blur-2xl -rotate-[5deg]" delay={0.7} yOffset={50}>
              <div className="flex items-start justify-between mb-8">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Box className="w-5 h-5 text-white" />
                 </div>
                 <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 border border-white/20" />
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20" />
                 </div>
              </div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Total Visits</p>
              <div className="text-3xl font-black text-white">$3,853.65</div>
              <div className="text-[10px] font-bold text-white/20 mt-4 tracking-[0.2em]">**** 5535</div>
           </GlassCard>

           {/* Card 6: Floating Pill (Amazon style) */}
           <motion.div
             animate={{ y: [0, -10, 0] }}
             transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
             className="absolute bottom-[20%] left-[8%] px-5 h-14 bg-white rounded-2xl flex items-center gap-4 shadow-2xl z-30"
           >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                 <div className="w-4 h-4 rounded bg-indigo-600" />
              </div>
              <div className="flex-1">
                 <p className="text-[11px] font-bold text-black">Asset optimization</p>
                 <p className="text-[10px] text-black/50">Processing GLB...</p>
              </div>
              <div className="text-xs font-bold text-red-500">-$99.99</div>
           </motion.div>

           {/* Toolbar/Icons (Bottom Center) */}
           <GlassCard className="absolute bottom-[5%] left-1/2 -translateX-1/2 w-80 h-16 p-2 flex items-center justify-around rounded-3xl" delay={0.8} yOffset={60}>
              {[LayoutGrid, TrendingUp, CreditCard, User].map((Icon, i) => (
                <button 
                  key={i} 
                  className={cn(
                    "p-2.5 rounded-2xl transition-all",
                    i === 0 ? "bg-white/10 text-[--accent]" : "text-white/20 hover:text-white/40"
                  )}
                >
                   <Icon className="w-5 h-5" />
                </button>
              ))}
           </GlassCard>
        </div>

        {/* Mobile View Placeholder or simplified layout would go here */}
        <div className="lg:hidden w-full space-y-4 mt-8">
           <GlassCard className="w-full">
              <div className="text-sm font-bold text-white/60 mb-2 uppercase">Platform Activity</div>
              <LineChart />
           </GlassCard>
        </div>
      </div>

      {/* Hero Bottom Gradient Mask */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[--bg] to-transparent pointer-events-none z-40" />
    </section>
  );
}
