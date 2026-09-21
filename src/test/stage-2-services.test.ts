import { describe, it, expect, beforeEach } from "vitest";
import { mockRequestService } from "@/services/mock/requests";
import { mockLoanService } from "@/services/mock/loans";
import { mockDb } from "@/mocks/db";

describe("Stage 2 Domain Services Workflow", () => {
  beforeEach(() => {
    mockDb.resetToDefault();
  });

  it("submits a new borrow request with items and adds timeline entry", async () => {
    const created = await mockRequestService.createRequest("p-member-ieee", {
      purpose: "Quadrotor test bench calibration and motor speed profiling",
      expectedReturnDate: "2026-10-15",
      items: [{ itemId: "item-stm32-f4", quantity: 1 }],
    });

    expect(created.id).toMatch(/^REQ-2026-/);
    expect(created.status).toBe("PENDING");
    expect(created.items.length).toBe(1);
    expect(created.items[0].requestedQuantity).toBe(1);
    expect(created.timeline.length).toBeGreaterThan(0);
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
    expect(cancelled.rejectionReason).toBe("No longer needed");
  });

  it("disallows member from cancelling non-pending request", async () => {
    // REQ-2026-0142 is PARTIALLY_APPROVED
    await expect(
      mockRequestService.cancelRequest("REQ-2026-0142", "p-member-ieee")
    ).rejects.toThrow("Only PENDING requests can be cancelled by members");
  });

  it("submits extension request and marks loan extensionStatus as PENDING", async () => {
    // LN-2026-0089 is ACTIVE with extensionStatus NONE
    const updated = await mockLoanService.requestExtension(
      {
        loanId: "LN-2026-0089",
        proposedReturnDate: "2026-10-25",
        reason: "Need additional time for motor encoder tuning",
      },
      "p-member-ieee"
    );

    expect(updated.extensionStatus).toBe("PENDING");
    expect(updated.extensionRequests.length).toBe(1);
    expect(updated.extensionRequests[0].proposedReturnDate).toBe("2026-10-25");
  });

  it("submits partial return declaration without immediately closing the loan", async () => {
    // LN-2026-0089 has 2 motor drivers and 1 STM32
    const loan = await mockLoanService.getLoan("LN-2026-0089");
    expect(loan).not.toBeNull();

    const line = loan!.items.find((i) => i.itemId === "item-pololu-driver")!;

    const returned = await mockLoanService.requestReturn(
      {
        loanId: "LN-2026-0089",
        items: [
          {
            lineItemId: line.id,
            quantity: 1, // return 1 of 2
            conditionReport: "Good condition",
          },
        ],
        memberNotes: "Returning 1 driver, keeping second driver for bench tests",
      },
      "p-member-ieee"
    );

    expect(returned.status).toBe("RETURN_REQUESTED");
    expect(returned.returnRequests.length).toBe(1);
    expect(returned.returnRequests[0].items[0].quantity).toBe(1);
  });
});
