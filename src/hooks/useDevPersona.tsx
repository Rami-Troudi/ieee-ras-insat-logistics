import React, { createContext, useContext, useState, useEffect } from "react";
import { UserPersona } from "@/types";

export const PRESET_PERSONAS: UserPersona[] = [
  {
    id: "p-member-ieee",
    name: "Rami Troudi (IEEE Member)",
    email: "rami.ieee@insat.u-carthage.tn",
    role: "MEMBER",
    clearance: "III",
    affiliation: "IEEE",
    isProcessed: true,
    status: "ACTIVE",
    strikesCount: 0,
  },
  {
    id: "p-member-unprocessed",
    name: "New Student (Unprocessed)",
    email: "student@insat.u-carthage.tn",
    role: "MEMBER",
    clearance: "I",
    affiliation: "EXTERNAL",
    isProcessed: false,
    status: "ACTIVE",
    strikesCount: 0,
  },
  {
    id: "p-member-eurobot",
    name: "Eurobot Team Lead",
    email: "eurobot.lead@insat.u-carthage.tn",
    role: "MEMBER",
    clearance: "V",
    affiliation: "EUROBOT",
    isProcessed: true,
    status: "ACTIVE",
    strikesCount: 0,
  },
  {
    id: "p-member-restricted",
    name: "Borrower (Strike 2 Active)",
    email: "strike.user@insat.u-carthage.tn",
    role: "MEMBER",
    clearance: "III",
    affiliation: "IEEE",
    isProcessed: true,
    status: "RESTRICTED",
    strikesCount: 2,
  },
  {
    id: "p-board-logistics",
    name: "Emna Taghlet (Logistics Board)",
    email: "emna.logistics@insat.u-carthage.tn",
    role: "BOARD",
    clearance: "V",
    affiliation: "RAS_BOARD",
    isProcessed: true,
    status: "ACTIVE",
    strikesCount: 0,
  },
  {
    id: "p-superadmin-chair",
    name: "Amine Elkadhi (RAS Chairman)",
    email: "chair.ras@insat.u-carthage.tn",
    role: "SUPERADMIN",
    clearance: "VI",
    affiliation: "RAS_BOARD",
    isProcessed: true,
    status: "ACTIVE",
    strikesCount: 0,
  },
];

interface DevPersonaContextType {
  currentPersona: UserPersona;
  setPersona: (persona: UserPersona) => void;
  isDev: boolean;
}

const DevPersonaContext = createContext<DevPersonaContextType>({
  currentPersona: PRESET_PERSONAS[0],
  setPersona: () => {},
  isDev: true,
});

export const DevPersonaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(() => {
    const saved = localStorage.getItem("ras_dev_persona_id");
    const found = PRESET_PERSONAS.find((p) => p.id === saved);
    return found || PRESET_PERSONAS[0];
  });

  useEffect(() => {
    localStorage.setItem("ras_dev_persona_id", currentPersona.id);
  }, [currentPersona]);

  return (
    <DevPersonaContext.Provider
      value={{
        currentPersona,
        setPersona: setCurrentPersona,
        isDev: import.meta.env.DEV,
      }}
    >
      {children}
    </DevPersonaContext.Provider>
  );
};

export const useDevPersona = () => useContext(DevPersonaContext);
