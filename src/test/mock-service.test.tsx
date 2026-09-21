import { describe, it, expect, beforeEach } from "vitest";
import { MockInventoryService } from "@/services/mock/inventory";

describe("MockInventoryService Scenarios & Filtering", () => {
  let service: MockInventoryService;

  beforeEach(() => {
    service = new MockInventoryService(10); // low latency for test speed
  });

  it("handles NORMAL / SUCCESS scenario returning mock items", async () => {
    service.setScenario("SUCCESS");
    expect(service.getScenario()).toBe("SUCCESS");

    const items = await service.listItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((it) => it.name.includes("STM32"))).toBe(true);
  });

  it("handles EMPTY scenario returning zero items and null for getItem", async () => {
    service.setScenario("EMPTY");
    expect(service.getScenario()).toBe("EMPTY");

    const items = await service.listItems();
    expect(items).toEqual([]);

    const single = await service.getItem("item-stm32-f4");
    expect(single).toBeNull();
  });

  it("handles ERROR scenario by rejecting with a network error", async () => {
    service.setScenario("ERROR");
    expect(service.getScenario()).toBe("ERROR");

    await expect(service.listItems()).rejects.toThrow("Simulated mock service network error");
    await expect(service.getItem("item-stm32-f4")).rejects.toThrow(
      "Simulated mock service network error"
    );
  });

  it("handles SLOW scenario with increased latency", async () => {
    service.setScenario("SLOW");
    expect(service.getScenario()).toBe("SLOW");

    const startTime = Date.now();
    const items = await service.listItems();
    const elapsed = Date.now() - startTime;

    expect(items.length).toBeGreaterThan(0);
    // SLOW scenario uses 1500ms latency
    expect(elapsed).toBeGreaterThanOrEqual(1400);
  }, 10000);

  it("filters items by search query, equipment class, and availability", async () => {
    service.setScenario("NORMAL");

    // Search query filter
    const searchResults = await service.listItems({ search: "Arduino" });
    expect(
      searchResults.every((it) => it.name.includes("Arduino") || it.description.includes("Arduino"))
    ).toBe(true);

    // Equipment class filter
    const classEResults = await service.listItems({ equipmentClass: "E" });
    expect(classEResults.every((it) => it.equipmentClass === "E")).toBe(true);

    // Available only filter
    const availableResults = await service.listItems({ availableOnly: true });
    expect(availableResults.every((it) => it.availableQuantity > 0)).toBe(true);

    // Single item retrieval
    const stm32 = await service.getItem("item-stm32-f4");
    expect(stm32).not.toBeNull();
    expect(stm32?.id).toBe("item-stm32-f4");
  });
});
