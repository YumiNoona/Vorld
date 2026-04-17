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
}: {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  isActive: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="origin-bottom relative group"
    >
      <Link
        href={href}
        className={cn(
          "relative flex items-center justify-center w-11 h-11 rounded-[14px] transition-colors duration-200",
          !isActive && "hover:bg-[--surface-low]"
        )}
      >
        {/* Subtle Backdrop for Active State */}
        {isActive && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 rounded-[14px] bg-[--surface-low] z-0"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        <Icon
          className={cn(
            "relative z-10 transition-colors duration-250",
            isActive ? "text-[--text-1]" : "text-[--text-3] group-hover:text-[--text-2]"
          )}
          style={{ width: 19, height: 19 }}
          strokeWidth={isActive ? 2 : 1.5}
        />

        {/* Tooltip */}
        <div className="absolute bottom-full mb-4 px-2.5 py-1.5 rounded-lg border border-[--surface-low] bg-[--surface] shadow-2xl pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="text-[--text-1] text-[11px] font-bold uppercase tracking-[0.1em]">{label}</span>
        </div>
      </Link>
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
  const supabase = createClient();

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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center">
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="mb-3 p-1.5 min-w-[240px] rounded-[22px] overflow-hidden bg-[--surface] border border-[--surface-low] shadow-3xl"
          >
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[--surface-subtle] border border-[--surface-low] flex items-center justify-center overflow-hidden shrink-0">
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
                  <span className="text-[13px] font-bold text-[--text-1] tracking-tight truncate">{profile?.full_name || "User"}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[--surface-low] text-[--text-3] text-[9px] font-bold uppercase tracking-wider">
                    {profile?.plan || "Free"}
                  </span>
                </div>
                <span className="text-[11px] text-[--text-3] truncate opacity-50">{profile?.email}</span>
              </div>
            </div>

            <div className="h-px mx-2 my-1 bg-[--surface-low]" />

            <button onClick={() => setTheme(isDark ? "light" : "dark")} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] text-[--text-2] hover:text-[--text-1] hover:bg-[--surface-low] transition-colors">
              {isDark ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>

            <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] text-[--text-2] hover:text-[--text-1] hover:bg-[--surface-low] transition-colors">
              <IconHelp className="w-4 h-4" />
              Help & Support
            </button>

            <div className="h-px mx-2 my-1 bg-[--surface-low]" />

            <button onClick={handleSignOut} className="w-full h-10 flex items-center gap-3 px-3.5 rounded-xl text-[13px] font-bold text-red-500 hover:bg-red-500/10 transition-colors uppercase tracking-widest text-center justify-center">
               Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="relative flex items-center gap-1 rounded-[26px] p-2 bg-[--surface] border border-[--surface-low] shadow-3xl">
        {NAV_ITEMS.map((item) => (
          <DockItem key={item.label} href={item.href} icon={item.icon} label={item.label} isActive={pathname === item.href} />
        ))}

        <div className="w-px h-5 mx-2 bg-[--surface-low]" />

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowMore((v) => !v)}
          className={cn(
            "relative flex items-center justify-center w-11 h-11 rounded-[14px] transition-colors duration-250",
            showMore ? "bg-[--surface-low]" : "hover:bg-[--surface-subtle]"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-[--surface-subtle] border border-[--surface-low] flex items-center justify-center overflow-hidden shrink-0 transition-transform group-hover:scale-105">
            {profile?.avatar_url ? (
              <img src={supabase.storage.from("avatars").getPublicUrl(profile.avatar_url).data.publicUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[--text-3] text-[10px] font-bold uppercase leading-none opacity-50">
                {profile?.full_name?.charAt(0) || "U"}
              </span>
            )}
          </div>
        </motion.button>
      </nav>
    </div>
  );
}
