"use client";

import React, { useEffect, useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";

/**
 * High-end loading and intro screen for the Vorld platform.
 * Provides a premium, suspenseful entry into the 3D scene.
 */
export default function IntroScreen() {
  const isLoading = useEditorStore((state) => state.isLoading);
  const projectTitle = useEditorStore((state) => state.projectTitle);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setComplete(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setComplete(false);
    }
  }, [isLoading]);

  if (complete) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0b0f14] transition-all duration-1000 ease-in-out",
        !isLoading && "opacity-0 pointer-events-none translate-y-4"
      )}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Animated Scanner Effect */}
        <div className="w-16 h-16 relative mb-8">
           <div className="absolute inset-0 border-2 border-accent/20 rounded-xl" />
           <div className="absolute inset-x-0 h-0.5 bg-accent/60 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-[scan_2s_infinite_ease-in-out]" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary tracking-tighter mb-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
          {projectTitle || "Untitled Vorld"}
        </h1>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-bg-secondary/50 border border-border-default rounded-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
           <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
           <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
             {isLoading ? "Synchronizing Assets" : "Initializing Viewport"}
           </span>
        </div>
      </div>

      <div className="absolute bottom-12 text-[10px] font-medium text-text-tertiary/40 uppercase tracking-[0.3em]">
        Vorld Platform Engine v3.0
      </div>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0% }
          50% { top: 100% }
        }
      `}</style>
    </div>
  );
}
