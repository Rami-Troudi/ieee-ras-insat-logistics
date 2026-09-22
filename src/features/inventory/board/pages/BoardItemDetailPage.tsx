import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useSession } from "@/hooks/useSession";
import { useBoardItemDetail, useBoardItemEvents, useMutateStock } from "../hooks/useBoardInventory";
import { ArrowLeft, Package, SlidersHorizontal, History } from "lucide-react";
import { InventoryEventType } from "@/types";

export const BoardItemDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const { currentPersona } = useSession();

  const { data: item, isLoading } = useBoardItemDetail(itemId || "");
  const { data: events = [] } = useBoardItemEvents(itemId || "");

  const mutateStockMutation = useMutateStock();

  // Stock mutation modal state
  const [showMutationModal, setShowMutationModal] = useState(false);
  const [mutationType, setMutationType] = useState<InventoryEventType>("ADD");
  const [mutationQty, setMutationQty] = useState<number>(1);
  const [mutationReason, setMutationReason] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (isLoading || !item) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading inventory item specifications..." />
      </PageContainer>
    );
  }

  const handleStockMutation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMessage(null);
      await mutateStockMutation.mutateAsync({
        payload: {
          itemId: item.id,
          type: mutationType,
          quantity: mutationQty,
          reason: mutationReason || `Stock adjustment: ${mutationType}`,
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setShowMutationModal(false);
      setSuccessMessage(`Stock mutation (${mutationType}) executed successfully.`);
      setMutationQty(1);
      setMutationReason("");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to mutate stock");
    }
  };

  return (
    <PageContainer maxWidth="wide">
      <div className="pb-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
          <Link to="/board/inventory">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Inventory Master</span>
          </Link>
        </Button>
      </div>

      <PageHeader
        title={item.name}
        description={`ID: ${item.id} · ${item.category} · Cabinet ${item.location || "General"}`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="default"
              onClick={() => setShowMutationModal(true)}
              className="gap-1.5 font-semibold text-xs"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Mutate Stock</span>
            </Button>
          </div>
        }
      />

      {errorMessage && (
        <div className="mb-4">
          <AlertBanner variant="warning" title="Operation Failed" description={errorMessage} />
        </div>
      )}

      {successMessage && (
        <div className="mb-4">
          <AlertBanner variant="info" title="Success" description={successMessage} />
        </div>
      )}

      {/* Live Stock Breakdown Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
            Total In System
          </span>
          <span className="text-2xl font-bold text-foreground mt-1 block">
            {item.totalQuantity}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Physical assets</p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
          <span className="text-[11px] font-semibold uppercase text-emerald-600 block">
            Available Now
          </span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {item.availableQuantity}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Ready for loan</p>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <span className="text-[11px] font-semibold uppercase text-amber-600 block">
            Allocated (48h)
          </span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {item.allocatedQuantity || 0}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Pending pickup</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
            Active Loans
          </span>
          <span className="text-2xl font-bold text-foreground mt-1 block">
            {item.borrowedQuantity || 0}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Checked out</p>
        </div>

        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
          <span className="text-[11px] font-semibold uppercase text-destructive block">
            Damaged
          </span>
          <span className="text-2xl font-bold text-destructive mt-1 block">
            {item.damagedQuantity || 0}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Broken hardware</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
            Tracking Mode
          </span>
          <span className="text-sm font-bold font-mono text-foreground mt-2 block">
            {item.trackingMode}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Inventory model</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Item Specifications */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm h-fit">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <Package className="w-4 h-4 text-primary" />
            <span>Specifications & Policy</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Equipment Class</span>
              <span className="font-bold text-primary">Class {item.equipmentClass}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Category</span>
              <span className="text-foreground">{item.category}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Storage Location</span>
              <span className="font-mono text-foreground">{item.location || "Main Cabinet"}</span>
            </div>
            <div className="pt-1">
              <span className="text-muted-foreground block mb-1">Description:</span>
              <p className="text-muted-foreground font-sans text-xs">
                {item.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Ledger & Movement History */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-border bg-card space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-secondary" />
              <span>Stock Movement Ledger</span>
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              {events.length} event{events.length !== 1 ? "s" : ""} recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground text-[11px] uppercase font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Qty</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No stock movement history recorded yet for this item.
                    </td>
                  </tr>
                ) : (
                  events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-accent/30">
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground">
                        <span className="font-mono text-[11px]">{evt.type}</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold whitespace-nowrap">{evt.quantity}</td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">
                        {evt.actorName || evt.actorUserId}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{evt.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stock Mutation Modal */}
      {showMutationModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                <span>Execute Stock Mutation</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMutationModal(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleStockMutation} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Mutation Type:</label>
                <select
                  value={mutationType}
                  onChange={(e) => setMutationType(e.target.value as InventoryEventType)}
                  className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                >
                  <option value="ADD">ADD (+ Total & Available)</option>
                  <option value="DAMAGE">DAMAGE (- Available, + Damaged)</option>
                  <option value="REPAIR">REPAIR (- Damaged, + Available)</option>
                  <option value="RETIRE">RETIRE (- Total & Available)</option>
                  <option value="CORRECT">CORRECT (Manual Count Adjustment)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Quantity:</label>
                <Input
                  type="number"
                  min={1}
                  value={mutationQty}
                  onChange={(e) => setMutationQty(parseInt(e.target.value) || 1)}
                  className="h-8 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Reason / Rationale Note:
                </label>
                <Input
                  required
                  placeholder="e.g. Received new shipment from DigiKey, found damaged pin..."
                  value={mutationReason}
                  onChange={(e) => setMutationReason(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMutationModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={mutateStockMutation.isPending}
                  className="text-xs font-semibold"
                >
                  {mutateStockMutation.isPending ? "Executing..." : "Apply Mutation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
