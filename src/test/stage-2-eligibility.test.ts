import { describe, it, expect } from "vitest";
import { evaluateItemEligibility } from "@/features/inventory/utils/eligibility";

describe("evaluateItemEligibility Clearance & Policy Matrix", () => {
  it("allows eligible member (Level III) to borrow standard Class E dev boards", () => {
    const result = evaluateItemEligibility("E", "III", "ACTIVE", true, 5, 0);
    expect(result.canBorrowOnline).toBe(true);
    expect(result.canRequest).toBe(true);
    expect(result.badgeType).toBe("SUCCESS");
    expect(result.statusLabel).toBe("Eligible");
  });

  it("permits provisional/unprocessed members to submit borrow requests with guidance notice", () => {
    const result = evaluateItemEligibility("E", "III", "ACTIVE", false, 5, 0);
    expect(result.canBorrowOnline).toBe(true);
    expect(result.canRequest).toBe(true);
    expect(result.badgeType).toBe("INFO");
    expect(result.statusLabel).toBe("Provisional");
    expect(result.reason).toContain("Affiliation not yet verified");
  });

  it("permits Strike-2 members to request ordinary equipment with explicit Board review notice", () => {
    const result = evaluateItemEligibility("E", "III", "ACTIVE", true, 5, 2);
    expect(result.canBorrowOnline).toBe(true);
    expect(result.canRequest).toBe(true);
    expect(result.badgeType).toBe("WARNING");
    expect(result.statusLabel).toBe("Board Review Req.");
    expect(result.reason).toContain("explicit Board approval");
  });

  it("blocks Strike-2 members from requesting Heavy Equipment (Class F) or High Value (Class G)", () => {
    const resultF = evaluateItemEligibility("F", "III", "ACTIVE", true, 2, 2);
    expect(resultF.canBorrowOnline).toBe(false);
    expect(resultF.canRequest).toBe(false);
    expect(resultF.badgeType).toBe("RESTRICTED");

    const resultG = evaluateItemEligibility("G", "VI", "ACTIVE", true, 1, 2);
    expect(resultG.canBorrowOnline).toBe(false);
    expect(resultG.canRequest).toBe(false);
    expect(resultG.badgeType).toBe("RESTRICTED");
  });

  it("blocks borrowing for Strike 4 (semester suspension) and Strike 5 (blacklist)", () => {
    const strike4 = evaluateItemEligibility("E", "III", "ACTIVE", true, 5, 4);
    expect(strike4.canBorrowOnline).toBe(false);
    expect(strike4.badgeType).toBe("RESTRICTED");

    const strike5 = evaluateItemEligibility("A", "III", "BANNED", true, 10, 5);
    expect(strike5.canBorrowOnline).toBe(false);
    expect(strike5.badgeType).toBe("RESTRICTED");
  });

  it("handles Class B and Class D as Direct Board Request (off online cart)", () => {
    const resB = evaluateItemEligibility("B", "III", "ACTIVE", true, 20, 0);
    expect(resB.canBorrowOnline).toBe(false);
    expect(resB.canRequest).toBe(false);
    expect(resB.badgeType).toBe("INFO");
    expect(resB.statusLabel).toBe("Direct Board");

    const resD = evaluateItemEligibility("D", "V", "ACTIVE", true, 5, 0);
    expect(resD.canBorrowOnline).toBe(false);
    expect(resD.canRequest).toBe(false);
    expect(resD.badgeType).toBe("INFO");
    expect(resD.statusLabel).toBe("Direct Board");
  });

  it("enforces Level I restriction: only Class A and Class B allowed", () => {
    const classA = evaluateItemEligibility("A", "I", "ACTIVE", true, 10, 0);
    expect(classA.canBorrowOnline).toBe(true);

    const classC = evaluateItemEligibility("C", "I", "ACTIVE", true, 5, 0);
    expect(classC.canBorrowOnline).toBe(false);
    expect(classC.reason).toContain("Insufficient clearance");

    const classE = evaluateItemEligibility("E", "I", "ACTIVE", true, 5, 0);
    expect(classE.canBorrowOnline).toBe(false);
    expect(classE.reason).toContain("Insufficient clearance");
  });

  it("enforces Level II restriction: allowed A, B, C; blocks E", () => {
    const classC = evaluateItemEligibility("C", "II", "ACTIVE", true, 5, 0);
    expect(classC.canBorrowOnline).toBe(true);

    const classE = evaluateItemEligibility("E", "II", "ACTIVE", true, 5, 0);
    expect(classE.canBorrowOnline).toBe(false);
    expect(classE.reason).toContain("Insufficient clearance");
  });

  it("handles Level III with Class F: eligible under Level V+ supervision", () => {
    const result = evaluateItemEligibility("F", "III", "ACTIVE", true, 2, 0);
    expect(result.canBorrowOnline).toBe(true);
    expect(result.canRequest).toBe(true);
    expect(result.badgeType).toBe("INFO");
    expect(result.statusLabel).toBe("Supervised (Lv V+)");
    expect(result.reason).toContain("Level V+ supervision");
  });

  it("handles Class G: requires explicit Level VI authorization", () => {
    const level3 = evaluateItemEligibility("G", "III", "ACTIVE", true, 1, 0);
    expect(level3.canBorrowOnline).toBe(true);
    expect(level3.canRequest).toBe(true);
    expect(level3.badgeType).toBe("WARNING");
    expect(level3.statusLabel).toBe("Level VI Auth Req.");

    const level5 = evaluateItemEligibility("G", "V", "ACTIVE", true, 1, 0);
    expect(level5.canBorrowOnline).toBe(true);
    expect(level5.statusLabel).toBe("Level VI Auth Req.");

    const level6 = evaluateItemEligibility("G", "VI", "ACTIVE", true, 1, 0);
    expect(level6.canBorrowOnline).toBe(true);
    expect(level6.badgeType).toBe("SUCCESS");
  });
});
