import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AppBrand } from "@/components/shared/AppBrand";
import { LogIn } from "lucide-react";
import { authService } from "@/services";

const loginSchema = z.object({ email: z.string().email("Please enter a valid email") });
type LoginFormData = z.infer<typeof loginSchema>;
const savedEmail = () => {
  try {
    return window.localStorage.getItem("ras_borrower_email") ?? "";
  } catch {
    return "";
  }
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: savedEmail() },
  });
  useEffect(() => {
    if (savedEmail()) navigate("/app", { replace: true });
  }, [navigate]);

  const onSubmit = async ({ email }: LoginFormData) => {
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    try {
      authService.setSession({
        id: "anonymous-member",
        name: "Borrower",
        email: normalizedEmail,
        role: "MEMBER",
        clearance: "I",
        affiliation: "EXTERNAL",
        isProcessed: false,
        status: "ACTIVE",
        strikesCount: 0,
      });
      navigate("/app", { replace: true });
    } catch {
      setError("This browser could not save your email. Enable site storage and try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block">
            <AppBrand to="/" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Continue to the equipment catalogue</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email once. No verification or sign-in is required.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              {...register("email")}
              placeholder="name@insat.u-carthage.tn"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
            />
            {errors.email && (
              <span className="text-xs text-destructive block">{errors.email.message}</span>
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
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? "Continuing…" : "Continue"}</span>
          </Button>
        </form>
        <p className="border-t border-border pt-3 text-center text-xs">
          <Link to="/auth/board-login" className="text-primary font-bold hover:underline">
            Board staff access
          </Link>
        </p>
      </div>
    </div>
  );
};
