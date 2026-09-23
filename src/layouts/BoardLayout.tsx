import React from "react";
import { DesktopBoardSidebar } from "@/components/shared/DesktopBoardSidebar";
import { MobileBoardBottomNav } from "@/components/shared/MobileBoardBottomNav";
import { TopBar } from "@/components/shared/TopBar";
import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/hooks/useSession";

export const BoardLayout: React.FC = () => {
  const { currentPersona } = useSession();
  if (currentPersona.role === "MEMBER") return <Navigate to="/app" replace />;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* High-density Desktop Board Sidebar */}
      <DesktopBoardSidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <TopBar isBoard={true} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Board Bottom Navigation + More Sheet Drawer */}
      <MobileBoardBottomNav />
    </div>
  );
};
