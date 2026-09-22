import React, { useState } from "react";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { useExportCsv } from "../hooks/useBoardExports";
import {
  Download,
  Lock,
  Package,
  Clock,
  AlertTriangle,
  FolderGit2,
  Users,
  CheckCircle2,
  ShieldAlert,
  DollarSign,
  ScrollText,
  FileSpreadsheet,
} from "lucide-react";
import { ExportDatasetType } from "@/services/contracts/board/exports";

interface DatasetCardConfig {
  type: ExportDatasetType;
  title: string;
  description: string;
  icon: React.ElementType;
  superadminOnly: boolean;
}

const DATASETS: DatasetCardConfig[] = [
  {
    type: "INVENTORY",
    title: "Master Inventory Catalog",
    description:
      "Full equipment ledger with total, available, allocated, borrowed, and maintenance quantities.",
    icon: Package,
    superadminOnly: false,
  },
  {
    type: "ACTIVE_LOANS",
    title: "Active Equipment Loans",
    description:
      "Currently active checkouts, borrower IDs, assigned hardware serials, and due dates.",
    icon: Clock,
    superadminOnly: false,
  },
  {
    type: "OVERDUE_LOANS",
    title: "Overdue Loans Report",
    description:
      "Delinquent loans exceeding their agreed return timestamp with days overdue calculations.",
    icon: AlertTriangle,
    superadminOnly: false,
  },
  {
    type: "REQUESTS",
    title: "Borrow Requests Ledger",
    description:
      "Historical borrow requests, line-item approvals, quantities, and decision statuses.",
    icon: FileSpreadsheet,
    superadminOnly: false,
  },
  {
    type: "PROJECTS",
    title: "Projects & Team Allocations",
    description:
      "Registered club projects, team leads, active member counts, and project categories.",
    icon: FolderGit2,
    superadminOnly: false,
  },
  {
    type: "STOCK_MOVEMENTS",
    title: "Stock Movement Ledger",
    description:
      "Complete chronological physical stock transactions (ADD, DAMAGE, REPAIR, WRITE-OFF).",
    icon: ScrollText,
    superadminOnly: false,
  },
  {
    type: "USERS",
    title: "User Accounts & Clearances",
    description:
      "Member directory with verified affiliations, clearance levels (I–VI), and account statuses.",
    icon: Users,
    superadminOnly: true,
  },
  {
    type: "AUDITS",
    title: "Physical Audit Records",
    description:
      "Semesterly inventory count reconciliation results, snapshot states, and discrepancy summaries.",
    icon: CheckCircle2,
    superadminOnly: true,
  },
  {
    type: "STRIKES",
    title: "Progressive Strikes Registry",
    description:
      "Disciplinary sanctions records (Strikes 1–5), issuing custodians, reasons, and expiration dates.",
    icon: ShieldAlert,
    superadminOnly: true,
  },
  {
    type: "INCIDENTS",
    title: "Incident Dossiers",
    description:
      "Equipment loss and damage reports, severity assessments, and custodial investigation notes.",
    icon: AlertTriangle,
    superadminOnly: true,
  },
  {
    type: "COMPENSATIONS",
    title: "Financial Compensations",
    description:
      "Equipment replacement assessments, assessed amounts in TND, and settlement timestamps.",
    icon: DollarSign,
    superadminOnly: true,
  },
  {
    type: "AUDIT_LOG",
    title: "System Audit Log",
    description:
      "Immutable administrative activity timeline with actor IDs, roles, and target details.",
    icon: ScrollText,
    superadminOnly: true,
  },
];

export const BoardExportsPage: React.FC = () => {
  const { currentPersona } = useSession();
  const exportMutation = useExportCsv();

  const [downloadingType, setDownloadingType] = useState<ExportDatasetType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSuperadmin = currentPersona.role === "SUPERADMIN";

  const handleExport = async (dataset: ExportDatasetType) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setDownloadingType(dataset);

      const result = await exportMutation.mutateAsync({
        dataset,
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      // Trigger client-side file download
      const blob = new Blob([result.csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", result.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage(`Exported ${result.rowCount} records to ${result.filename}.`);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to generate CSV export");
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="CSV Data Exports"
        description="Role-gated operational data extraction. Download clean, machine-readable CSV snapshots for spreadsheets, logistics accounting, and club records."
      />

      {errorMessage && (
        <div className="mb-4">
          <AlertBanner variant="destructive" title="Export Failed" description={errorMessage} />
        </div>
      )}

      {successMessage && (
        <div className="mb-4">
          <AlertBanner variant="success" title="Export Complete" description={successMessage} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DATASETS.map((ds) => {
          const Icon = ds.icon;
          const isGated = ds.superadminOnly && !isSuperadmin;
          const isCurrentLoading = downloadingType === ds.type;

          return (
            <div
              key={ds.type}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 ${
                isGated
                  ? "border-border/60 bg-muted/20 opacity-80"
                  : "border-border bg-card hover:border-primary/40 shadow-sm"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  {ds.superadminOnly && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isSuperadmin
                          ? "bg-purple-100 text-purple-800 border border-purple-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      <span>Clearance VI</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-foreground">{ds.title}</h4>
                <p className="text-xs text-muted-foreground">{ds.description}</p>
              </div>

              <div className="pt-2 border-t border-border/50">
                <Button
                  size="sm"
                  variant={isGated ? "outline" : "default"}
                  disabled={isGated || isCurrentLoading}
                  onClick={() => handleExport(ds.type)}
                  className="w-full text-xs font-semibold gap-1.5 h-8"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {isCurrentLoading
                      ? "Generating CSV..."
                      : isGated
                        ? "Superadmin Privilege Required"
                        : "Download CSV"}
                  </span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
};
