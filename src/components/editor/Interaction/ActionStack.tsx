"use client";

import React from "react";
import { 
  X, Box, ChevronDown, ChevronUp
} from "lucide-react";
import { useEditorStore, InteractionAction } from "@/stores/editorStore";
import { ActionForm, ACTION_TYPES } from "./ActionForms";

interface ActionStackProps {
  interactionId: string;
  actions: InteractionAction[];
  animations: string[];
  // If provided, we handle updates through this instead of direct store calls
  onUpdateStack?: (newActions: InteractionAction[]) => void;
}

export function ActionStack({ interactionId, actions, animations, onUpdateStack }: ActionStackProps) {
  const { updateAction, removeAction, reorderAction, addAction } = useEditorStore();

  const handleUpdate = (idx: number, updates: any) => {
    if (onUpdateStack) {
      const newActions = [...actions];
      newActions[idx] = { ...newActions[idx], config: { ...newActions[idx].config, ...updates } };
      onUpdateStack(newActions);
    } else {
      updateAction(interactionId, actions[idx].id, updates);
    }
  };

  const handleRemove = (idx: number) => {
    if (onUpdateStack) {
      const newActions = [...actions];
      newActions.splice(idx, 1);
      onUpdateStack(newActions);
    } else {
      removeAction(interactionId, actions[idx].id);
    }
  };

  const handleReorder = (oldIdx: number, newIdx: number) => {
    if (onUpdateStack) {
      const newActions = [...actions];
      const [moved] = newActions.splice(oldIdx, 1);
      newActions.splice(newIdx, 0, moved);
      onUpdateStack(newActions);
    } else {
      reorderAction(interactionId, oldIdx, newIdx);
    }
  };

  const handleAddAction = (type: string) => {
    let defaultConfig: any = {};
    if (type === "info_panel") defaultConfig = { title: "New Info Panel", body: "", imageUrl: "", layout: "top" };
    if (type === "url") defaultConfig = { url: "https://" };
    if (type === "highlight" || type === "glow") defaultConfig = { color: "#7c6aff", duration: 0.2 };
    if (type === "scale") defaultConfig = { value: 1.2, duration: 0.2 };
    if (type === "camera_focus") defaultConfig = { offset: [0, 1, 5], duration: 1.0 };
    if (type === "audio") defaultConfig = { src: "", volume: 1, loop: false };
    if (type === "animation") defaultConfig = { clip: animations[0] || "", loop: true };
    if (type === "toggle") defaultConfig = { stateKey: `toggle_${Math.random().toString(36).substr(2, 5)}`, states: { on: [], off: [] } };

    const newAction: InteractionAction = {
      id: Math.random().toString(36).substr(2, 9),
      type: type as any,
      config: defaultConfig
    };

    if (onUpdateStack) {
      onUpdateStack([...actions, newAction]);
    } else {
      addAction(interactionId, newAction);
    }
  };

  return (
    <div className="p-2 space-y-2">
      {actions.map((action, index) => {
        const typeData = ACTION_TYPES.find(t => t.id === action.type);
        const Icon = typeData?.icon || Box;

        return (
          <div key={action.id} className="rounded-lg bg-background-elevated border border-border-primary p-3 relative group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-mono text-text-tertiary bg-background py-0.5 px-1.5 rounded border border-border-primary/50">{index + 1}</span>
                 <Icon className="w-3.5 h-3.5 text-accent" />
                 <span className="text-xs font-medium text-white">{typeData?.label || action.type}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => index > 0 && handleReorder(index, index - 1)}
                  className="p-1 text-text-tertiary hover:text-white disabled:opacity-30"
                >
                   <ChevronUp className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => index < actions.length - 1 && handleReorder(index, index + 1)}
                  className="p-1 text-text-tertiary hover:text-white disabled:opacity-30"
                >
                   <ChevronDown className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => handleRemove(index)} 
                  className="p-1 text-text-tertiary hover:text-destructive"
                >
                   <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            <ActionForm 
              interactionId={interactionId}
              action={action} 
              animations={animations}
              onUpdate={(config) => handleUpdate(index, config)} 
            />
          </div>
        );
      })}

      <div className="pt-2">
         <div className="relative group/select">
            <select 
              onChange={(e) => { 
                if (e.target.value) {
                  handleAddAction(e.target.value);
                  e.target.value = "";
                }
              }} 
              defaultValue=""
              className="w-full h-8 bg-background-elevated border border-border-primary rounded-md text-[10px] font-medium text-text-secondary outline-none px-2 appearance-none text-center cursor-pointer hover:bg-background hover:text-white transition-colors"
            >
               <option value="" disabled>+ Add Action Step</option>
               {ACTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover/select:text-white text-text-tertiary">
               <ChevronDown className="w-3 h-3" />
            </div>
         </div>
      </div>
    </div>
  );
}
