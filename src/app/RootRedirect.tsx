import React from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";

export const RootRedirect: React.FC = () => {
  const { currentPersona, isLoading } = useSession();
  if (isLoading) return <div className="min-h-screen" aria-busy="true" />;
  if (currentPersona.role === "OPERATOR" || currentPersona.role === "SUPERADMIN") {
    return <Navigate to="/board" replace />;
  }
  return <Navigate to="/app" replace />;
};
