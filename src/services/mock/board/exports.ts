import { mockDb } from "@/mocks/db";
import {
  ExportDatasetType,
  ExportResult,
  IBoardExportService,
} from "@/services/contracts/board/exports";
import { refreshStrikeDerivedProfile, requireOperator, requireSuperadmin } from "../authorization";
import { mockBoardAuditLogService } from "./audit-log";

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): string {
  const headerLine = headers.map(escapeCsvField).join(",");
  const dataLines = rows.map((row) => row.map(escapeCsvField).join(","));
  return [headerLine, ...dataLines].join("\r\n");
}

export class MockBoardExportService implements IBoardExportService {
  async exportCsv(dataset: ExportDatasetType, actorUserId: string): Promise<ExportResult> {
    const actor = requireOperator(actorUserId);
    const superadminOnlyDatasets: ExportDatasetType[] = [
      "USERS",
      "AUDITS",
      "STRIKES",
      "INCIDENTS",
      "COMPENSATIONS",
      "AUDIT_LOG",
    ];

    if (superadminOnlyDatasets.includes(dataset)) requireSuperadmin(actorUserId);

    const snapshot = mockDb.getSnapshot();
    Object.keys(snapshot.userProfiles).forEach((userId) =>
      refreshStrikeDerivedProfile(snapshot, userId)
    );
    let headers: string[] = [];
    let rows: (string | number | boolean | null | undefined)[][] = [];
    const nowStr = new Date().toISOString().split("T")[0];
    const filename = `ras_export_${dataset.toLowerCase()}_${nowStr}.csv`;

    switch (dataset) {
      case "INVENTORY": {
        headers = [
          "Item ID",
          "Name",
          "Category",
          "Equipment Class",
          "Tracking Mode",
          "Total Qty",
          "Available Qty",
          "Allocated Qty",
          "Borrowed Qty",
          "Damaged Qty",
          "Maintenance Qty",
          "Lost Qty",
          "Location",
        ];
        rows = snapshot.inventory.map((item) => [
          item.id,
          item.name,
          item.category,
          item.equipmentClass,
          item.trackingMode,
          item.totalQuantity,
          item.availableQuantity,
          item.allocatedQuantity,
          item.borrowedQuantity,
          item.damagedQuantity,
          item.maintenanceQuantity,
          item.lostQuantity,
          item.location || "",
        ]);
        break;
      }

      case "ACTIVE_LOANS": {
        headers = [
          "Loan ID",
          "Member ID",
          "Member Name",
          "Project Name",
          "Checked Out At",
          "Due At",
          "Lifecycle Status",
          "Due Status",
          "Items Count",
          "Total Units",
        ];
        const activeLoans = snapshot.loans.filter((l) => l.lifecycleStatus === "ACTIVE");
        rows = activeLoans.map((loan) => {
          const totalUnits = loan.items.reduce(
            (acc, i) => acc + (i.borrowedQuantity - i.returnedQuantity - i.lostQuantity),
            0
          );
          return [
            loan.id,
            loan.userId,
            loan.userName,
            loan.projectName || "None",
            loan.borrowDate,
            loan.dueDate,
            loan.lifecycleStatus,
            loan.dueStatus,
            loan.items.length,
            totalUnits,
          ];
        });
        break;
      }

      case "OVERDUE_LOANS": {
        headers = [
          "Loan ID",
          "Member ID",
          "Member Name",
          "Checked Out At",
          "Due Date",
          "Days Overdue",
          "Items Held",
        ];
        const overdueLoans = snapshot.loans.filter(
          (l) => l.lifecycleStatus === "ACTIVE" && l.dueStatus === "OVERDUE"
        );
        rows = overdueLoans.map((loan) => {
          const dueTime = new Date(loan.dueDate).getTime();
          const nowTime = Date.now();
          const daysOverdue = Math.max(0, Math.floor((nowTime - dueTime) / (1000 * 60 * 60 * 24)));
          const itemsSummary = loan.items
            .map(
              (i) => `${i.borrowedQuantity - i.returnedQuantity - i.lostQuantity}x ${i.itemName}`
            )
            .join("; ");
          return [
            loan.id,
            loan.userId,
            loan.userName,
            loan.borrowDate,
            loan.dueDate,
            daysOverdue,
            itemsSummary,
          ];
        });
        break;
      }

      case "REQUESTS": {
        headers = [
          "Request ID",
          "Member ID",
          "Member Name",
          "Project Name",
          "Submitted At",
          "Decision Status",
          "Handover Status",
          "Lifecycle Status",
          "Items Count",
          "Total Qty Requested",
        ];
        rows = snapshot.requests.map((req) => {
          const totalQty = req.items.reduce((acc, i) => acc + i.requestedQuantity, 0);
          return [
            req.id,
            req.userId,
            req.userName,
            req.projectName || "General Logistics",
            req.createdAt,
            req.decisionStatus,
            req.handoverStatus,
            req.lifecycleStatus,
            req.items.length,
            totalQty,
          ];
        });
        break;
      }

      case "PROJECTS": {
        headers = ["Project ID", "Code", "Name", "Lead Name", "Status", "Member Count"];
        rows = snapshot.projects.map((proj) => [
          proj.id,
          proj.code,
          proj.name,
          proj.leadName,
          proj.status,
          proj.membersCount,
        ]);
        break;
      }

      case "STOCK_MOVEMENTS": {
        headers = [
          "Event ID",
          "Item ID",
          "Item Name",
          "Type",
          "Qty Delta",
          "Actor ID",
          "Actor Name",
          "Reason",
          "Timestamp",
        ];
        rows = snapshot.inventoryEvents.map((evt) => [
          evt.id,
          evt.itemId,
          evt.itemName,
          evt.type,
          evt.quantity,
          evt.actorUserId,
          evt.actorName,
          evt.reason,
          evt.timestamp,
        ]);
        break;
      }

      case "USERS": {
        headers = [
          "User ID",
          "Name",
          "Email",
          "Role",
          "Clearance Level",
          "Affiliation",
          "Status",
          "Strikes Count",
          "Joined Date",
        ];
        rows = Object.values(snapshot.userProfiles).map((u) => [
          u.id,
          u.name,
          u.email,
          u.role,
          u.clearance,
          u.affiliation,
          u.status,
          u.strikesCount,
          u.joinedDate,
        ]);
        break;
      }

      case "AUDITS": {
        headers = [
          "Audit ID",
          "Title",
          "Status",
          "Started At",
          "Started By",
          "Completed At",
          "Items Count",
          "Discrepancies",
        ];
        rows = snapshot.audits.map((a) => {
          const discrepancies = a.items.filter((i) => i.status === "DISCREPANCY").length;
          return [
            a.id,
            a.title,
            a.status,
            a.startedAt,
            a.startedByName,
            a.completedAt || "",
            a.items.length,
            discrepancies,
          ];
        });
        break;
      }

      case "STRIKES": {
        headers = [
          "Strike ID",
          "User ID",
          "User Name",
          "Strike Level",
          "Status",
          "Reason",
          "Issued At",
          "Issued By",
          "Expires At",
        ];
        rows = snapshot.strikes.map((s) => [
          s.id,
          s.userId,
          s.userName,
          s.level,
          s.status,
          s.reason,
          s.issuedAt,
          s.issuedByName,
          s.expiresAt || "Permanent",
        ]);
        break;
      }

      case "INCIDENTS": {
        headers = [
          "Incident ID",
          "User Name",
          "Title",
          "Category",
          "Severity",
          "Status",
          "Reported By",
          "Reported At",
        ];
        rows = snapshot.incidents.map((inc) => [
          inc.id,
          inc.userName,
          inc.title,
          inc.category,
          inc.severity,
          inc.status,
          inc.reportedByName,
          inc.reportedAt,
        ]);
        break;
      }

      case "COMPENSATIONS": {
        headers = [
          "Compensation ID",
          "User ID",
          "User Name",
          "Amount (TND)",
          "Assessment",
          "Status",
          "Created At",
          "Settled At",
        ];
        rows = snapshot.compensations.map((c) => [
          c.id,
          c.userId,
          c.userName,
          c.amount,
          c.assessment,
          c.status,
          c.createdAt,
          c.settledAt || "",
        ]);
        break;
      }

      case "AUDIT_LOG": {
        headers = [
          "Event ID",
          "Timestamp",
          "Actor ID",
          "Actor Name",
          "Actor Role",
          "Action",
          "Entity Type",
          "Entity ID",
          "Reason",
        ];
        rows = snapshot.auditEvents.map((evt) => [
          evt.id,
          evt.createdAt,
          evt.actorUserId,
          evt.actorName,
          evt.actorRole,
          evt.action,
          evt.entityType,
          evt.entityId,
          evt.reason || "",
        ]);
        break;
      }

      default:
        throw new Error(`Unknown dataset: ${dataset}`);
    }

    const csvContent = toCsv(headers, rows);

    // Audit log
    await mockBoardAuditLogService.logEvent({
      actorUserId,
      actorName: actor.name,
      actorRole: actor.role,
      action: "EXPORT_CREATED",
      entityType: "EXPORT",
      entityId: dataset,
      reason: `Exported ${rows.length} rows for dataset ${dataset}`,
    });

    return {
      filename,
      csvContent,
      rowCount: rows.length,
    };
  }
}

export const mockBoardExportService = new MockBoardExportService();
