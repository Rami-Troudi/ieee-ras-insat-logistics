import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState, ErrorState } from "@/components/shared/FeedbackStates";
import { Button } from "@/components/ui/button";
import { useUserLoans } from "../hooks/useLoans";
import { useSession } from "@/hooks/useSession";
import { formatDate, isDatePast } from "@/lib/dates";
import { ArrowRight, Clock, AlertTriangle, PackageCheck } from "lucide-react";
import { LoanStatus, getLoanDisplayStatus } from "@/types";

export const MemberLoansPage: React.FC = () => {
  const { currentPersona } = useSession();
  const { data: loans, isLoading, error, refetch } = useUserLoans(currentPersona.id);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filterOptions = [
    { value: "ALL", label: "All Loans" },
    { value: "ACTIVE", label: "Active" },
    { value: "DUE_SOON", label: "Due Soon" },
    { value: "OVERDUE", label: "Overdue" },
    { value: "RETURN_REQUESTED", label: "Return Pending" },
    { value: "CLOSED", label: "Returned / Closed" },
  ];

  const filteredLoans = (loans || []).filter((loan) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "ACTIVE") return loan.lifecycleStatus === "ACTIVE";
    if (statusFilter === "DUE_SOON")
      return loan.lifecycleStatus === "ACTIVE" && loan.dueStatus === "DUE_SOON";
    if (statusFilter === "OVERDUE")
      return (
        loan.lifecycleStatus === "ACTIVE" &&
        (loan.dueStatus === "OVERDUE" || isDatePast(loan.dueDate))
      );
    if (statusFilter === "RETURN_REQUESTED") return loan.returnStatus === "PENDING_CONFIRMATION";
    if (statusFilter === "CLOSED") return loan.lifecycleStatus === "CLOSED";
    return true;
  });

  return (
    <PageContainer>
      <PageHeader
        title="My Active Loans"
        description="Inspect physical equipment currently held under your custody, review return deadlines, request extensions, or report returns."
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {filterOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={statusFilter === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(opt.value)}
            className="text-xs min-h-[44px] sm:min-h-[36px]"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState message="Loading your active loans..." />
      ) : error ? (
        <ErrorState
          title="Failed to Load Loans"
          description="A datastore error occurred while retrieving active equipment loans."
          onRetry={() => refetch()}
        />
      ) : filteredLoans.length === 0 ? (
        <EmptyState
          title="No Loans Found"
          description={
            statusFilter !== "ALL"
              ? `No loan records matching status "${statusFilter}".`
              : "You do not currently have any physically borrowed equipment."
          }
          actionLabel="Browse Equipment"
          onAction={() => window.location.assign("/app/inventory")}
        />
      ) : (
        <div className="space-y-4">
          {filteredLoans.map((loan) => {
            const isOverdue =
              loan.lifecycleStatus === "ACTIVE" &&
              (loan.dueStatus === "OVERDUE" || isDatePast(loan.dueDate));

            const computedStatus: LoanStatus = getLoanDisplayStatus(loan);

            return (
              <div
                key={loan.id}
                className="p-5 rounded-xl border border-border bg-card shadow-sm hover:border-primary/40 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono font-bold text-foreground">{loan.id}</span>
                      {loan.projectName && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          {loan.projectName}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Borrowed on {formatDate(loan.borrowDate)}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {loan.items.map((i) => `${i.borrowedQuantity}x ${i.itemName}`).join(", ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={computedStatus} />
                  </div>
                </div>

                {/* Overdue Warning */}
                {isOverdue && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Loan is overdue! Official due date was {formatDate(loan.dueDate)}. Please
                      return immediately to avoid disciplinary strikes.
                    </span>
                  </div>
                )}

                {/* Pending Extension Notice */}
                {loan.extensionStatus === "PENDING" && (
                  <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20 text-xs text-secondary-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-secondary shrink-0" />
                    <span>
                      An extension request is pending Logistics Board review. Official due date
                      remains <strong>{formatDate(loan.dueDate)}</strong>.
                    </span>
                  </div>
                )}

                {/* Items in Loan */}
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1.5">
                  <span className="font-semibold text-muted-foreground block text-[11px] uppercase tracking-wider">
                    Equipment in Custody
                  </span>
                  <div className="divide-y divide-border/60">
                    {loan.items.map((line) => (
                      <div key={line.id} className="py-1.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-foreground">
                            {line.borrowedQuantity}x {line.itemName}
                          </span>
                          {line.serialNumbers && line.serialNumbers.length > 0 && (
                            <span className="text-[11px] text-muted-foreground ml-2 font-mono">
                              ({line.serialNumbers.join(", ")})
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground">
                            Returned: {line.returnedQuantity} of {line.borrowedQuantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Official Due Date:</span>
                    <span
                      className={`font-bold ${isOverdue ? "text-destructive" : "text-foreground"}`}
                    >
                      {formatDate(loan.dueDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="text-xs min-h-[44px]">
                      <Link to={`/app/loans/${loan.id}`} className="gap-1.5">
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>View Loan</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};
