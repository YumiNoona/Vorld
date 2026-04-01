"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MoreVertical, ExternalLink, Edit2, BarChart2, Trash2, Globe, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
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
  };
  onDelete?: (id: string) => void;
  onUpdate?: (project: any) => void;
}

export function ProjectCard({ project, onDelete, onUpdate }: ProjectCardProps) {
  const supabase = createClient();
  const [isUpdating, setIsUpdating] = useState(false);

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
      // 1. Delete from storage if possible (optional but good practice)
      // Note: model_path is user_id/filename
      await supabase.storage.from('models').remove([project.model_path]);

      // 2. Delete from DB
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;
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
      className="group flex flex-col rounded-xl bg-background border border-border-primary hover:border-accent/40 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video bg-background-subtle overflow-hidden">
        {project.thumbnail_url ? (
          <img 
            src={project.thumbnail_url} 
            alt={project.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background-subtle to-background-elevated">
             <div className="w-12 h-12 rounded-lg bg-accent/5 border border-accent/10 flex items-center justify-center text-accent/40 group-hover:text-accent/60 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-hover:scale-110 transition-transform duration-500 text-accent">
                   <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                   <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
             </div>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10 pointer-events-none group-hover:pointer-events-auto">
           <Link 
             href={`/editor/${project.id}`}
             className="h-9 px-4 bg-white text-black text-xs font-bold uppercase tracking-tight rounded-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl"
           >
              Open Editor
              <Edit2 className="w-3 h-3" />
           </Link>
        </div>

        {/* Visibility Badge */}
        <div className="absolute top-3 left-3 z-20">
           <button 
             onClick={toggleVisibility}
             disabled={isUpdating}
             className={cn(
               "px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 border backdrop-blur-md transition-all active:scale-95 disabled:opacity-50",
               project.is_public 
                 ? "bg-success/10 text-success border-success/20 hover:bg-success/20" 
                 : "bg-background-elevated/80 text-text-secondary border-border-primary hover:bg-background-elevated"
             )}
           >
             {isUpdating ? (
               <Loader2 className="w-3 h-3 animate-spin" />
             ) : (
               project.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />
             )}
             {project.is_public ? 'Public' : 'Private'}
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex items-center justify-between border-t border-border-primary/50">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-text-primary truncate uppercase tracking-tight">{project.name}</h3>
          <p className="text-[10px] text-text-tertiary mt-0.5 uppercase font-medium tracking-wide">Updated {updatedAtLabel}</p>
        </div>

        <DropdownMenu>
           <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg hover:bg-background-elevated text-text-tertiary hover:text-text-primary transition-colors">
                 <MoreVertical className="w-4 h-4" />
              </button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end" className="w-48 bg-background-overlay border-border-primary">
              <DropdownMenuItem asChild>
                <Link href={`/editor/${project.id}`} className="text-xs font-bold uppercase tracking-tight gap-2 cursor-pointer">
                   <Edit2 className="w-3.5 h-3.5" /> Edit project
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-bold uppercase tracking-tight gap-2 cursor-pointer" onClick={toggleVisibility}>
                 {project.is_public ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                 Make {project.is_public ? 'Private' : 'Public'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-bold uppercase tracking-tight gap-2 cursor-pointer">
                 <BarChart2 className="w-3.5 h-3.5" /> Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border-primary" />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-xs font-bold uppercase tracking-tight gap-2 text-destructive hover:text-destructive hover:bg-destructive-subtle/10 cursor-pointer"
              >
                 <Trash2 className="w-3.5 h-3.5" /> Delete project
              </DropdownMenuItem>
           </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
