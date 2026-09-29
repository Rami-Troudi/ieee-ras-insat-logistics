import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AppBrand } from "@/components/shared/AppBrand";
import { ShieldCheck, UserPlus, Sparkles, KeyRound } from "lucide-react";
import { staffSignIn } from "@/features/auth/staffSignIn";
import { authService } from "@/services";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid staff email"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormData = z.infer<typeof loginSchema>;

export const BoardLoginPage: React.FC = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [canBootstrap, setCanBootstrap] = useState(false);
  const [defaultSuperadminEmail, setDefaultSuperadminEmail] = useState("");
  const [mode, setMode] = useState<"login" | "bootstrap" | "reset">("login");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    fetch("/api/v1/auth/bootstrap-status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.superadminEmail) {
          setDefaultSuperadminEmail(data.superadminEmail);
          setEmail(data.superadminEmail);
        }
        if (data?.canBootstrap) {
          setCanBootstrap(true);
          setMode("bootstrap");
        }
      })
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmitLogin = async ({ email: loginEmail, password }: LoginFormData) => {
    setError("");
    try {
      await staffSignIn(loginEmail, password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in right now.");
    }
  };

  const onBootstrapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsBusy(true);
    try {
      const response = await fetch("/api/v1/auth/bootstrap-admin", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: newPassword,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new Error(body.error?.message ?? "Failed to initialize superadmin.");
      }

      await authService.getCurrentSession();
      window.location.assign("/board");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Setup failed. Please retry.");
    } finally {
      setIsBusy(false);
    }
  };

  const onResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter your superadmin email address.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsBusy(true);
    try {
      const response = await fetch("/api/v1/auth/set-admin-password", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: newPassword,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new Error(body.error?.message ?? "Failed to set password.");
      }

      setSuccess("Password set successfully! Signing you in...");
      await authService.getCurrentSession();
      window.location.assign("/board");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to set password. Please retry.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block">
            <AppBrand to="/" />
          </div>
          <h1 className="text-xl font-bold">
            {mode === "bootstrap"
              ? "Initial Superadmin Setup"
              : mode === "reset"
                ? "Set Superadmin Password"
                : "Board & Operator Access"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "bootstrap"
              ? "No primary superadmin is configured with a password. Choose your credentials to initialize."
              : mode === "reset"
                ? "Set a personal password for your Superadmin account to access the platform."
                : "Sign in with your staff email and password."}
          </p>
        </div>

        {mode === "bootstrap" && (
          <form onSubmit={onBootstrapSubmit} className="space-y-4">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Setting up the <strong>Primary Superadmin</strong> with Level VI clearance.
              </span>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="setup-name"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Full Name
              </label>
              <input
                id="setup-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rami Troudi"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="setup-email"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Superadmin Email
              </label>
              <input
                id="setup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@insat.u-carthage.tn"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="setup-password"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Create Password
              </label>
              <input
                id="setup-password"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="setup-confirm"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Confirm Password
              </label>
              <input
                id="setup-confirm"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive font-medium">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isBusy}
              className="w-full min-h-[44px] gap-2 font-bold"
            >
              <UserPlus className="w-4 h-4" />
              {isBusy ? "Initializing…" : "Set Up Superadmin & Enter Board"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setMode("login");
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground pt-1"
            >
              Switch to Standard Sign In →
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={onResetSubmit} className="space-y-4">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary flex items-start gap-2">
              <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Enter your Superadmin email and pick a new password to access the Board Console.
              </span>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reset-email"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Superadmin Email
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@insat.u-carthage.tn"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reset-password"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                New Password
              </label>
              <input
                id="reset-password"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reset-confirm"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Confirm New Password
              </label>
              <input
                id="reset-confirm"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive font-medium">
                {error}
              </p>
            )}

            {success && (
              <p role="status" className="text-sm text-emerald-600 font-medium">
                {success}
              </p>
            )}

            <Button
              type="submit"
              disabled={isBusy}
              className="w-full min-h-[44px] gap-2 font-bold"
            >
              <KeyRound className="w-4 h-4" />
              {isBusy ? "Saving…" : "Set Password & Enter Board"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setMode("login");
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground pt-1"
            >
              Back to Standard Sign In →
            </button>
          </form>
        )}

        {mode === "login" && (
          <form onSubmit={handleSubmit(onSubmitLogin)} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="board-email"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Staff email
              </label>
              <input
                id="board-email"
                type="email"
                autoComplete="email"
                required
                {...register("email")}
                placeholder="operator@insat.u-carthage.tn"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]"
              />
              {errors.email && (
                <span className="text-xs text-destructive">{errors.email.message}</span>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="board-password"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
              >
                Password
              </label>
              <input
                id="board-password"
                type="password"
                autoComplete="current-password"
                required
                {...register("password")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]"
              />
              {errors.password && (
                <span className="text-xs text-destructive">{errors.password.message}</span>
              )}
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive font-medium">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] gap-2 font-bold"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? "Signing in…" : "Sign In to Board Console"}
            </Button>

            <div className="flex flex-col gap-1.5 pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  if (defaultSuperadminEmail) setEmail(defaultSuperadminEmail);
                  setMode("reset");
                }}
                className="text-xs text-primary font-semibold hover:underline"
              >
                First time or need to set your superadmin password? →
              </button>

              {canBootstrap && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMode("bootstrap");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Initialize new superadmin account →
                </button>
              )}
            </div>
          </form>
        )}

        <p className="text-center text-xs">
          <Link to="/auth/login" className="text-primary font-bold hover:underline">
            ← Switch to Borrower access
          </Link>
        </p>
      </div>
    </div>
  );
};
