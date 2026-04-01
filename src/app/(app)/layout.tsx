import React from "react";
import { AppSidebar } from "@/components/shared/AppSidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-full relative">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border-strong scrollbar-track-transparent">
          {children}
        </div>
      </main>
    </div>
  );
}
