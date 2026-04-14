"use client";

import React from "react";
import { 
  Trash2, X, Box, GripVertical, Settings2, Sparkles, 
  Zap, Play, Info, ExternalLink, ChevronDown, ChevronUp,
  Sun, Maximize, Camera, Activity, Volume2, FileText, Link, ToggleLeft
} from "lucide-react";
import { useEditorStore, InteractionAction } from "@/stores/editorStore";
import { ActionStack } from "./ActionStack";
import { cn } from "@/lib/utils";

// Blender-style 3D Icons (Simplified SVG Components)
const IconSparkles = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);

const IconSun = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const IconMaximize = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m15 3 6 6" /><path d="M9 21 3 15" /><path d="M21 3v6h-6" /><path d="M3 21v-6h6" />
  </svg>
);

const IconCamera = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
  </svg>
);

const IconActivity = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const IconVolume2 = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const IconFileText = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14.5 2 14.5 7.5 20 7.5" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const IconLink = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const IconToggleLeft = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="12" x="2" y="6" rx="6" ry="6" /><circle cx="8" cy="12" r="2" />
  </svg>
);

export const ACTION_TYPES = [
  { id: "highlight", label: "Color Highlight", icon: IconSparkles },
  { id: "glow", icon: IconSun, label: "Emissive Glow" },
  { id: "scale", icon: IconMaximize, label: "Scale Transform" },
  { id: "camera_focus", icon: IconCamera, label: "Camera Focus" },
  { id: "animation", icon: IconActivity, label: "GLTF Animation" },
  { id: "audio", icon: IconVolume2, label: "Spatial Audio" },
  { id: "info_panel", icon: IconFileText, label: "Overlay Panel" },
  { id: "url", icon: IconLink, label: "Open Link" },
  { id: "toggle", icon: IconToggleLeft, label: "State Toggle" },
];

interface ActionFormProps {
  interactionId: string;
  action: InteractionAction;
  onUpdate: (updates: any) => void;
  animations: string[];
}

const InputLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[11px] font-medium text-text-tertiary mb-1 block">
    {children}
  </span>
);

export function ActionForm({ interactionId, action, onUpdate, animations }: ActionFormProps) {
  const { type, config } = action;

  switch (type) {
    case "highlight":
    case "glow":
      return (
        <div className="flex items-center gap-4">
           <div className="flex-1">
             <InputLabel>Color</InputLabel>
             <div className="flex items-center gap-3 bg-bg-primary border border-border-default h-9 px-3 rounded-lg relative overflow-hidden group/color">
               <input 
                 type="color" 
                 value={config.color || "#10b981"} 
                 onChange={e => onUpdate({ color: e.target.value })} 
                 className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
               />
               <div className="w-4 h-4 rounded-full border border-black/10 ring-1 ring-white/10" style={{ backgroundColor: config.color || "#10b981" }} />
               <span className="text-sm font-mono text-text-primary tracking-tight">{config.color?.toUpperCase() || "#10B981"}</span>
             </div>
           </div>
            <div className="w-24">
              <InputLabel>Duration</InputLabel>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  step="0.05" 
                  className="w-full h-9 bg-bg-primary rounded-lg border border-border-default text-sm pl-3 pr-7 text-text-primary outline-none focus:border-accent transition-all leading-none py-0" 
                  style={{ lineHeight: '34px' }}
                  value={action.config.duration ?? 0.15} 
                  onChange={e => onUpdate({ duration: parseFloat(e.target.value) })} 
                />
                <span className="absolute right-3 text-[10px] text-text-tertiary font-bold pointer-events-none uppercase tracking-tighter">sec</span>
              </div>
            </div>
        </div>
      );

    case "scale":
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <InputLabel>Target Scale</InputLabel>
            <input 
              type="number" 
              step="0.1" 
              className="w-full h-9 bg-bg-primary rounded-lg border border-border-default text-sm px-3 text-text-primary outline-none focus:border-accent transition-all" 
              value={config.value ?? 1.1} 
              onChange={e => onUpdate({ value: parseFloat(e.target.value) })} 
            />
          </div>
          <div>
            <InputLabel>Duration</InputLabel>
            <div className="relative flex items-center">
              <input 
                type="number" 
                step="0.05" 
                className="w-full h-9 bg-bg-primary rounded-lg border border-border-default text-sm pl-3 pr-7 text-text-primary outline-none focus:border-accent transition-all leading-none py-0" 
                style={{ lineHeight: '34px' }}
                value={config.duration ?? 0.15} 
                onChange={e => onUpdate({ duration: parseFloat(e.target.value) })} 
              />
              <span className="absolute right-3 text-[10px] text-text-tertiary font-bold pointer-events-none uppercase tracking-tighter">sec</span>
            </div>
          </div>
        </div>
      );

    case "camera_focus":
      return (
        <div className="space-y-3">
          <InputLabel>Camera Offset From Target</InputLabel>
          <div className="grid grid-cols-3 gap-2">
             {["X", "Y", "Z"].map((axis, i) => (
               <div key={axis} className="relative">
                 <input 
                   type="number" 
                   step="0.5" 
                   className="w-full h-9 bg-bg-primary rounded-lg border border-border-default text-sm px-3 text-text-primary text-center hover:border-text-tertiary focus:border-accent outline-none transition-all" 
                   value={config.offset?.[i] ?? 0} 
                   onChange={e => {
                    const newOffsets = [...(config.offset || [0,0,0])];
                    newOffsets[i] = parseFloat(e.target.value) || 0;
                    onUpdate({ offset: newOffsets });
                 }} />
                 <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-medium text-text-tertiary opacity-30">{axis}</span>
               </div>
             ))}
          </div>
        </div>
      );

    case "animation":
      return (
        <div className="space-y-4">
          <div>
            <InputLabel>Target Animation</InputLabel>
            <div className="relative">
              <select 
                value={config.clip || ""} 
                onChange={e => onUpdate({ clip: e.target.value })}
                className="w-full h-9 bg-bg-primary rounded-lg border border-border-default px-3 text-sm text-text-primary outline-none focus:border-accent appearance-none transition-all cursor-pointer"
              >
                <option value="" disabled>Select animation...</option>
                {animations.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={config.loop ?? true}
              onChange={(e) => onUpdate({ loop: e.target.checked })}
              className="w-4 h-4 rounded border-border-default bg-bg-primary text-accent focus:ring-accent accent-accent"
            />
            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">Loop animation</span>
          </label>
        </div>
      );

    case "audio":
      return (
        <div className="space-y-4">
          <div>
            <InputLabel>Source URL</InputLabel>
            <input 
              type="url" 
              value={config.src || ""} 
              placeholder="https://example.com/audio.mp3" 
              onChange={e => onUpdate({ src: e.target.value })} 
              className="w-full h-9 bg-bg-primary rounded-lg border border-border-default px-3 text-sm text-text-primary outline-none focus:border-accent transition-all" 
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
               <InputLabel>Volume</InputLabel>
               <span className="text-[10px] font-medium text-accent">{Math.round((config.volume ?? 1) * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.1"
              value={config.volume ?? 1}
              onChange={e => onUpdate({ volume: parseFloat(e.target.value) })}
              className="w-full accent-accent h-1.5 rounded-full bg-border-default appearance-none cursor-pointer"
            />
          </div>
        </div>
      );

    case "info_panel":
      return (
        <div className="space-y-4">
          <div>
            <InputLabel>Title</InputLabel>
            <input 
              type="text" 
              placeholder="Component Details" 
              value={config.title} 
              onChange={e => onUpdate({ title: e.target.value })} 
              className="w-full h-9 bg-bg-primary rounded-lg border border-border-default px-3 text-sm text-text-primary outline-none focus:border-accent transition-all" 
            />
          </div>
          <div>
            <InputLabel>Description</InputLabel>
            <textarea 
              placeholder="Enter detailed information here..." 
              value={config.body} 
              onChange={e => onUpdate({ body: e.target.value })} 
              className="w-full h-24 bg-bg-primary rounded-lg border border-border-default p-3 text-sm text-text-primary outline-none resize-none focus:border-accent transition-all leading-relaxed" 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <InputLabel>CTA Label</InputLabel>
              <input type="text" placeholder="Learn More" value={config.ctaLabel || ""} onChange={e => onUpdate({ ctaLabel: e.target.value })} className="w-full h-9 bg-bg-primary rounded-lg border border-border-default px-3 text-xs text-text-primary outline-none focus:border-accent" />
            </div>
            <div>
               <InputLabel>CTA URL</InputLabel>
               <input type="text" placeholder="https://..." value={config.ctaUrl || ""} onChange={e => onUpdate({ ctaUrl: e.target.value })} className="w-full h-9 bg-bg-primary rounded-lg border border-border-default px-3 text-xs text-text-primary outline-none focus:border-accent" />
            </div>
          </div>
        </div>
      );

    case "url":
      return (
        <div className="space-y-1">
          <InputLabel>Target Location</InputLabel>
          <div className="relative">
            <input 
              type="url" 
              value={config.url || "https://"} 
              placeholder="https://" 
              onChange={e => onUpdate({ url: e.target.value })} 
              className="w-full h-9 bg-bg-primary rounded-lg border border-border-default px-3 pl-9 text-sm text-text-primary outline-none focus:border-accent transition-all" 
            />
            <ExternalLink className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          </div>
        </div>
      );

    case "toggle":
      return (
        <div className="space-y-6 mt-2 p-4 bg-bg-secondary/40 rounded-xl border border-border-default shadow-inner">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-accent" />
               <span className="text-[11px] font-medium text-text-primary">State: Active</span>
            </div>
            <div className="bg-bg-primary/50 rounded-xl border border-border-default overflow-hidden">
              <ActionStack 
                interactionId={interactionId}
                actions={config.states?.on || []}
                animations={animations}
                onUpdateStack={(newActions) => onUpdate({ states: { ...config.states, on: newActions } })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-text-tertiary" />
               <span className="text-[11px] font-medium text-text-secondary">State: Inactive</span>
            </div>
            <div className="bg-bg-primary/50 rounded-xl border border-border-default overflow-hidden">
              <ActionStack 
                interactionId={interactionId}
                actions={config.states?.off || []}
                animations={animations}
                onUpdateStack={(newActions) => onUpdate({ states: { ...config.states, off: newActions } })}
              />
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
