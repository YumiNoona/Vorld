"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  ArrowUpRight, 
  Activity, 
  BarChart3, 
  Layers, 
  Database 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STATS = [
  { label: "Total projects", value: "4", trend: "↑12%", icon: Layers },
  { label: "Total views", value: "1,247", trend: "↑8%", icon: BarChart3 },
  { label: "Published", value: "2", trend: "—", icon: Activity },
  { label: "Storage", value: "340MB / 1GB", trend: "34%", icon: Database },
];

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="p-6 rounded-xl bg-background border border-border-primary hover:border-border-strong decoration-none transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent-subtle/50 flex items-center justify-center text-accent">
           <stat.icon className="w-5 h-5" />
        </div>
        {stat.trend !== "—" && (
           <span className={cn(
             "text-xs font-bold px-2 py-0.5 rounded-full",
             stat.trend.startsWith("↑") ? "text-success bg-success-subtle" : "text-text-tertiary bg-background-elevated"
           )}>
             {stat.trend}
           </span>
        )}
      </div>
      <p className="text-sm font-medium text-text-secondary mb-1">{stat.label}</p>
      <h3 className="text-2xl font-semibold text-white tracking-tight">{stat.value}</h3>
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">Overview</h1>
          <p className="text-sm text-text-secondary">Welcome back, John. Here's what's happening with your projects.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="h-10 px-4 flex items-center gap-2 bg-background-elevated hover:bg-background-overlay text-text-primary text-sm font-medium rounded-lg border border-border-primary transition-all">
              <Plus className="w-4 h-4" />
              New project
           </button>
           <button className="h-10 px-4 flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg shadow-lg active:scale-95 transition-all">
              View published
           </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      {/* Main Grid: Recent Projects & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white transition-all">Recent projects</h2>
            <Link href="/dashboard/projects" className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1 transition-all">
               View all
               <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Project Card Placeholders */}
             {[1, 2].map((i) => (
               <div key={i} className="group relative aspect-video rounded-xl bg-background-subtle border border-border-primary hover:border-border-strong overflow-hidden transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                  <div className="absolute bottom-4 left-4 z-20">
                     <p className="text-sm font-medium text-white">Nike Air Max 2024</p>
                     <p className="text-xs text-text-tertiary">Updated 2h ago</p>
                  </div>
                  <div className="absolute top-4 right-4 z-20">
                     <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-success-subtle text-success border border-success/20">
                        Published
                     </span>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-white">Recent activity</h2>
          <div className="rounded-xl border border-border-primary bg-background-subtle overflow-hidden">
             <div className="p-4 space-y-6">
                {[
                  { text: "Project 'Nike Shoe' was published", time: "2h ago" },
                  { text: "47 new views on 'Apartment Tour'", time: "5h ago" },
                  { text: "Thumbnail updated for 'Watch V1'", time: "1d ago" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-background-elevated flex items-center justify-center shrink-0">
                       <Activity className="w-4 h-4 text-text-tertiary" />
                    </div>
                    <div>
                       <p className="text-sm text-text-secondary leading-tight">{item.text}</p>
                       <p className="text-xs text-text-tertiary mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
             </div>
             <button className="w-full h-10 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:bg-background-elevated/50 transition-all border-t border-border-primary">
                View all activity
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
