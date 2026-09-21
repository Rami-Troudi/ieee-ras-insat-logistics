import { InventoryItemSummary } from "@/types";

export interface InventoryQueryFilter {
  search?: string;
  category?: string;
  equipmentClass?: string;
  availableOnly?: boolean;
}

export interface IInventoryService {
  listItems(filters?: InventoryQueryFilter): Promise<InventoryItemSummary[]>;
  getItem(id: string): Promise<InventoryItemSummary | null>;
  getCategories(): Promise<string[]>;
}
