import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { Sparkles, ShieldCheck } from "lucide-react";
import { authService } from "@/services";
import { useSession } from "@/hooks/useSession";
import { useUserProfile } from "@/features/profile/hooks/useProfile";

const borrowerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Surname must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  membership: z.enum(["IEEE", "AEROBOTIX", "EXTERNAL"]),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
});

export type BorrowerFormData = z.infer<typeof borrowerSchema>;

export interface BorrowerAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const BorrowerAuthModal: React.FC<BorrowerAuthModalProps> = ({
  isOpen: controlledIsOpen,
  onClose,
  onSuccess,
}) => {
  const { currentPersona, isAuthModalOpen, closeBorrowerAuthModal } = useSession();
  const { data: profile } = useUserProfile(currentPersona.id);

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : (isAuthModalOpen ?? internalOpen);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (closeBorrowerAuthModal) {
      closeBorrowerAuthModal();
    } else {
      setInternalOpen(false);
    }
  };

  const getSavedProfile = () => {
    try {
      const raw = localStorage.getItem("ras_borrower_profile");
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore JSON error
    }
    return null;
  };

  const saved = getSavedProfile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BorrowerFormData>({
    resolver: zodResolver(borrowerSchema),
    defaultValues: {
      firstName:
        saved?.firstName ||
        (currentPersona.name && !currentPersona.name.includes("(") && currentPersona.name !== "Guest"
          ? currentPersona.name.split(" ")[0]
          : ""),
      lastName:
        saved?.lastName ||
        (currentPersona.name && !currentPersona.name.includes("(") && currentPersona.name !== "Guest"
          ? currentPersona.name.split(" ").slice(1).join(" ")
          : ""),
      email:
        saved?.email ||
        (currentPersona.email && !currentPersona.email.includes("rami.ieee")
          ? currentPersona.email
          : ""),
      membership: (saved?.membership ||
        (profile?.affiliation === "AEROBOTIX"
          ? "AEROBOTIX"
          : profile?.affiliation === "EXTERNAL"
            ? "EXTERNAL"
            : "IEEE")) as "IEEE" | "AEROBOTIX" | "EXTERNAL",
      phone: saved?.phone || profile?.phone || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      const latestSaved = getSavedProfile();
      if (latestSaved) {
        reset({
          firstName: latestSaved.firstName || (latestSaved.name ? latestSaved.name.split(" ")[0] : ""),
          lastName:
            latestSaved.lastName ||
            (latestSaved.name ? latestSaved.name.split(" ").slice(1).join(" ") : ""),
          email: latestSaved.email || "",
          membership: (latestSaved.membership as "IEEE" | "AEROBOTIX" | "EXTERNAL") || "IEEE",
          phone: latestSaved.phone || "",
        });
      }
    }
  }, [isOpen, reset]);

  const selectedMembership = watch("membership");

  const onSubmit = async (data: BorrowerFormData) => {
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
    try {
      await authService.registerMember({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        name: fullName,
        email: data.email.trim().toLowerCase(),
        membership: data.membership,
        phone: data.phone.trim(),
      });

      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to complete borrower login/registration:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-md p-6 rounded-2xl border-border bg-card shadow-2xl"
      >
        <DialogHeader className="text-center sm:text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-1">
            <Sparkles className="w-6 h-6 text-primary" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Name *
              </label>
              <input
                type="text"
                {...register("firstName")}
                placeholder="e.g. Ahmed"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[40px] text-foreground"
              />
              {errors.firstName && (
                <span className="text-[11px] text-destructive block">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Surname *
              </label>
              <input
                type="text"
                {...register("lastName")}
                placeholder="e.g. Ben Mansour"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[40px] text-foreground"
              />
              {errors.lastName && (
                <span className="text-[11px] text-destructive block">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Institutional Email *
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="e.g. ahmed.bm@insat.u-carthage.tn"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[40px] text-foreground"
            />
            {errors.email && (
              <span className="text-[11px] text-destructive block">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Affiliation *
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
                        : "bg-background border-input text-foreground hover:bg-muted/50"
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
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[40px] text-foreground"
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

          <div className="pt-2 border-t border-border text-center">
            <Link
              to="/auth/board-login"
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>Board staff access (Password & Key)</span>
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
