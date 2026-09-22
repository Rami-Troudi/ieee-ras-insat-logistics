import { describe, it, expect, beforeEach } from "vitest";
import { mockRequestService } from "@/services/mock/requests";
import { mockLoanService } from "@/services/mock/loans";
import { mockProjectService } from "@/services/mock/profile";
import { mockDb } from "@/mocks/db";

describe("Stage 2 Domain Services Workflow", () => {
  beforeEach(() => {
    mockDb.resetToDefault();
  });

  it("submits a new borrow request with multi-dimensional states and line quantities", async () => {
    const created = await mockRequestService.createRequest("p-member-ieee", {
      purpose: "Quadrotor test bench calibration and motor speed profiling",
      expectedReturnDate: "2026-10-15",
      items: [{ itemId: "item-stm32-f4", quantity: 1 }],
    });

    expect(created.id).toMatch(/^REQ-2026-/);
    expect(created.decisionStatus).toBe("PENDING");
    expect(created.handoverStatus).toBe("WAITING");
    expect(created.lifecycleStatus).toBe("ACTIVE");
    expect(created.status).toBe("PENDING");

    // Line item future-proof fields
    expect(created.items.length).toBe(1);
    expect(created.items[0].requestedQuantity).toBe(1);
    expect(created.items[0].approvedQuantity).toBe(0);
    expect(created.items[0].handedOverQuantity).toBe(0);
    expect(created.items[0].returnedQuantity).toBe(0);
    expect(created.items[0].damagedQuantity).toBe(0);
    expect(created.items[0].lostQuantity).toBe(0);
  });

  it("enforces ownership check on request detail", async () => {
    // REQ-2026-0142 belongs to p-member-ieee
    const allowed = await mockRequestService.getRequest("REQ-2026-0142", "p-member-ieee");
    expect(allowed).not.toBeNull();

    await expect(
      mockRequestService.getRequest("REQ-2026-0142", "p-member-restricted")
    ).rejects.toThrow("Unauthorized");
  });

  it("allows member to cancel PENDING request with reason", async () => {
    const created = await mockRequestService.createRequest("p-member-ieee", {
      purpose: "Temporary sensor breadboard check",
      expectedReturnDate: "2026-10-10",
      items: [{ itemId: "item-arduino-uno", quantity: 1 }],
    });

    const cancelled = await mockRequestService.cancelRequest(
      created.id,
      "p-member-ieee",
      "No longer needed"
    );

    expect(cancelled.status).toBe("CANCELLED");
    expect(cancelled.lifecycleStatus).toBe("CANCELLED");
    expect(cancelled.rejectionReason).toBe("No longer needed");
  });

  it("disallows member from cancelling non-pending request", async () => {
    // REQ-2026-0142 is PARTIALLY_APPROVED
    await expect(
      mockRequestService.cancelRequest("REQ-2026-0142", "p-member-ieee")
    ).rejects.toThrow("Only PENDING requests can be cancelled by members");
  });

  it("enforces ownership check on loan detail", async () => {
    // LN-2026-0089 belongs to p-member-ieee
    const allowed = await mockLoanService.getLoan("LN-2026-0089", "p-member-ieee");
    expect(allowed).not.toBeNull();

    await expect(mockLoanService.getLoan("LN-2026-0089", "p-member-restricted")).rejects.toThrow(
      "Unauthorized"
    );
  });

  it("submits extension request and preserves official due date", async () => {
    // LN-2026-0089 is ACTIVE
    const initial = await mockLoanService.getLoan("LN-2026-0089");
    const originalDueDate = initial!.dueDate;

    const updated = await mockLoanService.requestExtension(
      {
        loanId: "LN-2026-0089",
        proposedReturnDate: "2026-10-25",
        reason: "Need additional time for motor encoder tuning",
      },
      "p-member-ieee"
    );

    expect(updated.extensionStatus).toBe("PENDING");
    expect(updated.dueDate).toBe(originalDueDate); // Official due date preserved!
    expect(updated.extensionRequests[0].proposedReturnDate).toBe("2026-10-25");
  });

  it("enforces strict returnable quantity formula and rejects return exceeding outstanding minus pending", async () => {
    // LN-2026-0089 has 2 motor drivers
    const loan = await mockLoanService.getLoan("LN-2026-0089");
    const driverLine = loan!.items.find((i) => i.itemId === "item-pololu-driver")!;

    // Step 1: Request return of 1 unit
    await mockLoanService.requestReturn(
      {
        loanId: "LN-2026-0089",
        items: [
          {
            lineItemId: driverLine.id,
            quantity: 1,
            conditionReport: "Good condition",
          },
        ],
      },
      "p-member-ieee"
    );

    // Step 2: Attempt to return 2 units when only 1 is remaining returnable (2 borrowed - 0 returned - 1 pending = 1)
    await expect(
      mockLoanService.requestReturn(
        {
          loanId: "LN-2026-0089",
          items: [
            {
              lineItemId: driverLine.id,
              quantity: 2, // Exceeds remaining returnable!
              conditionReport: "Good",
            },
          ],
        },
        "p-member-ieee"
      )
    ).rejects.toThrow(/already pending confirmation/);
  });

  it("scopes listMine projects strictly to assigned member", async () => {
    // p-member-ieee belongs only to proj-eurobot-2027
    const ieeeProjects = await mockProjectService.listMine("p-member-ieee");
    expect(ieeeProjects.length).toBe(1);
    expect(ieeeProjects[0].id).toBe("proj-eurobot-2027");

    // p-member-unprocessed belongs to no projects
    const unprocProjects = await mockProjectService.listMine("p-member-unprocessed");
    expect(unprocProjects.length).toBe(0);
  });
});
