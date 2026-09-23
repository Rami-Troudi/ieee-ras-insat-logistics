import React from "react";
import { useNavigate } from "react-router-dom";
import { useDevPersona } from "@/hooks/useDevPersona";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCheck, ShieldAlert, ChevronDown } from "lucide-react";
import { UserPersona } from "@/types";

export const DevPersonaSwitcher: React.FC = () => {
  const { currentPersona, personas, setPersona, isDev } = useDevPersona();
  const navigate = useNavigate();

  if (!isDev) return null;

  const handleSelectPersona = (p: UserPersona) => {
    setPersona(p);
    if (p.role === "OPERATOR" || p.role === "SUPERADMIN") {
      navigate("/board");
    } else {
      navigate("/app");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30 hover:bg-amber-500/20 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] sm:min-h-[36px]"
          title="Switch Active Dev Persona"
          aria-label={`Current Persona: ${currentPersona.role}. Click to switch role.`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-semibold">{currentPersona.role}</span>
          <span className="text-muted-foreground hidden sm:inline">
            (Lvl {currentPersona.clearance})
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Dev Role / Persona Switcher</span>
          <Badge variant="outline" className="text-[10px] uppercase font-mono">
            DEV ONLY
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {personas.map((p) => {
          const isSelected = p.id === currentPersona.id;
          return (
            <DropdownMenuItem
              key={p.id}
              onClick={() => handleSelectPersona(p)}
              className="flex flex-col items-start gap-0.5 py-2 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-xs text-foreground flex items-center gap-1.5">
                  {p.role === "SUPERADMIN" && <ShieldAlert className="w-3.5 h-3.5 text-primary" />}
                  {p.role === "OPERATOR" && <UserCheck className="w-3.5 h-3.5 text-secondary" />}
                  {p.name}
                </span>
                {isSelected && (
                  <Badge variant="default" className="text-[10px] h-4 px-1">
                    ACTIVE
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>Role: {p.role}</span>
                <span>•</span>
                <span>Clearance: Level {p.clearance}</span>
                {p.strikesCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-destructive font-semibold">{p.strikesCount} Strikes</span>
                  </>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
