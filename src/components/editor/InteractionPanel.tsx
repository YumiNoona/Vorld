"use client";

import React from "react";
import { useEditorStore } from "@/stores/editorStore";
import { 
  Plus, 
  Trash2, 
  MousePointer2, 
  ExternalLink, 
  Info,
  Type,
  ChevronDown,
  Sparkles,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const INTERACTION_TYPES = [
  { id: "hover_highlight", label: "Hover Highlight", icon: Sparkles },
  { id: "click_info_panel", label: "Click Info Panel", icon: Info },
  { id: "click_url", label: "Click Open URL", icon: ExternalLink },
  { id: "click_animation", label: "Click Play Animation", icon: Zap },
];

export function InteractionPanel() {
  const { selectedMesh, interactions, addInteraction, removeInteraction, updateInteraction } = useEditorStore();
  const meshInteractions = selectedMesh ? interactions[selectedMesh] || [] : [];

  if (!selectedMesh) {
    return (
      <aside className="w-80 border-l border-border-primary bg-background shrink-0 flex flex-col items-center justify-center p-8 text-center bg-background-subtle">
        <div className="w-12 h-12 rounded-2xl bg-background-elevated flex items-center justify-center text-text-tertiary/20 mb-4 border border-border-primary">
          <MousePointer2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-medium text-white mb-1">No mesh selected</h3>
        <p className="text-xs text-text-tertiary">Select a mesh in the viewport to configure its interactivity.</p>
      </aside>
    );
  }

  const handleAddInteraction = (type: string) => {
    const newInteraction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      config: type === "click_info_panel" ? { title: "New Info Panel", body: "" } : { url: "" }
    };
    addInteraction(selectedMesh, newInteraction);
  };

  return (
    <aside className="w-80 border-l border-border-primary bg-background shrink-0 flex flex-col z-10">
      <div className="h-10 border-b border-border-primary px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 truncate">
           <span className="text-xs font-semibold text-white truncate max-w-[150px]">{selectedMesh}</span>
        </div>
        <button className="h-7 px-2 rounded bg-accent hover:bg-accent-hover text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all">
           <Plus className="w-3 h-3" />
           Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none">
        
        {/* Interaction List */}
        <div className="space-y-4">
           {meshInteractions.length === 0 && (
              <div className="p-4 rounded-lg bg-background-subtle border border-border-primary flex flex-col items-center justify-center text-center py-8">
                 <Zap className="w-5 h-5 text-text-tertiary/40 mb-3" />
                 <p className="text-xs text-text-tertiary">No interactions configured.</p>
              </div>
           )}

           {meshInteractions.map((interaction) => (
             <div key={interaction.id} className="p-4 rounded-xl bg-background-subtle border border-border-primary hover:border-border-strong transition-all overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-accent-subtle/50 flex items-center justify-center text-accent">
                         {INTERACTION_TYPES.find(t => t.id === interaction.type)?.icon({ className: "w-3.5 h-3.5" })}
                      </div>
                      <span className="text-xs font-semibold text-white">
                         {INTERACTION_TYPES.find(t => t.id === interaction.type)?.label}
                      </span>
                   </div>
                   <button 
                     onClick={() => removeInteraction(selectedMesh, interaction.id)}
                     className="p-1 rounded hover:bg-destructive-subtle text-text-tertiary hover:text-destructive transition-colors"
                   >
                      <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>

                {/* Specific Config Forms */}
                <div className="space-y-3">
                   {interaction.type === "click_info_panel" && (
                      <>
                         <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-text-tertiary tracking-widest">Title</label>
                            <input
                              type="text"
                              value={interaction.config.title}
                              onChange={(e) => updateInteraction(selectedMesh, interaction.id, { title: e.target.value })}
                              className="w-full h-8 px-2 rounded-md bg-background border border-border-primary focus:border-accent text-xs transition-all outline-none"
                            />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-text-tertiary tracking-widest">Description</label>
                            <textarea
                              value={interaction.config.body}
                              onChange={(e) => updateInteraction(selectedMesh, interaction.id, { body: e.target.value })}
                              className="w-full h-16 p-2 rounded-md bg-background border border-border-primary focus:border-accent text-xs transition-all outline-none resize-none"
                            />
                         </div>
                      </>
                   )}
                </div>
             </div>
           ))}
        </div>

        {/* Add Interaction Selector */}
        <div className="pt-4 border-t border-border-primary">
           <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-widest mb-3">Available Interactivity</p>
           <div className="grid grid-cols-2 gap-2">
              {INTERACTION_TYPES.map((type) => (
                 <button
                   key={type.id}
                   onClick={() => handleAddInteraction(type.id)}
                   className="flex flex-col items-center justify-center p-3 rounded-lg border border-border-primary bg-background-subtle hover:border-accent/30 hover:bg-accent-subtle/10 transition-all text-center group"
                 >
                    <type.icon className="w-4 h-4 text-text-tertiary group-hover:text-accent mb-2" />
                    <span className="text-[10px] font-medium text-text-secondary group-hover:text-white leading-tight">{type.label}</span>
                 </button>
              ))}
           </div>
        </div>
      </div>

      <div className="p-4 bg-background-subtle border-t border-border-primary">
         <button className="w-full h-9 flex items-center justify-center gap-2 bg-background-elevated hover:bg-background-overlay text-text-primary text-xs font-medium rounded-lg border border-border-primary transition-all">
            Test interaction
         </button>
      </div>
    </aside>
  );
}
