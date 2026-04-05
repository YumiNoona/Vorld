"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List,
  ChevronDown,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { NewProjectModal } from "@/components/shared/NewProjectModal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ProjectsPage() {
  const supabase = createClient();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  const [search, setSearch] = useState("");
  const [isViewList, setIsViewList] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesFilter = 
      filter === "all" || 
      (filter === "public" && p.is_public) || 
      (filter === "private" && !p.is_public);
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpdate = (updatedProject: any) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">Projects</h1>
          <p className="text-sm text-text-secondary">Manage and organize your 3D experiences.</p>
        </div>
        <NewProjectModal />
      </div>

      {/* Toolbar - Removed "ugly lines" (borders) and updated typography */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-2">
        {/* Left: Filters */}
        <div className="flex items-center gap-1 bg-bg-secondary/50 p-1 rounded-xl self-start backdrop-blur-sm">
           {(["all", "public", "private"] as const).map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={cn(
                 "px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all",
                 filter === f 
                   ? "bg-bg-primary text-text-primary shadow-sm ring-1 ring-white/5" 
                   : "text-text-tertiary hover:text-text-secondary"
               )}
             >
               {f}
             </button>
           ))}
        </div>

        {/* Right: Search & Sort */}
        <div className="flex flex-1 items-center gap-4">
           <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-bg-secondary/50 border-none focus:ring-2 focus:ring-accent/20 transition-all text-sm outline-none text-text-primary placeholder:text-text-tertiary/50"
              />
           </div>
           
           <div className="flex items-center gap-1 bg-bg-secondary/50 p-1 rounded-xl backdrop-blur-sm">
              <button 
                onClick={() => setIsViewList(false)}
                className={cn("p-2 rounded-lg transition-all", !isViewList ? "bg-bg-primary text-text-primary shadow-sm ring-1 ring-white/5" : "text-text-tertiary hover:text-text-secondary")}
              >
                 <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsViewList(true)}
                className={cn("p-2 rounded-lg transition-all", isViewList ? "bg-bg-primary text-text-primary shadow-sm ring-1 ring-white/5" : "text-text-tertiary hover:text-text-secondary")}
              >
                 <List className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <Loader2 className="w-8 h-8 animate-spin text-accent" />
           <p className="text-sm text-text-tertiary font-medium">Loading projects...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <motion.div 
          layout
          className={cn(
            "grid gap-8",
            isViewList ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-40 space-y-10 text-center"
        >
           <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full opacity-50" />
              <div className="relative w-32 h-32 rounded-[2.5rem] bg-bg-secondary border-none flex items-center justify-center text-accent shadow-2xl group overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <Plus className="w-12 h-12 group-hover:scale-110 transition-transform duration-500 relative z-10" />
              </div>
           </div>
           
           <div className="max-w-md space-y-4">
              <h3 className="text-3xl font-bold text-text-primary tracking-tight leading-none">No projects yet</h3>
              <p className="text-text-secondary text-lg leading-relaxed">
                 You haven&apos;t created any 3D experiences. Upload a model to start building interactive worlds today.
              </p>
           </div>

           <NewProjectModal>
              <button className="h-14 px-12 bg-accent hover:brightness-110 text-white text-sm font-semibold rounded-2xl shadow-2xl hover:shadow-accent/40 active:scale-95 transition-all flex items-center gap-3">
                <Plus className="w-5 h-5" />
                Create your first project
              </button>
           </NewProjectModal>
        </motion.div>
      )}
    </div>
  );
}
