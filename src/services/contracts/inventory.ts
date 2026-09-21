export interface InventoryQueryFilter {
  search?: string;
  category?: string;
  equipmentClass?: string;
  availableOnly?: boolean;
}

export interface IInventoryService {
  listItems(filters?: InventoryQueryFilter): Promise<import("@/types").InventoryItemSummary[]>;
  getItem(id: string): Promise<import("@/types").InventoryItemSummary | null>;
}
