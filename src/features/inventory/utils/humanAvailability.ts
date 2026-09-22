import { InventoryItemSummary } from "@/types";

export type HumanAvailability =
  | { status: "Available"; color: "emerald"; label: "Available" }
  | { status: "Limited"; color: "amber"; label: "Limited stock" }
  | { status: "Unavailable"; color: "rose"; label: "Unavailable" };

/**
 * Returns simple, friendly human availability for students:
 * Available, Limited stock, or Unavailable based strictly on stock.
 * Borrowers do not see raw stock numbers.
 */
export function getHumanAvailability(item: InventoryItemSummary): HumanAvailability {
  if (item.availableQuantity > 3) {
    return { status: "Available", color: "emerald", label: "Available" };
  }
  if (item.availableQuantity > 0) {
    return { status: "Limited", color: "amber", label: "Limited stock" };
  }
  return { status: "Unavailable", color: "rose", label: "Unavailable" };
}

/**
 * Checks whether an item can be requested via the online cart.
 * Major product rule: Formal online borrow request is primarily for Class C and Class E.
 */
export function canRequestOnline(item: InventoryItemSummary): boolean {
  return (item.equipmentClass === "C" || item.equipmentClass === "E") && item.availableQuantity > 0;
}

/**
 * Human-friendly category naming
 */
export function getHumanCategory(category: string, equipmentClass: string): string {
  if (equipmentClass === "A") return "Consumables";
  if (equipmentClass === "B") return "Components";
  if (equipmentClass === "C") return "Mechanical & Power";
  if (equipmentClass === "D") return "Tools";
  if (equipmentClass === "E") return "Electronics";
  if (equipmentClass === "F") return "Heavy Equipment";
  if (equipmentClass === "G") return "High-Value";
  return category;
}
