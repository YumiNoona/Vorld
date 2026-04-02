"use client";

import React from "react";
import { Trash2, ChevronDown } from "lucide-react";
import { useEditorStore, Interaction } from "@/stores/editorStore";

interface TriggerSettingsProps {
  interaction: Interaction;
}

export function TriggerSettings({ interaction }: TriggerSettingsProps) {
  const { updateInteraction, removeInteraction } = useEditorStore();

  return (
    <div className="bg-background-subtle rounded-t-xl overflow-hidden shadow-sm shadow-black/50 border border-border-primary">
       <div className="p-3 bg-background border-b border-border-primary flex items-center justify-between">
          <div className="flex items-center gap-2 relative group/select">
             <select
               value={interaction.trigger}
               onChange={(e) => updateInteraction(interaction.id, { trigger: e.target.value as any })}
               className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer p-0 appearance-none underline underline-offset-4 decoration-accent/50 hover:decoration-accent pr-4"
             >
                <option value="onClick">On Click</option>
                <option value="onHover">On Hover</option>
             </select>
             <ChevronDown className="w-2.5 h-2.5 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary" />
          </div>
          <button 
            onClick={() => removeInteraction(interaction.id)}
            className="p-1.5 rounded hover:bg-destructive-subtle text-text-tertiary hover:text-destructive transition-colors"
          >
             <Trash2 className="w-3.5 h-3.5" />
          </button>
       </div>

       <div className="p-3 bg-background-subtle/30 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={interaction.conditions?.once || false}
              onChange={(e) => updateInteraction(interaction.id, { conditions: { ...interaction.conditions, once: e.target.checked } })}
              className="accent-accent"
            />
            <span className="text-[10px] text-text-secondary group-hover:text-white transition-colors">Run sequence only once</span>
          </label>
          
          {interaction.trigger === "onHover" && (
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={interaction.revertOnLeave ?? true}
                onChange={(e) => updateInteraction(interaction.id, { revertOnLeave: e.target.checked })}
                className="accent-accent"
              />
              <span className="text-[10px] text-text-secondary group-hover:text-white transition-colors">Revert actions on mouse leave</span>
            </label>
          )}
       </div>
    </div>
  );
}
