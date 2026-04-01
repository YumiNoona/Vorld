"use client";

import React from "react";
import { motion } from "framer-motion";
import { MoreVertical, ExternalLink, Edit2, BarChart2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    status: "published" | "draft" | "offline";
    updatedAt: string;
    thumbnailUrl?: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group flex flex-col rounded-xl bg-background border border-border-primary hover:border-border-strong overflow-hidden transition-all duration-300"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video bg-background-subtle overflow-hidden">
        {project.thumbnailUrl ? (
          <img 
            src={project.thumbnailUrl} 
            alt={project.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
             </svg>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
           <button className="h-9 px-4 bg-white text-black text-xs font-semibold rounded-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
              Preview
              <ExternalLink className="w-3 h-3" />
           </button>
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-3 left-3 z-20">
           <div className={cn(
             "px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 border",
             project.status === "published" 
               ? "bg-success-subtle text-success border-success/20" 
               : project.status === "draft"
               ? "bg-background-elevated text-text-tertiary border-border-primary"
               : "bg-warning-subtle text-warning border-warning/20"
           )}>
             <div className={cn("w-1.5 h-1.5 rounded-full", 
               project.status === "published" ? "bg-success" : 
               project.status === "draft" ? "bg-text-tertiary" : "bg-warning"
             )} />
             {project.status}
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-white truncate">{project.name}</h3>
          <p className="text-xs text-text-tertiary mt-0.5">Updated {project.updatedAt}</p>
        </div>

        <DropdownMenu>
           <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg hover:bg-background-elevated text-text-tertiary hover:text-white transition-colors">
                 <MoreVertical className="w-4 h-4" />
              </button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end" className="w-48 bg-background-overlay border-border-primary">
              <DropdownMenuItem className="text-sm gap-2">
                 <Edit2 className="w-4 h-4" /> Edit project
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm gap-2">
                 <ExternalLink className="w-4 h-4" /> View public link
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm gap-2">
                 <BarChart2 className="w-4 h-4" /> Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border-primary" />
              <DropdownMenuItem className="text-sm gap-2 text-destructive hover:text-destructive">
                 <Trash2 className="w-4 h-4" /> Delete project
              </DropdownMenuItem>
           </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
