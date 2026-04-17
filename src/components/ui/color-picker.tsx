"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { cn } from "@/lib/utils";
import { Pipette, Copy, Hash, ChevronDown, Check, Info } from "lucide-react";
import { toast } from "sonner";

interface ColorPickerProps {
  color: string;
  onChange: (color: string, noHistory?: boolean) => void;
  className?: string;
}

const PRESET_COLORS = [
  "#F59E0B", "#FDBA74", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899",
  "#FFFFFF", "#888888", "#333333", "#0C0C0C", "#FF4081", "#795548"
];

// --- Utilities ---

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const hexToHsl = (hex: string) => {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { 
    h: Math.round(h * 360), 
    s: Math.round(s * 100), 
    l: Math.round(l * 100) 
  };
};

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [localColor, setLocalColor] = useState(color);
  const [mode, setMode] = useState<"hex" | "rgb" | "hsl">("hex");
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  
  const isEyeDropperSupported = typeof window !== "undefined" && "EyeDropper" in window;

  // Sync with prop
  useEffect(() => {
    setLocalColor(color);
  }, [color]);

  // Load Recent Colors
  useEffect(() => {
    const saved = localStorage.getItem("vorld_recent_colors");
    if (saved) {
      try {
        setRecentColors(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent colors", e);
      }
    }
  }, []);

  const saveRecentColor = useCallback((newColor: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== newColor.toLowerCase());
      const updated = [newColor, ...filtered].slice(0, 12);
      localStorage.setItem("vorld_recent_colors", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleLiveChange = (newColor: string) => {
    setLocalColor(newColor);
    onChange(newColor, true); // No history for live preview
  };

  const handleCommit = (newColor: string) => {
    onChange(newColor, false); // Commit to history
    saveRecentColor(newColor);
  };

  const openEyeDropper = async () => {
    if (!isEyeDropperSupported) return;
    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const newColor = result.sRGBHex;
      setLocalColor(newColor);
      handleCommit(newColor);
    } catch (e) {
      console.warn("EyeDropper cancelled or failed", e);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(localColor.toUpperCase());
    setIsCopied(true);
    toast.success("Hex copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderInputs = () => {
    if (mode === "hex") {
      return (
        <div className="flex items-center gap-2 flex-1">
          <Hash className="w-3 h-3 text-text-tertiary" />
          <input 
            type="text" 
            value={localColor.replace("#", "").toUpperCase()} 
            onChange={(e) => {
              const val = "#" + e.target.value;
              setLocalColor(val);
              if (/^#[0-9A-Fa-f]{6}$/.test(val)) handleCommit(val);
            }}
            className="bg-transparent text-xs font-mono text-[--text-1] outline-none uppercase flex-1"
            maxLength={6}
          />
        </div>
      );
    }
    if (mode === "rgb") {
      const { r, g, b } = hexToRgb(localColor);
      return (
        <div className="flex items-center gap-1 flex-1 text-[10px] font-mono text-[--text-1]">
          <span>R {r}</span>
          <span className="opacity-30 mx-0.5">•</span>
          <span>G {g}</span>
          <span className="opacity-30 mx-0.5">•</span>
          <span>B {b}</span>
        </div>
      );
    }
    if (mode === "hsl") {
      const { h, s, l } = hexToHsl(localColor);
      return (
        <div className="flex items-center gap-1 flex-1 text-[10px] font-mono text-[--text-1]">
          <span>H {h}°</span>
          <span className="opacity-30 mx-0.5">•</span>
          <span>S {s}%</span>
          <span className="opacity-30 mx-0.5">•</span>
          <span>L {l}%</span>
        </div>
      );
    }
  };

  return (
    <Popover onOpenChange={(open) => {
      // Final commit when closing if changed
      if (!open) handleCommit(localColor);
    }}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-3 bg-[--surface] border border-[--border] h-9 px-3 rounded-lg hover:border-[--text-3] transition-all w-full group",
            className
          )}
        >
          <div 
            className="w-4 h-4 rounded-full border border-black/10 ring-1 ring-white/10 shrink-0" 
            style={{ backgroundColor: color || "#F59E0B" }} 
          />
          <span className="text-sm font-mono text-[--text-1] tracking-tight">
            {(color || "#F59E0B").toUpperCase()}
          </span>
          <ChevronDown className="w-3 h-3 ml-auto text-[--text-3] opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-64 p-0 overflow-hidden border-[--border] bg-[--surface] shadow-2xl backdrop-blur-md">
        <div className="p-4 space-y-4">
          {/* Primary: Color Picker Area */}
          <div className="pro-color-picker">
            <HexColorPicker 
              color={localColor} 
              onChange={handleLiveChange} 
            />
          </div>

          <div className="flex items-center gap-2 p-2 bg-[--bg]/50 rounded-lg border border-[--border]">
            {/* EyeDropper */}
            <button 
              onClick={openEyeDropper}
              disabled={!isEyeDropperSupported}
              title={isEyeDropperSupported ? "Eye Dropper" : "Eye Dropper not supported in this browser"}
              className={cn(
                "p-1.5 rounded hover:bg-[--surface-raised] text-[--text-3] hover:text-[--text-1] transition-all",
                !isEyeDropperSupported && "opacity-30 cursor-not-allowed"
              )}
            >
              <Pipette className="w-3.5 h-3.5" />
            </button>
            
            <div className="w-px h-4 bg-[--border]" />

            {/* Mode Switcher + Display */}
            <button 
              className="flex-1 flex items-center justify-start hover:opacity-70 transition-opacity px-1"
              onClick={() => setMode(prev => prev === "hex" ? "rgb" : prev === "rgb" ? "hsl" : "hex")}
            >
              {renderInputs()}
            </button>

            <div className="w-px h-4 bg-[--border]" />

            {/* Copy Button */}
            <button 
              onClick={copyToClipboard}
              className="p-1.5 rounded hover:bg-[--surface-raised] text-[--text-3] hover:text-[--text-1] transition-all"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[--accent]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Tertiary: Grids */}
          <div className="space-y-3">
            {/* Recent Colors */}
            {recentColors.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest pl-1">Recent</span>
                <div className="grid grid-cols-6 gap-1.5">
                  {recentColors.map((c) => (
                    <button
                      key={c}
                      className={cn(
                        "w-7 h-7 rounded-sm border border-black/10 ring-1 ring-white/10 transition-all hover:scale-110 active:scale-95",
                        localColor.toLowerCase() === c.toLowerCase() && "ring-2 ring-accent ring-offset-1 ring-offset-bg-primary"
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => handleCommit(c)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest pl-1">Global Palette</span>
              <div className="grid grid-cols-6 gap-1.5">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset}
                    className={cn(
                      "w-7 h-7 rounded-sm border border-black/10 ring-1 ring-white/10 transition-all hover:scale-110 active:scale-95",
                      localColor.toLowerCase() === preset.toLowerCase() && "ring-2 ring-accent ring-offset-1 ring-offset-bg-primary"
                    )}
                    style={{ backgroundColor: preset }}
                    onClick={() => handleCommit(preset)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Warning for Firefox/Safari if eyedropper missing */}
        {!isEyeDropperSupported && (
          <div className="px-4 py-2 bg-amber-500/10 border-t border-[--border] flex items-center gap-2">
            <Info className="w-3 h-3 text-amber-500" />
            <span className="text-[9px] font-medium text-amber-500/70">Pipette requires Chrome or Edge</span>
          </div>
        )}
      </PopoverContent>
      <style jsx global>{`
        .pro-color-picker .react-colorful {
          width: 100%;
          height: 140px;
          cursor: crosshair;
        }
        .pro-color-picker .react-colorful__saturation {
          border-radius: 8px 8px 0 0;
          border-bottom: none;
        }
        .pro-color-picker .react-colorful__hue {
          height: 12px;
          border-radius: 0 0 8px 8px;
          margin-top: 8px;
        }
        .pro-color-picker .react-colorful__pointer {
          width: 16px;
          height: 16px;
          border-width: 2px;
        }
      `}</style>
    </Popover>
  );
}
