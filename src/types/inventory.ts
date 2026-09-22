export type EquipmentClass = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type ItemClass = EquipmentClass;

export type TrackingMode = "QUANTITY" | "INDIVIDUAL_ASSET";

export type AssetCondition =
  "GOOD" | "MINOR_ISSUE" | "DAMAGED" | "MAINTENANCE" | "LOST" | "RETIRED";

export interface IndividualAsset {
  id: string;
  serialNumber: string;
  condition: AssetCondition;
  isAvailable: boolean;
  notes?: string;
}

export interface InventoryItemSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  equipmentClass: EquipmentClass;
  itemClass?: EquipmentClass;
  trackingMode: TrackingMode;
  totalQuantity: number;
  availableQuantity: number;
  allocatedQuantity: number;
  borrowedQuantity: number;
  damagedQuantity: number;
  maintenanceQuantity?: number;
  lostQuantity?: number;
  location?: string;
  isFavorite?: boolean;
  imageUrl?: string;
  specifications?: Record<string, string>;
  datasheetUrl?: string;
  assets?: IndividualAsset[];
  aliases?: string[];
  tags?: string[];
  isDirectBoardApproval?: boolean;
}

export interface InventoryQueryFilter {
  search?: string;
  category?: string;
  equipmentClass?: string;
  availableOnly?: boolean;
  borrowableByMe?: boolean;
  trackingMode?: TrackingMode;
  favoritesOnly?: boolean;
}
