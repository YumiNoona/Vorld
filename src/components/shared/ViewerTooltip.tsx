"use client";

import React from "react";
import { Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

interface ViewerTooltipProps {
  hovered: {
    name: string;
    position: [number, number, number];
    hasInteractions: boolean;
    label?: string;
  } | null;
}

/**
 * World-space tooltip for the published viewer.
 * Only shows on meshes that have at least one interaction configured.
 * Uses Framer Motion for smooth fade-rise animation.
 */
export function ViewerTooltip({ hovered }: ViewerTooltipProps) {
  // Filter: only show on meshes with interactions
  if (!hovered || !hovered.hasInteractions) return null;

  const displayText = hovered.label || "Click to explore";

  return (
    <Html
      position={hovered.position}
      pointerEvents="none"
      distanceFactor={10}
      center
      occlude={false}
    >
      <AnimatePresence>
        <motion.div
          key={hovered.name}
          initial={{ opacity: 0, y: 4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-center gap-2 px-3 py-1.5 bg-[--bg]/80 backdrop-blur-md border border-[--border] rounded-lg shadow-2xl whitespace-nowrap pointer-events-none"
        >
          <span className="text-[--accent] text-[8px] font-bold tracking-tighter uppercase">✦</span>
          <span className="text-[11px] font-medium text-[--text-1] tracking-tight">{displayText}</span>
        </motion.div>
      </AnimatePresence>
    </Html>
  );
}
