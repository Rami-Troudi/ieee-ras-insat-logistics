import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MOBILE_MEMBER_TABS } from "@/constants/navigation";

export { MOBILE_MEMBER_TABS };

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-2 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))] shadow-sm"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {MOBILE_MEMBER_TABS.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            (tab.path !== "/app" && location.pathname.startsWith(tab.path));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full min-h-[44px] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
              <span className="text-[10px] mt-1 leading-none">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
