"use client";

import React from "react";
import { 
  X, Box, ChevronDown, ChevronUp, Plus, Search
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { 
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem 
} from "@/components/ui/command";
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
         <Popover.Root>
            <Popover.Trigger asChild>
               <button className="w-full h-10 bg-bg-primary border border-border-default border-dashed rounded-xl text-[11px] font-bold text-text-tertiary hover:text-accent hover:border-accent hover:bg-accent/5 transition-all flex items-center justify-center gap-2 group/add shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-bg-secondary flex items-center justify-center group-hover/add:bg-accent group-hover/add:text-white transition-colors">
                     <Plus className="w-3 h-3" />
                  </div>
                  ADD INTERACTION ACTION
               </button>
            </Popover.Trigger>
            <Popover.Portal>
               <Popover.Content 
                  side="bottom" 
                  align="center" 
                  sideOffset={8}
                  className="w-64 bg-bg-primary/95 backdrop-blur-xl border border-border-default rounded-xl shadow-2xl z-[100] p-1 animate-in fade-in zoom-in-95 duration-150"
               >
                  <Command>
                     <CommandInput placeholder="Search actions..." className="h-9" />
                     <CommandList className="max-h-[280px]">
                        <CommandEmpty>No action found.</CommandEmpty>
                        <CommandGroup heading="Visual Effects">
                           {ACTION_TYPES.filter(a => ["highlight", "glow", "scale"].includes(a.id)).map(type => (
                              <CommandItem 
                                 key={type.id} 
                                 onSelect={() => handleAddAction(type.id)}
                                 className="flex items-center gap-2 px-2 py-2 cursor-pointer"
                              >
                                 <type.icon className="w-3.5 h-3.5 text-accent" />
                                 <span className="text-xs font-medium">{type.label}</span>
                              </CommandItem>
                           ))}
                        </CommandGroup>
                        <CommandGroup heading="Scene Flow">
                           {ACTION_TYPES.filter(a => ["camera_focus", "animation", "audio"].includes(a.id)).map(type => (
                              <CommandItem 
                                 key={type.id} 
                                 onSelect={() => handleAddAction(type.id)}
                                 className="flex items-center gap-2 px-2 py-2 cursor-pointer"
                              >
                                 <type.icon className="w-3.5 h-3.5 text-blue-400" />
                                 <span className="text-xs font-medium">{type.label}</span>
                              </CommandItem>
                           ))}
                        </CommandGroup>
                        <CommandGroup heading="Logic & UI">
                           {ACTION_TYPES.filter(a => ["info_panel", "url", "toggle"].includes(a.id)).map(type => (
                              <CommandItem 
                                 key={type.id} 
                                 onSelect={() => handleAddAction(type.id)}
                                 className="flex items-center gap-2 px-2 py-2 cursor-pointer"
                              >
                                 <type.icon className="w-3.5 h-3.5 text-text-tertiary" />
                                 <span className="text-xs font-medium">{type.label}</span>
                              </CommandItem>
                           ))}
                        </CommandGroup>
                     </CommandList>
                  </Command>
               </Popover.Content>
            </Popover.Portal>
         </Popover.Root>
      </div>
    </div>
  );
}
