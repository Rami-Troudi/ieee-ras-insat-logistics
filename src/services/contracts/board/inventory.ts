import {
  InventoryItemSummary,
  InventoryEvent,
  InventoryEventType,
  AssetCondition,
  IndividualAsset,
} from "@/types";

export interface MutateStockPayload {
  itemId: string;
  type: InventoryEventType;
  quantity: number;
  reason: string;
  assetId?: string;
  condition?: AssetCondition;
}

export interface CreateInventoryItemPayload {
  name: string;
  category: string;
  equipmentClass: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  trackingMode: "QUANTITY" | "INDIVIDUAL_ASSET";
  totalQuantity: number;
  description: string;
  location?: string;
  specifications?: Record<string, string>;
  initialAssets?: { serialNumber: string; condition: AssetCondition }[];
}

export interface UpdateAssetPayload {
  itemId: string;
  assetId: string;
  condition: AssetCondition;
  isAvailable: boolean;
  notes?: string;
}

export interface IBoardInventoryService {
  getItems(filters?: {
    search?: string;
    category?: string;
    equipmentClass?: string;
    lowStockOnly?: boolean;
  }): Promise<InventoryItemSummary[]>;
  getItemById(itemId: string): Promise<InventoryItemSummary | null>;
  createItem(
    payload: CreateInventoryItemPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<InventoryItemSummary>;
  mutateStock(
    payload: MutateStockPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<{ item: InventoryItemSummary; event: InventoryEvent }>;
  updateAsset(
    payload: UpdateAssetPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<IndividualAsset>;
  getMovementHistory(itemId?: string): Promise<InventoryEvent[]>;
}
