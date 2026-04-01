"use client";

import React from "react";
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
  Camera
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">Settings</h1>
        <p className="text-sm text-text-secondary">Manage your account preferences and security.</p>
      </div>

      {/* Profile Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <User className="w-4 h-4 text-accent" />
          Profile
        </h2>
        
        <div className="p-8 rounded-2xl bg-background-subtle border border-border-primary space-y-8">
           <div className="flex items-center gap-6">
              <div className="relative group">
                 <div className="w-20 h-20 rounded-full bg-background-elevated border-2 border-border-primary flex items-center justify-center overflow-hidden">
                    <User className="w-10 h-10 text-text-tertiary" />
                 </div>
                 <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera className="w-5 h-5 text-white" />
                 </button>
              </div>
              <div>
                 <h3 className="text-white font-medium">Profile Picture</h3>
                 <p className="text-xs text-text-tertiary mt-1">JPG, GIF or PNG. Max size of 2MB.</p>
                 <div className="flex items-center gap-2 mt-3">
                    <button className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">Upload new</button>
                    <span className="text-text-tertiary">•</span>
                    <button className="text-xs font-semibold text-text-tertiary hover:text-destructive transition-colors">Remove</button>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Full Name</label>
                 <input 
                   type="text" 
                   defaultValue="John Doe"
                   className="w-full h-10 px-4 rounded-lg bg-background border border-border-primary focus:border-accent outline-none transition-all text-sm text-white"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Email Address</label>
                 <input 
                   type="email" 
                   defaultValue="john@example.com"
                   className="w-full h-10 px-4 rounded-lg bg-background border border-border-primary focus:border-accent outline-none transition-all text-sm text-white"
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Bio</label>
              <textarea 
                placeholder="Write a short bio..."
                className="w-full h-24 p-4 rounded-lg bg-background border border-border-primary focus:border-accent outline-none transition-all text-sm text-white resize-none"
              />
           </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          Security
        </h2>
        
        <div className="p-8 rounded-2xl bg-background-subtle border border-border-primary space-y-6">
           <div className="flex items-center justify-between py-2">
              <div>
                 <h3 className="text-sm font-medium text-white">Password</h3>
                 <p className="text-xs text-text-tertiary mt-1">Last changed 3 months ago.</p>
              </div>
              <button className="h-9 px-4 rounded-lg border border-border-primary hover:bg-background-elevated text-xs font-medium text-white transition-all">
                 Change password
              </button>
           </div>
           
           <div className="h-px bg-border-primary" />
           
           <div className="flex items-center justify-between py-2">
              <div>
                 <h3 className="text-sm font-medium text-white">Two-factor authentication</h3>
                 <p className="text-xs text-text-tertiary mt-1">Add an extra layer of security to your account.</p>
              </div>
              <div className="w-10 h-5 bg-background-elevated rounded-full flex items-center px-1">
                 <div className="w-3 h-3 bg-white/20 rounded-full" />
              </div>
           </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent" />
          Preferences
        </h2>
        
        <div className="p-8 rounded-2xl bg-background-subtle border border-border-primary space-y-6">
           <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-sm font-medium text-white">Default Visibility</h3>
                 <p className="text-xs text-text-tertiary mt-1">New projects are private by default.</p>
              </div>
              <select className="h-9 px-3 rounded-md bg-background border border-border-primary text-xs text-white outline-none">
                 <option>Private</option>
                 <option>Public</option>
              </select>
           </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-border-primary">
         <button className="flex items-center gap-2 text-sm font-medium text-destructive hover:bg-destructive-subtle/20 px-4 py-2 rounded-lg transition-all">
            <LogOut className="w-4 h-4" />
            Sign out
         </button>
         <button className="h-10 px-6 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg shadow-lg active:scale-95 transition-all flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save changes
         </button>
      </div>
    </div>
  );
}
