import React from "react";
import { Link } from "react-router-dom";
import { AppBrand } from "@/components/shared/AppBrand";
import { UserMenu } from "@/components/shared/UserMenu";
import { DevPersonaSwitcher } from "@/components/shared/DevPersonaSwitcher";
import { Bell, Search, ShieldCheck } from "lucide-react";
import { useSession } from "@/hooks/useSession";

interface TopBarProps {
  isBoard?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ isBoard = false }) => {
  const { currentPersona } = useSession();
  const isBoardRole =
    isBoard || currentPersona.role === "BOARD" || currentPersona.role === "SUPERADMIN";

  const notificationPath = isBoardRole ? "/board/notifications" : "/app/notifications";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-border bg-card/95 backdrop-blur-sm">
      {/* Mobile Brand (Desktop brand lives in sidebar) */}
      <div className="flex items-center gap-2 lg:hidden">
        <AppBrand to={isBoard ? "/board" : "/app"} />
      </div>

      {/* Desktop Search / Operational Context Indicator */}
      <div className="hidden lg:flex items-center gap-3">
        {isBoard ? (
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>Operational Logistics Console</span>
            <span>•</span>
            <span className="font-mono text-foreground font-semibold">
              Clearance Level V+ Authority
            </span>
          </div>
        ) : (
          <Link
            to="/app/inventory"
            className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-md border border-border w-64 transition-colors min-h-[36px]"
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Search equipment catalog...</span>
          </Link>
        )}
      </div>

      {/* Right Controls: Dev Persona Switcher, Notifications, Reusable UserMenu */}
      <div className="flex items-center gap-2.5">
        <DevPersonaSwitcher />

        {/* In-App Notifications Button */}
        <Link
          to={notificationPath}
          className="relative flex items-center justify-center w-10 h-10 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-[44px] min-h-[44px]"
          aria-label="View In-App Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
        </Link>

        {/* Reusable User Menu Component */}
        <UserMenu isBoard={isBoardRole} />
      </div>
    </header>
  );
};
