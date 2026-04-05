import React, { useState, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Plus, 
  Upload, 
  X, 
  ArrowRight,
  Info,
  Loader2,
  FileBox,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useUsageStats } from "@/hooks/useUsageStats";

export function NewProjectModal({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const stats = useUsageStats();
  
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".glb") || droppedFile.name.endsWith(".gltf"))) {
      setFile(droppedFile);
    }
  }, []);

  const handleProcess = async () => {
    if (!file || !name.trim()) return;
    
    // 1. Quota Check (Hard Block)
    if (stats.storageUsed + file.size > stats.storageLimit) {
      toast.error("Storage limit exceeded. Please upgrade your plan.", {
        icon: <AlertTriangle className="w-4 h-4 text-destructive" />
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // 2. Project Quota Check
      if (stats.projectsCount >= stats.projectsLimit) {
        toast.error(`You have reached your project limit (${stats.projectsLimit}). Please upgrade your plan.`, {
          icon: <AlertTriangle className="w-4 h-4 text-destructive" />
        });
        setIsProcessing(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 2. Create Project Entry First (To get the PID)
      const { data: project, error: dbError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name,
          description,
          model_path: "pending", // Temporary
          storage_size: file.size,
          is_public: false
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Simulated Progress & Upload
      const simulateProgress = () => {
        let current = 0;
        const interval = setInterval(() => {
          current += Math.random() * 15;
          if (current >= 90) {
            clearInterval(interval);
            setUploadProgress(90);
          } else {
            setUploadProgress(Math.floor(current));
          }
        }, 300);
        return interval;
      };

      const progressInterval = simulateProgress();

      const filePath = `${user.id}/${project.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('models')
        .upload(filePath, file, { upsert: false });

      clearInterval(progressInterval);

      if (uploadError) {
        // Cleanup orphaned project entry
        await supabase.from('projects').delete().eq('id', project.id);
        throw uploadError;
      }

      setUploadProgress(100);

      // 4. Atomic Updates: Path + Profile Usage
      const { data: profile } = await supabase
        .from('profiles')
        .select('storage_used')
        .eq('id', user.id)
        .single();
      
      const newTotal = (profile?.storage_used || 0) + file.size;

      await Promise.all([
        supabase
          .from('projects')
          .update({ model_path: filePath })
          .eq('id', project.id),
        supabase
          .from('profiles')
          .update({ storage_used: newTotal })
          .eq('id', user.id)
      ]);

      toast.success("Project created successfully!");
      router.push(`/editor/${project.id}`);
    } catch (error: any) {
      toast.error(error.message || "Process failed");
      setIsProcessing(false);
    }
  };

  return (
    <Dialog onOpenChange={() => { setStep(1); setFile(null); setUploadProgress(0); setName(""); setDescription(""); setIsProcessing(false); }}>
      <DialogTrigger asChild>
        {children || (
          <button className="h-10 px-4 flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg shadow-lg active:scale-95 transition-all">
            <Plus className="w-4 h-4" />
            New project
          </button>
        )}
      </DialogTrigger>
      
      {/* Contrast Glass Styling Applied Below */}
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-[#0f172a]/60 backdrop-blur-[20px] saturate-[140%] border-white/10 sm:rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">New Project</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row h-full">
          {/* Main Form Area */}
          <div className="flex-1 p-8">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">Select your assets</h2>
                    <p className="text-sm text-slate-300">Choose a 3D model to begin your creation journey.</p>
                  </div>

                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    className={cn(
                      "group relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-300",
                      file 
                        ? "border-emerald-500/50 bg-emerald-500/5" 
                        : "border-white/10 hover:border-accent/40 hover:bg-white/5 bg-black/20"
                    )}
                  >
                    {!file && (
                      <>
                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-accent group-hover:scale-110 transition-all duration-300">
                           <Upload className="w-7 h-7" />
                        </div>
                        <div className="text-center">
                           <p className="text-sm font-semibold text-white tracking-tight">Drag & drop your file here</p>
                           <p className="text-xs text-slate-400 mt-1 font-medium">.glb or .gltf (Max 100MB)</p>
                        </div>
                        <input
                          type="file"
                          accept=".glb,.gltf"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </>
                    )}

                    {file && (
                      <div className="flex flex-col items-center gap-3">
                         <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <FileBox className="w-7 h-7" />
                         </div>
                         <div className="text-center">
                            <p className="text-sm font-semibold text-white truncate max-w-[240px]">{file.name}</p>
                            <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                         </div>
                         {!isProcessing && (
                           <button 
                             onClick={() => setFile(null)}
                             className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
                           >
                             Change File
                           </button>
                         )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      disabled={!file}
                      onClick={() => setStep(2)}
                      className="h-11 px-8 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50 text-sm font-bold rounded-xl transition-all flex items-center gap-2 active:scale-95"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">Project Details</h2>
                    <p className="text-sm text-slate-300">Set the identity for your 3D experience.</p>
                  </div>

                  <div className="space-y-5">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Project Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="My Awesome Scene"
                          className="w-full h-12 px-4 rounded-xl bg-black/30 border border-white/10 focus:border-accent/50 outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description (Optional)</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="What is this project about?"
                          className="w-full h-28 p-4 rounded-xl bg-black/30 border border-white/10 focus:border-accent/50 outline-none transition-all resize-none text-white placeholder:text-slate-600 font-medium"
                        />
                     </div>
                  </div>

                  {isProcessing && (
                    <div className="space-y-4">
                       <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                          <div className="flex flex-col gap-1">
                            <span className="text-accent animate-pulse">
                              {uploadProgress < 100 ? "Uploading Assets..." : "Finalizing Project..."}
                            </span>
                            {uploadProgress < 100 && file && (
                              <span className="text-[10px] text-slate-500 font-medium normal-case">
                                Est. time: {Math.max(1, Math.ceil((file.size * (1 - uploadProgress/100)) / (500 * 1024)))}s remaining
                              </span>
                            )}
                          </div>
                          <span className="text-white">{uploadProgress}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                          <motion.div 
                            className="h-full bg-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                          />
                       </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <button
                      disabled={isProcessing}
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
                    >
                      Back
                    </button>
                    <button
                      disabled={isProcessing || !name.trim()}
                      onClick={handleProcess}
                       className="h-11 px-8 bg-accent hover:brightness-110 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing</span>
                        </div>
                      ) : "Launch Editor"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Side Info Panel */}
          <div className="hidden md:flex w-64 bg-black/40 border-l border-white/10 p-8 flex-col justify-between">
             <div className="space-y-8">
               <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/20 flex items-center justify-center text-accent">
                     <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-wide">
                     Optimized Engine
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                     Your assets are automatically prepared for high-performance WebGL rendering.
                  </p>
               </div>
               
               <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                     <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-wide">
                     Selection System
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                     Use named groups in Blender to easily add interactions later.
                  </p>
               </div>
             </div>

             <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                   <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                   <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Quota</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                   Free projects are limited to 100MB per file.
                </p>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
