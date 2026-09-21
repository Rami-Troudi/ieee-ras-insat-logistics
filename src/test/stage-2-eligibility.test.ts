import { describe, it, expect } from "vitest";
import { evaluateItemEligibility } from "@/features/inventory/utils/eligibility";

describe("evaluateItemEligibility", () => {
  it("allows eligible member to borrow standard Class E dev boards", () => {
    const result = evaluateItemEligibility("E", "III", "ACTIVE", true, 5);
    expect(result.canBorrowOnline).toBe(true);
    expect(result.canRequest).toBe(true);
    expect(result.badgeType).toBe("SUCCESS");
  });

  it("blocks borrowing for RESTRICTED member due to strikes", () => {
    const result = evaluateItemEligibility("E", "III", "RESTRICTED", true, 5);
    expect(result.canBorrowOnline).toBe(false);
    expect(result.canRequest).toBe(false);
    expect(result.badgeType).toBe("RESTRICTED");
    expect(result.noticeTitle).toBe("Borrowing Suspended");
  });

  it("blocks borrowing for unverified/unprocessed member", () => {
    const result = evaluateItemEligibility("E", "I", "ACTIVE", false, 5);
    expect(result.canBorrowOnline).toBe(false);
    expect(result.canRequest).toBe(false);
    expect(result.badgeType).toBe("WARNING");
    expect(result.noticeTitle).toBe("Account Pending Verification");
  });

  it("requires Direct Board Request for Class B master instruments", () => {
    const result = evaluateItemEligibility("B", "III", "ACTIVE", true, 2);
    expect(result.canBorrowOnline).toBe(false);
    expect(result.canRequest).toBe(false);
    expect(result.badgeType).toBe("INFO");
    expect(result.noticeTitle).toBe("Direct Board Request Required");
  });

  it("requires Direct Board Scheduling for Class D capital equipment", () => {
    const result = evaluateItemEligibility("D", "V", "ACTIVE", true, 1);
    expect(result.canBorrowOnline).toBe(false);
    expect(result.canRequest).toBe(false);
    expect(result.badgeType).toBe("INFO");
    expect(result.noticeTitle).toBe("Direct Board Scheduling Required");
  });

  it("flags Class F equipment with Level V+ supervision requirement", () => {
    const result = evaluateItemEligibility("F", "III", "ACTIVE", true, 2);
    expect(result.canBorrowOnline).toBe(true);
    expect(result.canRequest).toBe(true);
    expect(result.badgeType).toBe("WARNING");
    expect(result.noticeTitle).toContain("Class F");
  });

  it("flags Class G equipment with Level VI custodian sign-off when clearance < VI", () => {
    const result = evaluateItemEligibility("G", "III", "ACTIVE", true, 4);
    expect(result.canBorrowOnline).toBe(true);
    expect(result.canRequest).toBe(true);
    expect(result.badgeType).toBe("WARNING");
    expect(result.noticeTitle).toContain("Class G");
  });
});
