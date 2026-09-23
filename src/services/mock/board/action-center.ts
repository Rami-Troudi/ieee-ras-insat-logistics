import { IBoardActionCenterService } from "@/services/contracts/board/action-center";
import { BoardAction } from "@/types";
import { isDatePast } from "@/lib/dates";
import { mockDb } from "@/mocks/db";

class MockBoardActionCenterService implements IBoardActionCenterService {
  private async simulateLatency(): Promise<void> {
    await new Promise((res) => setTimeout(res, 50));
  }

  async getActions(): Promise<BoardAction[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    const actions: BoardAction[] = [];

    // 1. Pending Disciplinary Recommendations (Critical / High)
    snapshot.recommendations
      .filter((r) => r.status === "PENDING_REVIEW")
      .forEach((r) => {
        actions.push({
          id: `act-rec-${r.id}`,
          type: "DISCIPLINARY_RECOMMENDATION",
          priority:
            r.sourceType === "OVERDUE_14_DAYS" || r.sourceType === "SAFETY_VIOLATION"
              ? "CRITICAL"
              : "HIGH",
          title: `Disciplinary Recommendation: ${r.userName}`,
          description: r.description,
          entityType: "INCIDENT",
          entityId: r.id,
          createdAt: r.createdAt,
          route: "/board/incidents",
          badgeLabel: `Strike ${r.suggestedStrikeLevel} Rec.`,
        });
      });

    // 2. Open Incidents (Critical / High)
    snapshot.incidents
      .filter((i) => i.status === "OPEN" || i.status === "INVESTIGATING")
      .forEach((i) => {
        actions.push({
          id: `act-inc-${i.id}`,
          type: "INCIDENT_OPEN",
          priority: i.severity === "CRITICAL" ? "CRITICAL" : "HIGH",
          title: `Active Incident: ${i.title}`,
          description: `${i.userName} — ${i.description}`,
          entityType: "INCIDENT",
          entityId: i.id,
          createdAt: i.reportedAt,
          route: `/board/incidents/${i.id}`,
          badgeLabel: `${i.severity} Severity`,
        });
      });

    // 3. Pending Borrow Requests (High)
    snapshot.requests
      .filter((r) => r.decisionStatus === "PENDING" && r.lifecycleStatus === "ACTIVE")
      .forEach((r) => {
        const hasClassG = r.items.some((i) => i.equipmentClass === "G");
        const hasClassF = r.items.some((i) => i.equipmentClass === "F");
        actions.push({
          id: `act-req-${r.id}`,
          type: "REQUEST_PENDING",
          priority: hasClassG ? "CRITICAL" : hasClassF ? "HIGH" : "HIGH",
          title: `Borrow Request: ${r.id}`,
          description: `${r.userName} (${r.items.map((i) => `${i.requestedQuantity}x ${i.itemName}`).join(", ")})`,
          entityType: "REQUEST",
          entityId: r.id,
          createdAt: r.createdAt,
          route: `/board/requests/${r.id}`,
          badgeLabel: hasClassG
            ? "Level VI Required"
            : hasClassF
              ? "Supervision Required"
              : "Pending Review",
        });
      });

    // 4. Return Requests Pending Physical Confirmation (High)
    snapshot.loans
      .filter((l) => l.returnStatus === "PENDING_CONFIRMATION" && l.lifecycleStatus === "ACTIVE")
      .forEach((l) => {
        actions.push({
          id: `act-ret-${l.id}`,
          type: "RETURN_PENDING",
          priority: "HIGH",
          title: `Physical Return Pending: ${l.id}`,
          description: `${l.userName} declared equipment for return at the counter. Physical condition check required.`,
          entityType: "LOAN",
          entityId: l.id,
          createdAt: l.returnRequests[0]?.requestedAt || l.updatedAt,
          route: `/board/loans/${l.id}`,
          badgeLabel: "Verify Return",
        });
      });

    // 5. Overdue Loans (High)
    snapshot.loans
      .filter(
        (l) =>
          l.lifecycleStatus === "ACTIVE" && (l.dueStatus === "OVERDUE" || isDatePast(l.dueDate))
      )
      .forEach((l) => {
        actions.push({
          id: `act-ovd-${l.id}`,
          type: "LOAN_OVERDUE",
          priority: "HIGH",
          title: `Overdue Loan: ${l.id}`,
          description: `${l.userName} — Due on ${new Date(l.dueDate).toLocaleDateString()}. Equipment held: ${l.items.map((i) => `${i.borrowedQuantity - i.returnedQuantity}x ${i.itemName}`).join(", ")}.`,
          entityType: "LOAN",
          entityId: l.id,
          createdAt: l.dueDate,
          route: `/board/loans/${l.id}`,
          badgeLabel: "Overdue",
        });
      });

    // 6. Approved Requests Awaiting Collection Handover (Medium)
    snapshot.requests
      .filter(
        (r) =>
          (r.decisionStatus === "APPROVED" || r.decisionStatus === "PARTIALLY_APPROVED") &&
          r.handoverStatus === "WAITING" &&
          r.lifecycleStatus === "ACTIVE"
      )
      .forEach((r) => {
        actions.push({
          id: `act-hnd-${r.id}`,
          type: "REQUEST_AWAITING_HANDOVER",
          priority: "MEDIUM",
          title: `Ready for Handover: ${r.id}`,
          description: `${r.userName} — Items staged at workshop counter. 48-hour reservation active.`,
          entityType: "REQUEST",
          entityId: r.id,
          createdAt: r.reviewedAt || r.updatedAt,
          route: `/board/requests/${r.id}`,
          badgeLabel: "Staged for Pickup",
        });
      });

    // 7. Due Date Extension Requests Pending Review (Medium)
    snapshot.loans
      .filter((l) => l.extensionStatus === "PENDING" && l.lifecycleStatus === "ACTIVE")
      .forEach((l) => {
        const ext =
          l.extensionRequests.find((e) => e.status === "PENDING") || l.extensionRequests[0];
        actions.push({
          id: `act-ext-${l.id}`,
          type: "EXTENSION_PENDING",
          priority: "MEDIUM",
          title: `Extension Requested: ${l.id}`,
          description: `${l.userName} requested due date extension to ${ext?.proposedReturnDate}. Reason: "${ext?.reason}".`,
          entityType: "LOAN",
          entityId: l.id,
          createdAt: ext?.requestedDate || l.updatedAt,
          route: `/board/loans/${l.id}`,
          badgeLabel: "Extension Review",
        });
      });

    // 8. Unprocessed User Registrations (Medium)
    Object.values(snapshot.userProfiles)
      .filter((u) => !u.isProcessed)
      .forEach((u) => {
        actions.push({
          id: `act-usr-${u.id}`,
          type: "USER_UNPROCESSED",
          priority: "MEDIUM",
          title: `New Account Verification: ${u.name}`,
          description: `Claimed Affiliation: ${u.claimedAffiliation || u.affiliation}. Membership: ${u.studentId ? `ID ${u.studentId}` : "Pending assignment"}. Verify affiliation and assign clearance.`,
          entityType: "USER",
          entityId: u.id,
          createdAt: u.joinedDate,
          route: `/board/users/${u.id}`,
          badgeLabel: "Verify Affiliation",
        });
      });

    // 9. Active Audits with Discrepancies (High)
    snapshot.audits
      .filter((a) => a.status === "IN_PROGRESS" && a.items.some((i) => i.status === "DISCREPANCY"))
      .forEach((a) => {
        const discCount = a.items.filter((i) => i.status === "DISCREPANCY").length;
        actions.push({
          id: `act-aud-${a.id}`,
          type: "AUDIT_DISCREPANCY",
          priority: "HIGH",
          title: `Audit Discrepancies: ${a.title}`,
          description: `${discCount} line item(s) have physical count variances requiring investigation and reconciliation.`,
          entityType: "AUDIT",
          entityId: a.id,
          createdAt: a.startedAt,
          route: `/board/audits/${a.id}`,
          badgeLabel: `${discCount} Discrepancies`,
        });
      });

    // 10. Low Available Stock (Low)
    snapshot.inventory
      .filter((i) => i.availableQuantity <= 1 && i.totalQuantity > 0)
      .forEach((i) => {
        actions.push({
          id: `act-stk-${i.id}`,
          type: "LOW_STOCK",
          priority: "LOW",
          title: `Low Available Stock: ${i.name}`,
          description: `Only ${i.availableQuantity} unit(s) available in unreserved inventory (Total: ${i.totalQuantity}, Allocated: ${i.allocatedQuantity}, Borrowed: ${i.borrowedQuantity}).`,
          entityType: "INVENTORY",
          entityId: i.id,
          createdAt: new Date().toISOString(),
          route: `/board/inventory/${i.id}`,
          badgeLabel: `${i.availableQuantity} Available`,
        });
      });

    // Sort: CRITICAL -> HIGH -> MEDIUM -> LOW, then newest first
    const priorityWeight: Record<string, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    return actions.sort((a, b) => {
      const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}

export const mockBoardActionCenterService = new MockBoardActionCenterService();
