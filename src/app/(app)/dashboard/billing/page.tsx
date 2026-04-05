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
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-2">Billing & Plan</h1>
        <p className="text-sm text-text-secondary">Manage your subscription, usage quotas, and payment methods.</p>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {formattedStats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-xl bg-bg-secondary border border-border-default shadow-sm transition-all duration-150 hover:border-text-tertiary">
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em] mb-4">{stat.label}</p>
            <div className="flex items-baseline justify-between mb-3">
               <span className="text-2xl font-semibold text-text-primary tracking-tight">{stat.value}</span>
               <span className="text-[11px] font-bold text-text-tertiary">{stat.percent.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-bg-primary rounded-full overflow-hidden border border-border-default">
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
        <h2 className="text-lg font-medium text-text-primary">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div 
              key={plan.name}
              className={cn(
                "relative p-6 rounded-2xl border transition-all duration-150",
                plan.current 
                  ? "bg-accent/5 border-accent shadow-sm" 
                   : "bg-bg-secondary border-border-default hover:border-text-tertiary"
              )}
            >
              {plan.current && (
                <div className="absolute -top-3 left-6 px-2.5 py-1 rounded bg-accent text-[9px] font-bold text-white tracking-[0.15em] uppercase shadow-sm">
                  Active Plan
                </div>
              )}
              <h3 className="text-sm font-bold text-text-secondary mb-1 uppercase tracking-widest">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                 <span className="text-3xl font-semibold text-text-primary tracking-tight">${plan.price}</span>
                 <span className="text-xs text-text-tertiary font-medium">/month</span>
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
                    ? "bg-bg-primary text-text-tertiary border border-border-default cursor-not-allowed" 
                    : "bg-accent hover:brightness-110 text-white shadow-md shadow-accent/20"
                )}
              >
                {plan.current ? "Active" : "Upgrade"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="p-8 rounded-2xl bg-bg-secondary border border-border-default flex flex-col md:flex-row items-center gap-8 shadow-sm">
         <div className="w-14 h-14 rounded-2xl bg-bg-primary border border-border-default flex items-center justify-center text-text-tertiary">
            <CreditCard className="w-7 h-7 opacity-40" />
         </div>
         <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-semibold text-text-primary mb-1">Payment Method</h3>
            <p className="text-sm text-text-secondary leading-relaxed">Your subscription is currently on the Free tier. Add a payment method to seamlessly upgrade to higher limits.</p>
         </div>
         <button className="h-10 px-6 bg-bg-primary hover:bg-bg-secondary text-text-primary text-xs font-bold uppercase tracking-widest rounded-xl border border-border-default transition-all active:scale-95 shadow-sm">
            Add Payment Method
         </button>
      </div>

      {/* History */}
      <div className="space-y-4">
         <h2 className="text-lg font-medium text-text-primary">Billing History</h2>
         <div className="rounded-xl border border-border-default overflow-hidden bg-bg-secondary shadow-sm">
            <table className="w-full text-left text-sm">
               <thead className="bg-bg-primary/50 border-b border-border-default">
                  <tr>
                     <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Date</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Amount</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Status</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Invoice</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border-default">
                  <tr className="hover:bg-bg-primary/30 transition-colors">
                     <td className="px-6 py-4 text-text-secondary font-medium">Apr 1, 2024</td>
                     <td className="px-6 py-4 text-text-primary font-semibold">$0.00</td>
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
