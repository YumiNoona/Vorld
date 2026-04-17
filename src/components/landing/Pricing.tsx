"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
      "vorld.so/p/...",
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
      "username.vorld.so",
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
    <section id="pricing" className="py-24 sm:py-32 bg-[--surface-raised] relative overflow-hidden">
      <div className="container max-w-7xl px-4 mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, y: 12 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.4 }}
           className="mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[--text-1] mb-6">
            Simple, honest pricing
          </h2>
          <p className="text-[--text-2] max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
            Choose the plan that fits your creative needs. Switch or cancel anytime.
          </p>

          {/* Segmented Control */}
          <div className="flex items-center justify-center gap-6 p-1.5 rounded-full bg-[--surface] border border-[--border] w-fit mx-auto shadow-sm">
            <button
               onClick={() => setIsAnnual(false)}
               className={cn(
                 "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-150", 
                 !isAnnual ? "bg-[--accent] text-[--accent-fg] shadow-md shadow-[--accent-subtle]" : "text-[--text-3] hover:text-[--text-2]"
               )}
            >
              Monthly
            </button>
            <button
               onClick={() => setIsAnnual(true)}
               className={cn(
                 "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-150 flex items-center gap-2", 
                 isAnnual ? "bg-[--accent] text-[--accent-fg] shadow-md shadow-[--accent-subtle]" : "text-[--text-3] hover:text-[--text-2]"
               )}
            >
              Annual
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                isAnnual ? "bg-white/20 text-white" : "bg-[--accent-subtle] text-[--accent]"
              )}>2 months free</span>
            </button>
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
                "relative flex flex-col p-8 rounded-2xl border transition-all duration-150",
                plan.popular 
                  ? "bg-[--accent-subtle] border-[--accent] shadow-sm" 
                  : "bg-[--surface] border-[--border] hover:border-[--text-3]"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[--accent] text-[10px] font-bold text-[--accent-fg] tracking-widest uppercase shadow-sm">
                  Most popular
                </div>
              )}

              <div className="mb-8 text-center">
                <h3 className="text-[--text-3] tracking-[0.2em] uppercase mb-6">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 justify-center mb-4">
                  <span className="text-[--text-1] tracking-tight">
                    ${isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-[--text-3] text-sm font-medium">
                    /mo
                  </span>
                </div>
                <p className="text-sm text-[--text-2] leading-relaxed h-10">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 mb-10">
                <ul className="space-y-4 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full bg-[--accent-subtle] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[--accent]" />
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
                  "w-full h-12 px-6 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 group",
                  plan.popular 
                    ? "bg-[--accent] hover:brightness-110 text-[--accent-fg] shadow-lg shadow-[--accent-subtle]" 
                    : "bg-[--surface-raised] hover:bg-[--surface] text-[--text-1] border border-[--border]"
                )}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
