import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useBoardUsers } from "../hooks/useBoardUsers";
import { useBoardLoans } from "@/features/loans/board/hooks/useBoardLoans";
import { LoadingState } from "@/components/shared/LoadingState";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";

export const BoardPeoplePage: React.FC = () => {
  const { data: users = [], isLoading } = useBoardUsers();
  const { data: loans = [] } = useBoardLoans();
  const [search, setSearch] = useState("");

  const activeLoansByUser = useMemo(() => {
    const map: Record<string, number> = {};
    loans.forEach((loan) => {
      if (loan.lifecycleStatus === "ACTIVE") {
        const count = loan.items.reduce((s, i) => s + i.borrowedQuantity, 0);
        map[loan.userId] = (map[loan.userId] || 0) + count;
      }
    });
    return map;
  }, [loans]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.affiliation && u.affiliation.toLowerCase().includes(q))
      );
    });
  }, [users, search]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingState message="Loading borrower directory..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">People</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Member roster, active borrowing status, and contacts.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            placeholder="Search students..."
          />
        </div>
      </div>

      <div className="space-y-2.5">
        {filteredUsers.map((u) => {
          const itemsOut = activeLoansByUser[u.id] || 0;
          const isRestricted = (u.strikesCount || 0) >= 4 || u.status === "BANNED";

          return (
            <div
              key={u.id}
              className="p-3.5 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground truncate">{u.name}</span>
                    <span className="text-[11px] font-medium text-muted-foreground px-2 py-0.5 rounded bg-muted">
                      {u.affiliation || "IEEE"}
                    </span>
                  </div>
                  <span className="text-muted-foreground block truncate">{u.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span
                    className={`font-bold block ${
                      itemsOut > 0 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {itemsOut} {itemsOut === 1 ? "item" : "items"} out
                  </span>
                  {isRestricted ? (
                    <span className="text-[10px] font-semibold text-destructive">Restricted</span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-medium">Active</span>
                  )}
                </div>

                <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                  <Link to={`/board/users/${u.id}`}>Details</Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
