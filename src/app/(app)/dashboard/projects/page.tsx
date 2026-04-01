"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { NewProjectModal } from "@/components/shared/NewProjectModal";

const PROJECTS = [
  { id: "1", name: "Nike Air Max 2024", status: "published", updatedAt: "2 hours ago" },
  { id: "2", name: "Modern Apartment Tour", status: "published", updatedAt: "5 hours ago" },
  { id: "3", name: "Watch V1 Concept", status: "draft", updatedAt: "1 day ago" },
  { id: "4", name: "Geometric Abstract", status: "offline", updatedAt: "3 days ago" },
] as const;

export default function ProjectsPage() {
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "offline">("all");
  const [search, setSearch] = useState("");
  const [isViewList, setIsViewList] = useState(false);

  const filteredProjects = PROJECTS.filter(p => {
    const matchesFilter = filter === "all" || p.status === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Projects</h1>
          <p className="text-sm text-text-secondary">Manage and organize your 3D experiences.</p>
        </div>
        <NewProjectModal />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-2">
        {/* Left: Filters */}
        <div className="flex items-center gap-1 bg-background-subtle p-1 rounded-lg border border-border-primary self-start">
           {(["all", "published", "draft", "offline"] as const).map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={cn(
                 "px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all",
                 filter === f 
                   ? "bg-background-elevated text-white shadow-sm" 
                   : "text-text-secondary hover:text-text-primary"
               )}
             >
               {f}
             </button>
           ))}
        </div>

        {/* Right: Search & Sort */}
        <div className="flex flex-1 items-center gap-3">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-background-subtle border border-border-primary focus:border-border-focus transition-all text-sm outline-none"
              />
           </div>
           
           <div className="flex items-center gap-1 bg-background-subtle p-1 rounded-lg border border-border-primary">
              <button 
                onClick={() => setIsViewList(false)}
                className={cn("p-1.5 rounded-md transition-all", !isViewList ? "bg-background-elevated text-white" : "text-text-tertiary hover:text-text-secondary")}
              >
                 <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsViewList(true)}
                className={cn("p-1.5 rounded-md transition-all", isViewList ? "bg-background-elevated text-white" : "text-text-tertiary hover:text-text-secondary")}
              >
                 <List className="w-4 h-4" />
              </button>
           </div>
           
           <button className="h-10 px-3 flex items-center gap-2 bg-background-subtle hover:bg-background-elevated text-text-secondary hover:text-text-primary text-sm font-medium rounded-lg border border-border-primary transition-all">
              Last updated
              <ChevronDown className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length > 0 ? (
        <motion.div 
          layout
          className={cn(
            "grid gap-6",
            isViewList ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
           <div className="w-16 h-16 rounded-2xl bg-background-subtle border border-border-primary flex items-center justify-center text-text-tertiary/20">
              <Plus className="w-8 h-8" />
           </div>
           <div>
              <h3 className="text-lg font-medium text-white">No projects found</h3>
              <p className="text-sm text-text-secondary">Try adjusting your filters or create a new project.</p>
           </div>
           <button className="h-10 px-4 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all">
              Create your first project
           </button>
        </div>
      )}
    </div>
  );
}
