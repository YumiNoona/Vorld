"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MoreVertical, ExternalLink, Edit2, BarChart2, Trash2, Globe, Lock, Loader2, Image as ImageIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThumbnailUploadModal } from "./ThumbnailUploadModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    is_public: boolean;
    updated_at: string;
    thumbnail_url?: string;
    model_path: string;
    storage_size: number;
  };
  onDelete?: (id: string) => void;
  onUpdate?: (project: any) => void;
}

export function ProjectCard({ project, onDelete, onUpdate }: ProjectCardProps) {
  const supabase = createClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isThumbModalOpen, setIsThumbModalOpen] = useState(false);

  const toggleVisibility = async () => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ is_public: !project.is_public })
        .eq('id', project.id)
        .select()
        .single();

      if (error) throw error;
      onUpdate?.(data);
      toast.success(`Project is now ${data.is_public ? 'public' : 'private'}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.storage.from('models').remove([project.model_path]);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      // Atomic Update: Decrement Profile Usage
      const { data: profile } = await supabase
        .from('profiles')
        .select('storage_used')
        .eq('id', user.id)
        .single();
      
      const newTotal = Math.max(0, (profile?.storage_used || 0) - project.storage_size);
      await supabase
        .from('profiles')
        .update({ storage_used: newTotal })
        .eq('id', user.id);

      onDelete?.(project.id);
      toast.success("Project deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updatedAtLabel = new Date(project.updated_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group flex flex-col rounded-[20px] bg-[--surface-low] hover:bg-[--surface-raised] overflow-hidden transition-all duration-500 shadow-xl border border-[--border]"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video bg-[--bg] overflow-hidden">
        {project.thumbnail_url ? (
          <img 
            src={project.thumbnail_url} 
            alt={project.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center bg-[#0f0f0f] relative overflow-hidden"
            style={{ 
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          >
             <div className="w-12 h-12 rounded-full bg-[--surface-low] flex items-center justify-center text-[--text-3] group-hover:text-[--accent] group-hover:scale-110 transition-all duration-300">
                <Upload className="w-6 h-6" />
             </div>
          </div>
        )}
        
        {/* Hover Overlay - Luxury Glass */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3 z-10 pointer-events-none group-hover:pointer-events-auto">
           <Link 
             href={`/editor/${project.id}`}
             className="h-10 px-8 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-3xl"
           >
              Open Editor
           </Link>
        </div>

        {/* Visibility Badge */}
        <div className="absolute top-4 left-4 z-20">
           <button 
             onClick={toggleVisibility}
             disabled={isUpdating}
             className={cn(
                "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 backdrop-blur-xl transition-all active:scale-95 disabled:opacity-50",
                project.is_public 
                  ? "bg-accent/20 text-accent" 
                  : "bg-white/10 text-white/70"
             )}
           >
             {isUpdating ? (
               <Loader2 className="w-3 h-3 animate-spin" />
             ) : (
               project.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />
             )}
             {project.is_public ? 'Published' : 'Private'}
           </button>
        </div>
      </div>

      <div className="p-5 flex items-center justify-between border-t border-[--surface-low]">
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold text-[--text-1] tracking-tight truncate">{project.name}</h3>
          <p className="text-[10px] text-[--text-3] mt-1 uppercase tracking-widest font-bold">Updated {updatedAtLabel}</p>
        </div>

        <DropdownMenu>
           <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-xl hover:bg-[--surface-raised] text-[--text-3] hover:text-[--text-1] transition-all">
                 <MoreVertical className="w-4 h-4" />
              </button>
           </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[--bg]/95 backdrop-blur-3xl shadow-3xl p-1 rounded-[16px] border border-[--border]">
              <DropdownMenuItem asChild className="rounded-md">
                <Link href={`/editor/${project.id}`} className="text-xs font-bold uppercase tracking-wider gap-3 cursor-pointer py-3 text-[--text-2] hover:text-[--text-1] transition-colors">
                   <Edit2 className="w-4 h-4" /> Edit project
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-bold uppercase tracking-wider gap-3 cursor-pointer py-3 rounded-md text-[--text-2] hover:text-[--text-1] transition-colors" onClick={toggleVisibility}>
                 {project.is_public ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                 Make {project.is_public ? 'Private' : 'Public'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-bold uppercase tracking-wider gap-3 cursor-pointer py-3 rounded-md text-[--text-2] hover:text-[--text-1] transition-colors" onClick={() => setIsThumbModalOpen(true)}>
                 <ImageIcon className="w-4 h-4" /> Custom Image
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-bold uppercase tracking-wider gap-3 cursor-pointer py-3 rounded-md text-[--text-2] hover:text-[--text-1] transition-colors">
                 <BarChart2 className="w-4 h-4" /> Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[--border] mx-1" />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-xs font-bold uppercase tracking-wider gap-3 py-3 rounded-md text-red-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
              >
                 <Trash2 className="w-4 h-4" /> Delete project
              </DropdownMenuItem>
           </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ThumbnailUploadModal 
        projectId={project.id}
        isOpen={isThumbModalOpen}
        onOpenChange={setIsThumbModalOpen}
        onUpdate={(url) => onUpdate?.({ ...project, thumbnail_url: url })}
      />
    </motion.div>
  );
}
