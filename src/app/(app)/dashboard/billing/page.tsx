"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Check, 
  CreditCard, 
  Zap, 
  Clock, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "FREE",
    price: 0,
    features: ["1 project", "vorld.so/p/...", "100MB storage", "500 views/mo"],
    current: true,
  },
  {
    name: "STARTER",
    price: 9,
    features: ["10 projects", "username.vorld.so", "1GB storage", "10k views/mo", "Analytics"],
    current: false,
  },
  {
    name: "PRO",
    price: 29,
    features: ["Unlimited projects", "Custom domain", "10GB storage", "Unlimited views", "Priority support"],
    current: false,
  },
];

import { useUsageStats } from "@/hooks/useUsageStats";

export default function BillingPage() {
  const stats = useUsageStats();

  const formattedStats = [
    { 
      label: "Projects", 
      value: `${stats.projectsCount} / ${stats.projectsLimit}`, 
      percent: Math.min((stats.projectsCount / stats.projectsLimit) * 100, 100) 
    },
    { 
      label: "Views", 
      value: `${stats.viewsCount} / ${stats.viewsLimit}`, 
      percent: Math.min((stats.viewsCount / stats.viewsLimit) * 100, 100) 
    },
    { 
      label: "Storage", 
      value: `${(stats.storageUsed / 1024 / 1024).toFixed(1)}MB / ${(stats.storageLimit / 1024 / 1024)}MB`, 
      percent: Math.min((stats.storageUsed / stats.storageLimit) * 100, 100) 
    },
  ];

  if (stats.isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Zap className="w-6 h-6 text-accent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-[--text-1] tracking-tighter mb-2">Billing & Plan</h1>
        <p className="text-sm text-[--text-3]">Manage your subscription, usage quotas, and payment methods.</p>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {formattedStats.map((stat) => (
          <div key={stat.label} className="p-8 rounded-2xl bg-[--surface-low] border border-[--border] shadow-sm transition-all duration-300 hover:bg-[--surface-raised]">
            <p className="text-[11px] font-bold text-[--text-3] uppercase tracking-[0.2em] mb-4">{stat.label}</p>
            <div className="flex items-baseline justify-between mb-3">
               <span className="text-2xl font-semibold text-[--text-1] tracking-tight">{stat.value}</span>
               <span className="text-[11px] font-bold text-[--text-3]">{stat.percent.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full bg-[--surface-raised] rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${stat.percent}%` }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
                 className={cn("h-full transition-colors", stat.percent >= 90 ? "bg-amber-500" : "bg-accent")}
               />
            </div>
          </div>
        ))}
      </div>

      {/* Current Plan & Switcher */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-[--text-1] uppercase tracking-widest opacity-60">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div 
              key={plan.name}
              className={cn(
                "relative p-8 rounded-[24px] transition-all duration-300 border border-[--border]",
                plan.current 
                  ? "bg-[--surface-raised] shadow-2xl" 
                   : "bg-[--surface-low] hover:bg-[--surface-raised]"
              )}
            >
              {plan.current && (
                <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-accent text-[9px] font-bold text-white tracking-[0.2em] uppercase shadow-2xl">
                  ACTIVE PLAN
                </div>
              )}
              <h3 className="text-sm font-bold text-[--text-3] mb-1 uppercase tracking-widest">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                 <span className="text-3xl font-semibold text-[--text-1] tracking-tight">${plan.price}</span>
                 <span className="text-xs text-[--text-3] font-medium opacity-50">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-text-secondary leading-relaxed">
                    <div className="w-4 h-4 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                       <Check className="w-2.5 h-2.5 text-accent" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <button 
                disabled={plan.current}
                className={cn(
                  "w-full h-10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98]",
                  plan.current 
                    ? "bg-[--surface-low] text-[--text-3] opacity-40 cursor-not-allowed" 
                    : "bg-[--text-1] text-[--bg] hover:opacity-90 shadow-2xl"
                )}
              >
                {plan.current ? "Active" : "Upgrade"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="p-10 rounded-[32px] bg-[--surface-low] border border-[--border] flex flex-col md:flex-row items-center gap-10 shadow-sm">
         <div className="w-16 h-16 rounded-[20px] bg-[--surface-raised] border border-[--border] flex items-center justify-center text-[--text-3]">
            <CreditCard className="w-8 h-8 opacity-40" />
         </div>
         <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-semibold text-[--text-1] mb-1">Payment Method</h3>
            <p className="text-sm text-[--text-3] leading-relaxed">Your subscription is currently on the Free tier. Add a payment method to seamlessly upgrade to higher limits.</p>
         </div>
         <button className="h-11 px-8 bg-[--surface-low] hover:bg-[--surface-subtle] text-[--text-1] text-[11px] font-bold uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-2xl">
            Add Payment Method
         </button>
      </div>

      {/* History */}
      <div className="space-y-6">
         <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[--text-3] opacity-60">Billing History</h2>
         <div className="rounded-[24px] overflow-hidden bg-[--surface-low] border border-[--border] shadow-sm">
            <table className="w-full text-left text-sm">
               <thead className="bg-[--surface-low]">
                  <tr>
                     <th className="px-8 py-5 text-[10px] font-bold text-[--text-3] uppercase tracking-[0.25em]">Date</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-[--text-3] uppercase tracking-[0.25em]">Amount</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-[--text-3] uppercase tracking-[0.25em]">Status</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-[--text-3] uppercase tracking-[0.25em]">Invoice</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[--surface-low]">
                  <tr className="hover:bg-[--surface-low]/50 transition-colors">
                     <td className="px-6 py-4 text-[--text-1] font-medium">Apr 1, 2024</td>
                     <td className="px-6 py-4 text-[--text-1] font-semibold">$0.00</td>
                     <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-widest">Successful</span>
                     </td>
                     <td className="px-6 py-4">
                        <button className="text-accent hover:text-accent/80 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 group transition-all">
                           Download PDF
                           <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
