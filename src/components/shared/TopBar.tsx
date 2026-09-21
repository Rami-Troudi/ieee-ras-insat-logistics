import React from "react";
import { Link } from "react-router-dom";
import { AppBrand } from "@/components/shared/AppBrand";
import { DevPersonaSwitcher } from "@/components/shared/DevPersonaSwitcher";
import { Bell, Search, ShieldCheck } from "lucide-react";
import { useDevPersona } from "@/hooks/useDevPersona";

interface TopBarProps {
  isBoard?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ isBoard = false }) => {
  const { currentPersona } = useDevPersona();

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

      {/* Right Controls: Persona Switcher, Notifications, Role pill */}
      <div className="flex items-center gap-2.5">
        <DevPersonaSwitcher />

        {/* In-App Notifications Button */}
        <Link
          to="/app/notifications"
          className="relative flex items-center justify-center w-10 h-10 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-[44px] min-h-[44px]"
          aria-label="View In-App Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
        </Link>

        {/* User Role Indicator / Profile Link */}
        <Link
          to="/app/profile"
          className="hidden sm:flex items-center gap-2 pl-2 border-l border-border hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
            {currentPersona.name.charAt(0)}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-foreground leading-tight truncate max-w-[120px]">
              {currentPersona.name.split(" ")[0]}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {currentPersona.affiliation}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
