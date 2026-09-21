import React from "react";
import { DesktopSidebar } from "@/components/shared/DesktopSidebar";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { TopBar } from "@/components/shared/TopBar";
import { Outlet } from "react-router-dom";

export const MemberLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Persistent Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <TopBar isBoard={false} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
