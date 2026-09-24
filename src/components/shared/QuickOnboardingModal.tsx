import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QrCode, Sparkles } from "lucide-react";
import { authService } from "@/services";
import { useSession } from "@/hooks/useSession";
import { useUserProfile } from "@/features/profile/hooks/useProfile";

const onboardingSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  membership: z.enum(["IEEE", "AEROBOTIX", "EXTERNAL"]),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const ONBOARDING_COMPLETED_KEY = "ras_onboarding_completed";

export const QuickOnboardingModal: React.FC = () => {
  const { currentPersona } = useSession();
  const { data: profile } = useUserProfile(currentPersona.id);

  // Check whether onboarding is needed:
  // If the user already completed onboarding or has stored credentials in localStorage, don't show.
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
      if (completed) return false;
      // If persona is not the default demo or is already a known student with phone, consider onboarded
      const activeSession = localStorage.getItem("ras_active_session");
      if (activeSession) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: currentPersona.name.includes("(") ? "" : currentPersona.name,
      email: currentPersona.email.includes("rami.ieee") ? "" : currentPersona.email,
      membership: (profile?.affiliation === "AEROBOTIX"
        ? "AEROBOTIX"
        : profile?.affiliation === "EXTERNAL"
          ? "EXTERNAL"
          : "IEEE") as "IEEE" | "AEROBOTIX" | "EXTERNAL",
      phone: profile?.phone || "",
    },
  });

  const selectedMembership = watch("membership");

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      await authService.registerMember({
        name: data.name,
        email: data.email,
        membership: data.membership,
        phone: data.phone,
      });

      localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md p-6 rounded-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center sm:text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-1">
            <QrCode className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Welcome to RAS Logistics!
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Please enter your student details to link your borrow requests. You&apos;ll stay logged
            in on this device.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Full Name *
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Yassine Ben Ali"
              className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[40px] text-foreground"
            />
            {errors.name && (
              <span className="text-[11px] text-destructive block">{errors.name.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Institutional Email *
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="e.g. yassine.ba@insat.u-carthage.tn"
              className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[40px] text-foreground"
            />
            {errors.email && (
              <span className="text-[11px] text-destructive block">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Membership *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "IEEE", label: "IEEE" },
                  { id: "AEROBOTIX", label: "Aerobotix" },
                  { id: "EXTERNAL", label: "External" },
                ] as const
              ).map((m) => {
                const isSelected = selectedMembership === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setValue("membership", m.id, { shouldValidate: true })}
                    className={`h-10 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card border-input text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
            {errors.membership && (
              <span className="text-[11px] text-destructive block">
                {errors.membership.message}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Phone Number *
            </label>
            <input
              type="tel"
              {...register("phone")}
              placeholder="+216 98 765 432"
              className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[40px] text-foreground"
            />
            {errors.phone && (
              <span className="text-[11px] text-destructive block">{errors.phone.message}</span>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 text-xs font-bold gap-2 rounded-xl mt-3 shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? "Saving Profile..." : "Get Started & Save Info"}</span>
          </Button>

          <p className="text-[10px] text-muted-foreground text-center pt-1">
            Your details will be remembered for all future QR scans and equipment requests.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
