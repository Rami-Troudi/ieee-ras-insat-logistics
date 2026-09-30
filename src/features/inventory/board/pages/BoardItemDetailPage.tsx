import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useSession } from "@/hooks/useSession";
import {
  useBoardItemDetail,
  useBoardItemEvents,
  useMutateStock,
  useDeleteInventoryItem,
  useUpdateInventoryItem,
} from "../hooks/useBoardInventory";
import { ArrowLeft, Package, History, Plus, Minus, Trash2, Edit, ImageIcon } from "lucide-react";
import { DEFAULT_EQUIPMENT_IMAGE } from "@/assets/equipmentImages";
import { ItemImagePicker } from "../../components/ItemImagePicker";

export const BoardItemDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { currentPersona } = useSession();

  const { data: item, isLoading } = useBoardItemDetail(itemId || "");
  const { data: events = [] } = useBoardItemEvents(itemId || "");

  const mutateStockMutation = useMutateStock();
  const deleteItemMutation = useDeleteInventoryItem();
  const updateItemMutation = useUpdateInventoryItem();

  // Action states: 1) Add number, 2) Remove number, 3) Delete as whole, 4) Manage & Picture
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit item form state
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [reasonInput, setReasonInput] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  if (isLoading || !item) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading inventory item specifications..." />
      </PageContainer>
    );
  }

  const openEditModal = () => {
    if (!item) return;
    setEditName(item.name || "");
    setEditCategory(item.category || "");
    setEditLocation(item.location || "");
    setEditDescription(item.description || "");
    setEditImageUrl(item.imageUrl || "");
    setErrorMessage(null);
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      setErrorMessage(null);
      await updateItemMutation.mutateAsync({
        payload: {
          itemId: item.id,
          name: editName.trim() || item.name,
          category: editCategory.trim() || item.category,
          location: editLocation.trim(),
          description: editDescription.trim(),
          imageUrl: editImageUrl.trim(),
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });
      setShowEditModal(false);
      setSuccessMessage("Item details and cart picture updated successfully.");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to update item");
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityInput < 1) return;

    try {
      setErrorMessage(null);
      await mutateStockMutation.mutateAsync({
        payload: {
          itemId: item.id,
          type: "ADD",
          quantity: quantityInput,
          reason: reasonInput.trim() || `Added ${quantityInput} units to stock`,
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setShowAddModal(false);
      setSuccessMessage(`Successfully added ${quantityInput} unit(s) to stock.`);
      setQuantityInput(1);
      setReasonInput("");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to add stock units");
    }
  };

  const handleRemoveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityInput < 1) return;
    if (quantityInput > item.availableQuantity) {
      setErrorMessage(`Cannot remove ${quantityInput} units. Only ${item.availableQuantity} units are available.`);
      return;
    }
    try {
      setErrorMessage(null);
      await mutateStockMutation.mutateAsync({
        payload: {
          itemId: item.id,
          type: "REMOVE",
          quantity: quantityInput,
          reason: reasonInput.trim() || `Removed ${quantityInput} units from stock`,
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setShowRemoveModal(false);
      setSuccessMessage(`Successfully removed ${quantityInput} unit(s) from stock.`);
      setQuantityInput(1);
      setReasonInput("");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to remove stock units");
    }
  };

  const handleDeleteItem = async () => {
    if ((item.borrowedQuantity || 0) > 0) {
      setErrorMessage("Cannot delete item while units are borrowed on active loans.");
      setShowDeleteConfirm(false);
      return;
    }
    if ((item.allocatedQuantity || 0) > 0) {
      setErrorMessage("Cannot delete item with active pending allocations.");
      setShowDeleteConfirm(false);
      return;
    }
    try {
      setErrorMessage(null);
      await deleteItemMutation.mutateAsync({
        itemId: item.id,
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });
      setShowDeleteConfirm(false);
      navigate("/board/inventory", {
        replace: true,
        state: { notice: `Item "${item.name}" was permanently deleted from inventory.` },
      });
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to delete item");
      setShowDeleteConfirm(false);
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
              variant="outline"
              size="sm"
              onClick={openEditModal}
              className="gap-1.5 font-semibold text-xs border-primary/40 hover:bg-primary/10 text-primary"
            >
              <Edit className="w-4 h-4" />
              <span>Manage & Picture</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setQuantityInput(1);
                setReasonInput("");
                setErrorMessage(null);
                setShowAddModal(true);
              }}
              className="gap-1.5 font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Add Number</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuantityInput(1);
                setReasonInput("");
                setErrorMessage(null);
                setShowRemoveModal(true);
              }}
              disabled={item.availableQuantity <= 0}
              className="gap-1.5 font-semibold text-xs border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
            >
              <Minus className="w-4 h-4" />
              <span>Remove Number</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setErrorMessage(null);
                setShowDeleteConfirm(true);
              }}
              className="gap-1.5 font-semibold text-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete as Whole</span>
            </Button>
          </div>
        }
      />

      {errorMessage && (
        <div className="mb-4">
          <AlertBanner variant="warning" title="Action Blocked" description={errorMessage} />
        </div>
      )}

      {successMessage && (
        <div className="mb-4">
          <AlertBanner variant="info" title="Success" description={successMessage} />
        </div>
      )}

      {/* Simplified Live Stock Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
            Total in Stock
          </span>
          <span className="text-2xl font-bold text-foreground mt-1 block">
            {item.totalQuantity}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">All units on record</p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
          <span className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 block">
            Available Now
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {item.availableQuantity}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Ready for borrow</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
            Borrowed / Out
          </span>
          <span className="text-2xl font-bold text-foreground mt-1 block">
            {item.borrowedQuantity || 0}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Currently checked out</p>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <span className="text-[11px] font-semibold uppercase text-amber-600 dark:text-amber-400 block">
            Allocated (Pending)
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {item.allocatedQuantity || 0}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Awaiting pickup</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Item Specifications */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span>Specifications & Policy</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={openEditModal}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>
          </div>

          {/* Item Cart Picture */}
          <div className="relative rounded-lg overflow-hidden border border-border bg-muted/20 aspect-video flex items-center justify-center group">
            <img
              src={item.imageUrl || DEFAULT_EQUIPMENT_IMAGE}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_EQUIPMENT_IMAGE;
              }}
            />
            <button
              type="button"
              onClick={openEditModal}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Change Cart Picture</span>
            </button>
          </div>

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
                  <th className="py-2.5 px-3">Action</th>
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
                        <span className="font-mono text-[11px] font-semibold">{evt.type}</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                        {evt.type === "REMOVE" ? `-${evt.quantity}` : `+${evt.quantity}`}
                      </td>
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

      {/* Action 1: Add Number Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>Add Units to Stock</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleAddStock} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  How many units would you like to add?
                </label>
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-9 text-sm font-semibold"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Current total: {item.totalQuantity} · New total will be:{" "}
                  <strong className="text-foreground">{item.totalQuantity + (quantityInput || 0)}</strong>
                </p>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Reason / Note (optional):
                </label>
                <Input
                  placeholder="e.g. New shipment received, bought spare units..."
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={mutateStockMutation.isPending}
                  className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{mutateStockMutation.isPending ? "Adding..." : `Add ${quantityInput} Unit(s)`}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action 2: Remove Number Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Minus className="w-5 h-5 text-amber-600" />
                <span>Remove Units from Stock</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRemoveModal(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleRemoveStock} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  How many units would you like to remove?
                </label>
                <Input
                  type="number"
                  min={1}
                  max={item.availableQuantity}
                  value={quantityInput}
                  onChange={(e) =>
                    setQuantityInput(Math.max(1, Math.min(item.availableQuantity, parseInt(e.target.value) || 1)))
                  }
                  className="h-9 text-sm font-semibold"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Available to remove: <strong className="text-foreground">{item.availableQuantity}</strong> · New
                  available will be:{" "}
                  <strong className="text-foreground">
                    {Math.max(0, item.availableQuantity - (quantityInput || 0))}
                  </strong>
                </p>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Reason / Note (optional):
                </label>
                <Input
                  placeholder="e.g. Discarded worn units, written off, consumable used..."
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRemoveModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={mutateStockMutation.isPending || item.availableQuantity <= 0}
                  className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>
                    {mutateStockMutation.isPending ? "Removing..." : `Remove ${quantityInput} Unit(s)`}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action 4: Edit Item & Cart Picture Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Manage Item & Picture</h3>
                  <p className="text-xs text-muted-foreground">
                    Update item details and catalogue cart picture
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <ItemImagePicker
                value={editImageUrl}
                onChange={setEditImageUrl}
                itemName={editName || item.name}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Item Name</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="h-8 text-xs font-medium"
                    placeholder="e.g. STM32 Nucleo-F401RE"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Category</label>
                  <Input
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    required
                    className="h-8 text-xs"
                    placeholder="e.g. Microcontrollers"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Storage Location</label>
                <Input
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="h-8 text-xs font-mono"
                  placeholder="e.g. Cabinet A - Shelf 2"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Technical specs, pinouts, contents, or borrowing warnings..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={updateItemMutation.isPending}
                  className="text-xs font-semibold gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{updateItemMutation.isPending ? "Saving Changes..." : "Save Changes"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action 3: Delete as Whole Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Item as Whole?"
        description={`Are you sure you want to permanently delete "${item.name}" from inventory? This action removes all ${item.totalQuantity} recorded unit(s) and cannot be undone.`}
        variant="destructive"
        confirmLabel={deleteItemMutation.isPending ? "Deleting..." : "Delete Item Permanently"}
        onConfirm={handleDeleteItem}
      />
    </PageContainer>
  );
};
