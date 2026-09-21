import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { QuantitySelector } from "@/components/shared/QuantitySelector";
import { PolicyNotice } from "@/components/shared/PolicyNotice";
import { EmptyState } from "@/components/shared/FeedbackStates";
import { Button } from "@/components/ui/button";
import { useBorrowCart, CartLineItem } from "@/features/cart";
import { useSession } from "@/hooks/useSession";
import { useActiveProjects, useCreateRequest } from "@/features/requests/hooks/useRequests";
import { Trash2, ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";

export const MemberCartPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentPersona } = useSession();
  const {
    state: cartState,
    updateQuantity,
    removeItem,
    clearCart,
    setProject,
    setPurpose,
    setReturnDate,
  } = useBorrowCart();

  const { data: projects = [] } = useActiveProjects();
  const createRequestMutation = useCreateRequest(currentPersona.id);

  const [formError, setFormError] = useState<string | null>(null);

  const isRestricted = currentPersona.status === "RESTRICTED";
  const isUnprocessed = !currentPersona.isProcessed;

  // Check if any cart item requires supervisor (Class F) or Class G
  const hasClassF = cartState.items.some((i: CartLineItem) => i.item.equipmentClass === "F");
  const hasClassG = cartState.items.some((i: CartLineItem) => i.item.equipmentClass === "G");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (cartState.items.length === 0) {
      setFormError("Your borrow cart is empty.");
      return;
    }

    if (!cartState.purpose.trim() || cartState.purpose.trim().length < 10) {
      setFormError("Please provide a detailed borrowing purpose (at least 10 characters).");
      return;
    }

    if (!cartState.expectedReturnDate) {
      setFormError("Please choose an expected return date.");
      return;
    }

    try {
      const created = await createRequestMutation.mutateAsync({
        projectId: cartState.projectId || undefined,
        purpose: cartState.purpose.trim(),
        expectedReturnDate: cartState.expectedReturnDate,
        items: cartState.items.map((i: CartLineItem) => ({
          itemId: i.item.id,
          quantity: i.quantity,
        })),
      });

      clearCart();
      navigate(`/app/requests/${created.id}`);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to submit request.");
    }
  };

  if (cartState.items.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Borrow Request Cart"
          description="Review selected equipment, assign project context, and submit for Logistics Board approval."
        />
        <EmptyState
          title="Your Borrow Cart is Empty"
          description="You have not selected any equipment yet. Explore the inventory catalog to add boards, sensors, and components."
          actionLabel="Browse Equipment Catalog"
          onAction={() => navigate("/app/inventory")}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Borrow Request Cart"
        description="Review selected equipment, specify project justification, and submit for Logistics Board review."
      />

      {/* Disqualification Banners */}
      {isUnprocessed && (
        <PolicyNotice
          variant="warning"
          title="Verification Required to Submit"
          description="Your profile affiliation is not yet confirmed. You cannot submit borrow requests until you are verified by a Logistics Custodian."
        />
      )}

      {isRestricted && (
        <PolicyNotice
          variant="restricted"
          title="Borrowing Suspended"
          description="Your account currently has active strikes preventing request submission. Please resolve overdue loans first."
        />
      )}

      {/* Special Class Advisory */}
      {hasClassF && (
        <PolicyNotice
          variant="warning"
          title="Class F Equipment in Cart"
          description="Your request contains workshop tools (Class F). Please confirm that an approved Level V+ supervisor will be present during work."
        />
      )}

      {hasClassG && (
        <PolicyNotice
          variant="warning"
          title="Class G Hazardous Energy in Cart"
          description="High-discharge LiPo battery checkout requires final Level VI Board approval and fireproof case inspection upon collection."
        />
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cart Line Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
              Selected Equipment (
              {cartState.items.reduce((s: number, i: CartLineItem) => s + i.quantity, 0)} Items)
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-xs text-muted-foreground hover:text-destructive min-h-[36px]"
            >
              Clear Cart
            </Button>
          </div>

          <div className="space-y-3">
            {cartState.items.map(({ item, quantity }: CartLineItem) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                      Class {item.equipmentClass}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                  </div>
                  <Link
                    to={`/app/inventory/${item.id}`}
                    className="text-base font-bold text-foreground hover:text-primary transition-colors block"
                  >
                    {item.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    Available stock: {item.availableQuantity}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                  <QuantitySelector
                    value={quantity}
                    min={1}
                    max={item.availableQuantity}
                    onChange={(q) => updateQuantity(item.id, q)}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive min-w-[44px] min-h-[44px] p-2"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button asChild variant="outline" size="sm" className="min-h-[44px]">
              <Link to="/app/inventory" className="gap-2 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Browsing Catalog</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Right 1 Col: Justification & Form Metadata */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Borrowing Details</span>
            </h2>

            {formError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Project Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Assign to Project (Optional)
              </label>
              <select
                value={cartState.projectId || ""}
                onChange={(e) => setProject(e.target.value || undefined)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
              >
                <option value="">No Project / General Prototyping</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.code} — {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Expected Return Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Expected Return Date *
              </label>
              <input
                type="date"
                value={cartState.expectedReturnDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setReturnDate(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
              />
              <span className="text-[11px] text-muted-foreground block">
                Default loan period is 14 days per RAS bylaws.
              </span>
            </div>

            {/* Purpose / Justification */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Borrowing Purpose & Justification *
              </label>
              <textarea
                value={cartState.purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={4}
                required
                placeholder="Explain the technical activity, test bench setup, or competition milestone..."
                className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <span className="text-[11px] text-muted-foreground block">
                Minimum 10 characters explaining your technical requirement.
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isRestricted || isUnprocessed || createRequestMutation.isPending}
              className="w-full min-h-[48px] gap-2 font-bold"
            >
              <span>
                {createRequestMutation.isPending ? "Submitting..." : "Submit Borrow Request"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              By submitting, you agree to the IEEE RAS Equipment Custody Regulations and the 48-hour
              pickup deadline once approved.
            </p>
          </div>
        </div>
      </form>
    </PageContainer>
  );
};
