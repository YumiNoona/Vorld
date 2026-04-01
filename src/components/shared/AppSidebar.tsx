"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  User
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

  useEffect(() => {
    setMounted(true);
    // Auto-collapse on smaller screens
    const handleResize = () => {
      if (window.innerWidth < 1280) setIsCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return null;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-background border-r border-border-primary z-40"
    >
      {/* Header / Logo */}
      <div className={cn(
        "h-14 flex items-center border-b border-border-primary px-4 shrink-0",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent">
              <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
            <span className="font-semibold tracking-tight text-white">Venus</span>
          </Link>
        )}
        {isCollapsed && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-1 rounded-md hover:bg-background-elevated text-text-tertiary transition-colors",
            isCollapsed && "hidden xl:block"
          )}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 flex items-center gap-3 border-b border-border-primary/50">
          <div className="w-8 h-8 rounded-full bg-background-elevated flex items-center justify-center text-accent ring-1 ring-border-primary">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">John Doe</span>
            <span className="text-[10px] uppercase font-bold text-accent tracking-widest">Free Plan</span>
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
                "group flex items-center gap-3 h-9 rounded-md text-sm font-medium transition-all duration-150 relative",
                isCollapsed ? "justify-center" : "px-3",
                isActive 
                  ? "bg-accent-subtle text-accent" 
                  : "text-text-secondary hover:bg-background-elevated hover:text-text-primary"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0 transition-transform", !isCollapsed && isActive && "scale-110")} />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-0.5 h-4 bg-accent rounded-full"
                />
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-background-overlay border border-border-primary rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 space-y-1 border-t border-border-primary shrink-0">
        <button className={cn(
          "w-full flex items-center gap-3 h-9 rounded-md text-sm font-medium text-text-secondary hover:bg-background-elevated hover:text-text-primary transition-all",
          isCollapsed ? "justify-center" : "px-3"
        )}>
          <HelpCircle className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Help & Docs</span>}
        </button>
        <button className={cn(
          "w-full flex items-center gap-3 h-9 rounded-md text-sm font-medium text-text-secondary hover:bg-background-elevated hover:text-text-primary transition-all",
          isCollapsed ? "justify-center" : "px-3"
        )}>
          <Moon className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Dark Theme</span>}
        </button>
      </div>
    </motion.aside>
  );
}
