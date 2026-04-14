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
  User as IconUser,
  LogOut as IconLogOut,
  MoreHorizontal as IconMore,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: IconDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: IconProjects },
  { label: "Billing", href: "/dashboard/billing", icon: IconBilling },
  { label: "Settings", href: "/dashboard/settings", icon: IconSettings },
];

/* ── Glass styles per theme ── */
function useDockGlass(isDark: boolean) {
  const dockShell: React.CSSProperties = {
    backdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
    WebkitBackdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
    background: isDark
      ? "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 100%), rgba(255,255,255,0.04)"
      : "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.52) 100%), rgba(255,255,255,0.04)",
    border: isDark
      ? "1px solid rgba(255,255,255,0.18)"
      : "1px solid rgba(0,0,0,0.08)",
    boxShadow: isDark
      ? "0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.12)"
      : "0 10px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.03)",
    borderRadius: "28px",
    padding: "10px 14px",
  };

  const popover: React.CSSProperties = {
    backdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
    WebkitBackdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
    background: isDark
      ? "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)"
      : "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.62) 100%)",
    border: isDark
      ? "1px solid rgba(255,255,255,0.15)"
      : "1px solid rgba(0,0,0,0.08)",
    boxShadow: isDark
      ? "0 10px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)"
      : "0 10px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
    borderRadius: "20px",
  };

  const tooltip: React.CSSProperties = {
    backdropFilter: "blur(20px) saturate(150%)",
    WebkitBackdropFilter: "blur(20px) saturate(150%)",
    background: isDark
      ? "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)"
      : "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 100%)",
    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.06)",
    boxShadow: isDark
      ? "0 4px 16px rgba(0,0,0,0.25), inset 0 0.5px 0 rgba(255,255,255,0.2)"
      : "0 4px 16px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.8)",
    borderRadius: "10px",
  };

  return { dockShell, popover, tooltip };
}

/* ── Dock Item with proximity magnification (motion-value driven, no React state) ── */
function DockItem({
  href,
  icon: Icon,
  label,
  isActive,
  mouseX,
  isDark,
  tooltipStyle,
}: {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  isActive: boolean;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  isDark: boolean;
  tooltipStyle: React.CSSProperties;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);
  const baseSize = 44;

  // Distance-based scale computed as a motion value — no React state updates
  const distance = useMotionValue(0);

  useEffect(() => {
    const unsub = mouseX.on("change", (mx) => {
      if (!ref.current || mx < 0) {
        distance.set(200); // far away = scale 1
        return;
      }
      const rect = ref.current.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      distance.set(Math.abs(mx - center));
    });
    return unsub;
  }, [mouseX, distance]);

  // Transform distance → raw scale (no React re-renders)
  const rawScale = useTransform(distance, [0, 180], [1.35, 1], { clamp: true });

  // Soft liquid spring
  const springScale = useSpring(rawScale, { stiffness: 200, damping: 20, mass: 0.5 });

  // Derive translateY from springScale for the "float up" effect
  const translateY = useTransform(springScale, (s: number) => (s - 1) * -8);

  return (
    <motion.div
      style={{
        scale: springScale,
        y: translateY,
        willChange: "transform",
        width: baseSize,
        height: baseSize,
      }}
      className="origin-bottom"
    >
      <Link
        ref={ref}
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative group flex items-center justify-center w-full h-full rounded-[14px] transition-[background,box-shadow] duration-200",
          isActive && isDark && "bg-white/[0.12] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.2)]",
          isActive && !isDark && "bg-black/[0.06] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.5)]",
          !isActive && isDark && "hover:bg-white/[0.06]",
          !isActive && !isDark && "hover:bg-black/[0.04]",
        )}
        style={{
          filter: hovered ? "brightness(1.12)" : "brightness(1)",
        }}
      >
        <Icon
          className={cn(
            "transition-colors duration-150",
            isActive && isDark && "text-white",
            isActive && !isDark && "text-slate-900",
            !isActive && isDark && "text-white/50 group-hover:text-white/85",
            !isActive && !isDark && "text-slate-400 group-hover:text-slate-700",
          )}
          style={{ width: 18, height: 18 }}
          strokeWidth={isActive ? 2 : 1.5}
        />

        {/* Tooltip */}
        <div
          className={cn(
            "absolute bottom-full mb-3 px-2.5 py-1 text-[11px] font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover:translate-y-0 whitespace-nowrap",
            isDark ? "text-white/90" : "text-slate-800",
          )}
          style={tooltipStyle}
        >
          {label}
        </div>

        {isActive && (
          <motion.div
            layoutId="dock-indicator"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    </motion.div>
  );
}

/* ── Main Dock ── */
export function AppDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const mouseX = useMotionValue(-1);

  const isDark = resolvedTheme === "dark";
  const glass = useDockGlass(isDark);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowMore(false);
    }
    if (showMore) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMore]);

  if (!mounted) return null;

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/login"); };

  /* Theme-aware text classes */
  const txtPrimary = isDark ? "text-white/90" : "text-slate-800";
  const txtSecondary = isDark ? "text-white/50" : "text-slate-500";
  const txtMuted = isDark ? "text-white/40" : "text-slate-400";
  const hoverBg = isDark ? "hover:bg-white/[0.08]" : "hover:bg-black/[0.04]";
  const divider = isDark ? "bg-white/[0.06]" : "bg-black/[0.06]";

  return (
    <div ref={containerRef} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center">
      {/* ── Popover ── */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            style={glass.popover}
            className="mb-3 p-1.5 min-w-[220px] relative overflow-hidden"
          >
            <div className="relative px-3 py-2.5 flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ring-1", isDark ? "bg-white/10 ring-white/10 text-white/60" : "bg-black/5 ring-black/5 text-slate-500")}>
                {profile?.avatar_url ? (
                  <img src={supabase.storage.from("avatars").getPublicUrl(profile.avatar_url).data.publicUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <IconUser className="w-4 h-4" />
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className={cn("text-[13px] font-medium truncate leading-tight", txtPrimary)}>{profile?.full_name || "User"}</span>
                <span className={cn("text-[11px] truncate leading-tight", txtMuted)}>{profile?.email}</span>
              </div>
            </div>

            <div className={cn("h-px mx-2 my-1 relative", divider)} />

            <button onClick={() => setTheme(isDark ? "light" : "dark")} className={cn("relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-normal transition-colors text-left", txtSecondary, hoverBg)}>
              {isDark ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>

            <button className={cn("relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-normal transition-colors text-left", txtSecondary, hoverBg)}>
              <IconHelp className="w-4 h-4" />
              Help & Support
            </button>

            <div className={cn("h-px mx-2 my-1 relative", divider)} />

            <button onClick={handleSignOut} className="relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-normal text-red-500 hover:bg-red-500/10 transition-colors text-left">
              <IconLogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dock Shell ── */}
      <nav
        style={glass.dockShell}
        className="relative flex items-center gap-0.5 overflow-visible"
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(-1)}
      >
        {/* No separate frostBloom / depthCompress divs — consolidated into dockShell background + box-shadow */}

        {NAV_ITEMS.map((item) => (
          <DockItem key={item.label} href={item.href} icon={item.icon} label={item.label} isActive={pathname === item.href} mouseX={mouseX} isDark={isDark} tooltipStyle={glass.tooltip} />
        ))}

        <div className={cn("w-px h-5 mx-1.5 relative", isDark ? "bg-white/[0.08]" : "bg-black/[0.06]")} />

        <button
          onClick={() => setShowMore((v) => !v)}
          className={cn(
            "relative group flex items-center justify-center w-11 h-11 rounded-[14px] transition-all duration-200",
            showMore && isDark && "bg-white/[0.12]",
            showMore && !isDark && "bg-black/[0.06]",
            !showMore && isDark && "text-white/50 hover:bg-white/[0.06] hover:text-white/85",
            !showMore && !isDark && "text-slate-400 hover:bg-black/[0.04] hover:text-slate-700",
          )}
        >
          <IconMore className={cn("w-[18px] h-[18px]", showMore ? (isDark ? "text-white" : "text-slate-800") : "")} strokeWidth={1.5} />
          <div className={cn("absolute bottom-full mb-3 px-2.5 py-1 text-[11px] font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover:translate-y-0 whitespace-nowrap", isDark ? "text-white/90" : "text-slate-800")} style={glass.tooltip}>
            More
          </div>
        </button>
      </nav>
    </div>
  );
}
