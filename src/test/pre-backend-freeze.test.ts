import { describe, it, expect, beforeEach } from "vitest";
import { mockDb } from "@/mocks/db";
import {
  requestService,
  boardRequestService,
  boardLoanService,
  inventoryService,
  authService,
} from "@/services";

describe("Pre-Backend Freeze Domain Integrity & Privacy Contracts", () => {
  beforeEach(() => {
    localStorage.clear();
    authService.clearSession();
    mockDb.reset();
  });

  describe("Requirement: C/E-Only Formal Online Requests", () => {
    it("permits online request creation for Class C and Class E items only", async () => {
      // item-stm32-f4 is Class E
      const validReq = await requestService.createRequest("p-member-ieee", {
        expectedReturnDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        items: [{ itemId: "item-stm32-f4", quantity: 1 }],
      });
      expect(validReq).toBeDefined();
      expect(validReq.items[0].equipmentClass).toBe("E");
    });

    it("rejects online request creation for non-C/E equipment classes", async () => {
      // item-glue-sticks is Class A (Consumables)
      await expect(
        requestService.createRequest("p-member-ieee", {
          expectedReturnDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          items: [{ itemId: "item-glue-sticks", quantity: 1 }],
        })
      ).rejects.toThrow("Only Class C and E can be requested online");

      // item-soldering-station is Class F (Heavy Equipment)
      await expect(
        requestService.createRequest("p-member-ieee", {
          expectedReturnDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          items: [{ itemId: "item-soldering-station", quantity: 1 }],
        })
      ).rejects.toThrow("Only Class C and E can be requested online");
    });

    it("rejects online request review for non-C/E equipment", async () => {
      let craftedId = "";
      mockDb.mutate((draft) => {
        craftedId = "REQ-CRAFTED-CLASS-A";
        draft.requests.push({
          id: craftedId,
          userId: "p-member-ieee",
          userName: "Rami Troudi",
          userEmail: "rami.ieee@insat.u-carthage.tn",
          userClearance: "III",
          expectedReturnDate: "2026-11-01",
          decisionStatus: "PENDING",
          handoverStatus: "WAITING",
          lifecycleStatus: "ACTIVE",
          status: "PENDING",
          items: [
            {
              id: "line-crafted-01",
              itemId: "item-glue-sticks",
              itemName: "Hot Melt Glue Sticks",
              category: "Consumables",
              equipmentClass: "A",
              requestedQuantity: 2,
              approvedQuantity: 0,
              handedOverQuantity: 0,
              returnedQuantity: 0,
              damagedQuantity: 0,
              lostQuantity: 0,
              status: "PENDING",
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timeline: [],
        });
      });

      await expect(
        boardRequestService.reviewRequest(
          {
            requestId: craftedId,
            lines: [{ lineId: "line-crafted-01", approvedQuantity: 2 }],
          },
          "p-board-logistics"
        )
      ).rejects.toThrow("Only Class C and E requests can be approved online");
    });
  });

  describe("Requirement: Borrower Stock Privacy & Catalog DTO", () => {
    it("ensures BorrowerCatalogItem DTO strictly hides internal quantities, serials, and locations", async () => {
      const catalog = await inventoryService.listItems(undefined, "p-member-ieee");
      expect(catalog.length).toBeGreaterThan(0);

      for (const item of catalog) {
        // Must contain safe public fields
        expect(item.id).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.description).toBeDefined();
        expect(item.category).toBeDefined();
        expect(item.imageUrl).toBeDefined();
        expect(["AVAILABLE", "LIMITED", "UNAVAILABLE"]).toContain(item.availability);
        expect(["NONE", "WORKSPACE", "REQUEST", "ASK_OPERATOR"]).toContain(item.action);

        // Must NEVER expose private inventory fields
        const unsafeItem = item as unknown as Record<string, unknown>;
        expect(unsafeItem.totalQuantity).toBeUndefined();
        expect(unsafeItem.availableQuantity).toBeUndefined();
        expect(unsafeItem.allocatedQuantity).toBeUndefined();
        expect(unsafeItem.borrowedQuantity).toBeUndefined();
        expect(unsafeItem.damagedQuantity).toBeUndefined();
        expect(unsafeItem.maintenanceQuantity).toBeUndefined();
        expect(unsafeItem.lostQuantity).toBeUndefined();
        expect(unsafeItem.location).toBeUndefined();
        expect(unsafeItem.assets).toBeUndefined();
        expect(unsafeItem.trackingMode).toBeUndefined();
        expect(unsafeItem.equipmentClass).toBeUndefined();
      }
    });
  });

  describe("Requirement: Allocation Expiry & Handover Boundary", () => {
    it("rejects physical handover if the 48-hour allocation window has expired", async () => {
      // Seed REQ-2026-0142 has an approved line but expired allocation simulation
      let reqId = "";
      mockDb.mutate((draft) => {
        reqId = "REQ-EXPIRED-TEST";
        const expiredDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
        draft.requests.push({
          id: reqId,
          userId: "p-member-ieee",
          userName: "Rami Troudi",
          userEmail: "rami.ieee@insat.u-carthage.tn",
          userClearance: "III",
          expectedReturnDate: "2026-11-01",
          decisionStatus: "APPROVED",
          handoverStatus: "WAITING",
          lifecycleStatus: "ACTIVE",
          status: "APPROVED",
          items: [
            {
              id: "line-exp-1",
              itemId: "item-arduino-uno",
              itemName: "Arduino Uno R3",
              category: "Development Boards",
              equipmentClass: "E",
              requestedQuantity: 1,
              approvedQuantity: 1,
              handedOverQuantity: 0,
              returnedQuantity: 0,
              damagedQuantity: 0,
              lostQuantity: 0,
              status: "APPROVED",
            },
          ],
          pickupDeadline: expiredDate,
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          updatedAt: expiredDate,
          timeline: [],
        });

        draft.allocations.push({
          id: "alloc-expired-1",
          requestId: reqId,
          requestLineId: "line-exp-1",
          itemId: "item-arduino-uno",
          itemName: "Arduino Uno R3",
          quantity: 1,
          status: "ACTIVE",
          expiresAt: expiredDate,
          allocatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          allocatedBy: "p-board-logistics",
        });
      });

      await expect(
        boardRequestService.confirmHandover(
          {
            requestId: reqId,
            lineHandoverDetails: [{ lineId: "line-exp-1" }],
          },
          "p-board-logistics"
        )
      ).rejects.toThrow(/Reservation expired/i);
    });
  });

  describe("Requirement: Exact Asset Return & Conservation", () => {
    it("strictly requires exact asset identifiers for individual asset tracking returns", async () => {
      // LN-2026-0089 has item-stm32-f4 with asset ast-stm-004
      const loan = await boardLoanService.getLoanById("LN-2026-0089");
      expect(loan).not.toBeNull();
      const stmLine = loan!.items.find((i) => i.itemId === "item-stm32-f4")!;

      // Returning with wrong/invalid asset ID throws
      await expect(
        boardLoanService.confirmReturn(
          {
            loanId: "LN-2026-0089",
            items: [
              {
                lineItemId: stmLine.id,
                returnedQuantity: 1,
                condition: "GOOD",
                assetIds: ["non-existent-asset"],
              },
            ],
          },
          "p-board-logistics"
        )
      ).rejects.toThrow(/Select exactly 1 outstanding assets/i);
    });
  });

  describe("Requirement: 3 Canonical Roles (MEMBER, OPERATOR, SUPERADMIN)", () => {
    it("rejects unauthorized member actor from executing operator mutations", async () => {
      await expect(
        boardLoanService.updateDueDate("LN-2026-0089", "2026-11-20", "p-member-ieee")
      ).rejects.toThrow("Unauthorized: active operator access required");

      await expect(
        boardRequestService.reviewRequest(
          {
            requestId: "REQ-2026-0155",
            lines: [{ lineId: "rline-waiting-uno", approvedQuantity: 1 }],
          },
          "p-member-ieee"
        )
      ).rejects.toThrow("Unauthorized: active operator access required");
    });

    it("verifies OPERATOR and SUPERADMIN roles are recognized as operators", async () => {
      // p-board-logistics is OPERATOR
      const operatorUpdate = await boardLoanService.updateDueDate(
        "LN-2026-0089",
        "2026-11-15",
        "p-board-logistics"
      );
      expect(operatorUpdate.dueDate).toBe("2026-11-15");

      // p-superadmin-chair is SUPERADMIN
      const superadminUpdate = await boardLoanService.updateDueDate(
        "LN-2026-0089",
        "2026-11-20",
        "p-superadmin-chair"
      );
      expect(superadminUpdate.dueDate).toBe("2026-11-20");
    });
  });
});
