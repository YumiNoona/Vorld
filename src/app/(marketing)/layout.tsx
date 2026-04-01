import React from "react";
import { Navbar } from "@/components/shared/Navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-14">
        {children}
      </main>
      <footer className="w-full h-16 border-t border-border-primary bg-background-subtle flex items-center justify-center text-sm text-text-tertiary">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <p>© 2026 Venus. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-text-secondary">Product</a>
            <a href="#" className="hover:text-text-secondary">Twitter</a>
            <a href="#" className="hover:text-text-secondary">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
