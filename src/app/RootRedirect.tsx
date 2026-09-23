import React from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";

export const RootRedirect: React.FC = () => {
  const { currentPersona } = useSession();
  if (currentPersona.role === "OPERATOR" || currentPersona.role === "SUPERADMIN") {
    return <Navigate to="/board" replace />;
  }
  return <Navigate to="/app" replace />;
};
