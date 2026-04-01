"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Venus branding SVG Logo component
 */
const Logo = () => (
  <div className="flex items-center gap-2 group">
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="text-accent group-hover:scale-110 transition-transform duration-300"
    >
      <path 
        d="M12 2L4 12L12 22L20 12L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
    <span className="text-xl font-semibold tracking-tight text-text-primary">
      Vorld
    </span>
  </div>
);

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "https://docs.venusapp.in" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-14 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl border-border-primary shadow-sm" 
          : "bg-transparent border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md hover:bg-background-elevated text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <Link
            href="/login"
            className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 transition-colors duration-200"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-1.5 px-4 h-9 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
