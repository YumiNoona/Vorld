"use client";

import React from "react";
import { 
  Trash2, X, Box, GripVertical, Settings2, Sparkles, 
  Zap, Play, Info, ExternalLink, ChevronDown, ChevronUp
} from "lucide-react";
import { useEditorStore, InteractionAction } from "@/stores/editorStore";
import { ActionStack } from "./ActionStack";

export const ACTION_TYPES = [
  { id: "highlight", label: "Color Highlight", icon: Sparkles },
  { id: "glow", label: "Emissive Glow", icon: Sparkles },
  { id: "scale", label: "Scale Transform", icon: Settings2 },
  { id: "camera_focus", label: "Camera Focus", icon: Zap },
  { id: "animation", label: "GLTF Animation", icon: Play },
  { id: "audio", label: "Play Audio", icon: Play },
  { id: "info_panel", label: "Info Panel", icon: Info },
  { id: "url", label: "Open URL", icon: ExternalLink },
  { id: "toggle", label: "Toggle State", icon: Zap },
];

interface ActionFormProps {
  interactionId: string;
  action: InteractionAction;
  onUpdate: (updates: any) => void;
  animations: string[];
}

export function ActionForm({ interactionId, action, onUpdate, animations }: ActionFormProps) {
  const { type, config } = action;

  switch (type) {
    case "highlight":
    case "glow":
      return (
        <div className="flex items-center gap-2 ml-2">
           <div className="flex items-center gap-2 flex-1 relative">
             <input 
               type="color" 
               value={config.color || "#ffffff"} 
               onChange={e => onUpdate({ color: e.target.value })} 
               className="absolute w-full h-full opacity-0 cursor-pointer" 
             />
             <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: config.color || "#ffffff" }} />
             <span className="text-[10px] uppercase font-mono text-text-secondary">{config.color || "#FFFFFF"}</span>
           </div>
           <input 
             type="number" 
             step="0.1" 
             className="w-12 h-6 bg-background rounded border border-border-primary text-xs px-1 text-white" 
             value={config.duration ?? 0.2} 
             onChange={e => onUpdate({ duration: parseFloat(e.target.value) })} 
           />
           <span className="text-[10px] text-text-tertiary">sec</span>
        </div>
      );

    case "scale":
      return (
        <div className="flex justify-between items-center ml-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-tertiary">Scale To:</span>
            <input 
              type="number" 
              step="0.1" 
              className="w-12 h-6 bg-background rounded border border-border-primary text-xs px-1 text-white" 
              value={config.value ?? 1.2} 
              onChange={e => onUpdate({ value: parseFloat(e.target.value) })} 
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-tertiary">Dur:</span>
            <input 
              type="number" 
              step="0.1" 
              className="w-12 h-6 bg-background rounded border border-border-primary text-xs px-1 text-white" 
              value={config.duration ?? 0.2} 
              onChange={e => onUpdate({ duration: parseFloat(e.target.value) })} 
            />
          </div>
        </div>
      );

    case "camera_focus":
      return (
        <div className="space-y-2 ml-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-tertiary">Offset</span>
            <div className="flex gap-1">
               {["X", "Y", "Z"].map((axis, i) => (
                 <input 
                   key={axis} 
                   type="number" 
                   step="0.5" 
                   className="w-10 h-6 bg-background rounded border border-border-primary text-xs px-1 text-white text-center hover:border-accent focus:border-accent outline-none" 
                   value={config.offset?.[i] ?? 0} 
                   onChange={e => {
                    const newOffsets = [...(config.offset || [0,0,0])];
                    newOffsets[i] = parseFloat(e.target.value) || 0;
                    onUpdate({ offset: newOffsets });
                 }} />
               ))}
            </div>
          </div>
        </div>
      );

    case "animation":
      return (
        <div className="space-y-2 ml-2">
          <select 
            value={config.clip || ""} 
            onChange={e => onUpdate({ clip: e.target.value })}
            className="w-full h-7 bg-background rounded border border-border-primary px-2 text-[10px] text-white outline-none focus:border-accent"
          >
            <option value="" disabled>Select Animation...</option>
            {animations.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={config.loop ?? true}
              onChange={(e) => onUpdate({ loop: e.target.checked })}
              className="accent-accent"
            />
            <span className="text-[10px] text-text-secondary group-hover:text-white transition-colors">Loop animation</span>
          </label>
        </div>
      );

    case "audio":
      return (
        <div className="space-y-2 ml-2">
          <input 
            type="url" 
            value={config.src || ""} 
            placeholder="Audio URL (.mp3, .wav)" 
            onChange={e => onUpdate({ src: e.target.value })} 
            className="w-full h-8 bg-background rounded border border-border-primary px-2 text-xs text-white outline-none focus:border-accent" 
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-tertiary">Volume:</span>
            <input 
              type="range" 
              min="0" max="1" step="0.1"
              value={config.volume ?? 1}
              onChange={e => onUpdate({ volume: parseFloat(e.target.value) })}
              className="flex-1 accent-accent h-1"
            />
          </div>
        </div>
      );

    case "info_panel":
      return (
        <div className="space-y-2 ml-2">
          <input type="text" placeholder="Title" value={config.title} onChange={e => onUpdate({ title: e.target.value })} className="w-full h-8 bg-background rounded border border-border-primary px-2 text-xs text-white outline-none focus:border-accent" />
          <textarea placeholder="Description" value={config.body} onChange={e => onUpdate({ body: e.target.value })} className="w-full h-16 bg-background rounded border border-border-primary p-2 text-xs text-white outline-none resize-none focus:border-accent" />
          <div className="flex items-center gap-2">
            <input type="text" placeholder="CTA Label" value={config.ctaLabel || ""} onChange={e => onUpdate({ ctaLabel: e.target.value })} className="flex-1 h-7 bg-background rounded border border-border-primary px-2 text-[10px] text-white outline-none focus:border-accent" />
            <input type="text" placeholder="CTA URL" value={config.ctaUrl || ""} onChange={e => onUpdate({ ctaUrl: e.target.value })} className="flex-1 h-7 bg-background rounded border border-border-primary px-2 text-[10px] text-white outline-none focus:border-accent" />
          </div>
        </div>
      );

    case "url":
      return (
        <input 
          type="url" 
          value={config.url || "https://"} 
          placeholder="https://" 
          onChange={e => onUpdate({ url: e.target.value })} 
          className="ml-2 w-[calc(100%-8px)] h-8 bg-background rounded border border-border-primary px-2 text-xs text-white outline-none focus:border-accent" 
        />
      );

    case "toggle":
      return (
        <div className="space-y-4 ml-2 p-2 bg-background-subtle/50 rounded border border-white/5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-accent uppercase tracking-tighter">State: ON (First Click)</span>
            </div>
            <div className="bg-background/50 rounded-lg border border-border-primary/50">
              <ActionStack 
                interactionId={interactionId}
                actions={config.states?.on || []}
                animations={animations}
                onUpdateStack={(newActions) => onUpdate({ states: { ...config.states, on: newActions } })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">State: OFF (Second Click)</span>
            </div>
            <div className="bg-background/50 rounded-lg border border-border-primary/50">
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
