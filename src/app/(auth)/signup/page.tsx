"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      // 1. Sign up user
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signupError) throw signupError;

      // 2. Handle deterministic redirection
      if (data.session) {
        // Email confirmation is OFF
        // Create profile
        const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") + Math.floor(Math.random() * 1000);
        
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user?.id,
            full_name: fullName,
            username: username,
          });

        if (profileError) {
          console.warn("Profile creation error:", profileError);
          // We don't throw here to avoid blocking login if profile insert fails 
          // (it might fail due to RLS or existing username, but auth succeeded)
        }

        toast.success("Account created successfully!");
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      } else {
        // Email confirmation is ON
        setSuccess(true);
        toast.info("Please check your email to confirm your account.");
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      toast.error(err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
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
          {success ? "Check your email" : "Create an account"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          className="text-sm text-text-secondary"
        >
          {success 
            ? "We've sent a confirmation link to your email address." 
            : "Join 2,400+ creators building the future of 3D."}
        </motion.p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-400 leading-relaxed">{error}</p>
          </motion.div>
        )}

        {success && !isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-start gap-3"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-400 leading-relaxed">
              Account created successfully! {router ? "Redirecting..." : "Please check your inbox."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!success && (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={isLoading}
              className="w-full h-10 px-4 rounded-lg bg-bg-secondary border border-border-default focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 transition-all outline-none disabled:opacity-50 text-text-primary placeholder:text-text-secondary/50"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={isLoading}
              className="w-full h-10 px-4 rounded-lg bg-bg-secondary border border-border-default focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 transition-all outline-none disabled:opacity-50 text-text-primary placeholder:text-text-secondary/50"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full h-10 px-4 rounded-lg bg-bg-secondary border border-border-default focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 transition-all outline-none disabled:opacity-50 text-text-primary placeholder:text-text-secondary/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-text-tertiary">Minimum 6 characters</p>
          </div>

          {/* Submit */}
          <button
            disabled={isLoading}
            className="w-full h-11 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              "Create account"
            )}
          </button>
        </motion.form>
      )}

      {/* Login Link */}
      <p className="text-center text-sm text-text-tertiary pt-2">
        {success ? (
          <button onClick={() => setSuccess(false)} className="text-accent hover:text-accent-hover font-medium">
            Back to signup
          </button>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
              Log in
            </Link>
          </>
        )}
      </p>
    </AuthSplitLayout>
  );
}
