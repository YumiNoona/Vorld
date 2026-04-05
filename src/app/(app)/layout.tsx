import React from "react";
import { AppDock } from "@/components/shared/AppDock";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg-primary font-sans">
      {/* Main Content Area - Full width, clean background, no sidebar borders */}
      <main className="h-full w-full overflow-y-auto scrollbar-none pb-32">
        {children}
      </main>

      {/* Floating iPad-style Dock with Glassmorphism */}
      <AppDock />
    </div>
  );
}
