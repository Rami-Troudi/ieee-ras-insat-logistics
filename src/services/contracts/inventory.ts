import { InventoryItemSummary, InventoryQueryFilter } from "@/types";

export interface IInventoryService {
  listItems(filters?: InventoryQueryFilter, userId?: string): Promise<InventoryItemSummary[]>;
  getItem(id: string): Promise<InventoryItemSummary | null>;
  getCategories(): Promise<string[]>;
}
