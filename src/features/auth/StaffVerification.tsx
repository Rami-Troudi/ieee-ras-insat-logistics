import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

interface StaffVerificationProps {
  onVerified: () => void;
}

/** Renews the 10-minute "fresh" board session by re-entering the assigned password. */
export const StaffVerification: React.FC<StaffVerificationProps> = ({ onVerified }) => {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/v1/staff/verify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: { code?: string; message?: string };
        };
        if (data.error?.code === "SESSION_EXPIRED" || response.status === 403) {
          window.location.assign("/auth/board-login");
          return;
        }
        throw new Error(data.error?.message ?? "Verification failed. Please try again.");
      }
      setPassword("");
      onVerified();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="password"
        autoComplete="current-password"
        required
        aria-label="Your board password"
        placeholder="Your board password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]"
      />
      <Button type="submit" disabled={busy || !password} className="w-full min-h-[44px] gap-2">
        <ShieldCheck className="w-4 h-4" />
        {busy ? "Verifying…" : "Confirm password"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
};
