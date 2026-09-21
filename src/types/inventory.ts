export type EquipmentClass = "A" | "B" | "C" | "D" | "E" | "F" | "G";

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
  trackingMode: TrackingMode;
  totalQuantity: number;
  availableQuantity: number;
  allocatedQuantity: number;
  borrowedQuantity: number;
  damagedQuantity: number;
  location?: string;
  isFavorite?: boolean;
  imageUrl?: string;
  specifications?: Record<string, string>;
  datasheetUrl?: string;
  assets?: IndividualAsset[];
}

export interface InventoryQueryFilter {
  search?: string;
  category?: string;
  equipmentClass?: string;
  availableOnly?: boolean;
}
