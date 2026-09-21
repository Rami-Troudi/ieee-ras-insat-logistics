import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBrand } from "@/components/shared/AppBrand";
import { cn } from "@/lib/utils";
import { BOARD_NAV_ITEMS } from "@/constants/navigation";
import { Bell, User, FlaskConical } from "lucide-react";

export { BOARD_NAV_ITEMS };

export const DesktopBoardSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0 select-none z-30">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <AppBrand to="/board" />
      </div>

      {/* Navigation List */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5"
        aria-label="Board Sidebar Navigation"
      >
        <div className="px-3 pb-2 pt-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Board Operations
        </div>
        {BOARD_NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/board" && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[40px]",
                isActive
                  ? "bg-secondary text-secondary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Development Design Lab Link */}
        {import.meta.env.DEV && (
          <div className="pt-3 mt-3 border-t border-border">
            <Link
              to="/_dev/design"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[40px]",
                location.pathname === "/_dev/design"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <FlaskConical className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Design Lab</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Secondary Bottom Links — Board context preserves Board shell */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          to="/board/notifications"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[40px]",
            location.pathname === "/board/notifications"
              ? "bg-secondary text-secondary-foreground font-semibold"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>Notifications</span>
        </Link>
        <Link
          to="/board/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[40px]",
            location.pathname === "/board/profile"
              ? "bg-secondary text-secondary-foreground font-semibold"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <User className="w-4 h-4 shrink-0" />
          <span>Profile</span>
        </Link>
      </div>
    </aside>
  );
};
