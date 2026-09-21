import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Inbox,
  ClipboardList,
  Clock,
  Package,
  MoreHorizontal,
  FolderGit2,
  Users,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Download,
  User,
  FlaskConical,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const BOARD_MOBILE_TABS = [
  { name: "Action", path: "/board", icon: Inbox },
  { name: "Requests", path: "/board/requests", icon: ClipboardList },
  { name: "Loans", path: "/board/loans", icon: Clock },
  { name: "Inventory", path: "/board/inventory", icon: Package },
];

export const BOARD_MORE_ITEMS = [
  { name: "Projects", path: "/board/projects", icon: FolderGit2 },
  { name: "Users & Accounts", path: "/board/users", icon: Users },
  { name: "Audits", path: "/board/audits", icon: CheckCircle2 },
  { name: "Incidents & Strikes", path: "/board/incidents", icon: AlertTriangle },
  { name: "Insights Dashboard", path: "/board/insights", icon: BarChart3 },
  { name: "Data Exports", path: "/board/exports", icon: Download },
  { name: "My Profile", path: "/app/profile", icon: User },
];

export const MobileBoardBottomNav: React.FC = () => {
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isMoreActive = BOARD_MORE_ITEMS.some((item) =>
    location.pathname.startsWith(item.path)
  );

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-2 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))] shadow-sm"
      aria-label="Board Mobile Navigation"
    >
      <div className="grid grid-cols-5 items-center justify-items-center h-14">
        {BOARD_MOBILE_TABS.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            (tab.path !== "/board" && location.pathname.startsWith(tab.path));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full min-h-[44px] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? "text-secondary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
              <span className="text-[10px] mt-1 leading-none">{tab.name}</span>
            </Link>
          );
        })}

        {/* 5th Tab: More Drawer */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center w-full h-full min-h-[44px] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isMoreActive
                  ? "text-secondary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="More Board Options"
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] mt-1 leading-none">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader className="pb-3 border-b border-border">
              <SheetTitle>Board Operations Menu</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-1 gap-1 py-4">
              {BOARD_MORE_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]",
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {import.meta.env.DEV && (
                <div className="pt-2 mt-2 border-t border-border">
                  <Link
                    to="/_dev/design"
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-500/10 min-h-[48px]"
                  >
                    <FlaskConical className="w-5 h-5" />
                    <span>Design Lab (Dev Only)</span>
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
