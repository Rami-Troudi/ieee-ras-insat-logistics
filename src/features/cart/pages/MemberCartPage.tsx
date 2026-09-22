import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useBorrowCart } from "@/features/cart";
import { useSession } from "@/hooks/useSession";
import { useCreateRequest } from "@/features/requests/hooks/useRequests";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Calendar,
  Send,
  CheckCircle2,
  PackageOpen,
} from "lucide-react";
import { formatDate } from "@/lib/dates";

export const MemberCartPage: React.FC = () => {
  const { currentPersona } = useSession();
  const {
    state: cartState,
    updateQuantity,
    removeItem,
    clearCart,
    setPurpose,
    setReturnDate,
  } = useBorrowCart();

  const createRequestMutation = useCreateRequest(currentPersona.id);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNote, setShowNote] = useState(Boolean(cartState.purpose));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Return date editing
  const [isEditingDate, setIsEditingDate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartState.items.length === 0) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await createRequestMutation.mutateAsync({
        purpose: cartState.purpose?.trim() || "Robotics project equipment borrow",
        expectedReturnDate: cartState.expectedReturnDate,
        items: cartState.items.map((i) => ({
          itemId: i.item.id,
          quantity: i.quantity,
        })),
      });

      clearCart();
      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Failed to submit borrow request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Request Sent!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We&apos;ll notify you as soon as your equipment is reviewed and ready for pickup at the
            RAS workspace.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button asChild variant="outline" className="flex-1 h-11">
            <Link to="/app/inventory">Back to Catalogue</Link>
          </Button>
          <Button asChild variant="default" className="flex-1 h-11">
            <Link to="/app/activity">View Activity</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (cartState.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-14 h-14 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto">
          <PackageOpen className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Your request is empty</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Explore the visual catalogue to add the robotics gear you need.
          </p>
        </div>
        <Button asChild variant="default" className="h-10 px-6">
          <Link to="/app/inventory">Browse Catalogue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Bar with Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Add more items</span>
        </Link>
        <button
          type="button"
          onClick={() => clearCart()}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Your Request</h1>
        <p className="text-xs text-muted-foreground">
          Confirm your items and submit for logistics pickup.
        </p>
      </div>

      {/* Visual Item List */}
      <div className="space-y-2.5">
        {cartState.items.map(({ item, quantity }) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card shadow-xs"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted/50 overflow-hidden shrink-0 border border-border/60">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                  IMG
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-1 border border-border bg-muted/20 rounded-lg p-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (quantity <= 1) removeItem(item.id);
                  else updateQuantity(item.id, quantity - 1);
                }}
                className="w-7 h-7 rounded bg-card border border-border/80 flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all"
                aria-label={`Decrease ${item.name}`}
              >
                {quantity === 1 ? (
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
              </button>
              <span className="w-6 text-center text-xs font-bold text-foreground">{quantity}</span>
              <button
                type="button"
                onClick={() => {
                  if (quantity < item.availableQuantity) {
                    updateQuantity(item.id, quantity + 1);
                  }
                }}
                disabled={quantity >= item.availableQuantity}
                className="w-7 h-7 rounded bg-card border border-border/80 flex items-center justify-center text-foreground hover:bg-muted active:scale-95 disabled:opacity-40 transition-all"
                aria-label={`Increase ${item.name}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Expected Return Date Section */}
        <div className="p-4 rounded-xl border border-border bg-card/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary shrink-0" />
            <div>
              <span className="text-xs text-muted-foreground block">Expected return</span>
              {isEditingDate ? (
                <input
                  type="date"
                  value={cartState.expectedReturnDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setReturnDate(e.target.value)}
                  onBlur={() => setIsEditingDate(false)}
                  autoFocus
                  className="text-xs font-bold bg-background border border-input rounded px-2 py-1 mt-1 text-foreground"
                />
              ) : (
                <span className="text-sm font-bold text-foreground">
                  {formatDate(cartState.expectedReturnDate)}
                </span>
              )}
            </div>
          </div>
          {!isEditingDate && (
            <button
              type="button"
              onClick={() => setIsEditingDate(true)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Change
            </button>
          )}
        </div>

        {/* Purpose / Note with 1-tap presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Purpose & Project
            </label>
            {!showNote && (
              <button
                type="button"
                onClick={() => setShowNote(true)}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Custom note</span>
              </button>
            )}
          </div>

          {/* Quick-tap purpose preset pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              "Robotics Workshop",
              "Eurobot Prep",
              "Lab Practical Work",
              "Personal Project",
              "Competition Testing",
            ].map((preset) => {
              const isSelected = cartState.purpose === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setPurpose(isSelected ? "" : preset);
                    setShowNote(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card border-input/80 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          {showNote && (
            <textarea
              value={cartState.purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={2}
              placeholder="Briefly describe what you are building or testing..."
              className="w-full rounded-xl border border-input bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary resize-none mt-1.5"
            />
          )}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Send Request Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 text-sm font-bold gap-2 rounded-xl shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? "Sending..." : "Send Request"}</span>
        </Button>
      </form>
    </div>
  );
};
