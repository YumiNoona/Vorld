"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, 
  Box, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  Moon, 
  Sun,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Projects", href: "/dashboard/projects", icon: Box },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
   const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    // Auto-collapse on smaller screens
    const handleResize = () => {
      if (window.innerWidth < 1280) setIsCollapsed(true);
    };
    handleResize();
     window.addEventListener("resize", handleResize);

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    }
    loadProfile();

    return () => window.removeEventListener("resize", handleResize);
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const avatarUrl = profile?.avatar_url 
    ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl 
    : null;

  if (!mounted) return null;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-[--bg] z-40"
    >
      {/* Header / Logo */}
      <div className={cn(
        "h-16 flex items-center px-4 shrink-0",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[--text-1]">
               <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xl font-bold tracking-tighter text-[--text-1] transition-opacity group-hover:opacity-70">Vorld</span>
          </Link>
        )}
        {isCollapsed && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[--text-1]">
            <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-1 rounded-md hover:bg-[--surface-raised] text-[--text-3] transition-colors",
            isCollapsed && "hidden xl:block"
          )}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Info */}
        {!isCollapsed && (
          <div className="p-6 flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-[--surface-subtle] flex items-center justify-center text-[--text-3] ring-1 ring-[--surface-low] overflow-hidden shadow-sm">
             {avatarUrl ? (
               <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               <User className="w-4 h-4" />
             )}
           </div>
           <div className="flex flex-col min-w-0">
             <span className="text-[13px] font-bold text-[--text-1] tracking-tight truncate">
               {profile?.full_name || "New User"}
             </span>
             <span className="text-[10px] uppercase font-bold text-[--text-3] tracking-[0.2em] truncate">
               {profile?.email?.split('@')[0] || "User"}
             </span>
           </div>
         </div>
       )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 h-10 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all duration-200 relative",
                isCollapsed ? "justify-center" : "px-3",
                isActive 
                  ? "bg-[--surface-low] text-[--text-1]" 
                  : "text-[--text-3] hover:bg-[--surface-subtle] hover:text-[--text-2]"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0 transition-opacity", isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70")} />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-0.5 h-4 bg-white/20 rounded-full"
                />
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-[--surface] rounded-[10px] text-[10px] font-bold text-[--text-1] uppercase tracking-[0.15em] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-1 group-hover:translate-x-0 shadow-[0_16px_48px_rgba(0,0,0,0.5)] z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-1 shrink-0">
        <button className={cn(
          "w-full flex items-center gap-3 h-9 rounded-md text-sm font-medium text-[--text-2] hover:bg-[--surface-raised] hover:text-[--text-1] transition-all",
          isCollapsed ? "justify-center" : "px-3"
        )}>
          <HelpCircle className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Help & Docs</span>}
        </button>
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "w-full flex items-center gap-3 h-9 rounded-md text-sm font-medium text-[--text-2] hover:bg-[--surface-raised] hover:text-[--text-1] transition-all",
            isCollapsed ? "justify-center" : "px-3"
          )}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>
         <button 
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-3 h-9 rounded-md text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all",
            isCollapsed ? "justify-center" : "px-3"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
