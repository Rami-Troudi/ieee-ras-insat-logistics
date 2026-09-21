import React from "react";
import { Link } from "react-router-dom";
import rasLogoFull from "@/assets/ras_logo_full.png";
import { cn } from "@/lib/utils";

interface AppBrandProps {
  className?: string;
  to?: string;
}

export const AppBrand: React.FC<AppBrandProps> = ({ className, to = "/" }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md group transition-opacity hover:opacity-95",
        className
      )}
      aria-label="IEEE RAS INSAT Logistics Home"
    >
      <div className="flex-shrink-0 flex items-center justify-center p-1">
        <img
          src={rasLogoFull}
          alt="IEEE Robotics & Automation Society"
          className="h-9 w-auto min-w-[110px] max-w-[150px] object-contain transition-all"
        />
      </div>
      <div className="hidden sm:flex flex-col border-l border-border/80 pl-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground leading-tight">
          Logistics
        </span>
        <span className="text-[10px] font-medium text-muted-foreground leading-tight">
          INSAT Student Branch Chapter
        </span>
      </div>
    </Link>
  );
};
