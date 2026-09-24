export type ExportDatasetType =
  | "INVENTORY"
  | "ACTIVE_LOANS"
  | "OVERDUE_LOANS"
  | "REQUESTS"
  | "PROJECTS"
  | "STOCK_MOVEMENTS"
  | "USERS" // Superadmin only
  | "AUDITS" // Superadmin only
  | "STRIKES" // Superadmin only
  | "INCIDENTS" // Superadmin only
  | "COMPENSATIONS" // Superadmin only
  | "AUDIT_LOG"; // Superadmin only

export interface ExportResult {
  filename: string;
  csvContent: string;
  rowCount: number;
}

export interface IBoardExportService {
  exportCsv(dataset: ExportDatasetType, actorUserId: string): Promise<ExportResult>;
}
