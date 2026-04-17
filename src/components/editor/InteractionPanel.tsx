"use client";

import React from "react";
import { useEditorStore } from "@/stores/editorStore";
import { 
  Plus, MousePointer2, Zap, StopCircle, Play 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TriggerSettings } from "./Interaction/TriggerSettings";
import { ActionStack } from "./Interaction/ActionStack";

export function InteractionPanel({ width, isCollapsed }: { width?: number, isCollapsed?: boolean }) {
  const { 
    interactions, 
    addInteraction, 
    animations, 
    previewMode, 
    setPreviewMode 
  } = useEditorStore();

  const primarySelection = useEditorStore((state) => state.primarySelection);
  const primarySelectionName = useEditorStore((state) => state.primarySelectionName);
  const selectedMeshes = useEditorStore((state) => state.selectedMeshes);
  
  // Migration logic: Fallback to UUID if Name interaction is missing, though we prefer Name for persistence
  const meshInteractions = (primarySelectionName ? interactions[primarySelectionName] : null)
    || (primarySelection ? interactions[primarySelection] : null)
    || [];

  const headerText = selectedMeshes?.size > 1 
     ? `${selectedMeshes.size} Items Selected`
     : (primarySelectionName || primarySelection);

  const panelStyle = {
    width: width !== undefined ? `${width}px` : '384px',
  };

  if (!primarySelection) {
    return (
      <aside 
        style={panelStyle}
        className={cn(
          "border-l border-[--border] bg-[--bg] shrink-0 flex flex-col items-center justify-center p-10 text-center bg-[--bg]/50 editor-panel-transition",
          isCollapsed ? "overflow-hidden border-none" : ""
        )}
      >
        <div className="w-16 h-16 rounded-3xl bg-[--surface] flex items-center justify-center text-[--text-3] mb-8 border border-[--border] shadow-xl">
          <MousePointer2 className="w-6 h-6 opacity-40" />
        </div>
        {!isCollapsed && (
          <>
            <h3 className="text-sm font-bold text-[--text-1] mb-3 uppercase tracking-widest">No Selection</h3>
            <p className="text-[13px] text-[--text-2] leading-relaxed max-w-[240px]">
              Select an object in the viewport to configure its properties and interactions.
            </p>
          </>
        )}
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
    <aside 
      style={panelStyle}
      className={cn(
        "border-l border-[--border] bg-[--surface] shrink-0 flex flex-col z-10 editor-panel-transition group/panel",
        isCollapsed ? "overflow-hidden border-none opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="h-12 border-b border-[--border] px-4 flex items-center justify-between shrink-0 bg-[--bg]/20">
        <div className="flex items-center gap-2 truncate">
           <span className="text-xs font-bold text-[--accent] uppercase tracking-widest truncate max-w-[300px]">{headerText}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-none">
        {meshInteractions.length === 0 && (
          <div className="p-6 rounded-xl bg-[--bg] border border-dashed border-[--border] flex flex-col items-center justify-center text-center py-10">
             <div className="w-10 h-10 rounded-lg bg-[--surface] border border-[--border] flex items-center justify-center mb-4">
                <Zap className="w-4 h-4 text-[--text-3] opacity-40" />
             </div>
             <p className="text-[13px] text-[--text-2] mb-6">No interactions configured.</p>
             <button 
               onClick={handleAddInteraction} 
               className="px-4 py-2 rounded-lg bg-[--surface] hover:bg-[--surface-raised] text-[--text-1] border border-[--border] transition-all text-sm font-semibold shadow-sm active:scale-95"
             >
               Add Interaction
             </button>
          </div>
        )}

        {meshInteractions.map((interaction: any) => (
          <div key={interaction.id} className="space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
             <TriggerSettings interaction={interaction} />
             <div className="bg-[--bg] border-x border-b border-[--border] rounded-b-xl overflow-hidden shadow-inner">
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
             className="w-full h-11 border border-dashed border-[--border] rounded-xl flex items-center justify-center gap-2 text-[--text-2] hover:text-[--text-1] hover:border-[--accent] hover:bg-[--accent-subtle]/10 transition-all text-sm font-semibold active:scale-[0.98]"
           >
             <Plus className="w-3.5 h-3.5" />
             New Trigger Block
           </button>
        )}
      </div>

      <div className="p-4 bg-bg-secondary/30 border-t border-border-default">
         <button 
           onClick={() => setPreviewMode(!previewMode)}
           className={cn(
             "w-full h-10 flex items-center justify-center gap-2 text-sm font-bold rounded-lg border transition-all shadow-sm active:scale-[0.98]",
             previewMode 
               ? "bg-[--accent] border-[--accent] text-[--accent-fg]" 
               : "bg-[--surface] hover:bg-[--surface-raised] text-[--text-1] border-[--border]"
           )}
         >
            {previewMode ? <StopCircle className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {previewMode ? "Stop Testing" : "Test sequence"}
         </button>
      </div>
    </aside>
  );
}
