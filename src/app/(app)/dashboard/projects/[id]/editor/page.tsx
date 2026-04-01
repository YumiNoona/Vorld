"use client";

import React, { useState, Suspense } from "react";
import { Viewport } from "@/components/editor/Viewport";
import { MeshExplorer } from "@/components/editor/MeshExplorer";
import { InteractionPanel } from "@/components/editor/InteractionPanel";
import { PublishSheet } from "@/components/shared/PublishSheet";
import { 
  ChevronLeft, 
  Save, 
  Play, 
  Share2, 
  Loader2,
  Check,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editorStore";

export default function EditorPage({ params }: { params: { id: string } }) {
  const { isDirty, setDirty } = useEditorStore();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>("Just now");

  const handleSave = () => {
    setIsSaving(true);
    // TODO: Supabase Save logic
    setTimeout(() => {
      setIsSaving(false);
      setDirty(false);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-12 border-b border-border-primary px-4 flex items-center justify-between shrink-0 z-50 bg-background">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/projects"
            className="p-1.5 rounded-lg hover:bg-background-elevated text-text-tertiary hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-border-primary" />
          <div className="flex flex-col">
             <h1 className="text-sm font-semibold text-white tracking-tight">Nike Air Max 2024</h1>
             <p className="text-[10px] text-text-tertiary">Project ID: {params.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[10px] text-text-tertiary mr-2">
             {isDirty ? (
               <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                  Unsaved changes
               </span>
             ) : (
               <span className="flex items-center gap-1.5 text-success">
                  <Check className="w-3 h-3" />
                  Saved {lastSaved}
               </span>
             )}
          </div>
          
          <button 
            disabled={!isDirty || isSaving}
            onClick={handleSave}
            className="h-8 px-3 rounded-md border border-border-primary hover:bg-background-elevated text-xs font-medium text-text-primary disabled:opacity-40 transition-colors flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </button>
          <button className="h-8 px-3 rounded-md bg-background-elevated hover:bg-background-overlay text-xs font-medium text-text-primary transition-colors flex items-center gap-2">
            <Play className="w-3 h-3" />
            Preview
          </button>
          <PublishSheet>
            <button className="h-8 px-4 rounded-md bg-accent hover:bg-accent-hover text-xs font-medium text-white shadow-lg active:scale-95 transition-all flex items-center gap-2">
              Publish
              <Share2 className="w-3 h-3" />
            </button>
          </PublishSheet>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Mesh Explorer */}
        <MeshExplorer />

        {/* Center: 3D Viewport */}
        <div className="flex-1 relative bg-[#0d0d0d] overflow-hidden">
          <Viewport />
          
          {/* Bottom info bar */}
          <div className="absolute bottom-4 left-4 right-4 h-10 flex items-center justify-between pointer-events-none">
             <div className="px-3 h-full rounded-lg bg-black/60 backdrop-blur-md border border-white/5 flex items-center gap-4 text-[10px] font-medium text-text-tertiary pointer-events-auto">
                <span>Meshes: 24</span>
                <div className="w-px h-3 bg-white/10" />
                <span>Vertices: 12,402</span>
                <div className="w-px h-3 bg-white/10" />
                <span>Texture: 4.2MB</span>
             </div>
             
             <div className="px-3 h-full rounded-lg bg-black/60 backdrop-blur-md border border-white/5 flex items-center gap-2 pointer-events-auto">
                <button className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                   <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-text-secondary uppercase tracking-widest px-2">Orbit Mode</span>
                <button className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                   <ChevronRight className="w-3.5 h-3.5" />
                </button>
             </div>
          </div>
        </div>

        {/* Right Panel: Interaction Config */}
        <InteractionPanel />
      </div>
    </div>
  );
}
