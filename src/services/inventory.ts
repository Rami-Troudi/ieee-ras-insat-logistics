import { IInventoryService } from "./contracts/inventory";
import { mockInventoryService } from "./mock/inventory";

/**
 * Public inventory service boundary.
 * In Stage 1-3, this delegates to mockInventoryService.
 * In Stage 4, this will swap to the real API client implementation without changing page imports.
 */
export const inventoryService: IInventoryService = mockInventoryService;

export { mockInventoryService };
export type { MockScenario } from "./mock/inventory";
