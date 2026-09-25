import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AppBrand } from "@/components/shared/AppBrand";
import { KeyRound } from "lucide-react";
import { authService } from "@/services";

const schema = z.object({
  email: z.string().email("Please enter a valid staff email"),
  password: z.string().min(1, "Password is required"),
  rememberDevice: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export const BoardLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", rememberDevice: true },
  });

  const onSubmit = async ({ email, password, rememberDevice }: FormData) => {
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    const storedDeviceKey = localStorage.getItem("ras_board_device_key") ?? undefined;

    try {
      const response = await fetch("/api/v1/auth/board-login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password: password.trim(),
          deviceKey: storedDeviceKey,
        }),
      });

      if (response.status === 429)
        throw new Error("Too many attempts. Wait a minute and try again.");
      if (response.status === 401)
        throw new Error("Invalid staff password. Check your assigned board credentials.");
      if (response.status === 403)
        throw new Error("This account is not authorized for board operations or is inactive.");
      const data = (await response.json()) as {
        ok: boolean;
        user: Parameters<typeof authService.setSession>[0];
        deviceKey?: string;
      };
      if (rememberDevice && data.deviceKey) {
        localStorage.setItem("ras_board_device_key", data.deviceKey);
      }
      authService.setSession(data.user);
      navigate("/board", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in right now.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block">
            <AppBrand to="/" />
          </div>
          <h1 className="text-xl font-bold">Board & Operator Access</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your assigned staff email and password.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              autoComplete="username email"
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
              placeholder="••••••••••••"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]"
            />
            {errors.password && (
              <span className="text-xs text-destructive">{errors.password.message}</span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="remember-device"
              type="checkbox"
              {...register("rememberDevice")}
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
            />
            <label
              htmlFor="remember-device"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Trust this device with local session key
            </label>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[44px] gap-2 font-bold"
          >
            <KeyRound className="w-4 h-4" />
            {isSubmitting ? "Authenticating…" : "Sign In to Board Console"}
          </Button>
        </form>
        <p className="text-center text-xs">
          <Link to="/auth/login" className="text-primary font-bold hover:underline">
            ← Switch to Borrower access
          </Link>
        </p>
      </div>
    </div>
  );
};
