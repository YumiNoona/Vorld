"use client";

import React, { useState, Suspense, useEffect } from "react";
import { Viewport } from "@/components/editor/Viewport";
import { MeshExplorer } from "@/components/editor/MeshExplorer";
import { InteractionPanel } from "@/components/editor/InteractionPanel";
import { PublishSheet } from "@/components/shared/PublishSheet";
import { InfoPanelOverlay } from "@/components/shared/InfoPanelOverlay";
import { 
  ChevronLeft, 
  Save, 
  Play, 
  Check,
  ChevronRight,
  Globe,
  Loader2,
  StopCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editorStore";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const supabase = createClient();
  const { isDirty, setDirty, setModelPath, setInteractions, setCamera, interactions, camera, reset, previewMode, setPreviewMode } = useEditorStore();
  
  const handlePreviewToggle = () => setPreviewMode(!previewMode);
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
    
      if (error) {
        toast.error("Failed to load project");
        return;
      }

      if (data) {
        setProject(data);
        setModelPath(data.model_path);
        
        // Load interactions and settings
        if (data.interactions) {
          setInteractions(data.interactions);
        }
        
        if (data.settings?.camera) {
          setCamera(data.settings.camera.position, data.settings.camera.target);
        }
        
        // Small delay to ensure state is set before clearing dirty flag
        setTimeout(() => setDirty(false), 100);
      }
      setIsLoading(false);
    }
    
    if (id) loadProject();

    return () => reset(); // Cleanup on unmount
  }, [id, supabase, setModelPath, setInteractions, setCamera, setDirty, reset]);

  // Hybrid Autosave Logic (3s Debounce)
  useEffect(() => {
    if (!isDirty || isLoading || isSaving || isAutosaving) return;

    const timer = setTimeout(async () => {
      setIsAutosaving(true);
      try {
        const { error } = await supabase
          .from('projects')
          .update({ 
            interactions: interactions,
            settings: {
              camera: {
                position: camera.position,
                target: camera.target
              }
            }
          })
          .eq('id', id);

        if (!error) {
          setDirty(false);
          setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err) {
        console.error("Autosave failed:", err);
      } finally {
        setIsAutosaving(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isDirty, interactions, camera, id, supabase, setDirty, isLoading, isSaving, isAutosaving]);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Explicit V2 storage format
    const payload = {
      updated_at: new Date().toISOString(),
      interactions: {
        version: 2,
        items: interactions
      },
      settings: {
        camera
      }
    };
    
    const savePromise = async () => {
      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    };

    toast.promise(savePromise(), {
      loading: 'Saving your changes...',
      success: () => {
        setDirty(false);
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setIsSaving(false);
        setShowSavedFeedback(true);
        setTimeout(() => setShowSavedFeedback(false), 2000);
        return 'Project saved successfully';
      },
      error: (err) => {
        setIsSaving(false);
        return `Failed to save: ${err.message}`;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background space-y-4">
        <h2 className="text-xl font-semibold text-white">Project not found</h2>
        <Link href="/dashboard/projects" className="text-accent hover:underline">Return to projects</Link>
      </div>
    );
  }

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
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              {project?.name || "Untitled Project"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-text-tertiary uppercase tracking-widest font-medium">
                {isAutosaving ? (
                  <span className="flex items-center gap-1.5 animate-pulse text-accent">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    Saving...
                  </span>
                ) : isDirty ? (
                  <span className="text-warning">Unsaved changes</span>
                ) : lastSaved ? (
                  <span className="text-success-text">Saved at {lastSaved}</span>
                ) : (
                  "Ready"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Save Status (Mobile/Compact) */}
        <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-full bg-background-subtle border border-border-primary">
           <div className="flex items-center gap-2">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-500",
                isDirty ? "bg-warning animate-pulse" : "bg-success"
              )} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                {isDirty ? "Changes detected" : "Syncing clear"}
              </span>
           </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={cn(
              "h-8 px-4 rounded-md text-xs font-medium transition-all flex items-center gap-2 shadow-lg active:scale-95",
              showSavedFeedback 
                ? "bg-success text-white" 
                : "bg-background-elevated hover:bg-background-overlay text-text-primary border border-border-primary disabled:opacity-50"
            )}
          >
            {isSaving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : showSavedFeedback ? (
              <Check className="w-3 h-3" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            {showSavedFeedback ? "Saved!" : "Save"}
          </button>
          
          <PublishSheet projectId={id} initialIsPublished={project.is_public} projectName={project.name}>
            <button className="h-8 px-4 rounded-md bg-accent hover:bg-accent-hover text-xs font-medium text-white shadow-lg active:scale-95 transition-all flex items-center gap-2">
              Publish
              <Globe className="w-3 h-3" />
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
          {previewMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in duration-300">
               <div className="px-6 py-2.5 rounded-full bg-accent border border-accent-border shadow-2xl shadow-accent/40 flex items-center gap-4 border-white/20">
                  <div className="flex items-center gap-2">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                     </span>
                     <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Testing Interactions</span>
                  </div>
                  <div className="h-4 w-px bg-white/20" />
                  <button 
                    onClick={() => setPreviewMode(false)}
                    className="text-[10px] font-bold text-white/80 hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-widest group"
                  >
                    <StopCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    Stop
                  </button>
               </div>
            </div>
          )}
          <Viewport />
          
          {/* Bottom info bar */}
          <div className="absolute bottom-4 left-4 right-4 h-10 flex items-center justify-between pointer-events-none">
             <div className="px-3 h-full rounded-lg bg-black/60 backdrop-blur-md border border-white/5 flex items-center gap-4 text-[10px] font-medium text-text-tertiary pointer-events-auto">
                <span>Model: {project.model_path.split('/').pop()}</span>
                <div className="w-px h-3 bg-white/10" />
                <span>Format: GLB</span>
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

      <InfoPanelOverlay />
    </div>
  );
}
