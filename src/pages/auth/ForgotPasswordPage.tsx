import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AppBrand } from "@/components/shared/AppBrand";
import { Mail, ArrowLeft } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid institutional email"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (_data: ForgotFormData) => {
    await new Promise((res) => setTimeout(res, 300));
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block">
            <AppBrand to="/" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Reset Password</h1>
          <p className="text-xs text-muted-foreground">
            Enter your email to receive password recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground space-y-2 text-center">
            <p className="font-bold">Recovery Link Dispatched</p>
            <p className="text-muted-foreground">
              If an account matches this email, instructions have been sent. Please contact the
              Logistics Board at the workshop desk if you need immediate credential recovery.
            </p>
            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="min-h-[44px]">
                <Link to="/auth/login">Back to Sign In</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Institutional Email
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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] gap-2 font-bold"
            >
              <Mail className="w-4 h-4" />
              <span>{isSubmitting ? "Sending..." : "Send Reset Link"}</span>
            </Button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
