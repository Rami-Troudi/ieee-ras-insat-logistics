import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AppBrand } from "@/components/shared/AppBrand";
import { ShieldCheck, UserPlus, Sparkles } from "lucide-react";
import { staffSignIn } from "@/features/auth/staffSignIn";
import { authService } from "@/services";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid staff email"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormData = z.infer<typeof loginSchema>;

export const BoardLoginPage: React.FC = () => {
  const [error, setError] = useState("");
  const [canBootstrap, setCanBootstrap] = useState(false);
  const [isBootstrapMode, setIsBootstrapMode] = useState(false);

  // Bootstrap form fields
  const [setupName, setSetupName] = useState("");
  const [setupEmail, setSetupEmail] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [setupConfirm, setSetupConfirm] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    fetch("/api/v1/auth/bootstrap-status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.canBootstrap) {
          setCanBootstrap(true);
          setIsBootstrapMode(true);
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

  const onSubmitLogin = async ({ email, password }: LoginFormData) => {
    setError("");
    try {
      await staffSignIn(email, password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in right now.");
    }
  };

  const onBootstrapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!setupName.trim() || setupName.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!setupEmail.trim() || !setupEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (setupPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (setupPassword !== setupConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsSettingUp(true);
    try {
      const response = await fetch("/api/v1/auth/bootstrap-admin", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: setupName.trim(),
          email: setupEmail.trim().toLowerCase(),
          password: setupPassword,
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
      setIsSettingUp(false);
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
            {isBootstrapMode ? "Initial Superadmin Setup" : "Board & Operator Access"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isBootstrapMode
              ? "No primary superadmin is configured with a password. Choose your administrator credentials to initialize the platform."
              : "Sign in with your staff email and the password assigned to you by a superadmin."}
          </p>
        </div>

        {isBootstrapMode ? (
          <form onSubmit={onBootstrapSubmit} className="space-y-4">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                You are setting up the <strong>Primary Superadmin</strong> with Level VI clearance
                and full authority.
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
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
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
                value={setupEmail}
                onChange={(e) => setSetupEmail(e.target.value)}
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
                value={setupPassword}
                onChange={(e) => setSetupPassword(e.target.value)}
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
                value={setupConfirm}
                onChange={(e) => setSetupConfirm(e.target.value)}
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
              disabled={isSettingUp}
              className="w-full min-h-[44px] gap-2 font-bold"
            >
              <UserPlus className="w-4 h-4" />
              {isSettingUp ? "Initializing…" : "Set Up Superadmin & Enter Board"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setIsBootstrapMode(false);
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground pt-1"
            >
              Switch to Standard Sign In →
            </button>
          </form>
        ) : (
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
                Assigned password
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

            {canBootstrap && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setIsBootstrapMode(true);
                }}
                className="w-full text-center text-xs text-primary font-bold hover:underline pt-1"
              >
                First time setup? Initialize Superadmin →
              </button>
            )}
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
