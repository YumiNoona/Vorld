"use client";

import React, { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger
} from "@/components/ui/sheet";
import { 
  Globe, 
  Copy, 
  ExternalLink, 
  Check, 
  Lock,
  Zap,
  Eye,
  Settings2,
  Trash2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface PublishSheetProps {
  children: React.ReactNode;
  projectId: string;
  initialIsPublished: boolean;
  projectName: string;
}

export function PublishSheet({ 
  children, 
  projectId, 
  initialIsPublished, 
  projectName 
}: PublishSheetProps) {
  const supabase = createClient();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [copied, setCopied] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    
    const { error } = await supabase
      .from('projects')
      .update({ is_public: !isPublished })
      .eq('id', projectId);

    if (error) {
      toast.error(error.message);
    } else {
      setIsPublished(!isPublished);
      toast.success(isPublished ? "Project unpublished" : "Project published live!");
    }
    
    setIsPublishing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/view/${projectId}` 
    : `vorld3d.com/view/${projectId}`;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-[--bg] border-l border-[--border-strong] p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-none">
          <SheetHeader className="text-left">
            <SheetTitle className="text-xl">Publish your project</SheetTitle>
            <SheetDescription>
              Make your 3D experience live for everyone to see.
            </SheetDescription>
          </SheetHeader>

          {/* Status Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 rounded-xl bg-[--surface-raised] border border-[--border]">
                <div className="flex items-center gap-3">
                   <div className={cn(
                     "w-2 h-2 rounded-full",
                     isPublished ? "bg-[--green]" : "bg-amber-500"
                   )} />
                   <span className="text-sm font-medium text-[--text-1]">
                      Status: {isPublished ? "Published" : "Draft"}
                   </span>
                </div>
                {isPublished && (
                   <button className="text-[10px] uppercase font-bold text-red-500 hover:bg-red-500/10 px-2 py-1 rounded transition-all">
                      Unpublish
                   </button>
                )}
             </div>
          </div>

          <AnimatePresence mode="wait">
            {!isPublished ? (
              <motion.div
                key="publish-cta"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                 <div className="p-6 rounded-xl bg-[--accent-subtle] border border-[--accent-border] flex flex-col items-center text-center">
                    <Zap className="w-10 h-10 text-[--accent] mb-4" />
                    <h3 className="text-sm font-semibold text-[--text-1] mb-2">Ready to go live?</h3>
                    <p className="text-xs text-[--text-2] leading-relaxed mb-6">
                       Publishing will serialize your project configuration and make it accessible via a public URL.
                    </p>
                    <button
                      disabled={isPublishing}
                      onClick={handlePublish}
                      className="w-full h-11 bg-[--accent] hover:brightness-110 text-[--accent-fg] text-sm font-semibold rounded-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish now"}
                    </button>
                 </div>
              </motion.div>
            ) : (
              <motion.div
                key="share-details"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                 {/* Success Flash */}
                 <div className="p-4 rounded-lg bg-[--green-subtle] border border-[--green]/20 flex items-center gap-3">
                    <Check className="w-4 h-4 text-[--green]" />
                    <span className="text-xs font-medium text-[--green]">Your project is now live!</span>
                 </div>

                 {/* Public URL */}
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-[--text-3] tracking-widest">Public URL</label>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-10 px-4 rounded-lg bg-[--bg] border border-[--border] flex items-center text-sm text-[--text-1] truncate">
                          {publicUrl}
                       </div>
                       <button 
                         onClick={() => copyToClipboard(publicUrl)}
                         className="h-10 px-3 rounded-lg bg-[--surface-raised] hover:bg-[--surface] text-[--text-1] border border-[--border] transition-all"
                       >
                          {copied ? <Check className="w-4 h-4 text-[--green]" /> : <Copy className="w-4 h-4" />}
                       </button>
                       <a 
                         href={publicUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="h-10 px-3 rounded-lg bg-[--surface-raised] hover:bg-[--surface] text-[--text-1] border border-[--border] transition-all flex items-center justify-center"
                       >
                          <ExternalLink className="w-4 h-4" />
                       </a>
                    </div>
                 </div>

                 {/* Embed Code */}
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-[--text-3] tracking-widest">Embed Code (iFrame)</label>
                    <div className="relative">
                       <pre className="p-4 rounded-lg bg-[--bg] border border-[--border] text-[11px] font-mono text-[--text-2] overflow-x-auto">
                          {`<iframe src="${publicUrl}" width="100%" height="600" frameborder="0"></iframe>`}
                       </pre>
                       <button 
                         onClick={() => copyToClipboard(`<iframe src="${publicUrl}" width="100%" height="600" frameborder="0"></iframe>`)}
                         className="absolute top-2 right-2 p-1.5 rounded-md bg-[--surface-raised] hover:bg-[--surface] text-[--text-3] transition-all"
                       >
                          <Copy className="w-3.5 h-3.5" />
                       </button>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Section */}
          <div className="space-y-6 pt-6 border-t border-[--border]">
             <div className="flex items-center gap-2 mb-4">
                <Settings2 className="w-4 h-4 text-[--text-3]" />
                <span className="text-xs font-semibold text-[--text-1] uppercase tracking-widest">Viewer Settings</span>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                      <p className="text-sm font-medium text-[--text-1]">Show controls</p>
                      <p className="text-xs text-[--text-3]">Allow users to rotate/zoom</p>
                   </div>
                   <div className="w-10 h-5 bg-[--accent] rounded-full flex items-center px-1">
                      <div className="w-3 h-3 bg-white rounded-full ml-auto" />
                   </div>
                </div>
                <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                      <p className="text-sm font-medium text-[--text-1]">Auto-rotate</p>
                      <p className="text-xs text-[--text-3]">Rotate model when idle</p>
                   </div>
                   <div className="w-10 h-5 bg-[--surface-raised] rounded-full flex items-center px-1">
                      <div className="w-3 h-3 bg-white/20 rounded-full" />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Footer: Pro Upsell (Disabled until billing is implemented) */}
        {false && (
          <div className="p-8 bg-background-subtle border-t border-border-primary">
             <div className="mb-4 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-accent" />
                <p className="text-xs font-medium text-text-primary">Upgrade to Pro for custom domains</p>
             </div>
             <button className="w-full h-11 rounded-lg border border-accent-border bg-accent-subtle/50 text-accent font-medium text-sm hover:bg-accent-subtle transition-all">
                View Pro plans
             </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
