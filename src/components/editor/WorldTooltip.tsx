"use client";

import React from "react";
import { Html } from "@react-three/drei";
import { useEditorStore } from "@/stores/editorStore";

interface WorldTooltipProps {
  hovered: { name: string; position: [number, number, number] } | null;
}

/**
 * World-space hover tooltip.
 * Automatically disabled in Preview Mode to maintain immersion.
 */
export default function WorldTooltip({ hovered }: WorldTooltipProps) {
  const previewMode = useEditorStore((state) => state.previewMode);

  if (!hovered || previewMode) return null;

  return (
    <Html
      position={hovered.position}
      pointerEvents="none"
      distanceFactor={10}
      center
      style={{
        transition: 'all 0.1s ease-out'
      }}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0f0905]/95 backdrop-blur-md border border-accent/30 rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-100 whitespace-nowrap">
        <span className="text-accent text-[8px] font-bold tracking-tighter uppercase">✦ Component</span>
        <span className="text-[11px] font-bold text-text-primary font-mono tracking-tight">{hovered.name}</span>
      </div>
    </Html>
  );
}
