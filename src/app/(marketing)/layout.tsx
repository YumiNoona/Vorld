"use client";

import React from "react";
import { Navbar } from "@/components/shared/Navbar";
import { usePathname } from "next/navigation";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="flex flex-col min-h-screen">
      {!isHome && <Navbar />}
      <main className={cn("flex-1", !isHome && "pt-14")}>
        {children}
      </main>
      <footer className="w-full h-16 border-t border-white/5 bg-[#080808] flex items-center justify-center text-sm text-white/30">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <p>© 2026 Vorld. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Product</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { cn } from "@/lib/utils";
