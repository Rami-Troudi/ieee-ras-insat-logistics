import React, { useEffect, useState } from "react";
import { DesktopBoardSidebar } from "@/components/shared/DesktopBoardSidebar";
import { MobileBoardBottomNav } from "@/components/shared/MobileBoardBottomNav";
import { TopBar } from "@/components/shared/TopBar";
import { Link, Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";

const BoardChallengeGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const developmentMode = import.meta.env.MODE !== "production";
  const [loading, setLoading] = useState(!developmentMode);
  const [active, setActive] = useState(developmentMode);

  const refresh = async () => {
    const response = await fetch("/api/v1/board/session", { credentials: "same-origin" });
    if (response.ok) {
      const session = (await response.json()) as { active: boolean };
      setActive(session.active);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (developmentMode) return;
    void refresh().catch(() => setLoading(false));
  }, [developmentMode]);

  if (loading) return <div className="min-h-screen" aria-busy="true" />;
  if (active) return <>{children}</>;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <section
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg space-y-4"
        aria-labelledby="board-verification-title"
      >
        <h1 id="board-verification-title" className="text-lg font-bold">
          Board session required
        </h1>
        <p className="text-sm text-muted-foreground">
          Your operational board session has expired or is not verified on this device.
        </p>
        <Button asChild className="w-full min-h-[44px]">
          <Link to="/auth/board-login">Sign in with staff credentials</Link>
        </Button>
      </section>
    </div>
  );
};

export const BoardLayout: React.FC = () => {
  const { currentPersona, isLoading } = useSession();
  if (isLoading) return <div className="min-h-screen" aria-busy="true" />;
  if (currentPersona.status !== "ACTIVE") return <Navigate to="/auth/board-login" replace />;
  if (currentPersona.role === "MEMBER") return <Navigate to="/app" replace />;

  return (
    <BoardChallengeGate>
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
    </BoardChallengeGate>
  );
};
