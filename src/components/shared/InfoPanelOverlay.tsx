"use client";

import React from "react";
import { useViewerStore } from "@/stores/viewerStore";
import { X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function InfoPanelOverlay() {
  const { infoPanel, setInfoPanel } = useViewerStore();

  if (!infoPanel) return null;

  const isSide = infoPanel.layout === "side";

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
      <div 
        className={cn(
          "pointer-events-auto bg-background-surface border border-border-primary rounded-2xl shadow-2xl overflow-hidden flex",
          isSide ? "flex-col md:flex-row w-full max-w-2xl" : "flex-col w-full max-w-sm"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {infoPanel.imageUrl && (
          <div className={cn("bg-background-subtle relative shrink-0", isSide ? "w-full md:w-1/2 h-48 md:h-auto" : "w-full h-48")}>
            <img 
              src={infoPanel.imageUrl} 
              alt={infoPanel.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className={cn("p-6 relative flex flex-col justify-center", isSide ? "w-full md:w-1/2 min-h-[300px]" : "w-full")}>
          <button 
            onClick={() => setInfoPanel(null)}
            className="absolute top-4 right-4 p-1.5 rounded-md bg-background hover:bg-background-elevated text-text-tertiary hover:text-white transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h3 className="text-xl font-bold text-white mb-2 pr-8">{infoPanel.title}</h3>
          
          {infoPanel.description && (
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap mb-4">
              {infoPanel.description}
            </p>
          )}

          {infoPanel.ctaUrl && infoPanel.ctaLabel && (
             <a
               href={infoPanel.ctaUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="mt-auto inline-flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors shadow-lg shadow-accent/20"
             >
                {infoPanel.ctaLabel}
                <ExternalLink className="w-4 h-4" />
             </a>
          )}
        </div>
      </div>
    </div>
  );
}
