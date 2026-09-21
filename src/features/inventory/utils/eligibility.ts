import { EquipmentClass, ClearanceLevel, UserStatus } from "@/types";

export interface EligibilityResult {
  canBorrowOnline: boolean;
  canRequest: boolean;
  reason?: string;
  badgeType: "SUCCESS" | "WARNING" | "RESTRICTED" | "INFO";
  noticeTitle?: string;
  noticeMessage?: string;
}

export function evaluateItemEligibility(
  equipmentClass: EquipmentClass,
  userClearance: ClearanceLevel,
  userStatus: UserStatus,
  isProcessed: boolean,
  availableQuantity: number
): EligibilityResult {
  if (userStatus === "BANNED" || userStatus === "BLACKLISTED") {
    return {
      canBorrowOnline: false,
      canRequest: false,
      badgeType: "RESTRICTED",
      reason: "Account suspended or blacklisted. Equipment borrowing is disabled.",
      noticeTitle: "Account Restricted",
      noticeMessage:
        "You are currently prohibited from borrowing any equipment due to active disciplinary restrictions.",
    };
  }

  if (userStatus === "RESTRICTED") {
    return {
      canBorrowOnline: false,
      canRequest: false,
      badgeType: "RESTRICTED",
      reason: "Account has active borrowing restrictions (strike threshold reached).",
      noticeTitle: "Borrowing Suspended",
      noticeMessage:
        "Your borrowing privileges are temporarily suspended due to outstanding overdue strikes. Please return overdue equipment or contact the Logistics Board.",
    };
  }

  if (!isProcessed) {
    return {
      canBorrowOnline: false,
      canRequest: false,
      badgeType: "WARNING",
      reason: "Account affiliation is pending verification by Logistics Custodian.",
      noticeTitle: "Account Pending Verification",
      noticeMessage:
        "Your IEEE RAS affiliation has not yet been verified by the Logistics Board. Please visit the RAS desk to complete onboarding.",
    };
  }

  // Check Equipment Classes
  if (equipmentClass === "B") {
    return {
      canBorrowOnline: false,
      canRequest: false,
      badgeType: "INFO",
      reason: "Class B Master Instruments require a Direct Board Request.",
      noticeTitle: "Direct Board Request Required",
      noticeMessage:
        "Class B instruments (oscilloscopes, spectrum analyzers, high-precision bench gear) cannot be checked out online. Contact the Logistics Board directly for scheduled lab sessions.",
    };
  }

  if (equipmentClass === "D") {
    return {
      canBorrowOnline: false,
      canRequest: false,
      badgeType: "INFO",
      reason: "Class D Heavy Capital Resources require Direct Board Scheduling.",
      noticeTitle: "Direct Board Scheduling Required",
      noticeMessage:
        "Class D machinery (3D printers, CNC mill, laser cutters) cannot be checked out via online cart. Schedule your fabrication slot with the RAS Workshop Custodian.",
    };
  }

  if (availableQuantity <= 0) {
    return {
      canBorrowOnline: true,
      canRequest: false,
      badgeType: "WARNING",
      reason: "Currently out of stock. All units allocated or on loan.",
      noticeTitle: "Out of Stock",
      noticeMessage: "No available units are currently in the workshop inventory.",
    };
  }

  if (equipmentClass === "F") {
    return {
      canBorrowOnline: true,
      canRequest: true,
      badgeType: "WARNING",
      reason: "Class F Workshop Tool: Level V+ supervision required during usage.",
      noticeTitle: "Supervision Requirement (Class F)",
      noticeMessage:
        "Class F tools (soldering stations, power tools) require an active Level V+ supervisor present during utilization.",
    };
  }

  if (equipmentClass === "G") {
    const clearanceNumeric = clearanceToNumber(userClearance);
    if (clearanceNumeric < 6) {
      return {
        canBorrowOnline: true,
        canRequest: true,
        badgeType: "WARNING",
        reason: "Class G Hazardous Energy: Level VI Board Custodian sign-off required.",
        noticeTitle: "Direct Custodian Authorization (Class G)",
        noticeMessage:
          "High-discharge LiPo batteries require explicit Level VI Board sign-off and fireproof storage compliance upon handover.",
      };
    }
  }

  return {
    canBorrowOnline: true,
    canRequest: true,
    badgeType: "SUCCESS",
    reason: "Eligible for online borrow request.",
  };
}

function clearanceToNumber(c: ClearanceLevel): number {
  switch (c) {
    case "I":
      return 1;
    case "II":
      return 2;
    case "III":
      return 3;
    case "IV":
      return 4;
    case "V":
      return 5;
    case "VI":
      return 6;
    default:
      return 1;
  }
}
