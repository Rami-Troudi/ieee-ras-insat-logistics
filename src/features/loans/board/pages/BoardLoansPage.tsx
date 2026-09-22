import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useBoardLoans } from "../hooks/useBoardLoans";
import { Search, Eye, RotateCcw, Clock, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { getLoanDisplayStatus } from "@/types";

export const BoardLoansPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: loans = [], isLoading } = useBoardLoans();

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      // Status filter
      if (statusFilter === "ACTIVE" && loan.lifecycleStatus !== "ACTIVE") return false;
      if (statusFilter === "OVERDUE" && loan.dueStatus !== "OVERDUE") return false;
      if (statusFilter === "DUE_SOON" && loan.dueStatus !== "DUE_SOON") return false;
      if (statusFilter === "RETURN_REQUESTED" && loan.returnStatus !== "PENDING_CONFIRMATION")
        return false;
      if (statusFilter === "EXTENSION_REQUESTED" && loan.extensionStatus !== "PENDING")
        return false;
      if (statusFilter === "CLOSED" && loan.lifecycleStatus !== "CLOSED") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = loan.id.toLowerCase().includes(q);
        const matchBorrower =
          loan.userName.toLowerCase().includes(q) || loan.userEmail.toLowerCase().includes(q);
        const matchItem = (loan.items || []).some((i) => i.itemName.toLowerCase().includes(q));
        const matchProject = loan.projectName?.toLowerCase().includes(q) || false;
        if (!matchId && !matchBorrower && !matchItem && !matchProject) return false;
      }

      return true;
    });
  }, [loans, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: loans.length,
      active: loans.filter((l) => l.lifecycleStatus === "ACTIVE").length,
      overdue: loans.filter((l) => l.lifecycleStatus === "ACTIVE" && l.dueStatus === "OVERDUE")
        .length,
      dueSoon: loans.filter((l) => l.lifecycleStatus === "ACTIVE" && l.dueStatus === "DUE_SOON")
        .length,
      returns: loans.filter((l) => l.returnStatus === "PENDING_CONFIRMATION").length,
      extensions: loans.filter((l) => l.extensionStatus === "PENDING").length,
      closed: loans.filter((l) => l.lifecycleStatus === "CLOSED").length,
    };
  }, [loans]);

  if (isLoading) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading logistics loan records..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="Active Loans & Custodial Tracking"
        description="Comprehensive loan portfolio. Track physical custody, inspect pending return intakes, and review return date extension requests."
      />

      {/* Filter Tabs / Metric Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === "ALL"
              ? "border-primary bg-primary/10 ring-2 ring-primary"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
            All Loans
          </span>
          <span className="text-xl font-bold text-foreground block mt-1">{counts.all}</span>
        </button>

        <button
          onClick={() => setStatusFilter("OVERDUE")}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === "OVERDUE"
              ? "border-destructive bg-destructive/10 ring-2 ring-destructive"
              : "border-destructive/30 bg-destructive/5 hover:border-destructive/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-destructive tracking-wider">
              Overdue
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
          </div>
          <span className="text-xl font-bold text-destructive block mt-1">{counts.overdue}</span>
        </button>

        <button
          onClick={() => setStatusFilter("DUE_SOON")}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === "DUE_SOON"
              ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500"
              : "border-border bg-card hover:border-amber-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-amber-600 tracking-wider">
              Due Soon
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-xl font-bold text-foreground block mt-1">{counts.dueSoon}</span>
        </button>

        <button
          onClick={() => setStatusFilter("RETURN_REQUESTED")}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === "RETURN_REQUESTED"
              ? "border-secondary bg-secondary/10 ring-2 ring-secondary"
              : "border-border bg-card hover:border-secondary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-secondary-foreground tracking-wider">
              Intake Queue
            </span>
            <RotateCcw className="w-3.5 h-3.5 text-secondary" />
          </div>
          <span className="text-xl font-bold text-foreground block mt-1">{counts.returns}</span>
        </button>

        <button
          onClick={() => setStatusFilter("EXTENSION_REQUESTED")}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === "EXTENSION_REQUESTED"
              ? "border-primary bg-primary/10 ring-2 ring-primary"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-primary tracking-wider">
              Extensions
            </span>
            <Calendar className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground block mt-1">{counts.extensions}</span>
        </button>

        <button
          onClick={() => setStatusFilter("CLOSED")}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === "CLOSED"
              ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500"
              : "border-border bg-card hover:border-emerald-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-emerald-600 tracking-wider">
              Returned
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-xl font-bold text-foreground block mt-1">{counts.closed}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search loans by borrower, ID, or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>
      </div>

      {/* Loan Records Table */}
      <div className="space-y-3">
        {filteredLoans.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No loans found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              No loan records matching the current filter criteria.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Loan ID</th>
                    <th className="py-3 px-4">Borrower</th>
                    <th className="py-3 px-4">Items Summary</th>
                    <th className="py-3 px-4">Total Qty</th>
                    <th className="py-3 px-4">Checked Out</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLoans.map((loan) => {
                    const isOverdue = loan.dueStatus === "OVERDUE";
                    const isDueSoon = loan.dueStatus === "DUE_SOON";
                    const totalBorrowed = (loan.items || []).reduce(
                      (acc, i) => acc + (i.borrowedQuantity || 0),
                      0
                    );
                    const itemsSummary =
                      (loan.items || []).map((i) => i.itemName).join(", ") || "Equipment";

                    return (
                      <tr
                        key={loan.id}
                        className={`hover:bg-accent/40 transition-colors ${
                          isOverdue ? "bg-destructive/5" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-medium text-foreground whitespace-nowrap">
                          {loan.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{loan.userName}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {loan.userEmail || loan.userId}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate">
                          <div className="font-medium text-foreground truncate">{itemsSummary}</div>
                          {loan.projectName && (
                            <div className="text-[11px] text-primary font-semibold">
                              Project: {loan.projectName}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                          {totalBorrowed} unit{totalBorrowed !== 1 ? "s" : ""}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {new Date(loan.borrowDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div
                            className={`font-semibold ${
                              isOverdue
                                ? "text-destructive"
                                : isDueSoon
                                  ? "text-amber-600"
                                  : "text-foreground"
                            }`}
                          >
                            {new Date(loan.dueDate).toLocaleDateString()}
                          </div>
                          {loan.extensionStatus === "PENDING" && (
                            <span className="text-[10px] text-primary font-bold block">
                              + Ext Requested
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={getLoanDisplayStatus(loan)} />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1">
                            <Link to={`/board/loans/${loan.id}`}>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
