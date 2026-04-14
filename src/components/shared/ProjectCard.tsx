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
    storage_size: number;
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
      className="group flex flex-col rounded-2xl bg-bg-secondary/50 border border-border-default/50 hover:border-accent/40 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video bg-bg-primary overflow-hidden">
        {project.thumbnail_url ? (
          <img 
            src={project.thumbnail_url} 
            alt={project.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-primary to-bg-secondary relative overflow-hidden">
             {/* Studio grid pattern */}
             <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
               <defs>
                 <pattern id={`grid-${project.id}`} width="24" height="24" patternUnits="userSpaceOnUse">
                   <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="1"/>
                 </pattern>
               </defs>
               <rect width="100%" height="100%" fill={`url(#grid-${project.id})`} className="text-text-primary" />
             </svg>
             {/* Perspective fade */}
             <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent opacity-60" />
             <div className="relative z-10 w-12 h-12 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent/30 group-hover:text-accent/60 group-hover:scale-110 transition-all duration-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-hover:rotate-12 transition-transform duration-500 text-accent">
                   <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                   <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
             </div>
          </div>
        )}
        
        {/* Hover Overlay - Glass Effect */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3 z-10 pointer-events-none group-hover:pointer-events-auto">
           <Link 
             href={`/editor/${project.id}`}
             className="h-10 px-6 bg-white text-black text-sm font-semibold rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-2xl"
           >
              Edit Project
              <Edit2 className="w-3.5 h-3.5" />
           </Link>
        </div>

        {/* Visibility Badge */}
        <div className="absolute top-4 left-4 z-20">
           <button 
             onClick={toggleVisibility}
             disabled={isUpdating}
             className={cn(
               "px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-2 backdrop-blur-xl transition-all active:scale-95 disabled:opacity-50 border",
               project.is_public 
                 ? "bg-accent/10 text-accent border-accent/20" 
                 : "bg-bg-primary/80 text-text-secondary border-border-default"
             )}
           >
             {isUpdating ? (
               <Loader2 className="w-3 h-3 animate-spin" />
             ) : (
               project.is_public ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />
             )}
             {project.is_public ? 'Public' : 'Private'}
           </button>
        </div>
      </div>

      {/* Content Area - Removed "ugly lines" (borders) */}
      <div className="p-5 flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate">{project.name}</h3>
          <p className="text-[11px] text-text-tertiary mt-1 font-medium">Updated {updatedAtLabel}</p>
        </div>

        <DropdownMenu>
           <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-xl hover:bg-bg-primary text-text-tertiary hover:text-text-primary transition-all">
                 <MoreVertical className="w-4 h-4" />
              </button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end" className="w-56 bg-bg-primary/95 backdrop-blur-2xl border-white/5 shadow-2xl p-1 rounded-xl">
              <DropdownMenuItem asChild className="rounded-lg">
                <Link href={`/editor/${project.id}`} className="text-xs font-semibold gap-3 cursor-pointer py-2.5">
                   <Edit2 className="w-4 h-4" /> Edit project
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-semibold gap-3 cursor-pointer py-2.5 rounded-lg" onClick={toggleVisibility}>
                 {project.is_public ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                 Make {project.is_public ? 'Private' : 'Public'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-semibold gap-3 cursor-pointer py-2.5 rounded-lg">
                 <BarChart2 className="w-4 h-4" /> Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5 mx-2" />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-xs font-semibold gap-3 py-2.5 rounded-lg text-red-500 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
              >
                 <Trash2 className="w-4 h-4" /> Delete project
              </DropdownMenuItem>
           </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
