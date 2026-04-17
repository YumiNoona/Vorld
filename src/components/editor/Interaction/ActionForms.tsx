"use client";

import React from "react";
import { 
  Trash2, X, Box, GripVertical, Settings2, Sparkles, 
  Zap, Play, Info, ExternalLink, ChevronDown, ChevronUp,
  Sun, Maximize, Camera, Activity, Volume2, FileText, Link, ToggleLeft,
  Move3D, Palette, Tag, PartyPopper, Eye, CloudSun, ArrowUpToLine
} from "lucide-react";
import { toast } from "sonner";
import { useEditorStore, InteractionAction } from "@/stores/editorStore";
import { ActionStack } from "./ActionStack";
import { cn } from "@/lib/utils";
import { ColorPicker } from "@/components/ui/color-picker";

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
  { id: "highlight", label: "Color Highlight", icon: IconSparkles, description: "Tint the mesh with a color" },
  { id: "glow", icon: IconSun, label: "Emissive Glow", description: "Add emissive light to the mesh" },
  { id: "scale", icon: IconMaximize, label: "Scale Transform", description: "Resize the mesh on interaction" },
  { id: "camera_focus", icon: IconCamera, label: "Camera Focus", description: "Fly camera to the mesh" },
  { id: "animation", icon: IconActivity, label: "GLTF Animation", description: "Play a model animation clip" },
  { id: "audio", icon: IconVolume2, label: "Spatial Audio", description: "Play a sound on interaction" },
  { id: "info_panel", icon: IconFileText, label: "Overlay Panel", description: "Show an info card overlay" },
  { id: "url", icon: IconLink, label: "Open Link", description: "Navigate to an external URL" },
  { id: "toggle", icon: IconToggleLeft, label: "State Toggle", description: "Toggle between two action sets" },
  { id: "material_swap", icon: Palette, label: "Material Swap", description: "Change color/roughness/metalness" },
  { id: "label_pin", icon: Tag, label: "Label Pin", description: "Pin a floating 2D label to mesh" },
  { id: "particle_burst", icon: PartyPopper, label: "Particle Burst", description: "Emit particles from mesh center" },
  { id: "reveal_hidden", icon: Eye, label: "Reveal Hidden", description: "Animate a hidden mesh into view" },
  { id: "set_environment", icon: CloudSun, label: "Set Environment", description: "Switch the IBL environment preset" },
];

interface ActionFormProps {
  interactionId: string;
  action: InteractionAction;
  onUpdate: (updates: any, noHistory?: boolean) => void;
  animations: string[];
}

const InputLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[11px] font-medium text-[--text-3] mb-1 block">
    {children}
  </span>
);

export function ActionForm({ interactionId, action, onUpdate, animations }: ActionFormProps) {
  const { type, config } = action;

  switch (type) {
    case "highlight":
      return (
        <div className="flex items-center gap-4">
           <div className="flex-1">
             <InputLabel>Color</InputLabel>
             <ColorPicker 
               color={config.color || "#10b981"} 
               onChange={(newColor, noHistory) => onUpdate({ color: newColor }, noHistory)} 
             />
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

    case "glow":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <InputLabel>Glow Color</InputLabel>
              <ColorPicker 
                color={config.color || "#10b981"} 
                onChange={(newColor, noHistory) => onUpdate({ color: newColor }, noHistory)} 
              />
            </div>
            <div className="w-24">
              <InputLabel>Intensity</InputLabel>
              <input 
                type="number" 
                step="0.1" 
                min="0"
                className="w-full h-9 bg-bg-primary rounded-lg border border-border-default text-sm px-3 text-text-primary outline-none focus:border-accent transition-all" 
                value={config.intensity ?? 2.0} 
                onChange={e => onUpdate({ intensity: parseFloat(e.target.value) })} 
              />
            </div>
          </div>
          <div>
            <InputLabel>Duration</InputLabel>
            <div className="relative flex items-center w-full">
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
                    className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] text-sm px-3 text-[--text-1] text-center hover:border-[--text-3] focus:border-[--accent] outline-none transition-all" 
                    value={config.offset?.[i] ?? 0} 
                    onChange={e => {
                     const newOffsets = [...(config.offset || [0,0,0])];
                     newOffsets[i] = parseFloat(e.target.value) || 0;
                     onUpdate({ offset: newOffsets });
                  }} />
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-medium text-[--text-3] opacity-30">{axis}</span>
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
                className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] px-3 text-sm text-[--text-1] outline-none focus:border-[--accent] appearance-none transition-all cursor-pointer"
              >
                <option value="" disabled>Select animation...</option>
                {animations.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[--text-3]" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={config.loop ?? true}
              onChange={(e) => onUpdate({ loop: e.target.checked })}
              className="w-4 h-4 rounded border-[--border] bg-[--surface-raised] text-[--accent] focus:ring-[--accent] accent-[--accent] cursor-pointer"
            />
            <span className="text-[--text-2] group-hover:text-[--text-1] transition-colors">Loop animation</span>
          </label>
        </div>
      );

    case "audio": {
      const isYoutube = config.src?.includes("youtube.com") || config.src?.includes("youtu.be");
      const isSpotify = config.src?.includes("spotify.com");
      const isLocal = config.sourceType === "file";

      return (
        <div className="space-y-4">
          <div className="flex p-1 bg-[--bg] rounded-lg border border-[--border]">
            <button 
              onClick={() => onUpdate({ sourceType: 'url' })}
              className={cn("flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all", !isLocal ? "bg-[--surface-raised] text-[--accent] shadow-sm" : "text-[--text-3] hover:text-[--text-2]")}
            >
              Remote URL
            </button>
            <button 
              onClick={() => onUpdate({ sourceType: 'file' })}
              className={cn("flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all", isLocal ? "bg-[--surface-raised] text-[--accent] shadow-sm" : "text-[--text-3] hover:text-[--text-2]")}
            >
              Upload Local
            </button>
          </div>

          <div>
            <InputLabel>{isLocal ? "Select File" : "Source URL"}</InputLabel>
            {isLocal ? (
              <div className="flex flex-col gap-2">
                 <input 
                   type="file" 
                   accept="audio/*"
                   className="hidden" 
                   id={`audio-upload-${action.id}`}
                   onChange={e => {
                     const file = e.target.files?.[0];
                     if (file) {
                       // In a real app we'd upload to Supabase, but for session we'll use blob
                       // The runtime will handle creating the ObjectURL
                       onUpdate({ src: URL.createObjectURL(file), fileName: file.name });
                       toast.success(`Loaded: ${file.name}`);
                     }
                   }}
                 />
                  <label 
                    htmlFor={`audio-upload-${action.id}`}
                    className="w-full h-10 border-2 border-dashed border-[--border] rounded-lg flex items-center justify-center gap-2 hover:border-[--accent] hover:bg-[--accent-subtle]/10 cursor-pointer transition-all text-sm font-medium text-[--text-3] hover:text-[--accent]"
                  >
                   <ArrowUpToLine className="w-4 h-4 text-text-tertiary" />
                   <span className="text-xs font-medium text-text-secondary">{config.fileName || "Choose MP3/WAV..."}</span>
                 </label>
              </div>
            ) : (
              <div className="space-y-2">
                <input 
                  type="url" 
                  value={config.src || ""} 
                  placeholder="https://example.com/audio.mp3" 
                  onChange={e => onUpdate({ src: e.target.value })} 
                  className={cn(
                    "w-full h-9 bg-[--surface-raised] rounded-lg border px-3 text-sm text-[--text-1] outline-none transition-all",
                    (isYoutube || isSpotify) ? "border-red-500/50" : "border-[--border] focus:border-[--accent]"
                  )} 
                />
                {(isYoutube || isSpotify) && (
                  <p className="text-[10px] text-red-500 font-medium">
                    Streaming links (YouTube/Spotify) are not supported. Use a direct file link (.mp3, .wav).
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <div className="flex justify-between">
                <InputLabel>Volume</InputLabel>
                <span className="text-[10px] font-mono font-bold text-[--accent]">{Math.round((config.volume ?? 1) * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.1"
                value={config.volume ?? 1}
                onChange={e => onUpdate({ volume: parseFloat(e.target.value) })}
                className="w-full accent-[--accent] h-1 rounded-full bg-[--border] appearance-none cursor-pointer"
              />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={config.loop ?? false}
                    onChange={(e) => onUpdate({ loop: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-7 h-4 bg-[--border] rounded-full peer peer-checked:bg-[--accent] transition-all" />
                  <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-all peer-checked:translate-x-3" />
                </div>
                <span className="text-[10px] font-bold text-[--text-3] uppercase tracking-wider group-hover:text-[--text-1] transition-colors">Loop</span>
              </label>
            </div>
          </div>
        </div>
      );
    }

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
              className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] px-3 text-sm text-[--text-1] outline-none focus:border-[--accent] transition-all" 
            />
          </div>
          <div>
            <InputLabel>Description</InputLabel>
            <textarea 
              placeholder="Enter detailed information here..." 
              value={config.body} 
              onChange={e => onUpdate({ body: e.target.value })} 
              className="w-full h-24 bg-[--surface-raised] rounded-lg border border-[--border] p-3 text-sm text-[--text-1] outline-none resize-none focus:border-[--accent] transition-all leading-relaxed" 
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
              className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] px-3 pl-9 text-sm text-[--text-1] outline-none focus:border-[--accent] transition-all" 
            />
            <ExternalLink className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[--text-3]" />
          </div>
        </div>
      );

    case "toggle":
      return (
        <div className="space-y-6 mt-2 p-4 bg-[--bg]/40 rounded-xl border border-[--border] shadow-inner">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[--accent]" />
               <span className="text-[11px] font-medium text-[--text-1]">State: Active</span>
            </div>
            <div className="bg-[--surface]/50 rounded-xl border border-[--border] overflow-hidden">
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
               <div className="w-2 h-2 rounded-full bg-[--text-3]" />
               <span className="text-[11px] font-medium text-[--text-3]">State: Inactive</span>
            </div>
            <div className="bg-[--surface]/50 rounded-xl border border-[--border] overflow-hidden">
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

    // ── NEW INTERACTION TYPES ──


    case "material_swap":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <InputLabel>Color</InputLabel>
              <ColorPicker 
                color={config.color || "#ffffff"} 
                onChange={(newColor, noHistory) => onUpdate({ color: newColor }, noHistory)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <InputLabel>Roughness</InputLabel>
              <input type="number" step="0.1" min="0" max="1" className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] text-sm px-3 text-[--text-1] outline-none focus:border-[--accent] transition-all text-center" value={config.roughness ?? 0.5} onChange={e => onUpdate({ roughness: parseFloat(e.target.value) })} />
            </div>
            <div>
              <InputLabel>Metalness</InputLabel>
              <input type="number" step="0.1" min="0" max="1" className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] text-sm px-3 text-[--text-1] outline-none focus:border-[--accent] transition-all text-center" value={config.metalness ?? 0.8} onChange={e => onUpdate({ metalness: parseFloat(e.target.value) })} />
            </div>
            <div>
              <InputLabel>Duration</InputLabel>
              <div className="relative flex items-center">
                <input type="number" step="0.05" className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] text-sm pl-3 pr-7 text-[--text-1] outline-none focus:border-[--accent] transition-all leading-none py-0" value={config.duration ?? 0.3} onChange={e => onUpdate({ duration: parseFloat(e.target.value) })} />
                <span className="absolute right-3 text-[10px] text-[--text-3] font-bold pointer-events-none uppercase tracking-tighter">sec</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "label_pin":
      return (
        <div className="space-y-4">
          <div>
            <InputLabel>Label Text</InputLabel>
            <input type="text" placeholder="Enter label text..." value={config.text || ""} onChange={e => onUpdate({ text: e.target.value })} className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] px-3 text-sm text-[--text-1] outline-none focus:border-[--accent] transition-all" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <InputLabel>Font Size</InputLabel>
              <input type="number" min="8" max="32" className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] text-sm px-3 text-[--text-1] outline-none focus:border-[--accent] transition-all text-center" value={config.fontSize ?? 14} onChange={e => onUpdate({ fontSize: parseInt(e.target.value) })} />
            </div>
            <div>
              <InputLabel>Background</InputLabel>
              <ColorPicker 
                color={config.backgroundColor || "#000000"} 
                onChange={(newColor, noHistory) => onUpdate({ backgroundColor: newColor }, noHistory)} 
              />
            </div>
            <div>
              <InputLabel>Position</InputLabel>
              <div className="relative">
                <select value={config.position || "top"} onChange={e => onUpdate({ position: e.target.value })} className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] px-2 text-sm text-[--text-1] outline-none focus:border-[--accent] appearance-none transition-all cursor-pointer">
                  <option value="top">Top</option>
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[--text-3]" />
              </div>
            </div>
          </div>
        </div>
      );

    case "particle_burst":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel>Particle Count</InputLabel>
              <input type="number" min="5" max="100" className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] text-sm px-3 text-[--text-1] outline-none focus:border-[--accent] transition-all" value={config.count ?? 20} onChange={e => onUpdate({ count: parseInt(e.target.value) })} />
            </div>
            <div>
              <InputLabel>Color</InputLabel>
              <ColorPicker 
                color={config.color || "#F59E0B"} 
                onChange={(newColor, noHistory) => onUpdate({ color: newColor }, noHistory)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel>Particle Size</InputLabel>
              <input type="number" step="0.01" min="0.01" className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] text-sm px-3 text-[--text-1] outline-none focus:border-[--accent] transition-all" value={config.size ?? 0.05} onChange={e => onUpdate({ size: parseFloat(e.target.value) })} />
            </div>
            <div>
              <InputLabel>Duration</InputLabel>
              <div className="relative flex items-center">
                <input type="number" step="0.1" className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] text-sm pl-3 pr-7 text-[--text-1] outline-none focus:border-[--accent] transition-all leading-none py-0" value={config.duration ?? 1.0} onChange={e => onUpdate({ duration: parseFloat(e.target.value) })} />
                <span className="absolute right-3 text-[10px] text-[--text-3] font-bold pointer-events-none uppercase tracking-tighter">sec</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "reveal_hidden":
      return (
        <div className="space-y-4">
          <div>
            <InputLabel>Target Mesh Name</InputLabel>
            <input type="text" placeholder="Enter mesh name to reveal..." value={config.targetMeshName || ""} onChange={e => onUpdate({ targetMeshName: e.target.value })} className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] px-3 text-sm text-[--text-1] outline-none focus:border-[--accent] transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel>Animation Type</InputLabel>
              <div className="relative">
                <select value={config.animationType || "fade"} onChange={e => onUpdate({ animationType: e.target.value })} className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] px-3 text-sm text-[--text-1] outline-none focus:border-[--accent] appearance-none transition-all cursor-pointer">
                  <option value="fade">Fade In</option>
                  <option value="scale_in">Scale In</option>
                  <option value="slide_up">Slide Up</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[--text-3]" />
              </div>
            </div>
            <div>
              <InputLabel>Duration</InputLabel>
              <div className="relative flex items-center">
                <input type="number" step="0.05" className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] text-sm pl-3 pr-7 text-[--text-1] outline-none focus:border-[--accent] transition-all leading-none py-0" value={config.duration ?? 0.4} onChange={e => onUpdate({ duration: parseFloat(e.target.value) })} />
                <span className="absolute right-3 text-[10px] text-[--text-3] font-bold pointer-events-none uppercase tracking-tighter">sec</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "set_environment":
      return (
        <div className="space-y-1">
          <InputLabel>Environment Preset</InputLabel>
          <div className="relative">
            <select 
              value={config.preset || "city"} 
              onChange={e => onUpdate({ preset: e.target.value })}
              className="w-full h-9 bg-[--surface-raised] rounded-lg border border-[--border] px-3 text-sm text-[--text-1] outline-none focus:border-[--accent] appearance-none transition-all cursor-pointer"
            >
              <option value="city">City</option>
              <option value="sunset">Sunset</option>
              <option value="dawn">Dawn</option>
              <option value="night">Night</option>
              <option value="forest">Forest</option>
              <option value="studio">Studio</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[--text-3]" />
          </div>
        </div>
      );

    default:
      return null;
  }
}
