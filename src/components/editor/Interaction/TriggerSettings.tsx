"use client";

import React from "react";
import { Trash2, ChevronDown } from "lucide-react";
import { useEditorStore, Interaction } from "@/stores/editorStore";
import { cn } from "@/lib/utils";

interface TriggerSettingsProps {
  interaction: Interaction;
}

export function TriggerSettings({ interaction }: TriggerSettingsProps) {
  const { updateInteraction, removeInteraction } = useEditorStore();

  return (
    <div className="bg-bg-secondary rounded-t-xl overflow-hidden border border-border-default transition-all duration-150">
       <div className="p-3 bg-bg-primary border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2 relative group/select">
             <select
               value={interaction.trigger}
               onChange={(e) => updateInteraction(interaction.id, { trigger: e.target.value as any })}
               className="bg-transparent text-sm font-medium text-text-primary px-2 py-1 rounded-md hover:bg-bg-secondary border border-transparent hover:border-border-default outline-none cursor-pointer appearance-none pr-8 transition-all"
             >
                <option value="onClick">On click</option>
                <option value="onHover">On hover</option>
             </select>
             <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary" />
          </div>
          <button 
            onClick={() => removeInteraction(interaction.id)}
            className="p-1.5 rounded-md hover:bg-red-500/10 text-text-tertiary hover:text-red-500 transition-colors"
          >
             <Trash2 className="w-3.5 h-3.5" />
          </button>
       </div>

       <div className="p-4 space-y-3 bg-bg-secondary/50">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                checked={interaction.conditions?.once || false}
                onChange={(e) => updateInteraction(interaction.id, { conditions: { ...interaction.conditions, once: e.target.checked } })}
                className="w-4 h-4 rounded border-border-default bg-bg-primary text-accent focus:ring-accent accent-accent cursor-pointer"
              />
            </div>
            <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">Run sequence only once</span>
          </label>
          
          {interaction.trigger === "onHover" && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={interaction.revertOnLeave ?? true}
                onChange={(e) => updateInteraction(interaction.id, { revertOnLeave: e.target.checked })}
                className="w-4 h-4 rounded border-border-default bg-bg-primary text-accent focus:ring-accent accent-accent cursor-pointer"
              />
              <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">Revert on mouse leave</span>
            </label>
          )}
       </div>
    </div>
  );
}
