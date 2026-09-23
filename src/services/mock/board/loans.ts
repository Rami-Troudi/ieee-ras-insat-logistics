import {
  IBoardLoanService,
  ConfirmReturnPayload,
  BoardLoanFilterParams,
} from "@/services/contracts/board/loans";
import { LoanRecord } from "@/types";
import { mockDb } from "@/mocks/db";
import { mockBoardAuditLogService } from "./audit-log";
import { requireOperatorInDraft } from "../authorization";
import { inventoryState, moveUnits, recordInventoryEvent } from "./inventoryState";

const makeId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

class MockBoardLoanService implements IBoardLoanService {
  async getLoans(filters?: BoardLoanFilterParams): Promise<LoanRecord[]> {
    let loans = mockDb.getSnapshot().loans;
    if (filters?.lifecycleStatus && filters.lifecycleStatus !== "ALL")
      loans = loans.filter((loan) => loan.lifecycleStatus === filters.lifecycleStatus);
    if (filters?.dueStatus && filters.dueStatus !== "ALL")
      loans = loans.filter((loan) => loan.dueStatus === filters.dueStatus);
    if (filters?.returnStatus && filters.returnStatus !== "ALL")
      loans = loans.filter((loan) => loan.returnStatus === filters.returnStatus);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      loans = loans.filter(
        (loan) =>
          loan.userName.toLowerCase().includes(q) ||
          loan.userEmail.toLowerCase().includes(q) ||
          loan.items.some((line) => line.itemName.toLowerCase().includes(q))
      );
    }
    return loans.sort((a, b) => Date.parse(b.borrowDate) - Date.parse(a.borrowDate));
  }

  async getLoanById(loanId: string): Promise<LoanRecord | null> {
    return mockDb.getSnapshot().loans.find((loan) => loan.id === loanId) ?? null;
  }

  async confirmReturn(payload: ConfirmReturnPayload, actorUserId: string): Promise<LoanRecord> {
    let updated!: LoanRecord;
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      const loan = draft.loans.find((candidate) => candidate.id === payload.loanId);
      if (!loan || loan.lifecycleStatus === "CLOSED") throw new Error("Active loan not found");
      if (new Set(payload.items.map((item) => item.lineItemId)).size !== payload.items.length)
        throw new Error("Each loan line can appear once per return");
      const plan = payload.items.map((input) => {
        const line = loan.items.find((candidate) => candidate.id === input.lineItemId);
        if (!line) throw new Error(`Loan line ${input.lineItemId} not found`);
        const outstanding = line.borrowedQuantity - line.returnedQuantity - line.lostQuantity;
        if (
          !Number.isInteger(input.returnedQuantity) ||
          input.returnedQuantity <= 0 ||
          input.returnedQuantity > outstanding
        )
          throw new Error(`Invalid return quantity for ${line.itemName}`);
        const item = draft.inventory.find((candidate) => candidate.id === line.itemId);
        if (!item) throw new Error(`Inventory item ${line.itemId} not found`);
        const lost = input.condition === "LOST";
        const destination: "lost" | "damaged" | "maintenance" | "available" = lost
          ? "lost"
          : input.condition === "DAMAGED"
            ? "damaged"
            : input.condition === "MAINTENANCE"
              ? "maintenance"
              : "available";
        const unresolved = (line.assetIds ?? []).filter(
          (assetId) => !(line.resolvedAssetIds ?? []).includes(assetId)
        );
        const assetIds =
          item.trackingMode === "INDIVIDUAL_ASSET"
            ? (input.assetIds ?? unresolved.slice(0, input.returnedQuantity))
            : undefined;
        if (
          item.trackingMode === "INDIVIDUAL_ASSET" &&
          (!assetIds ||
            assetIds.length !== input.returnedQuantity ||
            new Set(assetIds).size !== assetIds.length ||
            assetIds.some((assetId) => !unresolved.includes(assetId)))
        )
          throw new Error(
            `Select exactly ${input.returnedQuantity} outstanding assets for ${line.itemName}`
          );
        if (item.trackingMode === "QUANTITY" && input.assetIds?.length)
          throw new Error("Quantity tracked return cannot include asset identifiers");
        return { input, line, item, destination, assetIds, lost };
      });
      const timestamp = now();
      for (const { input, line, item, destination, assetIds, lost } of plan) {
        const before = inventoryState(item);
        moveUnits(item, "borrowed", destination, input.returnedQuantity, assetIds, input.condition);
        if (lost) line.lostQuantity += input.returnedQuantity;
        else line.returnedQuantity += input.returnedQuantity;
        line.resolvedAssetIds = [...(line.resolvedAssetIds ?? []), ...(assetIds ?? [])];
        recordInventoryEvent(
          draft,
          item,
          "RETURN",
          input.returnedQuantity,
          before,
          actorUserId,
          actor.name,
          `${input.condition} inspection for loan ${loan.id}`
        );
        if (["DAMAGED", "MAINTENANCE"].includes(input.condition)) {
          draft.incidents.unshift({
            id: `inc-${makeId()}`,
            title: `${input.condition === "DAMAGED" ? "Damage" : "Maintenance required"} on return: ${line.itemName}`,
            description:
              input.notes ||
              `${input.returnedQuantity} unit(s) classified ${input.condition} during return inspection.`,
            severity: input.condition === "DAMAGED" ? "HIGH" : "MEDIUM",
            category: input.condition === "DAMAGED" ? "DAMAGE" : "POLICY_BREACH",
            status: "OPEN",
            userId: loan.userId,
            userName: loan.userName,
            relatedLoanId: loan.id,
            relatedItemId: line.itemId,
            reportedBy: actorUserId,
            reportedByName: actor.name,
            reportedAt: timestamp,
          });
          if (input.condition === "DAMAGED") {
            draft.recommendations.unshift({
              id: `rec-${makeId()}`,
              userId: loan.userId,
              userName: loan.userName,
              sourceType: "DAMAGE",
              sourceEntityId: loan.id,
              suggestedStrikeLevel: 2,
              description:
                input.notes || `Damage reported during return inspection of ${line.itemName}`,
              status: "PENDING_REVIEW",
              createdAt: timestamp,
            });
          }
        }
      }
      const allResolved = loan.items.every(
        (line) => line.returnedQuantity + line.lostQuantity === line.borrowedQuantity
      );
      const anyResolved = loan.items.some((line) => line.returnedQuantity + line.lostQuantity > 0);
      loan.lifecycleStatus = allResolved ? "CLOSED" : "ACTIVE";
      loan.status = allResolved ? "CLOSED" : anyResolved ? "PARTIALLY_RETURNED" : "ACTIVE";
      loan.returnStatus = allResolved ? "COMPLETE" : anyResolved ? "PARTIAL" : "NONE";
      loan.updatedAt = timestamp;
      if (allResolved) {
        const member = draft.userProfiles[loan.userId];
        if (member) member.activeLoansCount = Math.max(0, (member.activeLoansCount ?? 1) - 1);
      }
      draft.notifications.unshift({
        id: `notif-${makeId()}`,
        userId: loan.userId,
        title: "Return inspection recorded",
        message: allResolved
          ? `Loan ${loan.id} is closed.`
          : `The return for loan ${loan.id} was recorded. Remaining items stay in your custody.`,
        type: "RETURN_CONFIRMED",
        read: false,
        link: `/app/loans/${loan.id}`,
        createdAt: timestamp,
      });
      updated = structuredClone(loan);
    });
    await mockBoardAuditLogService.logEvent({
      actorUserId,
      actorName: "Operator",
      actorRole: "OPERATOR",
      action: "RETURN_CONFIRMED",
      entityType: "LOAN",
      entityId: updated.id,
      after: updated,
      reason: payload.inspectionNotes || "Physical return inspection completed",
    });
    return updated;
  }

  async updateDueDate(loanId: string, dueDate: string, actorUserId: string): Promise<LoanRecord> {
    if (!Number.isFinite(Date.parse(dueDate)))
      throw new Error("A valid expected return date is required");
    let updated!: LoanRecord;
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      const loan = draft.loans.find((candidate) => candidate.id === loanId);
      if (!loan || loan.lifecycleStatus !== "ACTIVE") throw new Error("Active loan not found");
      loan.dueDate = dueDate;
      loan.dueStatus = Date.parse(dueDate) < Date.now() ? "OVERDUE" : "ON_TIME";
      loan.updatedAt = now();
      draft.notifications.unshift({
        id: `notif-${makeId()}`,
        userId: loan.userId,
        title: "Expected return date updated",
        message: `Your expected return date is now ${dueDate}.`,
        type: "GENERAL",
        read: false,
        link: "/app/activity",
        createdAt: loan.updatedAt,
      });
      updated = structuredClone(loan);
      void actor;
    });
    await mockBoardAuditLogService.logEvent({
      actorUserId,
      actorName: "Operator",
      actorRole: "OPERATOR",
      action: "STATUS_OVERRIDE",
      entityType: "LOAN",
      entityId: updated.id,
      after: updated,
      reason: `Expected return date changed to ${dueDate}`,
    });
    return updated;
  }
}

export const mockBoardLoanService = new MockBoardLoanService();
