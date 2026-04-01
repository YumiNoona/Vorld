"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Globe, 
  LogOut,
  Save,
  Camera,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: "",
    avatar_url: "",
  });
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUser(user);
        setEmail(user.email || "");

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        
        if (profileData) {
          setProfile({
            full_name: profileData.full_name || "",
            avatar_url: profileData.avatar_url || "",
          });
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Update profile with new avatar URL (path)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: filePath }));
      toast.success("Avatar updated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update Name in profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // 2. Update Email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        toast.info("Follow the link sent to both emails to confirm the change.");
      }

      // 3. Update Password if provided
      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
        if (passwordError) throw passwordError;
        setNewPassword("");
        toast.success("Password updated!");
      }

      toast.success("Settings saved!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const avatarPublicUrl = profile.avatar_url 
    ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl 
    : null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2 uppercase">Settings</h1>
        <p className="text-sm text-text-secondary">Manage your account preferences and security.</p>
      </div>

      {/* Profile Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-medium text-text-primary flex items-center gap-2">
          <User className="w-4 h-4 text-accent" />
          Profile
        </h2>
        
        <div className="p-8 rounded-2xl bg-background-subtle border border-border-primary space-y-8">
           <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                 <div className="w-20 h-20 rounded-full bg-background-elevated border-2 border-border-primary flex items-center justify-center overflow-hidden">
                    {avatarPublicUrl ? (
                      <img src={avatarPublicUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-text-tertiary" />
                    )}
                 </div>
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera className="w-5 h-5 text-white" />
                 </div>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*"
                   onChange={handleAvatarUpload}
                 />
              </div>
              <div>
                 <h3 className="text-text-primary font-medium">Profile Picture</h3>
                 <p className="text-xs text-text-tertiary mt-1 uppercase tracking-tight font-bold">JPG, GIF or PNG. Max size of 2MB.</p>
                 <div className="flex items-center gap-2 mt-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold uppercase tracking-tight text-accent hover:text-accent-hover transition-colors"
                    >
                      Upload new
                    </button>
                    <span className="text-text-tertiary">•</span>
                    <button 
                      className="text-xs font-bold uppercase tracking-tight text-text-tertiary hover:text-destructive transition-colors"
                      onClick={async () => {
                         const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
                         if (!error) setProfile(prev => ({ ...prev, avatar_url: "" }));
                      }}
                    >
                      Remove
                    </button>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Full Name</label>
                 <input 
                   type="text" 
                   value={profile.full_name}
                   onChange={e => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                   className="w-full h-10 px-4 rounded-lg bg-background border border-border-primary focus:border-accent outline-none transition-all text-sm text-text-primary"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Email Address</label>
                 <input 
                   type="email" 
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   className="w-full h-10 px-4 rounded-lg bg-background border border-border-primary focus:border-accent outline-none transition-all text-sm text-text-primary"
                 />
              </div>
           </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-medium text-text-primary flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          Security
        </h2>
        
        <div className="p-8 rounded-2xl bg-background-subtle border border-border-primary space-y-6">
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">New Password</label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                   <input 
                     type="password" 
                     placeholder="Leave blank to keep current"
                     value={newPassword}
                     onChange={e => setNewPassword(e.target.value)}
                     className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border-primary focus:border-accent outline-none transition-all text-sm text-text-primary"
                   />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-border-primary">
         <button 
           onClick={handleSignOut}
           className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight text-destructive hover:bg-destructive-subtle/20 px-4 py-2 rounded-lg transition-all"
         >
            <LogOut className="w-4 h-4" />
            Sign out
         </button>
         <button 
           onClick={handleSave}
           disabled={saving}
           className="h-10 px-6 bg-accent hover:bg-accent-hover text-white text-sm font-bold uppercase tracking-tight rounded-lg shadow-lg active:scale-95 transition-all flex items-center gap-2"
         >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
         </button>
      </div>
    </div>
  );
}
