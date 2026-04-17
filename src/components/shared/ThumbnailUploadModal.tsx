"use client";

import React, { useState, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ThumbnailUploadModalProps {
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (thumbnailUrl: string) => void;
}

export function ThumbnailUploadModal({ 
  projectId, 
  isOpen, 
  onOpenChange, 
  onUpdate 
}: ThumbnailUploadModalProps) {
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      toast.error("File size must be under 2MB.");
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${projectId}_${Date.now()}.${fileExt}`;

      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(filePath);

      // 3. Update database
      const { error: dbError } = await supabase
        .from('projects')
        .update({ thumbnail_url: publicUrl })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      toast.success("Thumbnail updated successfully!");
      onUpdate?.(publicUrl);
      onOpenChange(false);
      
      // Cleanup
      setFile(null);
      setPreview(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload thumbnail");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[--bg] border border-[--border] sm:rounded-2xl shadow-3xl">
        <div className="p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[--text-1] tracking-tight">Project Thumbnail</DialogTitle>
            <DialogDescription className="text-sm text-[--text-2]">
              Choose a custom image to represent this project.
            </DialogDescription>
          </DialogHeader>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={cn(
              "group relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-300 overflow-hidden",
              file 
                ? "border-[--accent]/30 bg-[--accent-subtle]" 
                : "border-[--border] hover:border-[--accent]/40 hover:bg-[--surface-low] bg-[--surface-subtle]"
            )}
          >
            {preview ? (
              <div className="absolute inset-0 w-full h-full">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[--surface-low] flex items-center justify-center text-[--text-3] group-hover:text-[--accent] group-hover:scale-110 transition-all duration-300">
                   <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                   <p className="text-sm font-semibold text-[--text-1] tracking-tight">Drag & drop your image</p>
                   <p className="text-xs text-[--text-3] mt-1 font-medium">JPG, PNG, WebP (Max 2MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) handleFileSelect(selected);
                  }}
                />
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              disabled={isUploading}
              onClick={() => onOpenChange(false)}
              className="px-4 text-xs font-bold text-[--text-3] hover:text-[--text-1] transition-colors uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
               disabled={isUploading || !file}
               onClick={handleUpload}
               className="h-10 px-8 bg-[--text-1] hover:opacity-90 disabled:opacity-50 text-[--bg] text-[11px] font-bold uppercase tracking-widest rounded-full transition-all shadow-2xl active:scale-95 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
