"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  ArrowUpRight, 
  Activity, 
  BarChart3, 
  Layers, 
  Database,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function StatCard({ label, value, trend, icon: Icon, index, isLoading }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      className="p-6 rounded-xl bg-bg-secondary border border-border-default hover:border-text-tertiary transition-all duration-150"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
           <Icon className="w-5 h-5" />
        </div>
        {trend && trend !== "—" && (
           <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent uppercase tracking-wider">
             {trend}
           </span>
        )}
      </div>
      <p className="text-sm font-medium text-text-secondary mb-1">{label}</p>
      <h3 className="text-2xl font-semibold text-text-primary tracking-tight">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" /> : value}
      </h3>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    published: 0,
    views: "—",
    storage: "—"
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      // Fetch Project Count (Real Data Strategy)
      const { count, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      
      // Fetch Published Count
      const { count: pubCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true);

      // Fetch Recent Projects
      const { data: recentProjects } = await supabase
        .from('projects')
        .select('id, name, updated_at, is_public, model_path')
        .order('updated_at', { ascending: false })
        .limit(2);

      if (!countError) {
        setStats(prev => ({ 
          ...prev, 
          projects: count || 0,
          published: pubCount || 0
        }));
      }

      if (recentProjects) {
        setProjects(recentProjects);
      }

      setIsLoading(false);
    }
    
    fetchData();
  }, [supabase]);

  const STAT_CONFIG = [
    { label: "Total projects", value: stats.projects, icon: Layers },
    { label: "Total views", value: stats.views, icon: BarChart3 },
    { label: "Published", value: stats.published, icon: Activity },
    { label: "Storage", value: stats.storage, icon: Database },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-2">Overview</h1>
          <p className="text-sm text-text-secondary">Welcome back. Monitoring your 3D assets and interactivity.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link 
             href="/dashboard/projects"
             className="h-10 px-4 flex items-center gap-2 bg-bg-secondary hover:bg-bg-primary text-text-primary text-sm font-medium rounded-lg border border-border-default transition-all duration-150 active:scale-95"
           >
              <Plus className="w-4 h-4" />
              New project
           </Link>
           <Link 
             href="/dashboard/projects"
             className="h-10 px-4 flex items-center gap-2 bg-accent hover:brightness-110 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-150 active:scale-95"
           >
              View gallery
           </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CONFIG.map((stat, i) => (
          <StatCard 
            key={stat.label} 
            index={i} 
            isLoading={isLoading}
            {...stat}
          />
        ))}
      </div>

      {/* Main Grid: Recent Projects & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-text-primary">Recent projects</h2>
            <Link href="/dashboard/projects" className="text-sm text-accent hover:underline font-medium flex items-center gap-1 transition-all">
               View all
               <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {isLoading ? (
                [1, 2].map(i => <div key={i} className="aspect-video rounded-xl bg-bg-secondary border border-border-default animate-pulse" />)
             ) : projects.length > 0 ? (
                projects.map((project) => (
                  <Link 
                    key={project.id} 
                    href={`/editor/${project.id}`}
                    className="group relative aspect-video rounded-xl bg-bg-secondary border border-border-default hover:border-text-tertiary overflow-hidden transition-all duration-150"
                  >
                     <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/40 to-transparent z-10" />
                     <div className="absolute bottom-4 left-4 z-20">
                        <p className="text-sm font-medium text-text-primary">{project.name}</p>
                        <p className="text-xs text-text-tertiary">
                          Updated {new Date(project.updated_at).toLocaleDateString()}
                        </p>
                     </div>
                     {project.is_public && (
                        <div className="absolute top-4 right-4 z-20">
                           <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                              Published
                           </span>
                        </div>
                     )}
                  </Link>
                ))
             ) : (
                <div className="col-span-2 aspect-video rounded-xl border border-dashed border-border-default flex flex-col items-center justify-center text-text-tertiary">
                   <Layers className="w-8 h-8 mb-2 opacity-20" />
                   <p className="text-sm">No projects found</p>
                </div>
             )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-text-primary">Recent activity</h2>
          <div className="rounded-xl border border-border-default bg-bg-secondary overflow-hidden">
             <div className="p-4 space-y-6">
                {[
                  { text: "System ready for deployment", time: "Now" },
                  { text: "Analytics engine pending", time: "Upcoming" },
                  { text: "Storage usage optimized", time: "Fixed" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-bg-primary border border-border-default flex items-center justify-center shrink-0">
                       <Activity className="w-4 h-4 text-text-tertiary" />
                    </div>
                    <div>
                       <p className="text-sm text-text-secondary leading-tight">{item.text}</p>
                       <p className="text-xs text-text-tertiary mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
             </div>
             <button className="w-full h-10 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:bg-bg-primary transition-all border-t border-border-default">
                View all activity
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
