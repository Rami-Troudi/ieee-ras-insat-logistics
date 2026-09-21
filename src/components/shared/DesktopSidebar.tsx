import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBrand } from "@/components/shared/AppBrand";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  ClipboardList,
  Clock,
  Heart,
  Bell,
  User,
  FlaskConical,
} from "lucide-react";

export const MEMBER_NAV_ITEMS = [
  { name: "Home", path: "/app", icon: Home },
  { name: "Inventory", path: "/app/inventory", icon: Package },
  { name: "My Requests", path: "/app/requests", icon: ClipboardList },
  { name: "My Loans", path: "/app/loans", icon: Clock },
  { name: "Favorites", path: "/app/favorites", icon: Heart },
];

export const DesktopSidebar: React.FC<{ isBoard?: boolean }> = ({ isBoard = false }) => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0 select-none z-30">
      {/* Header with official RAS Logo */}
      <div className="p-4 border-b border-border">
        <AppBrand to={isBoard ? "/board" : "/app"} />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Sidebar Navigation">
        {MEMBER_NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/app" && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
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
          <div className="pt-4 mt-4 border-t border-border">
            <span className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Development
            </span>
            <Link
              to="/_dev/design"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]",
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

      {/* Secondary Bottom Links */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          to="/app/notifications"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[44px]"
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>Notifications</span>
        </Link>
        <Link
          to="/app/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[44px]"
        >
          <User className="w-4 h-4 shrink-0" />
          <span>Profile</span>
        </Link>
      </div>
    </aside>
  );
};
