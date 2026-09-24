import { BorrowerCatalogItem, InventoryItemSummary, UserProfile } from "@/types";
import { clearanceToNumber } from "./eligibility";
import { DEFAULT_EQUIPMENT_IMAGE } from "@/assets/equipmentImages";

export function isFormalRequestClass(item: InventoryItemSummary): boolean {
  return item.equipmentClass === "C" || item.equipmentClass === "E";
}

export function getBorrowerCatalogAccess(
  user: UserProfile,
  item: InventoryItemSummary
): {
  visible: boolean;
  action: BorrowerCatalogItem["action"];
  availability: BorrowerCatalogItem["availability"];
} {
  const availability =
    item.availableQuantity <= 0
      ? "UNAVAILABLE"
      : item.availableQuantity <= 3
        ? "LIMITED"
        : "AVAILABLE";
  const clearance = clearanceToNumber(user.clearance);
  const requiredClearance = { A: 1, B: 1, C: 2, D: 3, E: 3, F: 3, G: 4 }[item.equipmentClass];
  const visible =
    user.role === "MEMBER" &&
    user.status === "ACTIVE" &&
    user.strikesCount < 4 &&
    clearance >= requiredClearance &&
    item.totalQuantity > 0 &&
    (item.equipmentClass !== "G" || user.clearance === "IV") &&
    (user.strikesCount < 2 || !["F", "G"].includes(item.equipmentClass));
  if (!visible || availability === "UNAVAILABLE") return { visible, action: "NONE", availability };
  if (item.equipmentClass === "A") return { visible, action: "WORKSPACE", availability };
  if (isFormalRequestClass(item)) return { visible, action: "REQUEST", availability };
  return { visible, action: "ASK_OPERATOR", availability };
}

export function toBorrowerCatalogItem(
  item: InventoryItemSummary,
  access: ReturnType<typeof getBorrowerCatalogAccess>
): BorrowerCatalogItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    imageUrl: item.imageUrl || DEFAULT_EQUIPMENT_IMAGE,
    ...(item.datasheetUrl ? { datasheetUrl: item.datasheetUrl } : {}),
    availability: access.availability,
    action: access.action,
  };
}
