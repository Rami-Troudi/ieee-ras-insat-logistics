import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AppBrand } from "@/components/shared/AppBrand";
import { ShieldCheck } from "lucide-react";
import { staffSignIn } from "@/features/auth/staffSignIn";

const schema = z.object({
  email: z.string().email("Please enter a valid staff email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export const BoardLoginPage: React.FC = () => {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async ({ email, password }: FormData) => {
    setError("");
    try {
      await staffSignIn(email, password);
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
            Sign in with your staff email and the password assigned to you by a superadmin.
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
            <p role="alert" className="text-sm text-destructive">
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
