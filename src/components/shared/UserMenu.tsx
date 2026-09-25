import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";
import { authService } from "@/services";
import { User, Bell, LogOut, ChevronDown } from "lucide-react";

export interface UserMenuProps {
  isBoard?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({ isBoard = false }) => {
  const navigate = useNavigate();
  const { currentPersona, openBorrowerAuthModal } = useSession();
  const isBoardRole =
    isBoard || currentPersona.role === "OPERATOR" || currentPersona.role === "SUPERADMIN";
  const isGuest = currentPersona.id === "anonymous" || !currentPersona.email;

  const profilePath = isBoardRole ? "/board/profile" : "/app/profile";
  const notificationPath = isBoardRole ? "/board/notifications" : "/app/notifications";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 p-1 rounded-full sm:rounded-md hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] min-w-[44px]"
          aria-label="User menu"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
            {currentPersona.name.charAt(0)}
          </div>
          <div className="hidden md:flex flex-col text-left mr-1">
            <span className="text-xs font-medium text-foreground leading-tight truncate max-w-[110px]">
              {currentPersona.name.split(" ")[0]}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {isGuest
                ? "Guest"
                : isBoardRole
                  ? `Clearance ${currentPersona.clearance}`
                  : currentPersona.affiliation}
            </span>
          </div>
          <ChevronDown className="hidden md:block w-3 h-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-semibold text-foreground truncate">
              {currentPersona.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-normal truncate">
              {currentPersona.email || "No active account"}
            </span>
            <div className="flex items-center gap-1.5 pt-1">
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono">
                {isBoardRole ? `Lvl ${currentPersona.clearance}` : currentPersona.affiliation}
              </Badge>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-semibold">
                {currentPersona.role}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to={profilePath}
            className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-[36px]"
          >
            <User className="w-4 h-4 text-muted-foreground" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to={notificationPath}
            className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-[36px]"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span>Notifications</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            authService.clearSession();
            if (isBoardRole) {
              navigate("/auth/board-login");
            } else {
              openBorrowerAuthModal();
            }
          }}
          className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer min-h-[44px] sm:min-h-[36px]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
