"use client";

import React from "react";
import { motion } from "framer-motion";
import { Upload, Settings2, Share2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    number: "01",
    title: "Upload",
    description: "Upload your GLB. Separate objects in Blender first.",
    icon: Upload,
  },
  {
    number: "02",
    title: "Configure",
    description: "Click any mesh, assign hover, click, and info actions.",
    icon: Settings2,
  },
  {
    number: "03",
    title: "Publish",
    description: "Get a shareable link or iframe. Instantly live.",
    icon: Share2,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-[--bg] relative overflow-hidden">
      <div className="container max-w-7xl px-4 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[--text-1] mb-4">
            How it works
          </h2>
          <p className="text-[--text-2] max-w-xl mx-auto">
            From model to masterpiece in three simple steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative px-4">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.number}>
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 12 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative flex flex-col items-center p-10 rounded-[2rem] bg-[--surface]/40 backdrop-blur-xl border border-white/5 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-[--surface]/60 ring-1 ring-white/5"
              >
                {/* Number Badge */}
                <div className="absolute top-6 right-6 text-xs font-mono font-bold text-[--text-3]/10 group-hover:text-[--accent]/30 transition-colors duration-500">
                  {step.number}
                </div>

                {/* Icon Container */}
                <div className="w-14 h-14 rounded-2xl bg-[--accent-subtle] border border-[--accent-border] flex items-center justify-center mb-8 text-[--accent] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  <step.icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-medium text-[--text-1] mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[--text-2] leading-relaxed">
                  {step.description}
                </p>
              </motion.div>

              {/* Progress Connector (Desktop only) */}
              {index < STEPS.length - 1 && (
                <div className="hidden md:flex items-center justify-center absolute left-[33.333%] top-1/2 -translate-y-1/2 -ml-6 z-20 pointer-events-none opacity-20">
                  {index === 0 && (
                     <div className="flex items-center gap-1">
                        <div className="w-8 h-[2px] bg-dashed-border bg-[length:8px_2px] bg-repeat-x" />
                        <ChevronRight className="w-4 h-4 text-[--text-3]" />
                     </div>
                  )}
                </div>
              )}
              {index === 1 && (
                <div className="hidden md:flex items-center justify-center absolute left-[66.666%] top-1/2 -translate-y-1/2 -ml-6 z-20 pointer-events-none opacity-20">
                   <div className="flex items-center gap-1">
                      <div className="w-8 h-[2px] bg-dashed-border bg-[length:8px_2px] bg-repeat-x" />
                      <ChevronRight className="w-4 h-4 text-[--text-3]" />
                   </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <style jsx>{`
        .bg-dashed-border {
          background-image: linear-gradient(to right, var(--text-3) 40%, transparent 40%);
        }
      `}</style>
    </section>
  );
}
