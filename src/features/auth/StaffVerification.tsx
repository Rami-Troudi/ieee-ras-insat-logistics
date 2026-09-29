import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

async function call(path: string, body?: unknown): Promise<void> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.ok) return;
  const data = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
  throw new Error(data.error?.message ?? "Request failed. Please try again.");
}

interface StaffVerificationProps {
  onVerified: () => void;
}

/** Emails a 6-digit staff code and exchanges it for a fresh (10 min) board session. */
export const StaffVerification: React.FC<StaffVerificationProps> = ({ onVerified }) => {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant={sent ? "outline" : "default"}
        disabled={busy}
        className="w-full min-h-[44px] gap-2"
        onClick={() => run(() => call("/api/v1/staff/challenge").then(() => setSent(true)))}
      >
        <ShieldCheck className="w-4 h-4" />
        {sent ? "Resend code" : "Email me a verification code"}
      </Button>
      {sent && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              await call("/api/v1/staff/verify", { code });
              onVerified();
            });
          }}
        >
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="\d{6}"
            required
            aria-label="Six-digit verification code"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg tracking-[0.4em] font-mono min-h-[44px]"
          />
          <Button
            type="submit"
            disabled={busy || code.length !== 6}
            className="w-full min-h-[44px]"
          >
            {busy ? "Verifying…" : "Verify"}
          </Button>
        </form>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
