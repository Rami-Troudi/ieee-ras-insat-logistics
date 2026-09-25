import { createClient } from "@libsql/client";
import { INITIAL_INVENTORY } from "../src/mocks/seed/inventory.ts";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken || url.startsWith("file:")) {
  throw new Error("Set production TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before seeding.");
}

const client = createClient({ url, authToken });
const now = Date.now();

try {
  console.log(`Seeding ${INITIAL_INVENTORY.length} inventory items to Turso...`);
  for (const item of INITIAL_INVENTORY) {
    const isFormal = item.equipmentClass === "C" || item.equipmentClass === "E";
    const isVisible = item.borrowerVisible ?? isFormal ? 1 : 0;
    const total = item.totalQuantity;
    const available = item.availableQuantity;
    const allocated = item.allocatedQuantity ?? 0;
    const borrowed = item.borrowedQuantity ?? 0;
    const damaged = item.damagedQuantity ?? 0;
    const maintenance = item.maintenanceQuantity ?? 0;
    const lost = item.lostQuantity ?? 0;

    // Invariant check
    if (total !== available + allocated + borrowed + damaged + maintenance + lost) {
      console.warn(`Item ${item.id} (${item.name}) violates conservation: total=${total}, sum=${available + allocated + borrowed + damaged + maintenance + lost}`);
    }

    await client.execute({
      sql: `INSERT OR REPLACE INTO inventory (
        id, name, category, equipment_class, tracking_mode,
        total_quantity, available_quantity, allocated_quantity,
        borrowed_quantity, damaged_quantity, maintenance_quantity,
        lost_quantity, borrower_visible, data, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        item.id,
        item.name.slice(0, 160),
        item.category.slice(0, 80),
        item.equipmentClass,
        item.trackingMode,
        total,
        available,
        allocated,
        borrowed,
        damaged,
        maintenance,
        lost,
        isVisible,
        JSON.stringify(item),
        now,
      ],
    });

    if (item.trackingMode === "INDIVIDUAL_ASSET") {
      // Create asset records for tracking
      for (let i = 1; i <= total; i++) {
        const serialNumber = `SN-${item.id.replace("item-", "").toUpperCase()}-${String(i).padStart(3, "0")}`;
        const assetId = `asset-${item.id}-${i}`;
        const state = i <= available ? "AVAILABLE" : "BORROWED";
        await client.execute({
          sql: `INSERT OR IGNORE INTO inventory_assets (id, item_id, serial_number, state, data)
                VALUES (?, ?, ?, ?, ?)`,
          args: [
            assetId,
            item.id,
            serialNumber,
            state,
            JSON.stringify({ id: assetId, itemId: item.id, serialNumber, state }),
          ],
        });
      }
    }
  }

  const count = await client.execute("SELECT count(*) as count FROM inventory");
  console.log(`Successfully seeded inventory. Total items in DB: ${count.rows[0].count}`);
} finally {
  client.close();
}
