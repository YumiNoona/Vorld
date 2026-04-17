"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Activity, 
  BarChart3, 
  Layers, 
  Database,
  Loader2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function StatCard({ label, value, trend, index, isLoading }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      className="py-6 flex flex-col justify-between"
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--text-3] mb-3">{label}</p>
        <h3 className="text-4xl font-bold text-[--text-1] tracking-tighter">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[--text-3]" /> : value}
        </h3>
      </div>
      {trend && trend !== "—" && (
         <p className="text-[11px] font-bold text-[--accent] mt-2 tracking-widest uppercase">{trend}</p>
      )}
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
      <div className="flex items-end justify-between pb-10">
        <div>
          <h1 className="font-bold text-[--text-1] tracking-tighter mb-2" style={{ fontSize: 'var(--text-heading-1)' }}>Overview</h1>
          <p className="text-[13px] font-medium text-[--text-3]">Welcome back. Monitoring your 3D assets and interactivity.</p>
        </div>
        <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/projects"
              className="h-11 px-8 flex items-center gap-2 bg-[--text-1] text-[--bg] text-[11px] font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-150 active:scale-95 shadow-2xl"
            >
               <Plus className="w-4 h-4" />
               New project
            </Link>
            <Link 
              href="/dashboard/projects"
              className="h-11 px-8 flex items-center gap-2 bg-[--surface-low] hover:bg-[--surface-raised] text-[--text-1] text-[11px] font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-150 active:scale-95 shadow-xl border border-[--border]"
            >
               View gallery
            </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 py-4">
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
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[--text-3]">Recent projects</h2>
            <Link href="/dashboard/projects" className="text-[11px] font-bold text-[--accent] uppercase tracking-[0.2em] hover:text-[--text-1] flex items-center gap-2 transition-all">
               View all
               <ChevronRight className="w-3.5 h-3.5" />
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
                    className="group relative aspect-video rounded-[20px] bg-[--surface-low] hover:bg-[--surface-raised] overflow-hidden transition-all duration-300 border border-[--border]"
                  >
                     <div className="absolute inset-0 bg-gradient-to-t from-[--bg]/40 to-transparent z-10" />
                     <div className="absolute bottom-4 left-4 z-20">
                        <p className="text-sm font-medium text-[--text-1]">{project.name}</p>
                        <p className="text-xs text-[--text-3]">
                          Updated {new Date(project.updated_at).toLocaleDateString()}
                        </p>
                     </div>
                     {project.is_public && (
                         <div className="absolute top-4 right-4 z-20">
                           <span className="text-[9px] uppercase font-bold tracking-[0.15em] px-2.5 py-1 rounded-full bg-accent/20 text-accent">
                              Published
                           </span>
                        </div>
                     )}
                  </Link>
                ))
              ) : (
                 <div className="col-span-2 aspect-video rounded-[24px] bg-[--surface-subtle] flex flex-col items-center justify-center text-[--text-3]">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[--text-3] mb-2 opacity-50">Start your first world</h3>
                    <p className="text-[10px] text-[--text-3] uppercase tracking-widest font-bold opacity-30">Upload GLB to begin</p>
                 </div>
              )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-10">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[--text-3]">Recent activity</h2>
          <div className="bg-[--surface-low] rounded-[24px] overflow-hidden border border-[--border]">
             <div className="p-6 space-y-8">
                {[
                  { text: "System ready for deployment", time: "Now" },
                  { text: "Analytics engine pending", time: "Upcoming" },
                  { text: "Storage usage optimized", time: "Fixed" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-[--surface-low] flex items-center justify-center shrink-0">
                       <Activity className="w-3.5 h-3.5 text-[--text-3]" />
                    </div>
                    <div>
                       <p className="text-[13px] font-bold text-[--text-1] tracking-tight leading-none mb-1.5">{item.text}</p>
                       <p className="text-[10px] uppercase font-bold text-[--text-3] tracking-widest opacity-50">{item.time}</p>
                    </div>
                  </div>
                ))}
             </div>
             <button className="w-full h-12 text-[10px] font-bold uppercase tracking-[0.2em] text-[--text-3] hover:text-[--text-1] hover:bg-[--surface-low] transition-all">
                View all activity
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
