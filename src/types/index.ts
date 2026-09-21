export type Role = "MEMBER" | "BOARD" | "SUPERADMIN";

export type ClearanceLevel = "I" | "II" | "III" | "IV" | "V" | "VI";

export type UserStatus = "ACTIVE" | "RESTRICTED" | "BANNED" | "BLACKLISTED";

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: Role;
  clearance: ClearanceLevel;
  affiliation: "EXTERNAL" | "AEROBOTIX" | "IEEE" | "RAS_BOARD" | "EUROBOT";
  isProcessed: boolean;
  status: UserStatus;
  strikesCount: number;
}

export type EquipmentClass = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type TrackingMode = "QUANTITY" | "INDIVIDUAL_ASSET";

export type AssetCondition = "GOOD" | "MINOR_ISSUE" | "DAMAGED" | "MAINTENANCE" | "LOST" | "RETIRED";

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
  isFavorite?: boolean;
}
