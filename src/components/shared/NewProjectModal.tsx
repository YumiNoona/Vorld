"use client";

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
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function NewProjectModal({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".glb") || droppedFile.name.endsWith(".gltf"))) {
      setFile(droppedFile);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Final Rule 1: Upload path MUST be ${user.id}/${file.name}
      const filePath = `${user.id}/${file.name}`;

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 95));
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from('models')
        .upload(filePath, file, {
          upsert: true // Allow overwriting if same name
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      setStep(2);
      // Final Rule 2: DB MUST store user_id/file.glb
      (window as any)._pendingModelPath = filePath;
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsCreating(true);
    const modelPath = (window as any)._pendingModelPath;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name,
          description,
          model_path: modelPath,
          is_public: false // Final Rule 3: Public toggle works via is_public
        })
        .select()
        .single();

      if (error) {
        console.error("Project creation error:", error);
        throw error;
      }

      console.log("Project created:", data);
      toast.success("Project created successfully!");
      
      // Force a small delay to ensure DB consistency before redirect
      setTimeout(() => {
        router.push(`/editor/${data.id}`);
      }, 500);
    } catch (error: any) {
      console.error("HandleCreateProject catch:", error);
      toast.error(error.message || "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog onOpenChange={() => { setStep(1); setFile(null); setUploadProgress(0); setName(""); setDescription(""); }}>
      <DialogTrigger asChild>
        {children || (
          <button className="h-10 px-4 flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg shadow-lg active:scale-95 transition-all">
            <Plus className="w-4 h-4" />
            New project
          </button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-background-surface border-border-strong sm:rounded-2xl">
        <div className="flex h-full">
          {/* Main Form Area */}
          <div className="flex-1 p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <DialogHeader>
                    <DialogTitle className="text-xl">Upload your model</DialogTitle>
                    <DialogDescription>
                      Upload a GLB or GLTF file to start building your experience.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    className={cn(
                      "group relative aspect-[16/9] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-300",
                      file 
                        ? "border-success/50 bg-success-subtle/10" 
                        : "border-border-primary hover:border-accent/50 hover:bg-accent-subtle/5 bg-background-subtle"
                    )}
                  >
                    {!file && (
                      <>
                        <div className="w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center text-text-tertiary group-hover:text-accent transition-colors">
                           <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                           <p className="text-sm font-medium text-text-primary uppercase tracking-tight">Drag & drop your file here</p>
                           <p className="text-xs text-text-tertiary mt-1">Accepts .glb, .gltf — max 100MB</p>
                        </div>
                        <input
                          type="file"
                          accept=".glb,.gltf"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </>
                    )}

                    {file && !isUploading && (
                      <div className="flex flex-col items-center gap-3">
                         <div className="w-12 h-12 rounded-xl bg-success-subtle border border-success/20 flex items-center justify-center text-success">
                            <FileBox className="w-6 h-6" />
                         </div>
                         <div className="text-center">
                            <p className="text-sm font-medium text-text-primary">{file.name}</p>
                            <p className="text-xs text-text-tertiary mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                         </div>
                         <button 
                           onClick={() => setFile(null)}
                           className="text-xs text-text-tertiary hover:text-destructive transition-colors"
                         >
                           Remove file
                         </button>
                      </div>
                    )}

                    {isUploading && (
                      <div className="w-full px-12 space-y-4">
                         <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-text-secondary">Uploading model...</span>
                            <span className="text-accent">{uploadProgress}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-background-elevated rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-accent"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                            />
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-background-elevated border border-border-primary">
                    <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Tip: For the best experience, separate each interactive object into its own named mesh in Blender before export.
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      disabled={!file || isUploading}
                      onClick={handleUpload}
                      className="h-10 px-6 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 font-bold uppercase tracking-tight"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Next"}
                      {!isUploading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <DialogHeader>
                    <DialogTitle className="text-xl">Project details</DialogTitle>
                    <DialogDescription>
                      Give your project a name and description.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Project name *</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="My Awesome 3D Scene"
                          className="w-full h-10 px-4 rounded-lg bg-background-subtle border border-border-primary focus:border-border-focus outline-none transition-all text-text-primary"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Description (optional)</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Tell us about this experience..."
                          className="w-full h-24 p-4 rounded-lg bg-background-subtle border border-border-primary focus:border-border-focus outline-none transition-all resize-none text-text-primary"
                        />
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm font-medium text-text-tertiary hover:text-text-primary transition-colors"
                    >
                      Back
                    </button>
                    <button
                      disabled={isCreating}
                      onClick={handleCreateProject}
                       className="h-10 px-6 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 font-bold uppercase tracking-tight"
                    >
                      {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Open in Editor"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Side Illustration Panel (Desktop only) */}
          <div className="hidden lg:flex w-56 bg-[#0d0d0d] border-l border-border-strong p-8 flex-col justify-center gap-8">
             <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-accent-subtle border border-accent-border flex items-center justify-center text-accent">
                   <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-text-secondary leading-relaxed">
                   Upload your model and we'll optimize it for the web automatically.
                </p>
             </div>
             <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-background-elevated border border-border-primary flex items-center justify-center text-text-tertiary">
                   <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-text-tertiary leading-relaxed">
                   Blender assets work best with named meshes.
                </p>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
