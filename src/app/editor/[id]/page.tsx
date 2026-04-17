"use client";

import React, { useState, Suspense, useEffect, useMemo, useRef, useCallback } from "react";
import { Viewport } from "@/components/editor/Viewport";
import { MeshExplorer } from "@/components/editor/MeshExplorer";
import { InteractionPanel } from "@/components/editor/InteractionPanel";
import { PublishSheet } from "@/components/shared/PublishSheet";
import { InfoPanelOverlay } from "@/components/shared/InfoPanelOverlay";
import { 
  ChevronLeft, 
  Save, 
  Check,
  ChevronRight,
  Globe,
  Loader2,
  Box,
  Square,
  Image as ImageIcon,
  Maximize,
  ArrowDownToLine,
  ArrowRight,
  Pencil
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEditorStore, RenderMode, CameraMode } from "@/stores/editorStore";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

// --- Extracted Components for Performance & Stability ---

const ResizeHandle = ({ 
  side, 
  isCollapsed, 
  onMouseDown, 
  onToggle, 
  onReset 
}: { 
  side: 'left' | 'right', 
  isCollapsed: boolean,
  onMouseDown: (e: React.MouseEvent) => void,
  onToggle: () => void,
  onReset: () => void
}) => {
  return (
    <div 
      className={cn(
        "resizer-handle w-[6px] group relative flex items-center justify-center transition-all z-50 shrink-0 cursor-col-resize",
        "before:content-[''] before:absolute before:inset-y-0 before:-inset-x-2 before:z-0" // Increase hit area
      )}
      onMouseDown={onMouseDown}
      onDoubleClick={onReset}
    >
      {/* The visual line - liquid emerald glow on hover */}
      <div className="w-[1px] h-full bg-border-default group-hover:bg-accent group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-300 pointer-events-none z-10" />
      
      {/* Collapse Button - only visible on hover */}
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { 
          e.stopPropagation(); 
          e.preventDefault();
          onToggle(); 
        }}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-5 h-10 bg-bg-primary border border-border-default rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:border-accent hover:bg-bg-secondary shadow-md active:scale-90 z-[60]",
          side === 'left' ? "-right-2.5" : "-left-2.5"
        )}
      >
        {side === 'left' ? (
          isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-accent" /> : <ChevronLeft className="w-3.5 h-3.5 text-text-tertiary" />
        ) : (
          isCollapsed ? <ChevronLeft className="w-3.5 h-3.5 text-accent" /> : <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
        )}
      </button>
    </div>
  );
};

// --- Main Page Component ---

export default function EditorPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = useMemo(() => createClient(), []);
  
  const isDirty = useEditorStore(state => state.isDirty);
  const setDirty = useEditorStore(state => state.setDirty);
  const setModelPath = useEditorStore(state => state.setModelPath);
  const setInteractions = useEditorStore(state => state.setInteractions);
  const setCamera = useEditorStore(state => state.setCamera);
  const interactions = useEditorStore(state => state.interactions);
  const camera = useEditorStore(state => state.camera);
  const reset = useEditorStore(state => state.reset);
  const previewMode = useEditorStore(state => state.previewMode);
  const setPreviewMode = useEditorStore(state => state.setPreviewMode);
  const renderMode = useEditorStore(state => state.renderMode);
  const setRenderMode = useEditorStore(state => state.setRenderMode);
  const cameraMode = useEditorStore(state => state.cameraMode);
  const setCameraMode = useEditorStore(state => state.setCameraMode);
  
  const { 
    leftWidth, rightWidth, leftCollapsed, rightCollapsed,
    setLeftWidth, setRightWidth, toggleLeftCollapse, toggleRightCollapse,
    resetPanelWidths
  } = useEditorStore();

  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  // Resize Engine State
  const dragInfo = useRef<{ side: 'left' | 'right' | null, startX: number, startWidth: number }>({ side: null, startX: 0, startWidth: 0 });
  const rafRunning = useRef(false);

  // Optimized Listeners: Remove width dependencies to prevent re-mounting listeners
  useEffect(() => {
    // Initial Load
    const savedLeft = localStorage.getItem("vorld_lw");
    const savedRight = localStorage.getItem("vorld_rw");
    if (savedLeft) useEditorStore.getState().setLeftWidth(parseInt(savedLeft));
    if (savedRight) useEditorStore.getState().setRightWidth(parseInt(savedRight));

    const onMouseMove = (e: MouseEvent) => {
      if (!dragInfo.current.side || rafRunning.current) return;
      
      rafRunning.current = true;
      requestAnimationFrame(() => {
        const info = dragInfo.current;
        if (!info.side) {
           rafRunning.current = false;
           return;
        }

        const delta = e.clientX - info.startX;
        const totalWidth = window.innerWidth;
        const MIN_VIEWPORT = 300; // Slightly smaller min for flexibility

        if (info.side === 'left') {
          const newWidth = info.startWidth + delta;
          const currentRight = useEditorStore.getState().rightWidth;
          const maxLeftAllowed = totalWidth - currentRight - MIN_VIEWPORT;
          useEditorStore.getState().setLeftWidth(Math.min(newWidth, maxLeftAllowed));
        } else {
          const newWidth = info.startWidth - delta;
          const currentLeft = useEditorStore.getState().leftWidth;
          const maxRightAllowed = totalWidth - currentLeft - MIN_VIEWPORT;
          useEditorStore.getState().setRightWidth(Math.min(newWidth, maxRightAllowed));
        }
        rafRunning.current = false;
      });
    };

    const onMouseUp = () => {
      if (dragInfo.current.side) {
        document.body.classList.remove("resizing");
        const state = useEditorStore.getState();
        localStorage.setItem("vorld_lw", state.leftWidth.toString());
        localStorage.setItem("vorld_rw", state.rightWidth.toString());
        dragInfo.current.side = null;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseleave", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseleave", onMouseUp);
    };
  }, []); // Run once on mount

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
        if (data.interactions) setInteractions(data.interactions);
        if (data.settings?.camera) setCamera(data.settings.camera.position, data.settings.camera.target);
        setTimeout(() => setDirty(false), 100);
      }
      setIsLoading(false);
    }
    
    if (id) loadProject();
    return () => reset();
  }, [id, supabase, setModelPath, setInteractions, setCamera, setDirty, reset]);

  const handleTitleSubmit = async () => {
    if (!tempTitle.trim() || tempTitle === project.name) {
      setIsEditingTitle(false);
      return;
    }
    try {
      const { error } = await supabase.from('projects').update({ name: tempTitle.trim() }).eq('id', id);
      if (error) throw error;
      setProject({ ...project, name: tempTitle.trim() });
      toast.success("Project renamed");
    } catch {
      toast.error("Failed to rename project");
    } finally {
      setIsEditingTitle(false);
    }
  };

  useEffect(() => {
    if (!isDirty || isLoading || isSaving || isAutosaving) return;
    const timer = setTimeout(async () => {
      setIsAutosaving(true);
      try {
        await supabase.from('projects').update({ 
          interactions,
          settings: { camera: { position: camera.position, target: camera.target } }
        }).eq('id', id);
        setDirty(false);
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
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
    const savePromise = async () => {
      const { error } = await supabase.from('projects').update({
        updated_at: new Date().toISOString(),
        interactions: { version: 2, items: interactions },
        settings: { camera }
      }).eq('id', id);
      if (error) throw error;
      return true;
    };
    toast.promise(savePromise(), {
      loading: 'Saving project...',
      success: () => {
        setDirty(false);
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setIsSaving(false);
        setShowSavedFeedback(true);
        setTimeout(() => setShowSavedFeedback(false), 2000);
        return 'Project saved';
      },
      error: (err) => {
        setIsSaving(false);
        return `Save failed: ${err.message}`;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-primary">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const startResize = (side: 'left' | 'right', e: React.MouseEvent) => {
    dragInfo.current = { 
      side, 
      startX: e.clientX, 
      startWidth: side === 'left' ? leftWidth : rightWidth 
    };
    document.body.classList.add("resizing");
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden selection:bg-accent/20">
      <header className="h-12 border-b border-border-default px-4 flex items-center justify-between shrink-0 z-50 bg-bg-primary">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects" className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-all duration-150">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-border-default" />
          <div className="flex flex-col group/title cursor-pointer" onClick={() => { if (!isEditingTitle) { setTempTitle(project?.name || ""); setIsEditingTitle(true); } }}>
            {isEditingTitle ? (
              <input autoFocus className="text-sm font-bold text-text-primary bg-bg-secondary border border-accent/30 rounded px-1 -ml-1 outline-none h-5 flex items-center" value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} onBlur={handleTitleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSubmit(); if (e.key === 'Escape') setIsEditingTitle(false); }} />
            ) : (
              <h1 className="text-sm font-bold text-text-primary tracking-tight leading-none flex items-center gap-2">
                {project?.name || "Untitled Project"}
                <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity shrink-0" />
              </h1>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-text-secondary font-medium tracking-tight">
                {isAutosaving ? <span className="flex items-center gap-1.5 animate-pulse text-accent"><Loader2 className="w-2.5 h-2.5 animate-spin" />Autosaving...</span> : isDirty ? <span className="text-amber-500">Unsaved changes</span> : lastSaved ? <span className="text-accent">Sync clear • {lastSaved}</span> : "Cloud synced"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={isSaving || !isDirty} className={cn("h-8 px-4 rounded-md text-xs font-semibold transition-all flex items-center gap-2 active:scale-95", showSavedFeedback ? "bg-accent text-white" : "bg-bg-secondary hover:bg-bg-primary text-text-primary border border-border-default disabled:opacity-50")}>
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : showSavedFeedback ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
            {showSavedFeedback ? "Saved" : "Save"}
          </button>
          <div className="h-4 w-px bg-border-default mx-1" />
          <PublishSheet projectId={id} initialIsPublished={project?.is_public} projectName={project?.name}>
            <button className="h-8 px-4 rounded-md bg-accent hover:brightness-110 text-xs font-semibold text-white shadow-sm active:scale-95 transition-all flex items-center gap-2">Publish<Globe className="w-3 h-3" /></button>
          </PublishSheet>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <MeshExplorer width={leftWidth} isCollapsed={leftCollapsed} />
        <ResizeHandle side="left" isCollapsed={leftCollapsed} onMouseDown={(e) => startResize('left', e)} onToggle={toggleLeftCollapse} onReset={resetPanelWidths} />
        <div className="flex-1 relative bg-bg-secondary overflow-hidden">
          {previewMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
               <div className="px-6 py-2 rounded-full bg-accent text-white border border-white/20 shadow-xl flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span>
                     <span className="text-[11px] font-semibold text-white tracking-tight">Live Test Mode</span>
                  </div>
                  <div className="h-4 w-px bg-white/20" />
                  <button onClick={() => setPreviewMode(false)} className="text-[11px] font-semibold hover:opacity-80 transition-opacity">Exit</button>
               </div>
            </div>
          )}
          <Viewport />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40 pointer-events-none">
             <div className="flex p-1 rounded-xl bg-bg-primary/90 backdrop-blur-md border border-border-default shadow-lg pointer-events-auto">
                {[{ id: 'free', icon: Maximize, label: 'Free' }, { id: 'top', icon: ArrowDownToLine, label: 'Top' }, { id: 'side', icon: ArrowRight, label: 'Side' }].map((m) => (
                  <button key={m.id} onClick={() => setCameraMode(m.id as CameraMode)} className={cn("p-2 rounded-lg flex items-center gap-2 transition-all duration-150", cameraMode === m.id ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary")} title={m.label}><m.icon className="w-3.5 h-3.5" />{cameraMode === m.id && <span className="text-[11px] font-semibold tracking-tight pr-1">{m.label}</span>}</button>
                ))}
             </div>
             <div className="w-px h-6 bg-border-default mx-1 shrink-0" />
             <div className="flex p-1 rounded-xl bg-bg-primary/90 backdrop-blur-md border border-border-default shadow-lg pointer-events-auto">
                {[{ id: 'texture', icon: ImageIcon, label: 'Texture' }, { id: 'solid', icon: Square, label: 'Solid' }, { id: 'wireframe', icon: Box, label: 'Wire' }].map((m) => (
                  <button key={m.id} onClick={() => setRenderMode(m.id as RenderMode)} className={cn("p-2 rounded-lg flex items-center gap-2 transition-all duration-150", renderMode === m.id ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary")} title={m.label}><m.icon className="w-3.5 h-3.5" />{renderMode === m.id && <span className="text-[11px] font-semibold tracking-tight pr-1">{m.label}</span>}</button>
                ))}
             </div>
          </div>
          <div className="absolute bottom-6 left-6 px-3 py-2 rounded-lg bg-bg-primary/80 backdrop-blur-sm border border-border-default text-xs font-medium text-text-secondary flex items-center gap-3">
             <span className="tracking-tight">{project?.model_path?.split('/').pop() || "vorld_model.glb"}</span>
             <div className="w-px h-3 bg-border-default" />
             <span className="font-semibold text-accent">WebGL 2.0</span>
          </div>
        </div>
        <ResizeHandle side="right" isCollapsed={rightCollapsed} onMouseDown={(e) => startResize('right', e)} onToggle={toggleRightCollapse} onReset={resetPanelWidths} />
        <InteractionPanel width={rightWidth} isCollapsed={rightCollapsed} />
      </div>
      <InfoPanelOverlay />
    </div>
  );
}
