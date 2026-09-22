import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { QuantitySelector } from "@/components/shared/QuantitySelector";
import { PolicyNotice } from "@/components/shared/PolicyNotice";
import { EmptyState } from "@/components/shared/FeedbackStates";
import { Button } from "@/components/ui/button";
import { useBorrowCart, CartLineItem } from "@/features/cart";
import { useSession } from "@/hooks/useSession";
import { useMyProjects, useCreateRequest } from "@/features/requests/hooks/useRequests";
import { QUERY_KEYS } from "@/app/query-client";
import { Trash2, ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";

const cartFormSchema = z.object({
  projectId: z.string().optional(),
  expectedReturnDate: z.string().min(1, "Please choose a proposed return date"),
  purpose: z
    .string()
    .min(10, "Please provide a detailed borrowing purpose (at least 10 characters)"),
});

type CartFormData = z.infer<typeof cartFormSchema>;

export const MemberCartPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const { data: myProjects = [] } = useMyProjects(currentPersona.id);
  const createRequestMutation = useCreateRequest(currentPersona.id);

  // Ref to suppress the empty-state guard while navigating away after submission,
  // and to trigger cart clear on unmount. Using a ref avoids causing extra re-renders.
  const isSubmittedRef = React.useRef(false);
  const clearCartRef = React.useRef(clearCart);
  clearCartRef.current = clearCart; // keep ref in sync with latest clearCart

  // Clear the cart when this component unmounts after a successful submission.
  React.useEffect(() => {
    return () => {
      if (isSubmittedRef.current) {
        clearCartRef.current();
      }
    };
  }, []); // intentionally empty — we use refs to avoid stale-closure issues

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CartFormData>({
    resolver: zodResolver(cartFormSchema),
    defaultValues: {
      projectId: cartState.projectId || "",
      expectedReturnDate: cartState.expectedReturnDate,
      purpose: cartState.purpose,
    },
  });

  const selectedProjectId = watch("projectId");
  const purposeValue = watch("purpose");
  const returnDateValue = watch("expectedReturnDate");

  // Keep cart context synchronized with form values only if value actually changed
  React.useEffect(() => {
    const val = selectedProjectId || undefined;
    if (val !== cartState.projectId) {
      setProject(val);
    }
  }, [selectedProjectId, cartState.projectId, setProject]);

  React.useEffect(() => {
    const val = purposeValue || "";
    if (val !== cartState.purpose) {
      setPurpose(val);
    }
  }, [purposeValue, cartState.purpose, setPurpose]);

  React.useEffect(() => {
    if (returnDateValue && returnDateValue !== cartState.expectedReturnDate) {
      setReturnDate(returnDateValue);
    }
  }, [returnDateValue, cartState.expectedReturnDate, setReturnDate]);

  const isBanned =
    currentPersona.status === "BANNED" ||
    currentPersona.status === "BLACKLISTED" ||
    currentPersona.strikesCount >= 4;

  const isProvisional = !currentPersona.isProcessed;
  const isStrike2 = currentPersona.strikesCount >= 2;

  // Check if any cart item requires Level V+ supervision (Class F) or Level VI authorization (Class G)
  const hasClassF = cartState.items.some((i: CartLineItem) => i.item.equipmentClass === "F");
  const hasClassG = cartState.items.some((i: CartLineItem) => i.item.equipmentClass === "G");

  const onSubmit = async (data: CartFormData) => {
    if (cartState.items.length === 0) return;

    try {
      const created = await createRequestMutation.mutateAsync({
        projectId: data.projectId || undefined,
        purpose: data.purpose.trim(),
        expectedReturnDate: data.expectedReturnDate,
        items: cartState.items.map((i: CartLineItem) => ({
          itemId: i.item.id,
          quantity: i.quantity,
        })),
      });

      // Mark as submitted BEFORE navigate so the empty-state guard is suppressed
      // even if React re-renders the cart component during the route transition.
      isSubmittedRef.current = true;
      // Pre-populate detail cache so the request detail page renders immediately.
      queryClient.setQueryData(QUERY_KEYS.requests.detail(created.id), created);
      navigate(`/app/requests/${created.id}`, { replace: true });
      // Cart is cleared in the useEffect cleanup when this component unmounts.
    } catch (err: unknown) {
      console.error("Submission failed:", err);
    }
  };

  // Suppress empty-state when a submission just navigated away
  if (cartState.items.length === 0 && !isSubmittedRef.current) {
    return (
      <PageContainer>
        <PageHeader
          title="Borrow Request Cart"
          description="Review selected equipment, assign project context, and submit for Logistics Board approval."
        />
        <EmptyState
          title="Your Borrow Cart is Empty"
          description="You have not selected any equipment yet. Explore the inventory catalog to add development boards, components, and tools."
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

      {/* Disciplinary & Provisional Advisories */}
      {isBanned && (
        <PolicyNotice
          variant="restricted"
          title="Borrowing Privileges Suspended"
          description="Your account currently has active disciplinary restrictions preventing request submission."
        />
      )}

      {isProvisional && (
        <PolicyNotice
          variant="info"
          title="Provisional Membership Status"
          description="Your account is provisional pending full verification. Immediate request submission is permitted; the Logistics Board will process your identity confirmation during review."
        />
      )}

      {isStrike2 && (
        <PolicyNotice
          variant="warning"
          title="Explicit Board Review Required (Strike 2 Active)"
          description="You have 2 active strikes. You can still submit requests for ordinary equipment, but every request requires explicit Board review and approval. Classes F and G are unavailable."
        />
      )}

      {/* Special Class Advisories */}
      {hasClassF && (
        <PolicyNotice
          variant="info"
          title="Class F Equipment in Cart"
          description="Your request contains Heavy Equipment (Class F). Please confirm that an approved Level V+ supervisor will be present during work in the lab."
        />
      )}

      {hasClassG && (
        <PolicyNotice
          variant="warning"
          title="Class G High Value Electronics in Cart"
          description="High-value calibration electronics require explicit Level VI authorization (RAS Chairman / Logistics Manager)."
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            {createRequestMutation.isError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {createRequestMutation.error instanceof Error
                    ? createRequestMutation.error.message
                    : "Failed to submit borrow request."}
                </span>
              </div>
            )}

            {/* Project Selection (strictly scoped to user's assigned projects) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Assign to Project (Optional)
              </label>
              <select
                id="project-assignment"
                aria-label="Assign to Project"
                {...register("projectId")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
              >
                <option value="">No Project / Personal Prototyping</option>
                {myProjects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.code} — {proj.name}
                  </option>
                ))}
              </select>
              {myProjects.length === 0 && (
                <span className="text-[11px] text-muted-foreground block">
                  You are not assigned to any active robotics projects.
                </span>
              )}
            </div>

            {/* Expected Return Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Expected Return Date *
              </label>
              <input
                type="date"
                {...register("expectedReturnDate")}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
              />
              {errors.expectedReturnDate && (
                <span className="text-xs text-destructive block">
                  {errors.expectedReturnDate.message}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground block">
                Suggested default return date is 14 days from today.
              </span>
            </div>

            {/* Purpose / Justification */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Borrowing Purpose & Justification *
              </label>
              <textarea
                {...register("purpose")}
                rows={4}
                placeholder="Explain the technical activity, test bench setup, or competition milestone..."
                className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              {errors.purpose && (
                <span className="text-xs text-destructive block">{errors.purpose.message}</span>
              )}
              <span className="text-[11px] text-muted-foreground block">
                Minimum 10 characters explaining your technical requirement.
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isBanned || createRequestMutation.isPending}
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
