import { BorrowerCatalogItem, InventoryQueryFilter } from "@/types";

export interface IInventoryService {
  listItems(filters?: InventoryQueryFilter, userId?: string): Promise<BorrowerCatalogItem[]>;
  getItem(id: string, userId?: string): Promise<BorrowerCatalogItem | null>;
  getCategories(userId?: string): Promise<string[]>;
}
