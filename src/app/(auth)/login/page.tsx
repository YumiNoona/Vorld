"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Supabase Login logic
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <AuthSplitLayout>
      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-2xl font-semibold tracking-tight text-white"
        >
          Welcome back
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          className="text-sm text-text-secondary"
        >
          Enter your details to access your dashboard.
        </motion.p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Email Address</label>
          <input
            type="email"
            required
            placeholder="name@example.com"
            className="w-full h-10 px-4 rounded-lg bg-background-subtle border border-border-primary focus:border-border-focus focus:ring-2 focus:ring-accent-subtle transition-all outline-none"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-secondary">Password</label>
            <Link href="/forgot-password"  className="text-xs text-accent hover:text-accent-hover font-medium transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full h-10 px-4 rounded-lg bg-background-subtle border border-border-primary focus:border-border-focus focus:ring-2 focus:ring-accent-subtle transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          disabled={isLoading}
          className="w-full h-11 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log in"}
        </button>
      </motion.form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-primary"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-text-tertiary">Or continue with</span>
        </div>
      </div>

      {/* OAuth */}
      <div className="grid grid-cols-2 gap-4">
        <button className="h-10 border border-border-primary hover:border-border-strong rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-text-secondary transition-colors transition-all">
          <Globe className="w-4 h-4" />
          Google
        </button>
        <button className="h-10 border border-border-primary hover:border-border-strong rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-text-secondary transition-colors transition-all">
          <Lock className="w-4 h-4" />
          GitHub
        </button>
      </div>

      {/* Signup Link */}
      <p className="text-center text-sm text-text-tertiary">
        Don't have an account?{" "}
        <Link href="/signup" className="text-accent hover:text-accent-hover font-medium">
          Sign up
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
