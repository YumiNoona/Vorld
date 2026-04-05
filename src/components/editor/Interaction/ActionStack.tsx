"use client";

import React from "react";
import { 
  X, Box, ChevronDown, ChevronUp, Plus
} from "lucide-react";
import { useEditorStore, InteractionAction } from "@/stores/editorStore";
import { ActionForm, ACTION_TYPES } from "./ActionForms";
import { cn } from "@/lib/utils";

interface ActionStackProps {
  interactionId: string;
  actions: InteractionAction[];
  animations: string[];
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
    if (type === "highlight" || type === "glow") defaultConfig = { color: "#10b981", duration: 0.15 };
    if (type === "scale") defaultConfig = { value: 1.1, duration: 0.15 };
    if (type === "camera_focus") defaultConfig = { offset: [0, 1, 5], duration: 0.8 };
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
    <div className="p-3 space-y-3 bg-bg-secondary/30">
      {actions.map((action, index) => {
        const typeData = ACTION_TYPES.find(t => t.id === action.type);
        const Icon = typeData?.icon || Box;

        return (
          <div key={action.id} className="rounded-xl bg-bg-primary border border-border-default p-4 relative group transition-all duration-150 hover:border-text-tertiary shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <div className="text-[10px] font-semibold text-text-tertiary bg-bg-secondary h-5 w-5 flex items-center justify-center rounded-md border border-border-default">
                   {index + 1}
                 </div>
                 <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-accent" />
                    <span className="text-sm font-medium text-text-primary">{typeData?.label || action.type}</span>
                 </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => index > 0 && handleReorder(index, index - 1)}
                  className="p-1 text-text-tertiary hover:text-text-primary"
                >
                   <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => index < actions.length - 1 && handleReorder(index, index + 1)}
                  className="p-1 text-text-tertiary hover:text-text-primary"
                >
                   <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleRemove(index)} 
                  className="p-1 ml-1 text-text-tertiary hover:text-red-500"
                >
                   <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pl-8">
              <ActionForm 
                interactionId={interactionId}
                action={action} 
                animations={animations}
                onUpdate={(config) => handleUpdate(index, config)} 
              />
            </div>
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
              className="w-full h-10 bg-bg-primary border border-border-default rounded-lg text-sm font-medium text-text-secondary outline-none px-4 appearance-none text-center cursor-pointer hover:bg-bg-secondary hover:text-text-primary transition-all shadow-sm"
            >
               <option value="" disabled>+ Add Action</option>
               {ACTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary">
               <Plus className="w-3.5 h-3.5" />
            </div>
         </div>
      </div>
    </div>
  );
}
