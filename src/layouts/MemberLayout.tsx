import React from "react";
import { DesktopSidebar } from "@/components/shared/DesktopSidebar";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { TopBar } from "@/components/shared/TopBar";
import { QuickOnboardingModal } from "@/components/shared/QuickOnboardingModal";
import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/hooks/useSession";

export const MemberLayout: React.FC = () => {
  const { currentPersona } = useSession();
  if (currentPersona.role !== "MEMBER") return <Navigate to="/board" replace />;

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

      {/* First-time QR Onboarding Dialog */}
      <QuickOnboardingModal />
    </div>
  );
};
