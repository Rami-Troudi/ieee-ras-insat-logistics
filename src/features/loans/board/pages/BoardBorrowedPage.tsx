import React, { useState, useMemo } from "react";
import {
  useBoardLoans,
  useConfirmReturn,
  useUpdateLoanDueDate,
} from "@/features/loans/board/hooks/useBoardLoans";
import { useSession } from "@/hooks/useSession";
import { LoadingState } from "@/components/shared/LoadingState";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import { formatDate, isDatePast } from "@/lib/dates";
import { RotateCcw, X, Edit2 } from "lucide-react";
import { AssetCondition, LoanRecord } from "@/types";

export const BoardBorrowedPage: React.FC = () => {
  const { currentPersona } = useSession();
  const { data: loans = [], isLoading, refetch } = useBoardLoans();
  const returnMutation = useConfirmReturn();
  const updateDueDateMutation = useUpdateLoanDueDate();

  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "OVERDUE" | "DUE_TODAY">("ALL");

  // Fast Return Dialog State
  const [activeReturnLoan, setActiveReturnLoan] = useState<LoanRecord | null>(null);
  const [returnCondition, setReturnCondition] = useState<AssetCondition>("GOOD");
  const [returnNote, setReturnNote] = useState("");
  const [escalateDamage, setEscalateDamage] = useState(false);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Direct Date Edit State
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>("");

  const todayStr = new Date().toISOString().split("T")[0];

  const activeLoans = useMemo(() => {
    return loans.filter((l) => l.lifecycleStatus === "ACTIVE");
  }, [loans]);

  const filteredLoans = useMemo(() => {
    return activeLoans.filter((loan) => {
      const isOverdue = loan.dueStatus === "OVERDUE" || isDatePast(loan.dueDate);
      const isDueToday = loan.dueDate === todayStr;

      if (filterTab === "OVERDUE" && !isOverdue) return false;
      if (filterTab === "DUE_TODAY" && !isDueToday) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchUser = loan.userName.toLowerCase().includes(q);
        const matchItem = loan.items.some((i) => i.itemName.toLowerCase().includes(q));
        const matchSerial = loan.items.some((i) =>
          (i.serialNumbers || []).some((s) => s.toLowerCase().includes(q))
        );
        if (!matchUser && !matchItem && !matchSerial) return false;
      }
      return true;
    });
  }, [activeLoans, filterTab, search, todayStr]);

  const overdueCount = activeLoans.filter(
    (l) => l.dueStatus === "OVERDUE" || isDatePast(l.dueDate)
  ).length;
  const dueTodayCount = activeLoans.filter((l) => l.dueDate === todayStr).length;

  const openReturnInspection = (loan: LoanRecord) => {
    setReturnCondition("GOOD");
    setReturnNote("");
    setEscalateDamage(false);
    setActiveReturnLoan(loan);
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReturnLoan) return;

    try {
      setIsSubmittingReturn(true);
      await returnMutation.mutateAsync({
        payload: {
          loanId: activeReturnLoan.id,
          items: activeReturnLoan.items.map((item) => ({
            lineItemId: item.id,
            returnedQuantity:
              item.borrowedQuantity - (item.returnedQuantity || 0) - item.lostQuantity,
            ...(item.assetIds
              ? {
                  assetIds: item.assetIds.filter(
                    (id) => !(item.resolvedAssetIds ?? []).includes(id)
                  ),
                }
              : {}),
            condition: returnCondition,
            notes: returnNote,
            escalateIncident: returnCondition === "DAMAGED" && escalateDamage,
          })),
          inspectionNotes: returnNote,
        },
        actorUserId: currentPersona.id,
      });

      setActiveReturnLoan(null);
      setReturnNote("");
      setEscalateDamage(false);
      refetch();
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleSaveDate = async (loanId: string) => {
    if (!newDueDate) return;
    await updateDueDateMutation.mutateAsync({
      loanId,
      dueDate: newDueDate,
      actorUserId: currentPersona.id,
    });
    setEditingLoanId(null);
    setNewDueDate("");
    refetch();
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <LoadingState message="Loading borrowed equipment..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Borrowed Equipment</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          See who currently has what and process physical returns.
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={filterTab === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTab("ALL")}
            className="text-xs h-9"
          >
            All Active ({activeLoans.length})
          </Button>
          <Button
            type="button"
            variant={filterTab === "DUE_TODAY" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTab("DUE_TODAY")}
            className="text-xs h-9"
          >
            Due Today ({dueTodayCount})
          </Button>
          <Button
            type="button"
            variant={filterTab === "OVERDUE" ? "destructive" : "outline"}
            size="sm"
            onClick={() => setFilterTab("OVERDUE")}
            className="text-xs h-9"
          >
            Overdue ({overdueCount})
          </Button>
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            placeholder="Search student, item, serial..."
          />
        </div>
      </div>

      {/* List of Borrowed Equipment */}
      {filteredLoans.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
          No borrowed equipment matches your filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLoans.map((loan) => {
            const isOverdue = loan.dueStatus === "OVERDUE" || isDatePast(loan.dueDate);
            const isEditingThis = editingLoanId === loan.id;

            return (
              <div
                key={loan.id}
                className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{loan.userName}</span>
                    <span className="text-xs text-muted-foreground">• {loan.userEmail}</span>
                  </div>

                  <div className="text-xs font-medium text-foreground">
                    {loan.items.map((i) => (
                      <span key={i.id} className="inline-block mr-3">
                        {i.itemName} <span className="font-bold">×{i.borrowedQuantity}</span>
                        {i.serialNumbers && i.serialNumbers.length > 0 && (
                          <span className="ml-1 text-[11px] text-muted-foreground font-mono">
                            ({i.serialNumbers.join(", ")})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Due Date & Direct Edit */}
                  <div className="flex items-center gap-2 text-xs">
                    {isEditingThis ? (
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="date"
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                          className="px-2 py-0.5 border border-input rounded text-xs bg-background text-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveDate(loan.id)}
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingLoanId(null)}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span
                          className={
                            isOverdue ? "text-destructive font-bold" : "text-muted-foreground"
                          }
                        >
                          Expected return: {formatDate(loan.dueDate)}
                          {isOverdue && " (Overdue)"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLoanId(loan.id);
                            setNewDueDate(loan.dueDate);
                          }}
                          className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit date</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Return Action */}
                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => {
                      openReturnInspection(loan);
                      setReturnCondition("GOOD");
                      setReturnNote("");
                    }}
                    className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Return</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fast Return Dialog Modal */}
      {activeReturnLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-base font-bold text-foreground">Confirm Return</h2>
              <button
                type="button"
                onClick={() => setActiveReturnLoan(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <span className="text-muted-foreground">Borrower:</span>{" "}
              <span className="font-bold text-foreground">{activeReturnLoan.userName}</span>
              <div className="pt-1 text-foreground font-medium">
                {activeReturnLoan.items
                  .map((i) => `${i.itemName} ×${i.borrowedQuantity}`)
                  .join(", ")}
              </div>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Condition of Returned Equipment:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-background cursor-pointer font-medium hover:border-primary">
                    <input
                      type="radio"
                      name="condition"
                      value="GOOD"
                      checked={returnCondition === "GOOD"}
                      onChange={() => setReturnCondition("GOOD")}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Good / Working</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-background cursor-pointer font-medium hover:border-primary">
                    <input
                      type="radio"
                      name="condition"
                      value="MINOR_ISSUE"
                      checked={returnCondition === "MINOR_ISSUE"}
                      onChange={() => setReturnCondition("MINOR_ISSUE")}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Needs attention</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-background cursor-pointer font-medium hover:border-primary">
                    <input
                      type="radio"
                      name="condition"
                      value="DAMAGED"
                      checked={returnCondition === "DAMAGED"}
                      onChange={() => setReturnCondition("DAMAGED")}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Damaged</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-background cursor-pointer font-medium hover:border-primary">
                    <input
                      type="radio"
                      name="condition"
                      value="LOST"
                      checked={returnCondition === "LOST"}
                      onChange={() => setReturnCondition("LOST")}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Lost</span>
                  </label>
                </div>
              </div>

              {returnCondition === "DAMAGED" && (
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={escalateDamage}
                    onChange={(event) => setEscalateDamage(event.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    Create a damage incident for operator review. This does not issue or recommend a
                    strike.
                  </span>
                </label>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Optional Note:
                </label>
                <textarea
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Notes about connector, pins, test behavior..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveReturnLoan(null)}
                  className="flex-1 text-xs h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="flex-1 text-xs h-10 font-bold"
                >
                  {isSubmittingReturn ? "Processing..." : "Confirm Return"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
