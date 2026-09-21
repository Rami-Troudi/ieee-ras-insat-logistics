import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBrand } from "@/components/shared/AppBrand";
import { cn } from "@/lib/utils";
import {
  Inbox,
  Package,
  ClipboardList,
  Clock,
  FolderGit2,
  Users,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Download,
  Bell,
  User,
  FlaskConical,
} from "lucide-react";

export const BOARD_NAV_ITEMS = [
  { name: "Action Center", path: "/board", icon: Inbox },
  { name: "Inventory", path: "/board/inventory", icon: Package },
  { name: "Requests", path: "/board/requests", icon: ClipboardList },
  { name: "Loans", path: "/board/loans", icon: Clock },
  { name: "Projects", path: "/board/projects", icon: FolderGit2 },
  { name: "Users", path: "/board/users", icon: Users },
  { name: "Audits", path: "/board/audits", icon: CheckCircle2 },
  { name: "Incidents", path: "/board/incidents", icon: AlertTriangle },
  { name: "Insights", path: "/board/insights", icon: BarChart3 },
  { name: "Exports", path: "/board/exports", icon: Download },
];

export const DesktopBoardSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0 select-none z-30">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <AppBrand to="/board" />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5" aria-label="Board Sidebar Navigation">
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

      {/* Secondary Bottom Links */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          to="/app/notifications"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[40px]"
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>Notifications</span>
        </Link>
        <Link
          to="/app/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[40px]"
        >
          <User className="w-4 h-4 shrink-0" />
          <span>Profile</span>
        </Link>
      </div>
    </aside>
  );
};
