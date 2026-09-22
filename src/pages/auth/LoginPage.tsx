import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AppBrand } from "@/components/shared/AppBrand";
import { LogIn } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid institutional email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (_data: LoginFormData) => {
    // Mock login behavior
    await new Promise((res) => setTimeout(res, 300));
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block">
            <AppBrand to="/" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Sign In to Logistics Platform</h1>
          <p className="text-xs text-muted-foreground">
            Enter your INSAT institutional credentials to manage equipment loans.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="name.member@insat.u-carthage.tn"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
            />
            {errors.email && (
              <span className="text-xs text-destructive block">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Password
              </label>
              <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
            />
            {errors.password && (
              <span className="text-xs text-destructive block">{errors.password.message}</span>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[44px] gap-2 font-bold"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border">
          Don't have an account?{" "}
          <Link to="/auth/register" className="text-primary font-bold hover:underline">
            Register for Membership
          </Link>
        </div>
      </div>
    </div>
  );
};
