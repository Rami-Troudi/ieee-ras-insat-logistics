import { IBoardInsightsService } from "@/services/contracts/board/insights";
import { BoardInsightsData } from "@/types";
import { isDatePast } from "@/lib/dates";
import { mockDb } from "@/mocks/db";

class MockBoardInsightsService implements IBoardInsightsService {
  private async simulateLatency(): Promise<void> {
    await new Promise((res) => setTimeout(res, 50));
  }

  async getInsights(): Promise<BoardInsightsData> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();

    // 1. Inventory Aggregations
    const totalDistinctItems = snapshot.inventory.length;
    const totalUnits = snapshot.inventory.reduce((s, i) => s + i.totalQuantity, 0);
    const availableUnits = snapshot.inventory.reduce((s, i) => s + i.availableQuantity, 0);
    const allocatedUnits = snapshot.inventory.reduce((s, i) => s + i.allocatedQuantity, 0);
    const borrowedUnits = snapshot.inventory.reduce((s, i) => s + i.borrowedQuantity, 0);
    const damagedUnits = snapshot.inventory.reduce((s, i) => s + i.damagedQuantity, 0);

    // 2. Borrowing Rates
    const totalRequestsCount = snapshot.requests.length;
    const approvedRequests = snapshot.requests.filter(
      (r) => r.decisionStatus === "APPROVED" || r.decisionStatus === "PARTIALLY_APPROVED"
    ).length;
    const partialRequests = snapshot.requests.filter(
      (r) => r.decisionStatus === "PARTIALLY_APPROVED"
    ).length;

    const approvalRatePercent =
      totalRequestsCount > 0 ? Math.round((approvedRequests / totalRequestsCount) * 100) : 0;
    const partialApprovalRatePercent =
      approvedRequests > 0 ? Math.round((partialRequests / approvedRequests) * 100) : 0;

    const activeLoans = snapshot.loans.filter((l) => l.lifecycleStatus === "ACTIVE");
    const activeLoansCount = activeLoans.length;

    const overdueLoans = activeLoans.filter(
      (l) => l.dueStatus === "OVERDUE" || isDatePast(l.dueDate)
    );
    const overdueLoansCount = overdueLoans.length;
    const overdueRatePercent =
      activeLoansCount > 0 ? Math.round((overdueLoansCount / activeLoansCount) * 100) : 0;

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const requestsThisMonth = snapshot.requests.filter((r) => {
      const t = Date.parse(r.createdAt);
      return !isNaN(t) && t >= thirtyDaysAgo;
    }).length;

    const durations = snapshot.loans.map((l) => {
      const start = Date.parse(l.borrowDate);
      const due = Date.parse(l.dueDate);
      if (isNaN(start) || isNaN(due)) return 14;
      return Math.max(1, Math.round((due - start) / (1000 * 60 * 60 * 24)));
    });
    const averageDurationDays =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 14;

    const extensionFrequencyPercent = 0;

    // 3. Equipment Rankings
    const borrowCountsByItem: Record<string, number> = {};
    snapshot.loans.forEach((l) => {
      l.items.forEach((i) => {
        borrowCountsByItem[i.itemId] = (borrowCountsByItem[i.itemId] || 0) + i.borrowedQuantity;
      });
    });

    const topBorrowedItems = snapshot.inventory
      .map((i) => ({
        id: i.id,
        name: i.name,
        equipmentClass: i.equipmentClass,
        borrowCount: borrowCountsByItem[i.id] || 0,
      }))
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 5);

    const frequentlyUnavailableItems = snapshot.inventory
      .map((i) => ({
        id: i.id,
        name: i.name,
        availableRatio:
          i.totalQuantity > 0 ? Math.round((i.availableQuantity / i.totalQuantity) * 100) : 0,
      }))
      .sort((a, b) => a.availableRatio - b.availableRatio)
      .slice(0, 5);

    const mostDamagedItems = snapshot.inventory
      .filter((i) => i.damagedQuantity > 0)
      .map((i) => ({
        id: i.id,
        name: i.name,
        damagedCount: i.damagedQuantity,
      }))
      .sort((a, b) => b.damagedCount - a.damagedCount)
      .slice(0, 5);

    // 4. Project Equipment Aggregations
    const equipmentByProject = snapshot.projects.map((p) => {
      const pLoans = snapshot.loans.filter(
        (l) => l.projectId === p.id && l.lifecycleStatus === "ACTIVE"
      );
      const activeUnits = pLoans.reduce(
        (sum, l) =>
          sum + l.items.reduce((s, i) => s + (i.borrowedQuantity - i.returnedQuantity), 0),
        0
      );
      return {
        projectId: p.id,
        projectName: p.name,
        activeUnits,
      };
    });

    const requestsByProject = snapshot.projects.map((p) => ({
      projectId: p.id,
      projectName: p.name,
      requestCount: snapshot.requests.filter((r) => r.projectId === p.id).length,
    }));

    // 5. Discipline Metrics
    const activeStrikesByLevel: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    snapshot.strikes
      .filter((s) => s.status === "ACTIVE")
      .forEach((s) => {
        activeStrikesByLevel[s.level] = (activeStrikesByLevel[s.level] || 0) + 1;
      });

    const pendingRecommendationsCount = snapshot.recommendations.filter(
      (r) => r.status === "PENDING_REVIEW"
    ).length;
    const openIncidentsCount = snapshot.incidents.filter(
      (i) => i.status === "OPEN" || i.status === "INVESTIGATING"
    ).length;
    const totalCompensationDue = snapshot.compensations
      .filter((c) => c.status === "PENDING")
      .reduce((s, c) => s + c.amount, 0);

    return {
      inventory: {
        totalDistinctItems,
        totalUnits,
        availableUnits,
        allocatedUnits,
        borrowedUnits,
        damagedUnits,
        maintenanceUnits: snapshot.inventory.reduce((s, i) => s + (i.maintenanceQuantity || 0), 0),
        lostUnits: snapshot.inventory.reduce((s, i) => s + (i.lostQuantity || 0), 0),
      },
      borrowing: {
        totalRequestsCount,
        requestsThisMonth,
        approvalRatePercent,
        partialApprovalRatePercent,
        activeLoansCount,
        averageDurationDays,
        extensionFrequencyPercent,
        overdueLoansCount,
        overdueRatePercent,
      },
      equipment: {
        topBorrowedItems,
        frequentlyUnavailableItems,
        mostDamagedItems,
      },
      projects: {
        projectsCount: snapshot.projects.length,
        equipmentByProject,
        requestsByProject,
      },
      discipline: {
        activeStrikesByLevel,
        pendingRecommendationsCount,
        openIncidentsCount,
        totalCompensationDue,
      },
    };
  }
}

export const mockBoardInsightsService = new MockBoardInsightsService();
