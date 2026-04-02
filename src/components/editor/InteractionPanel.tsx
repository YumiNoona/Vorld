"use client";

import React from "react";
import { useEditorStore } from "@/stores/editorStore";
import { 
  Plus, MousePointer2, Zap, StopCircle, Play 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TriggerSettings } from "./Interaction/TriggerSettings";
import { ActionStack } from "./Interaction/ActionStack";

export function InteractionPanel() {
  const { 
    selectedMeshes, 
    interactions, 
    addInteraction, 
    animations, 
    previewMode, 
    setPreviewMode 
  } = useEditorStore();

  const primaryMesh = selectedMeshes && selectedMeshes.length > 0 ? selectedMeshes[0] : null;
  const meshInteractions = primaryMesh ? interactions[primaryMesh] || [] : [];

  const headerText = selectedMeshes?.length > 1 
     ? `${selectedMeshes.length} meshes selected`
     : primaryMesh;

  if (!primaryMesh) {
    return (
      <aside className="w-80 border-l border-border-primary bg-background shrink-0 flex flex-col items-center justify-center p-8 text-center bg-background-subtle">
        <div className="w-12 h-12 rounded-2xl bg-background-elevated flex items-center justify-center text-text-tertiary/20 mb-4 border border-border-primary">
          <MousePointer2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-medium text-white mb-1">No meshes selected</h3>
        <p className="text-xs text-text-tertiary">Select meshes in the viewport to configure interactivity.</p>
      </aside>
    );
  }

  const handleAddInteraction = () => {
    const newInteraction = {
      id: Math.random().toString(36).substr(2, 9),
      trigger: "onClick" as "onClick" | "onHover",
      conditions: { once: false },
      revertOnLeave: true,
      actions: []
    };
    addInteraction(newInteraction);
  };

  return (
    <aside className="w-80 border-l border-border-primary bg-background shrink-0 flex flex-col z-10">
      <div className="h-10 border-b border-border-primary px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 truncate">
           <span className="text-xs font-semibold text-white truncate max-w-[200px] text-accent uppercase tracking-widest">{headerText}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none">
        {meshInteractions.length === 0 && (
          <div className="p-4 rounded-lg bg-background-subtle border border-dashed border-border-primary flex flex-col items-center justify-center text-center py-8">
             <Zap className="w-5 h-5 text-text-tertiary/40 mb-3" />
             <p className="text-xs text-text-tertiary">No interactions configured.</p>
             <button 
               onClick={handleAddInteraction} 
               className="mt-4 px-3 py-1.5 rounded bg-background-elevated hover:bg-white text-white hover:text-black transition-colors text-xs font-medium shadow shadow-black/20"
             >
               Add Interaction
             </button>
          </div>
        )}

        {meshInteractions.map((interaction: any) => (
          <div key={interaction.id} className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-300">
             <TriggerSettings interaction={interaction} />
             <div className="bg-background border-x border-b border-border-primary rounded-b-xl overflow-hidden">
                <ActionStack 
                  interactionId={interaction.id} 
                  actions={interaction.actions || []} 
                  animations={animations} 
                />
             </div>
          </div>
        ))}
        
        {meshInteractions.length > 0 && (
           <button 
             onClick={handleAddInteraction} 
             className="w-full h-10 border border-dashed border-border-primary rounded-xl flex items-center justify-center gap-2 text-text-tertiary hover:text-white hover:border-accent hover:bg-accent-subtle/10 transition-all text-xs font-medium"
           >
             <Plus className="w-3.5 h-3.5" />
             New Trigger Block
           </button>
        )}
      </div>

      <div className="p-4 bg-background-subtle border-t border-border-primary">
         <button 
           onClick={() => setPreviewMode(!previewMode)}
           className={cn(
             "w-full h-9 flex items-center justify-center gap-2 text-xs font-medium rounded-lg border transition-all shadow-lg",
             previewMode 
               ? "bg-accent border-accent-border text-white shadow-accent/20" 
               : "bg-background-elevated hover:bg-background-overlay text-text-primary border-border-primary"
           )}
         >
            {previewMode ? <StopCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {previewMode ? "Stop Testing" : "Test sequence"}
         </button>
      </div>
    </aside>
  );
}
