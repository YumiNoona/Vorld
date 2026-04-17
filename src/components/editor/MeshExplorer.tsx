"use client";

import React, { useMemo, useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { useGLTF } from "@react-three/drei";
import { 
  Search, 
  Box, 
  Eye,
  Loader2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function MeshExplorer({ width, isCollapsed }: { width?: number, isCollapsed?: boolean }) {
  const supabase = useMemo(() => createClient(), []);
  const { modelPath } = useEditorStore();
  
  const modelUrl = useMemo(() => {
    if (!modelPath) return null;
    return supabase.storage.from('models').getPublicUrl(modelPath).data.publicUrl;
  }, [modelPath, supabase]);

  // Handle styles
  const panelStyle = {
    width: width !== undefined ? `${width}px` : '384px',
  };

  return (
    <aside 
      style={panelStyle}
      className={cn(
        "border-r border-[--border] bg-[--surface] shrink-0 flex flex-col z-10 editor-panel-transition",
        isCollapsed ? "overflow-hidden border-none opacity-0" : "opacity-100"
      )}
    >
      {!modelUrl ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <Loader2 className="w-5 h-5 text-[--accent] animate-spin" />
        </div>
      ) : (
        <MeshList url={modelUrl} />
      )}
    </aside>
  );
}

function MeshList({ url }: { url: string }) {
  const { selectedMeshes, selectMesh, interactions } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const { nodes } = useGLTF(url) as any;

  const meshes = useMemo(() => {
    const allMeshes = Object.values(nodes || {}).filter((n: any) => n.isMesh);
    if (!searchQuery) return allMeshes;
    return allMeshes.filter((m: any) => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [nodes, searchQuery]);

  return (
    <>
      <div className="h-12 border-b border-[--border] px-4 flex items-center justify-between shrink-0 bg-[--bg]/10">
        {isSearching ? (
          <div className="flex-1 flex items-center gap-2 animate-in slide-in-from-right-2 duration-200">
            <Search className="w-3.5 h-3.5 text-[--text-3]" />
            <input 
              autoFocus
              placeholder="Search meshes..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-[--text-1] placeholder:text-[--text-3]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setIsSearching(false)}
            />
            <button onClick={() => { setSearchQuery(""); setIsSearching(false); }} className="p-1 hover:bg-[--surface-raised] rounded-md transition-colors">
              <X className="w-3 h-3 text-[--text-3]" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-sm font-semibold text-[--text-2] tracking-tight">Scene Explorer</span>
            <button 
              onClick={() => setIsSearching(true)}
              className="p-1.5 rounded-md hover:bg-[--surface-raised] text-[--text-3] hover:text-[--text-1] transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 scrollbar-none space-y-1">
        {meshes.map((mesh: any) => {
          const isSelected = selectedMeshes.has(mesh.uuid);
          const hasInteractions = (interactions[mesh.uuid]?.length > 0) || (interactions[mesh.name]?.length > 0);
          
          return (
            <button
              key={mesh.uuid}
              onClick={(e) => selectMesh(mesh.uuid, mesh.name, { 
                ctrl: e.ctrlKey || e.metaKey, 
                shift: e.shiftKey 
              })}
              className={cn(
                "group flex items-center gap-3 h-9 w-full px-3 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]",
                isSelected 
                  ? "bg-[--accent-subtle] text-[--accent] ring-1 ring-inset ring-[--accent-border]/50" 
                  : "text-[--text-2] hover:bg-[--surface-raised] hover:text-[--text-1]"
              )}
            >
              <Box className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-[--accent]" : "text-[--text-3]")} />
              <span className="truncate flex-1 text-left text-[13px]">{mesh.name}</span>
              
              {hasInteractions && (
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[--accent-subtle]">
                   <div className="w-1.5 h-1.5 rounded-full bg-[--accent]" />
                </div>
              )}
              
              <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
            </button>
          );
        })}

        {meshes.length === 0 && (
          <div className="p-8 text-center">
             <p className="text-xs text-text-tertiary font-medium">No meshes found</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[--border] bg-[--bg]">
         <p className="text-xs text-[--text-3] font-medium leading-loose">
            Total nodes: {meshes.length}
         </p>
      </div>
    </>
  );
}
