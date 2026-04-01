"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "FREE",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for hobbyists and side projects.",
    features: [
      "1 project",
      "venusapp.in/p/...",
      "100MB storage",
      "500 views/mo",
    ],
    cta: "Get started free",
    popular: false,
  },
  {
    name: "STARTER",
    monthlyPrice: 9,
    yearlyPrice: 7,
    description: "For professionals building a portfolio.",
    features: [
      "10 projects",
      "username.venusapp.in",
      "1GB storage",
      "10k views/mo",
      "Analytics",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "PRO",
    monthlyPrice: 29,
    yearlyPrice: 24,
    description: "For agencies and high-traffic projects.",
    features: [
      "Unlimited projects",
      "Custom domain",
      "10GB storage",
      "Unlimited views",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start free trial",
    popular: false,
  },
];

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-background-subtle relative overflow-hidden">
      <div className="container max-w-7xl px-4 mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, y: 12 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.4 }}
           className="mb-12"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto mb-8">
            Start for free and upgrade as you grow.
          </p>

          {/* Segmented Control */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn("text-sm font-medium transition-colors", !isAnnual ? "text-text-primary" : "text-text-tertiary")}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-12 h-6 rounded-full bg-background-surface border border-border-primary p-1 cursor-pointer transition-colors"
            >
              <motion.div
                animate={{ x: isAnnual ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-4 h-4 rounded-full bg-accent"
              />
            </button>
            <span className={cn("text-sm font-medium transition-colors", isAnnual ? "text-text-primary" : "text-text-tertiary")}>
              Annual <span className="text-success text-xs font-bold ml-1">2 months free</span>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "relative flex flex-col p-8 rounded-2xl bg-background border transition-all duration-300",
                plan.popular 
                  ? "border-accent-border bg-accent-subtle/20 shadow-glow" 
                  : "border-border-primary hover:border-border-strong"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-[10px] font-bold text-white tracking-widest uppercase">
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-bold text-accent tracking-widest uppercase mb-4">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 justify-center mb-2">
                  <span className="text-4xl font-semibold text-white tracking-tight">
                    ${isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-text-tertiary text-sm font-medium">
                    /mo
                  </span>
                </div>
                <p className="text-sm text-text-secondary">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 mb-8">
                <ul className="space-y-4 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent-subtle/50 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-sm text-text-secondary leading-tight">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={cn(
                  "w-full h-11 px-6 rounded-lg font-medium transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 group",
                  plan.popular 
                    ? "bg-accent hover:bg-accent-hover text-white shadow-lg" 
                    : "bg-background-elevated hover:bg-background-overlay text-text-primary border border-border-primary hover:border-border-strong"
                )}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
