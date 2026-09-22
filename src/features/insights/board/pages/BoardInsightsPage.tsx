import React from "react";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { LoadingState } from "@/components/shared/LoadingState";
import { useBoardInsights } from "../hooks/useBoardInsights";
import {
  BarChart3,
  TrendingUp,
  Package,
  Clock,
  AlertTriangle,
  FolderGit2,
  ShieldCheck,
} from "lucide-react";

export const BoardInsightsPage: React.FC = () => {
  const { data: insights, isLoading } = useBoardInsights();

  if (isLoading || !insights) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Computing logistics telemetry and metrics..." />
      </PageContainer>
    );
  }

  const { inventory, borrowing, equipment, projects, discipline } = insights;

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="Logistics Insights & Telemetry"
        description="Comprehensive operational analytics: real-time inventory utilization, equipment demand, loan overdue rates, and project allocation distribution."
      />

      {/* KPI Top Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">
              Total Items
            </span>
            <Package className="w-4 h-4 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1 block">
            {inventory.totalDistinctItems}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {inventory.totalUnits} total units
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">
              Active Loans
            </span>
            <Clock className="w-4 h-4 text-secondary" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1 block">
            {borrowing.activeLoansCount}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {inventory.borrowedUnits} units held
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">
              Approval Rate
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {borrowing.approvalRatePercent}%
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {borrowing.totalRequestsCount} total requests
          </p>
        </div>

        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-destructive">
              Overdue Rate
            </span>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <span className="text-2xl font-bold text-destructive mt-1 block">
            {borrowing.overdueRatePercent}%
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {borrowing.overdueLoansCount} overdue loans
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">
              Open Incidents
            </span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1 block">
            {discipline.openIncidentsCount}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Under investigation</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">
              Compensation Due
            </span>
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1 block">
            {discipline.totalCompensationDue} TND
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Pending replacement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Borrowed Items */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Most In-Demand Hardware (Top Borrowed)</span>
          </h3>

          <div className="space-y-2 text-xs">
            {equipment.topBorrowedItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/50"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-foreground">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Class {item.equipmentClass} · {item.id}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-foreground">
                    {item.borrowCount} total checkouts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Equipment Allocation */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <FolderGit2 className="w-4 h-4 text-secondary" />
            <span>Project Allocations & Teams ({projects.projectsCount})</span>
          </h3>

          <div className="space-y-2 text-xs">
            {projects.equipmentByProject.map((proj) => (
              <div
                key={proj.projectId}
                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/50"
              >
                <div>
                  <div className="font-semibold text-foreground">{proj.projectName}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {proj.projectId}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-foreground">{proj.activeUnits} units in use</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
