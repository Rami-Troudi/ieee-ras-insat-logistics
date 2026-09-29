import React, { useEffect, useState } from "react";
import { MUTATION_ERROR_EVENT, type MutationErrorDetail } from "@/app/query-client";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { Button } from "@/components/ui/button";
import { StaffVerification } from "./StaffVerification";

/** Shows failed board mutations; an expired "fresh" session prompts for a new staff code. */
export const MutationErrorHost: React.FC = () => {
  const [error, setError] = useState<MutationErrorDetail | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const onError = (event: Event) => {
      setVerified(false);
      setError((event as CustomEvent<MutationErrorDetail>).detail);
    };
    window.addEventListener(MUTATION_ERROR_EVENT, onError);
    return () => window.removeEventListener(MUTATION_ERROR_EVENT, onError);
  }, []);

  if (!error) return null;
  const needsReverify = error.code === "FRESH_AUTH_REQUIRED";
  const dismiss = () => setError(null);

  return (
    <div className="fixed top-4 inset-x-4 z-[70] mx-auto max-w-md space-y-3" role="alert">
      {needsReverify && verified ? (
        <AlertBanner
          variant="success"
          title="Verified"
          description="Your session is fresh for 10 minutes. Please repeat your action."
          onDismiss={dismiss}
        />
      ) : (
        <AlertBanner
          variant="error"
          title={needsReverify ? "Staff verification required" : "Action failed"}
          description={
            needsReverify
              ? "Sensitive changes need a fresh staff code (valid for 10 minutes)."
              : error.message
          }
          onDismiss={dismiss}
        />
      )}
      {needsReverify && !verified && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-xl space-y-3">
          <StaffVerification onVerified={() => setVerified(true)} />
          <Button variant="ghost" size="sm" className="w-full" onClick={dismiss}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
