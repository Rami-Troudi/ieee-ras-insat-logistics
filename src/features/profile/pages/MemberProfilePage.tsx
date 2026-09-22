import React, { useState } from "react";
import { useUserProfile, useUpdateContactInfo, useResetDemoData } from "../hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { Mail, Phone, RotateCcw, AlertTriangle } from "lucide-react";

export const MemberProfilePage: React.FC = () => {
  const { currentPersona } = useSession();
  const { data: profile, isLoading, refetch } = useUserProfile(currentPersona.id);
  const updateContactMutation = useUpdateContactInfo(currentPersona.id);
  const resetDemoMutation = useResetDemoData();

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || "");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateContactMutation.mutateAsync({ phone: phoneNumber });
    setIsEditingPhone(false);
    refetch();
  };

  const handleResetDemoData = async () => {
    await resetDemoMutation.mutateAsync();
    setResetSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <LoadingState message="Loading your profile..." />
      </div>
    );
  }

  const p = profile || {
    id: currentPersona.id,
    name: currentPersona.name,
    email: currentPersona.email,
    studentId: "INSAT Student",
    phone: "",
    status: currentPersona.status,
    strikesCount: currentPersona.strikesCount,
  };

  const isRestricted = p.status === "BANNED" || p.status === "BLACKLISTED" || p.strikesCount >= 4;

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your student information and contact details.
        </p>
      </div>

      {isRestricted && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-xs text-destructive flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Borrowing privileges restricted</span>
            <p>Please contact the logistics team or RAS Board at the workshop.</p>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            {p.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">{p.name}</h2>
            <span className="text-xs text-muted-foreground">{p.studentId || "INSAT Member"}</span>
          </div>
        </div>

        <div className="divide-y divide-border/60 text-xs pt-2">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </span>
            <span className="font-medium text-foreground">{p.email}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              <span>Phone</span>
            </span>
            {isEditingPhone ? (
              <form onSubmit={handleSavePhone} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+216 ..."
                  autoFocus
                  className="px-2 py-0.5 rounded border border-input text-xs w-28 text-foreground"
                />
                <button type="submit" className="text-xs text-primary font-bold hover:underline">
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{p.phone || "Not provided"}</span>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneNumber(p.phone || "");
                    setIsEditingPhone(true);
                  }}
                  className="text-[11px] text-primary hover:underline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Development Reset */}
      {import.meta.env.DEV && (
        <div className="pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDemoData}
            disabled={resetDemoMutation.isPending}
            className="w-full text-xs h-9 gap-1.5 text-muted-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetSuccess ? "Resetting..." : "Reset Demo Data"}</span>
          </Button>
        </div>
      )}
    </div>
  );
};
