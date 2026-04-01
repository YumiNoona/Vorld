"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Box, 
  MousePointer2, 
  Zap, 
  BarChart3, 
  Code2, 
  Cpu 
} from "lucide-react";

const FEATURES = [
  {
    title: "GLB / GLTF support",
    description: "Upload any standard 3D file and let Venus handle the heavy lifting.",
    icon: Box,
  },
  {
    title: "Per-mesh interactivity",
    description: "Hover, click, animate, and show info panels on any part of your model.",
    icon: MousePointer2,
  },
  {
    title: "Publish in one click",
    description: "Get a live URL, iframe embed, or use your custom domain instantly.",
    icon: Zap,
  },
  {
    title: "Analytics built in",
    description: "See views, clicks, and top-performing hotspots to optimize your experience.",
    icon: BarChart3,
  },
  {
    title: "Embeddable anywhere",
    description: "Add your 3D models to Notion, portfolios, product pages, and emails.",
    icon: Code2,
  },
  {
    title: "Powered by Three.js",
    description: "High-performance WebGL rendering that works perfectly on any device.",
    icon: Cpu,
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-background relative border-t border-border-primary">
      <div className="container max-w-7xl px-4 mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 12 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.4 }}
           className="text-center mb-20"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">
            Everything you need for interactive 3D
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            A professional toolkit for the modern web.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group p-8 rounded-2xl bg-background-subtle border border-border-primary hover:border-border-strong transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-subtle/50 flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-5 h-5" />
              </div>

              <h3 className="text-lg font-medium text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
