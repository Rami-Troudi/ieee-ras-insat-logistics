import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/app?auth=login", { replace: true });
  }, [navigate]);

  return <div className="min-h-screen" aria-busy="true" />;
};
