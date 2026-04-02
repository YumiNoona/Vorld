"use client";

import React from "react";
import { useEditorStore } from "@/stores/editorStore";
import { useGLTF } from "@react-three/drei";
import { 
  Search, 
  Eye, 
  EyeOff, 
  Box, 
  Layers, 
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export function MeshExplorer() {
  const supabase = createClient();
  const { modelPath, selectedMeshes, toggleMeshSelection, interactions } = useEditorStore();
  
  const modelUrl = React.useMemo(() => {
    if (!modelPath) return null;
    return supabase.storage.from('models').getPublicUrl(modelPath).data.publicUrl;
  }, [modelPath, supabase]);

  const { nodes, isLoading } = useGLTF(modelUrl || "") as any;

  if (!modelUrl || isLoading) {
    return (
      <aside className="w-64 border-r border-border-primary bg-background shrink-0 flex flex-col z-10 items-center justify-center">
        <Loader2 className="w-5 h-5 text-accent animate-spin" />
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r border-border-primary bg-background shrink-0 flex flex-col z-10">
      <div className="h-10 border-b border-border-primary px-4 flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold text-white uppercase tracking-widest px-2">Explorer</span>
        <button className="p-1 rounded text-text-tertiary hover:text-white transition-colors">
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 scrollbar-none">
        <div className="space-y-0.5">
          {Object.values(nodes)
            .filter((n: any) => n.isMesh)
            .map((mesh: any) => {
               const isSelected = selectedMeshes.includes(mesh.name);
               const hasInteractions = interactions[mesh.name]?.length > 0;
               return (
                 <button
                   key={mesh.name}
                   onClick={() => toggleMeshSelection(mesh.name)}
                   className={cn(
                     "group flex items-center gap-2 h-8 w-full px-2 rounded-md text-xs font-medium transition-colors",
                     isSelected 
                       ? "bg-accent-subtle text-accent" 
                       : "text-text-secondary hover:bg-background-elevated hover:text-text-primary"
                   )}
                 >
                   <Box className="w-3.5 h-3.5 shrink-0" />
                   <span className="truncate flex-1 text-left">{mesh.name}</span>
                   {hasInteractions && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                   <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                 </button>
               );
            })
          }
        </div>
      </div>
    </aside>
  );
}
