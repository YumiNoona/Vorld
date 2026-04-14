"use client";

import React, { useState, useEffect } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { 
  Pencil, 
  Trash2, 
  EyeOff, 
  Eye, 
  Maximize2, 
  ChevronRight,
  MousePointer2
} from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";

interface EditorContextMenuProps {
  children: React.ReactNode;
}

export function EditorContextMenu({ children }: EditorContextMenuProps) {
  const { 
    primarySelection, 
    selectedMeshes, 
    hiddenMeshes, 
    isolatedId,
    toggleMeshVisibility, 
    toggleIsolate,
    renameMesh,
    deleteMesh,
    primarySelectionName 
  } = useEditorStore();

  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState("");

  const targetId = primarySelection;
  const isHidden = targetId ? hiddenMeshes.has(targetId) : false;
  const isIsolated = targetId === isolatedId;

  const handleRename = () => {
    if (targetId && tempName.trim()) {
      renameMesh(targetId, tempName.trim());
      setIsRenaming(false);
    }
  };

  if (!targetId) {
    return (
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          {children}
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content 
            className="min-w-[160px] bg-bg-primary/95 backdrop-blur-xl border border-border-default rounded-xl p-1.5 shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="px-2.5 py-2 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
              Canvas
            </div>
            <ContextMenu.Item 
              disabled
              className="group flex items-center justify-between px-2.5 py-2 text-xs font-medium text-text-secondary rounded-lg outline-none opacity-50"
            >
              <span>No object selected</span>
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    );
  }

  return (
    <ContextMenu.Root onOpenChange={(open) => {
      if (open) setTempName(primarySelectionName || targetId || "");
      else setIsRenaming(false);
    }}>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>
      
      <ContextMenu.Portal>
        <ContextMenu.Content 
          className="min-w-[180px] bg-bg-primary/95 backdrop-blur-xl border border-border-default rounded-xl p-1.5 shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-100"
        >
           <div className="px-2.5 py-2 mb-1 flex items-center gap-2 border-b border-border-default/50">
             <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[11px] font-bold text-text-primary truncate max-w-[120px]">
                {selectedMeshes.size > 1 
                  ? `${selectedMeshes.size} Objects Selected` 
                  : (primarySelectionName || "Selected Mesh")}
              </span>
          </div>

          <ContextMenu.Item 
            onSelect={(e) => { e.preventDefault(); setIsRenaming(true); }}
            className="group flex items-center justify-between px-2.5 py-2 text-xs font-medium text-text-primary rounded-lg outline-none hover:bg-accent hover:text-white cursor-default transition-colors"
          >
            <div className="flex items-center gap-2">
              <Pencil className="w-3.5 h-3.5" />
              <span>Rename</span>
            </div>
            <span className="text-[10px] opacity-40 group-hover:opacity-100">Enter</span>
          </ContextMenu.Item>

          <ContextMenu.Item 
            onSelect={() => toggleMeshVisibility(targetId)}
            className="group flex items-center justify-between px-2.5 py-2 text-xs font-medium text-text-primary rounded-lg outline-none hover:bg-accent hover:text-white cursor-default transition-colors"
          >
            <div className="flex items-center gap-2">
              {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{isHidden ? "Show" : "Hide"}</span>
            </div>
            <span className="text-[10px] opacity-40 group-hover:opacity-100">H</span>
          </ContextMenu.Item>

          <ContextMenu.Item 
            onSelect={() => toggleIsolate(isIsolated ? null : targetId)}
            className="group flex items-center justify-between px-2.5 py-2 text-xs font-medium text-text-primary rounded-lg outline-none hover:bg-accent hover:text-white cursor-default transition-colors"
          >
            <div className="flex items-center gap-2">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isIsolated ? "Exit Isolation" : "Isolate"}</span>
            </div>
            <span className="text-[10px] opacity-40 group-hover:opacity-100">I</span>
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px bg-border-default my-1" />

          <ContextMenu.Item 
            onSelect={() => targetId && deleteMesh(targetId)}
            className="group flex items-center justify-between px-2.5 py-2 text-xs font-medium text-red-500 rounded-lg outline-none hover:bg-red-500 hover:text-white cursor-default transition-colors"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </div>
            <span className="text-[10px] opacity-40 group-hover:opacity-100">Del</span>
          </ContextMenu.Item>

          {isRenaming && (
            <div className="absolute inset-0 bg-bg-primary/95 backdrop-blur-md p-1.5 flex flex-col gap-2 rounded-xl border border-accent/30 shadow-2xl">
              <input
                autoFocus
                className="w-full bg-bg-secondary border border-border-default rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") setIsRenaming(false);
                }}
              />
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleRename}
                  className="flex-1 h-7 bg-accent text-white text-[10px] font-bold rounded-md hover:brightness-110"
                >
                  Apply
                </button>
                <button 
                  onClick={() => setIsRenaming(false)}
                  className="px-2 h-7 bg-bg-secondary text-text-secondary text-[10px] font-bold rounded-md hover:bg-border-default"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
