import React from "react";
import { cn } from "@/lib/utils";

export interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row-on-desktop" | "row-on-mobile";
  spacing?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "between";
  children: React.ReactNode;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  direction = "row-on-desktop",
  spacing = "md",
  align = "start",
  className,
  children,
  ...props
}) => {
  const spacingClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    between: "justify-between items-center",
  };

  return (
    <div
      className={cn(
        "flex w-full",
        direction === "row-on-desktop" ? "flex-col sm:flex-row" : "flex-row",
        spacingClasses[spacing],
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
