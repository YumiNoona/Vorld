"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  LayoutGrid as IconDashboard,
  Box as IconProjects,
  CreditCard as IconBilling,
  Settings as IconSettings,
  HelpCircle as IconHelp,
  Moon as IconMoon,
  Sun as IconSun,
  LogOut as IconLogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: IconDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: IconProjects },
  { label: "Billing", href: "/dashboard/billing", icon: IconBilling },
  { label: "Settings", href: "/dashboard/settings", icon: IconSettings },
];

/* --- Constants for the "Liquid" Feel --- */
const SPRING_CONFIG = { stiffness: 180, damping: 18, mass: 0.6 };
const MAGNIFICATION_RANGE = [1.45, 1];
const DISTANCE_RANGE = [0, 160];

function DockItem({
  href,
  icon: Icon,
  label,
  isActive,
  mouseX,
  isDark,
}: {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  isActive: boolean;
  mouseX: any;
  isDark: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const baseSize = 44;

  // Single source distance logic
  const distance = useMotionValue(200);
  
  // High-fidelity spring logic
  const springValue = useSpring(distance, SPRING_CONFIG);

  // Sync distance without re-renders
  useEffect(() => {
    const unsub = mouseX.on("change", (mx: number) => {
      if (!ref.current || mx < 0) {
        distance.set(200);
        return;
      }
      const rect = ref.current.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      distance.set(Math.abs(mx - center));
    });
    return unsub;
  }, [mouseX, distance]);

  // Derived transforms from the single spring value
  const scale = useTransform(springValue, DISTANCE_RANGE, MAGNIFICATION_RANGE, { clamp: true });
  const translateY = useTransform(scale, (s: number) => (s - 1) * -10);

  return (
    <motion.div
      style={{ scale, y: translateY, willChange: "transform", width: baseSize, height: baseSize }}
      className="origin-bottom relative group"
    >
      <Link
        ref={ref}
        href={href}
        className={cn(
          "relative flex items-center justify-center w-full h-full rounded-[14px] transition-colors duration-200",
          !isActive && (isDark ? "hover:bg-white/[0.08]" : "hover:bg-black/[0.04]")
        )}
      >
        {/* Amber Pill Background for Active State */}
        {isActive && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 rounded-[14px] bg-[--accent-subtle] border border-[--accent-border] z-0"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        <Icon
          className={cn(
            "relative z-10 transition-colors duration-200",
            isActive ? "text-[--accent]" : (isDark ? "text-[--text-3] group-hover:text-[--text-2]" : "text-[--text-3] group-hover:text-[--text-2]")
          )}
          style={{ width: 19, height: 19 }}
          strokeWidth={isActive ? 2.2 : 1.8}
        />

        {/* Tooltip with AnimatePresence */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            whileHover={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-full mb-4 px-2.5 py-1.5 rounded-lg border border-[--border] bg-[--surface] shadow-xl pointer-events-none whitespace-nowrap hidden group-hover:block"
          >
             <span className="text-[--text-1] text-[11px] font-medium tracking-tight">{label}</span>
          </motion.div>
        </AnimatePresence>
      </Link>

      <motion.div whileTap={{ scale: 0.92 }} className="absolute inset-0 pointer-events-none" />
    </motion.div>
  );
}

export function AppDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const mouseX = useMotionValue(-1);

  const isDark = resolvedTheme === "dark";

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(data);
      }
    }
    loadProfile();
  }, [supabase]);

  if (!mounted) return null;

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/login"); };

  return (
    <div ref={containerRef} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center">
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className={cn(
              "mb-3 p-1.5 min-w-[240px] rounded-[22px] overflow-hidden",
              isDark ? "glass-dark" : "glass-light"
            )}
            style={{
              boxShadow: isDark 
                ? "0 0 0 0.5px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.18) inset, 0 -1px 0 rgba(0,0,0,0.3) inset, 0 16px 40px rgba(0,0,0,0.5)"
                : "0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(0,0,0,0.06) inset, 0 16px 40px rgba(0,0,0,0.12)"
            }}
          >
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[--surface-raised] border border-[--border] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {profile?.avatar_url ? (
                  <img src={supabase.storage.from("avatars").getPublicUrl(profile.avatar_url).data.publicUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[--text-3] text-xs font-bold leading-none uppercase">
                    {profile?.full_name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-[--text-1] truncate">{profile?.full_name || "User"}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-[--accent-subtle] text-[--accent] text-[9px] font-bold uppercase tracking-wider border border-[--accent-border]">
                    {profile?.plan || "Free"}
                  </span>
                </div>
                <span className="text-[11px] text-[--text-3] truncate">{profile?.email}</span>
              </div>
            </div>

            <div className="h-px mx-2 my-1 bg-[--border]" />

            <button onClick={() => setTheme(isDark ? "light" : "dark")} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] text-[--text-2] hover:text-[--text-1] hover:bg-[--surface-raised] transition-colors">
              {isDark ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>

            <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] text-[--text-2] hover:text-[--text-1] hover:bg-[--surface-raised] transition-colors">
              <IconHelp className="w-4 h-4" />
              Help & Support
            </button>

            <div className="h-px mx-2 my-1 bg-[--border]" />

            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-500/10 transition-colors">
               Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className={cn(
          "relative flex items-center gap-1 border border-[--border] rounded-[26px] p-2",
          isDark ? "glass-dark shadow-[0_16px_40px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.3)]" : "glass-light shadow-[0_16px_40px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06)]"
        )}
        style={{
          boxShadow: isDark 
            ? "0 0 0 0.5px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.18) inset, 0 -1px 0 rgba(0,0,0,0.3) inset, 0 16px 40px rgba(0,0,0,0.5)"
            : "0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(0,0,0,0.06) inset, 0 16px 40px rgba(0,0,0,0.12)"
        }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(-1)}
      >
        {NAV_ITEMS.map((item) => (
          <DockItem key={item.label} href={item.href} icon={item.icon} label={item.label} isActive={pathname === item.href} mouseX={mouseX} isDark={isDark} />
        ))}

        <div className="w-px h-5 mx-2 bg-[--border]" />

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowMore((v) => !v)}
          className={cn(
            "relative flex items-center justify-center w-11 h-11 rounded-[14px] transition-colors duration-250",
            showMore ? (isDark ? "bg-white/[0.12]" : "bg-black/[0.06]") : (isDark ? "hover:bg-white/[0.08]" : "hover:bg-black/[0.04]")
          )}
        >
          <div className="w-8 h-8 rounded-full bg-[--surface-raised] border border-[--border] flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
            {profile?.avatar_url ? (
              <img src={supabase.storage.from("avatars").getPublicUrl(profile.avatar_url).data.publicUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[--text-3] text-[10px] font-bold uppercase leading-none">
                {profile?.full_name?.charAt(0) || "U"}
              </span>
            )}
          </div>
        </motion.button>
      </nav>
    </div>
  );
}
