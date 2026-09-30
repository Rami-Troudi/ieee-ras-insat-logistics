import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useSession } from "@/hooks/useSession";
import {
  useBoardInventory,
  useCreateInventoryItem,
  useSetBorrowerVisibility,
  useDeleteInventoryItem,
} from "../hooks/useBoardInventory";
import { Package, Search, Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import { EquipmentClass, InventoryItemSummary } from "@/types";
import { DEFAULT_EQUIPMENT_IMAGE } from "@/assets/equipmentImages";
import { ItemImagePicker } from "../../components/ItemImagePicker";

const isBorrowerCatalogVisible = (item: { borrowerVisible?: boolean; equipmentClass: string }) =>
  item.borrowerVisible ?? (item.equipmentClass === "C" || item.equipmentClass === "E");

export const BoardInventoryPage: React.FC = () => {
  const { currentPersona } = useSession();
  const location = useLocation();
  const { data: items = [], isLoading } = useBoardInventory();
  const createItemMutation = useCreateInventoryItem();
  const visibilityMutation = useSetBorrowerVisibility();
  const deleteItemMutation = useDeleteInventoryItem();

  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<InventoryItemSummary | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pageNotice, setPageNotice] = useState<string | null>(
    (location.state as { notice?: string } | null)?.notice || null
  );

  // Form state for creating a new item
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Development Boards");
  const [newItemClass, setNewItemClass] = useState<EquipmentClass>("B");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemLocation, setNewItemLocation] = useState("Cabinet A-1");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemImageUrl, setNewItemImageUrl] = useState("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.category));
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
      if (classFilter !== "ALL" && item.equipmentClass !== classFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q) || false;
        if (!matchName && !matchId && !matchLoc) return false;
      }
      return true;
    });
  }, [items, categoryFilter, classFilter, searchQuery]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newItemName.trim();
    if (!name || name.length > 160) return;

    try {
      await createItemMutation.mutateAsync({
        payload: {
          name,
          category: newItemCategory.trim() || "Uncategorized",
          equipmentClass: newItemClass,
          trackingMode: "QUANTITY",
          totalQuantity: newItemQty,
          location: newItemLocation.trim(),
          description: newItemDescription.trim(),
          imageUrl: newItemImageUrl.trim() || undefined,
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setShowAddModal(false);
      setNewItemName("");
      setNewItemDescription("");
      setNewItemImageUrl("");
      setNewItemQty(1);
      setPageNotice(`Added "${name}" to inventory.`);
    } catch {
      // Keep the modal open so input is preserved; the global MutationErrorHost reports the error.
    }
  };


  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    if ((itemToDelete.borrowedQuantity || 0) > 0) {
      setDeleteError("Cannot delete item while units are borrowed on active loans.");
      return;
    }
    if ((itemToDelete.allocatedQuantity || 0) > 0) {
      setDeleteError("Cannot delete item with active pending allocations.");
      return;
    }

    try {
      setDeleteError(null);
      await deleteItemMutation.mutateAsync({
        itemId: itemToDelete.id,
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });
      const deletedName = itemToDelete.name;
      setItemToDelete(null);
      setPageNotice(`Item "${deletedName}" was permanently deleted from inventory.`);
    } catch (err: unknown) {
      const e = err as Error;
      setDeleteError(e.message || "Failed to delete item");
    }
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading inventory catalog..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="Board Inventory Operations"
        description="Master catalog ledger, real-time stock balances, add/remove unit controls, and item deletions."
        action={
          <Button
            variant="default"
            size="default"
            onClick={() => setShowAddModal(true)}
            className="gap-2 font-semibold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Catalog Item</span>
          </Button>
        }
      />

      {pageNotice && (
        <div className="mb-4">
          <AlertBanner variant="info" title="Inventory Updated" description={pageNotice} />
        </div>
      )}

      {deleteError && (
        <div className="mb-4">
          <AlertBanner variant="warning" title="Action Blocked" description={deleteError} />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant={categoryFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("ALL")}
            className="h-8 text-xs"
          >
            All Categories
          </Button>
          {categories.slice(0, 4).map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={categoryFilter === cat ? "default" : "outline"}
              onClick={() => setCategoryFilter(cat)}
              className="h-8 text-xs"
            >
              {cat}
            </Button>
          ))}

          {/* Class Filter Dropdown or Chips */}
          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
          <span className="text-muted-foreground text-[11px] font-semibold uppercase">Class:</span>
          {(["ALL", "A", "B", "C", "D", "E", "F", "G"] as const).map((cls) => (
            <Button
              key={cls}
              size="sm"
              variant={classFilter === cls ? "secondary" : "ghost"}
              onClick={() => setClassFilter(cls)}
              className="h-7 px-2 text-xs font-mono"
            >
              {cls}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, cabinet location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="space-y-3">
        {visibilityMutation.error instanceof Error && (
          <p role="alert" className="text-sm text-destructive">
            {visibilityMutation.error.message}
          </p>
        )}
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No inventory items found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your category or class filters.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Item Name & Specs</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Available</th>
                    <th className="py-3 px-4">Borrowed</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Borrower access</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((item) => {
                    const isLowStock = item.availableQuantity <= 1 && item.totalQuantity > 0;
                    const isOutOfStock = item.availableQuantity === 0;

                    return (
                      <tr key={item.id} className="hover:bg-accent/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.imageUrl || DEFAULT_EQUIPMENT_IMAGE}
                              alt={item.name}
                              className="w-9 h-9 rounded object-cover border border-border shrink-0 bg-muted"
                              onError={(e) => {
                                e.currentTarget.src = DEFAULT_EQUIPMENT_IMAGE;
                              }}
                            />
                            <div>
                              <div className="font-semibold text-foreground">{item.name}</div>
                              <div className="text-[11px] font-mono text-muted-foreground">
                                {item.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{item.category}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex whitespace-nowrap text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            Class {item.equipmentClass}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {item.totalQuantity}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold ${
                              isOutOfStock
                                ? "text-destructive"
                                : isLowStock
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                            }`}
                          >
                            {item.availableQuantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground font-medium">
                          {item.borrowedQuantity || 0}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {item.location || "Cabinet"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant={isBorrowerCatalogVisible(item) ? "secondary" : "outline"}
                            disabled={visibilityMutation.isPending}
                            aria-label={`${isBorrowerCatalogVisible(item) ? "Hide" : "Show"} ${item.name} to borrowers`}
                            onClick={() =>
                              visibilityMutation.mutate({
                                itemId: item.id,
                                visible: !isBorrowerCatalogVisible(item),
                                actorUserId: currentPersona.id,
                              })
                            }
                            className="h-8 gap-1.5 text-xs"
                          >
                            {isBorrowerCatalogVisible(item) ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                            <span>{isBorrowerCatalogVisible(item) ? "Hide" : "Show"}</span>
                          </Button>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1">
                              <Link to={`/board/inventory/${item.id}`}>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Manage</span>
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setDeleteError(null);
                                setItemToDelete(item);
                              }}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title={`Delete ${item.name} as whole`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <span>Add New Catalog Item</span>
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

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Item Name:</label>
                <Input
                  required
                  maxLength={160}
                  placeholder="e.g. STM32 Nucleo F401RE"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Category:</label>
                  <Input
                    required
                    maxLength={80}
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Equipment Class:
                  </label>
                  <select
                    value={newItemClass}
                    onChange={(e) => setNewItemClass(e.target.value as EquipmentClass)}
                    className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                  >
                    {(["A", "B", "C", "D", "E", "F", "G"] as EquipmentClass[]).map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Initial Quantity:
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={newItemQty}
                    max={100000}
                    onChange={(e) =>
                      setNewItemQty(Math.min(100000, Math.max(1, parseInt(e.target.value) || 1)))
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Cabinet Location:
                  </label>
                  <Input
                    placeholder="e.g. Cabinet B-3"
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Description / Notes:
                </label>
                <Input
                  placeholder="Technical specs, pinout info, caution notes..."
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <ItemImagePicker
                value={newItemImageUrl}
                onChange={setNewItemImageUrl}
                label="Item Picture (Catalogue & Cart View):"
              />

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
                  disabled={createItemMutation.isPending}
                  className="text-xs font-semibold"
                >
                  {createItemMutation.isPending ? "Creating..." : "Add to Catalog"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item as Whole Confirmation Dialog */}
      <ConfirmationDialog
        open={Boolean(itemToDelete)}
        onClose={() => {
          setItemToDelete(null);
          setDeleteError(null);
        }}
        title="Delete Item as Whole?"
        description={
          itemToDelete
            ? `Are you sure you want to permanently delete "${itemToDelete.name}"? This removes the item and all its units from the inventory master.`
            : ""
        }
        variant="destructive"
        confirmLabel={deleteItemMutation.isPending ? "Deleting..." : "Delete Item Permanently"}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
};
