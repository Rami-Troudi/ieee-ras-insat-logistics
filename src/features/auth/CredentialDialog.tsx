import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";

interface CredentialDialogProps {
  name: string;
  email: string;
  password: string;
  onClose: () => void;
}

/** Shows a generated password exactly once so the superadmin can hand it over. */
export const CredentialDialog: React.FC<CredentialDialogProps> = ({
  name,
  email,
  password,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="credential-title"
      className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
        <h3 id="credential-title" className="text-base font-bold flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" />
          Board credentials for {name}
        </h3>
        <dl className="text-sm space-y-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Email</dt>
            <dd className="font-mono break-all">{email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Password</dt>
            <dd className="font-mono text-lg tracking-wider break-all select-all">{password}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">
          This password is shown only once and cannot be retrieved later. Give it to {name} now; a
          superadmin can generate a new one at any time.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={copy}>
            {copied ? "Copied" : "Copy password"}
          </Button>
          <Button type="button" size="sm" onClick={onClose}>
            I have saved it
          </Button>
        </div>
      </div>
    </div>
  );
};
