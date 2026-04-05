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

export const ACTION_TYPES = [
  { id: "highlight", label: "Color Highlight", icon: Sparkles },
  { id: "glow", icon: Sun, label: "Emissive Glow" },
  { id: "scale", icon: Maximize, label: "Scale Transform" },
  { id: "camera_focus", icon: Camera, label: "Camera Focus" },
  { id: "animation", icon: Activity, icon_alt: Play, label: "GLTF Animation" },
  { id: "audio", icon: Volume2, label: "Spatial Audio" },
  { id: "info_panel", icon: FileText, label: "Overlay Panel" },
  { id: "url", icon: Link, label: "Open Link" },
  { id: "toggle", icon: ToggleLeft, label: "State Toggle" },
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
