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
import { Sparkles, ShieldCheck, AlertCircle } from "lucide-react";
import { authService } from "@/services";
import { useSession } from "@/hooks/useSession";
import { useUserProfile } from "@/features/profile/hooks/useProfile";

const borrowerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Surname must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  membership: z.enum(["IEEE", "EXTERNAL"]),
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
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : (isAuthModalOpen ?? internalOpen);

  const [borrowerError, setBorrowerError] = useState("");

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
        (currentPersona.name &&
        !currentPersona.name.includes("(") &&
        currentPersona.name !== "Guest"
          ? currentPersona.name.split(" ")[0]
          : ""),
      lastName:
        saved?.lastName ||
        (currentPersona.name &&
        !currentPersona.name.includes("(") &&
        currentPersona.name !== "Guest"
          ? currentPersona.name.split(" ").slice(1).join(" ")
          : ""),
      email:
        saved?.email ||
        (currentPersona.email && !currentPersona.email.includes("rami.ieee")
          ? currentPersona.email
          : ""),
      membership: (saved?.membership === "EXTERNAL" || profile?.affiliation === "EXTERNAL"
        ? "EXTERNAL"
        : "IEEE") as "IEEE" | "EXTERNAL",
      phone: saved?.phone || profile?.phone || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      const latestSaved = getSavedProfile();
      if (latestSaved) {
        reset({
          firstName:
            latestSaved.firstName || (latestSaved.name ? latestSaved.name.split(" ")[0] : ""),
          lastName:
            latestSaved.lastName ||
            (latestSaved.name ? latestSaved.name.split(" ").slice(1).join(" ") : ""),
          email: latestSaved.email || "",
          membership: (latestSaved.membership === "EXTERNAL" ? "EXTERNAL" : "IEEE"),
          phone: latestSaved.phone || "",
        });
      }
    }
  }, [isOpen, reset]);

  const selectedMembership = watch("membership");

  const onSubmitBorrower = async (data: BorrowerFormData) => {
    setBorrowerError("");
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

      localStorage.setItem("ras_onboarding_completed", "true");
      localStorage.setItem("ras_borrower_email", data.email.trim().toLowerCase());
      localStorage.setItem(
        "ras_borrower_profile",
        JSON.stringify({
          name: fullName,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim().toLowerCase(),
          membership: data.membership,
          phone: data.phone.trim(),
        })
      );

      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setBorrowerError(
        err instanceof Error ? err.message : "Could not complete sign up. Please try again."
      );
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
        <div>
          <DialogHeader className="text-center sm:text-center space-y-1.5">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-1">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Welcome to RAS Logistics!
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please enter your student details to link your borrow requests and get notified when
              equipment is ready for pickup.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitBorrower)} className="space-y-3 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Name *
                </label>
                <input
                  type="text"
                  {...register("firstName")}
                  placeholder="e.g. Ahmed"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[38px] text-foreground"
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
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[38px] text-foreground"
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
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[38px] text-foreground"
              />
              {errors.email && (
                <span className="text-[11px] text-destructive block">{errors.email.message}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Affiliation *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "IEEE", label: "IEEE" },
                    { id: "EXTERNAL", label: "External" },
                  ] as const
                ).map((m) => {
                  const isSelected = selectedMembership === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setValue("membership", m.id, { shouldValidate: true })}
                      className={`h-9 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center ${
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
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[38px] text-foreground"
              />
              {errors.phone && (
                <span className="text-[11px] text-destructive block">{errors.phone.message}</span>
              )}
            </div>

            {borrowerError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{borrowerError}</span>
              </div>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 text-xs font-bold gap-2 rounded-xl mt-3 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? "Saving Profile..." : "Get Started & Save Info"}</span>
            </Button>

            <div className="pt-2 text-center">
              <Link
                to="/auth/board-login"
                onClick={handleClose}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Board staff access</span>
              </Link>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
