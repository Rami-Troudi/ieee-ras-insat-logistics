import { describe, it, expect, beforeEach } from "vitest";
import { mockDb } from "@/mocks/db";
import {
  boardRequestService,
  boardLoanService,
  boardInventoryService,
  boardAuditService,
  boardDisciplineService,
  boardUserService,
  boardExportService,
  boardProjectService,
  boardInsightsService,
} from "@/services";
import { InventoryAuditItem } from "@/types";

describe("Stage 3 Board & Superadmin Domain Operations", () => {
  beforeEach(() => {
    mockDb.reset();
  });

  describe("Cross-Role Borrow Lifecycle & Inventory Stock Reservation", () => {
    it("executes full lifecycle: Request Review -> 48h Allocation -> Stock Reduction -> Handover -> Active Loan", async () => {
      // 1. Check initial inventory stock for Arduino Uno (item-arduino-uno)
      const initialItem = await boardInventoryService.getItemById("item-arduino-uno");
      expect(initialItem).not.toBeNull();
      const initialAvailable = initialItem!.availableQuantity;
      const initialAllocated = initialItem!.allocatedQuantity;

      // 2. Locate pending request (REQ-2026-0155)
      const pendingReq = await boardRequestService.getRequestById("REQ-2026-0155");
      expect(pendingReq).not.toBeNull();
      expect(pendingReq!.decisionStatus).toBe("PENDING");

      // 3. Board reviews and approves request
      const approvedReq = await boardRequestService.reviewRequest(
        {
          requestId: "REQ-2026-0155",
          lines: [
            {
              lineId: "rline-waiting-uno",
              approvedQuantity: 1,
            },
          ],
          decisionNotes: "Approved for IEEE INSAT prototyping",
        },
        "p-board-logistics",
        "OPERATOR",
        "V"
      );

      expect(approvedReq.decisionStatus).toBe("APPROVED");
      const approvedLine = approvedReq.items.find((i) => i.id === "rline-waiting-uno");
      expect(approvedLine!.approvedQuantity).toBe(1);

      // 4. Verify inventory stock was reserved/allocated (48h window)
      const postAllocItem = await boardInventoryService.getItemById("item-arduino-uno");
      expect(postAllocItem!.availableQuantity).toBe(initialAvailable - 1);
      expect(postAllocItem!.allocatedQuantity).toBe(initialAllocated + 1);

      // 5. Confirm physical handover to create active loan
      const { request: handedOverReq, loanId } = await boardRequestService.confirmHandover(
        {
          requestId: "REQ-2026-0155",
          lineHandoverDetails: [
            {
              lineId: "rline-waiting-uno",
            },
          ],
          notes: "Hardware inspected and handed over",
        },
        "p-board-logistics",
        "OPERATOR"
      );

      expect(handedOverReq.handoverStatus).toBe("HANDED_OVER");
      expect(handedOverReq.lifecycleStatus).toBe("CLOSED");

      // 6. Verify loan record exists
      const createdLoan = await boardLoanService.getLoanById(loanId);
      expect(createdLoan).not.toBeNull();
      expect(createdLoan!.lifecycleStatus).toBe("ACTIVE");
      const loanItem = createdLoan!.items.find((i) => i.itemId === "item-arduino-uno");
      expect(loanItem!.borrowedQuantity).toBe(1);

      // 7. Verify inventory state: allocated released, borrowed incremented
      const postHandoverItem = await boardInventoryService.getItemById("item-arduino-uno");
      expect(postHandoverItem!.allocatedQuantity).toBe(initialAllocated);
      expect(postHandoverItem!.borrowedQuantity).toBe(initialItem!.borrowedQuantity + 1);
    });

    it("restores inventory stock on return inspection with GOOD condition", async () => {
      // Find active loan LN-2026-0089 (STM32 & Pololu)
      const loan = await boardLoanService.getLoanById("LN-2026-0089");
      expect(loan).not.toBeNull();
      expect(loan!.lifecycleStatus).toBe("ACTIVE");

      const initialInv = await boardInventoryService.getItemById("item-stm32-f4");
      const initialAvailable = initialInv!.availableQuantity;
      const initialBorrowed = initialInv!.borrowedQuantity;

      // Confirm return with condition GOOD
      const updatedLoan = await boardLoanService.confirmReturn(
        {
          loanId: "LN-2026-0089",
          items: [
            {
              lineItemId: loan!.items[0].id,
              returnedQuantity: 1,
              condition: "GOOD",
              notes: "Returned clean and fully functional",
            },
            {
              lineItemId: loan!.items[1].id,
              returnedQuantity: 2,
              condition: "GOOD",
              notes: "Drivers in working order",
            },
          ],
          inspectionNotes: "Physical intake verified at cabinet A",
        },
        "p-board-logistics",
        "OPERATOR"
      );

      expect(updatedLoan.lifecycleStatus).toBe("CLOSED");
      expect(updatedLoan.returnStatus).toBe("COMPLETE");

      // Stock should be restored
      const postReturnInv = await boardInventoryService.getItemById("item-stm32-f4");
      expect(postReturnInv!.availableQuantity).toBe(initialAvailable + 1);
      expect(postReturnInv!.borrowedQuantity).toBe(initialBorrowed - 1);
    });

    it("records DAMAGED inventory without automatic incident or strike recommendation", async () => {
      const loan = await boardLoanService.getLoanById("LN-2026-0072");
      expect(loan).not.toBeNull();

      const updatedLoan = await boardLoanService.confirmReturn(
        {
          loanId: "LN-2026-0072",
          items: [
            {
              lineItemId: loan!.items[0].id,
              returnedQuantity: 1,
              condition: "DAMAGED",
              notes: "Swollen cell and ruptured insulation",
            },
          ],
          inspectionNotes: "Hardware damaged during testing",
        },
        "p-board-logistics",
        "OPERATOR"
      );

      expect(updatedLoan.lifecycleStatus).toBe("CLOSED");

      // Damage is an inventory condition; escalation is a separate explicit operator choice.
      const incidents = await boardDisciplineService.getIncidents({ status: "OPEN" });
      const damageIncident = incidents.find(
        (incident) => incident.relatedLoanId === "LN-2026-0072"
      );
      expect(damageIncident).toBeUndefined();

      const recs = await boardDisciplineService.getRecommendations();
      const damageRec = recs.find(
        (recommendation) => recommendation.sourceEntityId === "LN-2026-0072"
      );
      expect(damageRec).toBeUndefined();
    });

    it("creates a damage incident only after explicit operator escalation", async () => {
      const loan = await boardLoanService.getLoanById("LN-2026-0072");
      expect(loan).not.toBeNull();

      await boardLoanService.confirmReturn(
        {
          loanId: loan!.id,
          items: [
            {
              lineItemId: loan!.items[0].id,
              returnedQuantity: 1,
              condition: "DAMAGED",
              notes: "Operator requested incident review",
              escalateIncident: true,
            },
          ],
        },
        "p-board-logistics"
      );

      const incidents = await boardDisciplineService.getIncidents({ status: "OPEN" });
      expect(incidents.some((incident) => incident.relatedLoanId === loan!.id)).toBe(true);
      expect(
        (await boardDisciplineService.getRecommendations()).some(
          (recommendation) => recommendation.sourceEntityId === loan!.id
        )
      ).toBe(false);
    });
  });

  describe("Role-Based Security & Superadmin Gating", () => {
    it("rejects Class G approval by Board (Level V) and allows Superadmin (Level VI)", async () => {
      // Mock db draft with a Class G item request
      let classGReqId = "";
      mockDb.mutate((draft) => {
        classGReqId = "req-class-g-test";
        draft.requests.push({
          id: classGReqId,
          userId: "p-member-ieee",
          userName: "Rami Troudi",
          userEmail: "rami.ieee@insat.u-carthage.tn",
          userClearance: "III",
          note: "High precision oscilloscope benchmarks",
          expectedReturnDate: "2026-10-30",
          decisionStatus: "PENDING",
          handoverStatus: "WAITING",
          lifecycleStatus: "ACTIVE",
          status: "PENDING",
          items: [
            {
              id: "line-g-01",
              itemId: "item-keysight-dso", // Class G Oscilloscope
              itemName: "Keysight InfiniiVision DSOX1204G 4-Channel 200MHz Oscilloscope",
              category: "High Value Electronics",
              equipmentClass: "G",
              requestedQuantity: 1,
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

      // 1. Board Member (Level V) attempts to approve -> Must throw Error
      await expect(
        boardRequestService.reviewRequest(
          {
            requestId: classGReqId,
            lines: [{ lineId: "line-g-01", approvedQuantity: 1 }],
          },
          "p-board-logistics",
          "OPERATOR",
          "V"
        )
      ).rejects.toThrow("Only Class C and E requests can be approved online");

      // 2. Superadmin (Level VI) attempts to approve online -> Must also throw Error
      await expect(
        boardRequestService.reviewRequest(
          {
            requestId: classGReqId,
            lines: [{ lineId: "line-g-01", approvedQuantity: 1 }],
            decisionNotes: "Approved under Superadmin chairman authorization",
          },
          "p-superadmin-chair",
          "SUPERADMIN",
          "VI"
        )
      ).rejects.toThrow("Only Class C and E requests can be approved online");
    });

    it("enforces Superadmin-only gate for Manual Level IV clearance grant", async () => {
      // 1. Board Member attempts to grant Manual Level IV -> Throws
      await expect(
        boardUserService.updateClearance(
          {
            userId: "p-member-unprocessed",
            newClearance: "IV",
            source: "MANUAL_LEVEL_IV",
            reason: "Attempted board grant",
          },
          "p-board-logistics",
          "OPERATOR",
          "V"
        )
      ).rejects.toThrow(/Superadmin/i);

      // 2. Superadmin grants Manual Level IV -> Succeeds
      const updatedUser = await boardUserService.updateClearance(
        {
          userId: "p-member-unprocessed",
          newClearance: "IV",
          source: "MANUAL_LEVEL_IV",
          reason: "Approved Eurobot lead exceptional clearance",
        },
        "p-superadmin-chair",
        "SUPERADMIN",
        "VI"
      );

      expect(updatedUser.clearance).toBe("IV");
      expect(updatedUser.clearanceSource).toBe("MANUAL_LEVEL_IV");
    });

    it("enforces Superadmin-only gate for Strike 5 (Permanent Blacklist)", async () => {
      // 1. Board member attempts Strike 5 -> Throws
      await expect(
        boardDisciplineService.issueStrike(
          {
            userId: "p-member-restricted",
            level: 5,
            reason: "Severe unauthorized equipment tampering",
          },
          "p-board-logistics",
          "OPERATOR"
        )
      ).rejects.toThrow(/Superadmin/i);

      // 2. Superadmin issues Strike 5 -> User permanently blacklisted
      const strike = await boardDisciplineService.issueStrike(
        {
          userId: "p-member-restricted",
          level: 5,
          reason: "Severe unauthorized equipment tampering confirmed by council",
        },
        "p-superadmin-chair",
        "SUPERADMIN"
      );

      expect(strike.level).toBe(5);

      const targetUser = await boardUserService.getUserById("p-member-restricted");
      expect(targetUser!.status).toBe("BLACKLISTED");
      expect(targetUser!.isBanned).toBe(true);
    });

    it("enforces Superadmin-only gate for sensitive CSV dataset exports", async () => {
      // 1. Board member attempts to export users -> Throws
      await expect(boardExportService.exportCsv("USERS", "p-board-logistics")).rejects.toThrow(
        /Superadmin/i
      );

      // 2. Board member can export inventory -> Succeeds
      const invExport = await boardExportService.exportCsv("INVENTORY", "p-board-logistics");
      expect(invExport.csvContent).toContain("Item ID,Name,Category,Equipment Class");
      expect(invExport.rowCount).toBeGreaterThan(0);

      // 3. Superadmin can export sensitive users dataset
      const userExport = await boardExportService.exportCsv("USERS", "p-superadmin-chair");
      expect(userExport.csvContent).toContain("User ID,Name,Email,Role,Clearance");
      expect(userExport.rowCount).toBeGreaterThan(0);
    });
  });

  describe("Physical Inventory Audits & Discrepancy Reconciliation", () => {
    it("runs audit flow: snapshot -> record counts -> reconcile discrepancy -> complete audit", async () => {
      // 1. Start new inventory audit
      const audit = await boardAuditService.startAudit(
        {
          title: "Fall 2026 Midterm Cabinet Audit",
          notes: "Verification of microcontrollers and sensors",
        },
        "p-board-logistics",
        "OPERATOR"
      );

      expect(audit.status).toBe("IN_PROGRESS");
      expect(audit.items.length).toBeGreaterThan(0);

      const firstItem = audit.items[0];
      const initialInventoryItem = await boardInventoryService.getItemById(firstItem.itemId);
      expect(firstItem.expectedSnapshotQuantity).toBe(
        initialInventoryItem!.availableQuantity +
          initialInventoryItem!.allocatedQuantity +
          initialInventoryItem!.damagedQuantity +
          initialInventoryItem!.maintenanceQuantity
      );

      // 2. Record physical counts with a deliberate discrepancy (-1 missing)
      const recorded = await boardAuditService.recordCounts(
        {
          auditId: audit.id,
          counts: [
            {
              itemId: firstItem.itemId,
              physicalCount: firstItem.expectedSnapshotQuantity - 1,
              notes: "One unit missing from bin",
            },
          ],
        },
        "p-board-logistics",
        "OPERATOR"
      );

      const auditItem = recorded.items.find(
        (i: InventoryAuditItem) => i.itemId === firstItem.itemId
      );
      expect(auditItem!.status).toBe("DISCREPANCY");
      expect(auditItem!.discrepancy).toBe(-1);

      // 3. Attempting to complete audit while discrepancy exists must throw
      await expect(
        boardAuditService.completeAudit(audit.id, "p-board-logistics", "OPERATOR")
      ).rejects.toThrow(/Count and reconcile/i);

      // 4. Reconcile discrepancy
      const reconciled = await boardAuditService.reconcileItem(
        {
          auditId: audit.id,
          itemId: firstItem.itemId,
          reason: "Confirmed lost during competition testing",
        },
        "p-board-logistics",
        "OPERATOR"
      );

      const reconciledItem = reconciled.items.find(
        (i: InventoryAuditItem) => i.itemId === firstItem.itemId
      );
      expect(reconciledItem!.status).toBe("RECONCILED");
      expect((await boardInventoryService.getItemById(firstItem.itemId))!.totalQuantity).toBe(
        initialInventoryItem!.totalQuantity - 1
      );
      const correctionEvent = (
        await boardInventoryService.getMovementHistory(firstItem.itemId)
      ).find((event) => event.id === reconciledItem!.resolutionEventId);
      expect(correctionEvent?.quantity).toBe(-1);
      expect(correctionEvent?.reason).toContain("Confirmed lost");

      // 5. Match remaining items so all are reconciled/matched
      const matchAllPayload = audit.items.map((i: InventoryAuditItem) => ({
        itemId: i.itemId,
        physicalCount:
          i.itemId === firstItem.itemId
            ? firstItem.expectedSnapshotQuantity - 1
            : i.expectedSnapshotQuantity,
      }));

      await boardAuditService.recordCounts(
        {
          auditId: audit.id,
          counts: matchAllPayload,
        },
        "p-board-logistics",
        "OPERATOR"
      );

      // 6. Complete audit
      const completed = await boardAuditService.completeAudit(
        audit.id,
        "p-board-logistics",
        "OPERATOR"
      );
      expect(completed.status).toBe("RECONCILED");
      expect(completed.completedBy).toBe("p-board-logistics");
    });

    it("reconciles a positive physical discrepancy with an audited signed addition", async () => {
      const audit = await boardAuditService.startAudit(
        { title: "Positive count check", categoryFilter: "Consumables" },
        "p-board-logistics",
        "OPERATOR"
      );
      const target = audit.items.find((item) => item.itemId === "item-glue-sticks")!;
      const before = await boardInventoryService.getItemById(target.itemId);
      await boardAuditService.recordCounts(
        {
          auditId: audit.id,
          counts: [{ itemId: target.itemId, physicalCount: target.expectedSnapshotQuantity + 2 }],
        },
        "p-board-logistics",
        "OPERATOR"
      );

      const corrected = await boardAuditService.reconcileItem(
        {
          auditId: audit.id,
          itemId: target.itemId,
          reason: "Two additional units physically verified",
        },
        "p-board-logistics",
        "OPERATOR"
      );
      const line = corrected.items.find((item) => item.itemId === target.itemId)!;
      const after = await boardInventoryService.getItemById(target.itemId);
      const event = (await boardInventoryService.getMovementHistory(target.itemId)).find(
        (candidate) => candidate.id === line.resolutionEventId
      );

      expect(after!.totalQuantity).toBe(before!.totalQuantity + 2);
      expect(event?.quantity).toBe(2);
      expect(event?.reason).toContain("Two additional units");
      expect(
        mockDb
          .getSnapshot()
          .auditEvents.some((entry) => entry.action === "INVENTORY_PHYSICAL_CORRECTION")
      ).toBe(true);
    });
  });

  describe("Actor identity authorization", () => {
    it("does not accept a caller-supplied operator role for inventory writes", async () => {
      await expect(
        boardInventoryService.mutateStock(
          {
            itemId: "item-glue-sticks",
            type: "ADD",
            quantity: 1,
            reason: "spoofed actor test",
          },
          "p-member-ieee",
          "OPERATOR"
        )
      ).rejects.toThrow(/active operator/i);
    });

    it("requires superadmin authorization for retirement and keeps asset count equal to owned total", async () => {
      const item = await boardInventoryService.getItemById("item-stm32-f4");
      const asset = item!.assets!.find((entry) => entry.state === "AVAILABLE")!;
      const payload = {
        itemId: item!.id,
        type: "RETIRE" as const,
        quantity: 1,
        reason: "Asset reached end of useful life",
        assetIds: [asset.id],
      };

      await expect(
        boardInventoryService.mutateStock(payload, "p-board-logistics", "SUPERADMIN")
      ).rejects.toThrow(/superadmin access/i);
      await boardInventoryService.mutateStock(payload, "p-superadmin-chair", "MEMBER");

      const retired = await boardInventoryService.getItemById(item!.id);
      expect(retired!.assets).toHaveLength(retired!.totalQuantity);
      expect(retired!.assets!.some((entry) => entry.id === asset.id)).toBe(false);
    });

    it("does not allow project membership or a forged role to change member identity", async () => {
      const before = mockDb.getSnapshot().userProfiles["p-member-ieee"];
      await expect(
        boardProjectService.assignMember(
          "proj-eurobot-2027",
          "p-member-ieee",
          "p-member-ieee",
          "OPERATOR"
        )
      ).rejects.toThrow(/active operator/i);

      await boardProjectService.assignMember(
        "proj-eurobot-2027",
        "p-member-ieee",
        "p-board-logistics",
        "OPERATOR"
      );
      const after = mockDb.getSnapshot().userProfiles["p-member-ieee"];
      expect(after.role).toBe(before.role);
      expect(after.affiliation).toBe(before.affiliation);
      expect(after.clearance).toBe(before.clearance);
    });

    it("requires a real superadmin for Strike 5 even when the caller claims that role", async () => {
      await expect(
        boardDisciplineService.issueStrike(
          { userId: "p-member-ieee", level: 5, reason: "spoofed authorization test" },
          "p-board-logistics",
          "SUPERADMIN"
        )
      ).rejects.toThrow(/superadmin access/i);
    });
  });

  describe("Derived analytics and current periods", () => {
    it("uses calendar-month request counts and omits averages when there is no loan data", async () => {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const expiredAt = new Date(monthStart.getTime() - 1).toISOString();
      mockDb.mutate((draft) => {
        draft.loans = [];
        draft.requests.forEach((request) => {
          request.createdAt = expiredAt;
        });
        draft.requests[0].createdAt = monthStart.toISOString();
        draft.strikes = [
          {
            id: "strike-expired-analytics-test",
            userId: "p-member-ieee",
            userName: "Rami Troudi",
            level: 1,
            status: "ACTIVE",
            reason: "Expired strike used to check derived analytics",
            issuedBy: "p-board-logistics",
            issuedByName: "Operator",
            issuedAt: expiredAt,
            expiresAt: expiredAt,
          },
        ];
        draft.userProfiles["p-member-ieee"].status = "RESTRICTED";
      });

      const insights = await boardInsightsService.getInsights();
      const profile = await boardUserService.getUserById("p-member-ieee");
      expect(insights.borrowing.requestsThisMonth).toBe(1);
      expect(insights.borrowing.averageDurationDays).toBeNull();
      expect(insights.discipline.activeStrikesByLevel[1]).toBe(0);
      expect(profile?.strikesCount).toBe(0);
      expect(profile?.status).toBe("ACTIVE");
    });

    it("rebuilds a stale semester configuration from the current date before issuing a strike", async () => {
      mockDb.mutate((draft) => {
        draft.semesters = [
          {
            id: "stale-semester",
            name: "Spring 2024",
            startDate: "2024-02-01T00:00:00.000Z",
            endDate: "2024-08-31T23:59:59.999Z",
            isCurrent: true,
          },
        ];
      });

      const strike = await boardDisciplineService.issueStrike(
        { userId: "p-member-ieee", level: 1, reason: "Current semester lifecycle check" },
        "p-board-logistics",
        "MEMBER"
      );
      const currentSemester = mockDb.getSnapshot().semesters.find((semester) => semester.isCurrent);

      expect(currentSemester).toBeDefined();
      expect(strike.expiresAt).toBe(currentSemester!.endDate);
      expect(Date.parse(strike.expiresAt!)).toBeGreaterThan(Date.now());
    });
  });
});
