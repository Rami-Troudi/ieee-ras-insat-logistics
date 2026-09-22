import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AppBrand } from "@/components/shared/AppBrand";
import { PolicyNotice } from "@/components/shared/PolicyNotice";
import { UserPlus } from "lucide-react";

import { useDevPersona } from "@/hooks/useDevPersona";
import { mockDb } from "@/mocks/db";
import { UserPersona } from "@/types";

const registerSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid institutional email"),
  studentId: z.string().min(5, "Student ID must be at least 5 characters"),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setPersona } = useDevPersona();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    // Mock registration producing MEMBER role with provisional/unprocessed affiliation
    await new Promise((res) => setTimeout(res, 400));

    const newPersona: UserPersona = {
      id: "p-member-unprocessed",
      name: data.name,
      email: data.email,
      role: "MEMBER",
      clearance: "I",
      affiliation: "EXTERNAL",
      isProcessed: false,
      status: "ACTIVE",
      strikesCount: 0,
    };

    // Store profile in mockDb so profile page reflects the registered member details
    mockDb.mutate((draft) => {
      draft.userProfiles[newPersona.id] = {
        ...newPersona,
        phone: data.phone,
        studentId: data.studentId,
        joinedDate: new Date().toISOString(),
        strikes: [],
        activeLoansCount: 0,
        totalRequestsCount: 0,
      };
    });

    setPersona(newPersona);
    setIsSuccess(true);
    setTimeout(() => {
      navigate("/app");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-lg p-6 rounded-2xl border border-border bg-card shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block">
            <AppBrand to="/" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Member Account Registration</h1>
          <p className="text-xs text-muted-foreground">
            Register and immediately submit equipment borrow requests.
          </p>
        </div>

        <PolicyNotice
          variant="info"
          title="Instant Request Access"
          description="Accounts may register and immediately submit requests without an account approval gate. The Logistics Board will verify and confirm your affiliation during request processing."
        />

        {isSuccess ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 font-medium text-center space-y-2">
            <p className="font-bold text-sm">Registration Successful!</p>
            <p>Welcome to IEEE RAS INSAT Logistics. Redirecting you to the equipment catalog...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Full Name *
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="Ahmed Ben Mansour"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
              />
              {errors.name && (
                <span className="text-xs text-destructive block">{errors.name.message}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Institutional Email *
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="ahmed.bm@insat.u-carthage.tn"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
              />
              {errors.email && (
                <span className="text-xs text-destructive block">{errors.email.message}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Student ID *
                </label>
                <input
                  type="text"
                  {...register("studentId")}
                  placeholder="INSAT-2025-XXXX"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
                />
                {errors.studentId && (
                  <span className="text-xs text-destructive block">{errors.studentId.message}</span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  placeholder="+216 XX XXX XXX"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
                />
                {errors.phone && (
                  <span className="text-xs text-destructive block">{errors.phone.message}</span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Password *
              </label>
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
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? "Creating Account..." : "Register Account"}</span>
            </Button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
