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
    features: ["1 project", "venusapp.in/p/...", "100MB storage", "500 views/mo"],
    current: true,
  },
  {
    name: "STARTER",
    price: 9,
    features: ["10 projects", "username.venusapp.in", "1GB storage", "10k views/mo", "Analytics"],
    current: false,
  },
  {
    name: "PRO",
    price: 29,
    features: ["Unlimited projects", "Custom domain", "10GB storage", "Unlimited views", "Priority support"],
    current: false,
  },
];

export default function BillingPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">Billing</h1>
        <p className="text-sm text-text-secondary">Manage your subscription and usage.</p>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Projects", value: "1 / 1", percent: 100 },
          { label: "Views", value: "124 / 500", percent: 24.8 },
          { label: "Storage", value: "42MB / 100MB", percent: 42 },
        ].map((stat) => (
          <div key={stat.label} className="p-6 rounded-xl bg-background-subtle border border-border-primary">
            <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-4">{stat.label}</p>
            <div className="flex items-baseline justify-between mb-2">
               <span className="text-xl font-semibold text-white">{stat.value}</span>
               <span className="text-xs text-text-tertiary">{stat.percent}%</span>
            </div>
            <div className="h-1.5 w-full bg-background-elevated rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${stat.percent}%` }}
                 className={cn("h-full", stat.percent >= 90 ? "bg-warning" : "bg-accent")}
               />
            </div>
          </div>
        ))}
      </div>

      {/* Current Plan & Switcher */}
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-white">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div 
              key={plan.name}
              className={cn(
                "relative p-6 rounded-2xl border transition-all duration-300",
                plan.current 
                  ? "bg-accent-subtle/10 border-accent-border shadow-glow" 
                   : "bg-background border-border-primary hover:border-border-strong"
              )}
            >
              {plan.current && (
                <div className="absolute -top-3 left-6 px-2 py-0.5 rounded bg-accent text-[10px] font-bold text-white tracking-widest uppercase">
                  Current Plan
                </div>
              )}
              <h3 className="text-sm font-bold text-text-primary mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                 <span className="text-2xl font-semibold text-white">${plan.price}</span>
                 <span className="text-xs text-text-tertiary">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="w-3 h-3 text-accent shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button 
                disabled={plan.current}
                className={cn(
                  "w-full h-9 rounded-lg text-xs font-medium transition-all",
                  plan.current 
                    ? "bg-background-elevated text-text-tertiary" 
                    : "bg-accent hover:bg-accent-hover text-white"
                )}
              >
                {plan.current ? "Current" : "Upgrade"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="p-8 rounded-2xl bg-background-subtle border border-border-primary flex flex-col md:flex-row items-center gap-8">
         <div className="w-16 h-16 rounded-2xl bg-background-elevated flex items-center justify-center text-text-tertiary">
            <CreditCard className="w-8 h-8" />
         </div>
         <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-medium text-white mb-1">Payment Method</h3>
            <p className="text-sm text-text-secondary">Your subscription is currently free. Add a payment method to unlock pro features.</p>
         </div>
         <button className="h-10 px-6 bg-background-elevated hover:bg-background-overlay text-white text-sm font-medium rounded-lg border border-border-primary transition-all">
            Add Card
         </button>
      </div>

      {/* History */}
      <div className="space-y-4">
         <h2 className="text-lg font-medium text-white">Billing History</h2>
         <div className="rounded-xl border border-border-primary overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-background-subtle border-b border-border-primary">
                  <tr>
                     <th className="px-6 py-3 font-medium text-text-tertiary">Date</th>
                     <th className="px-6 py-3 font-medium text-text-tertiary">Amount</th>
                     <th className="px-6 py-3 font-medium text-text-tertiary">Status</th>
                     <th className="px-6 py-3 font-medium text-text-tertiary">Invoice</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border-primary/50">
                  <tr>
                     <td className="px-6 py-4 text-text-secondary">Apr 1, 2024</td>
                     <td className="px-6 py-4 text-white">$0.00</td>
                     <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full bg-success-subtle text-success text-[10px] font-bold">Paid</span>
                     </td>
                     <td className="px-6 py-4">
                        <button className="text-accent hover:underline flex items-center gap-1">
                           PDF <ArrowRight className="w-3 h-3" />
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
