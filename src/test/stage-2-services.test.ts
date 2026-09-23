import { describe, it, expect, beforeEach } from "vitest";
import { mockRequestService } from "@/services/mock/requests";
import { mockLoanService } from "@/services/mock/loans";
import { mockProjectService } from "@/services/mock/profile";
import { authService, boardLoanService } from "@/services";
import { mockDb } from "@/mocks/db";
import { UserPersona } from "@/types";

describe("Stage 2 Domain Services Workflow", () => {
  beforeEach(() => {
    mockDb.resetToDefault();
  });

  it("registers a provisional member via authService and updates session", async () => {
    let notifiedPersona: UserPersona | null = null;
    const unsubscribe = authService.subscribeSession((p) => {
      notifiedPersona = p;
    });

    const result = await authService.registerMember({
      name: "Test Candidate",
      email: "candidate@insat.u-carthage.tn",
      phone: "+216 55 123 456",
      membership: "EXTERNAL",
    });

    expect(result.persona.name).toBe("Test Candidate");
    expect(result.persona.role).toBe("MEMBER");
    expect(result.persona.clearance).toBe("I");
    expect(result.persona.affiliation).toBe("EXTERNAL");
    expect(result.persona.isProcessed).toBe(false);
    expect(result.persona.status).toBe("ACTIVE");

    expect(result.profile.phone).toBe("+216 55 123 456");

    // Check that session subscribers were notified
    expect(notifiedPersona).not.toBeNull();
    const persona: UserPersona = notifiedPersona!;
    expect(persona.name).toBe("Test Candidate");

    unsubscribe();
  });

  it("submits a new borrow request with multi-dimensional states and line quantities", async () => {
    const created = await mockRequestService.createRequest("p-member-ieee", {
      note: "Quadrotor test bench calibration and motor speed profiling",
      expectedReturnDate: "2026-10-15",
      items: [{ itemId: "item-stm32-f4", quantity: 1 }],
    });

    expect(created.id).toMatch(/^REQ-/);
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
      note: "Temporary sensor breadboard check",
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

  it("allows operator to directly update loan due date", async () => {
    // LN-2026-0089 is ACTIVE
    const updated = await boardLoanService.updateDueDate(
      "LN-2026-0089",
      "2026-10-25",
      "p-board-logistics"
    );

    expect(updated.dueDate).toBe("2026-10-25");
  });

  it("enforces operator-managed return flow and updates loan returned quantities", async () => {
    // LN-2026-0089 has 2 motor drivers
    const loan = await mockLoanService.getLoan("LN-2026-0089");
    const driverLine = loan!.items.find((i) => i.itemId === "item-pololu-driver")!;

    // Operator confirms physical return of 1 unit
    const returned = await boardLoanService.confirmReturn(
      {
        loanId: "LN-2026-0089",
        items: [
          {
            lineItemId: driverLine.id,
            returnedQuantity: 1,
            condition: "GOOD",
          },
        ],
      },
      "p-board-logistics"
    );

    const updatedLine = returned.items.find((i) => i.id === driverLine.id)!;
    expect(updatedLine.returnedQuantity).toBe(1);
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
