import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useBoardRequests } from "../hooks/useBoardRequests";
import { Search, Eye, PackageCheck, Clock, Calendar } from "lucide-react";
import { getRequestDisplayStatus } from "@/types";

export const BoardRequestsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: requests = [], isLoading } = useBoardRequests();

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Status filter
      if (statusFilter === "PENDING" && req.decisionStatus !== "PENDING") return false;
      if (
        statusFilter === "APPROVED" &&
        ((req.decisionStatus !== "APPROVED" && req.decisionStatus !== "PARTIALLY_APPROVED") ||
          req.handoverStatus === "HANDED_OVER")
      )
        return false;
      if (statusFilter === "HANDED_OVER" && req.handoverStatus !== "HANDED_OVER") return false;
      if (statusFilter === "REJECTED" && req.decisionStatus !== "REJECTED") return false;
      if (statusFilter === "EXPIRED" && req.lifecycleStatus !== "EXPIRED") return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = req.id.toLowerCase().includes(q);
        const matchMember =
          req.userName.toLowerCase().includes(q) || req.userEmail.toLowerCase().includes(q);
        const matchProject = req.projectName?.toLowerCase().includes(q) || false;
        const matchItems = (req.items || []).some((i) => i.itemName.toLowerCase().includes(q));
        if (!matchId && !matchMember && !matchProject && !matchItems) return false;
      }

      return true;
    });
  }, [requests, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter((r) => r.decisionStatus === "PENDING").length,
      approved: requests.filter(
        (r) =>
          (r.decisionStatus === "APPROVED" || r.decisionStatus === "PARTIALLY_APPROVED") &&
          r.handoverStatus !== "HANDED_OVER"
      ).length,
      handedOver: requests.filter((r) => r.handoverStatus === "HANDED_OVER").length,
      rejected: requests.filter((r) => r.decisionStatus === "REJECTED").length,
      expired: requests.filter((r) => r.lifecycleStatus === "EXPIRED").length,
    };
  }, [requests]);

  if (isLoading) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading borrow requests queue..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="Borrow Requests & Approvals"
        description="Review member loan applications, perform line-item approvals, reserve stock for 48h handover, and register physical checkouts."
      />

      {/* Filter Tabs and Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <Button
            size="sm"
            variant={statusFilter === "ALL" ? "default" : "outline"}
            onClick={() => setStatusFilter("ALL")}
            className="h-8 text-xs"
          >
            All ({counts.all})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "PENDING" ? "default" : "outline"}
            onClick={() => setStatusFilter("PENDING")}
            className="h-8 text-xs font-semibold text-primary"
          >
            Pending Review ({counts.pending})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "APPROVED" ? "default" : "outline"}
            onClick={() => setStatusFilter("APPROVED")}
            className="h-8 text-xs text-secondary-foreground"
          >
            Ready Handover ({counts.approved})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "HANDED_OVER" ? "default" : "outline"}
            onClick={() => setStatusFilter("HANDED_OVER")}
            className="h-8 text-xs text-emerald-600"
          >
            Handed Over ({counts.handedOver})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "REJECTED" ? "default" : "outline"}
            onClick={() => setStatusFilter("REJECTED")}
            className="h-8 text-xs text-destructive"
          >
            Rejected ({counts.rejected})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "EXPIRED" ? "default" : "outline"}
            onClick={() => setStatusFilter("EXPIRED")}
            className="h-8 text-xs text-muted-foreground"
          >
            Expired ({counts.expired})
          </Button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, member, item, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
            <PackageCheck className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No requests found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              No borrow requests matching the current status filter and search term.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Borrower & Clearance</th>
                    <th className="py-3 px-4">Project / Purpose</th>
                    <th className="py-3 px-4">Requested Items</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRequests.map((req) => {
                    const totalQty = (req.items || []).reduce(
                      (acc, i) => acc + (i.requestedQuantity || 0),
                      0
                    );
                    const itemNames = (req.items || [])
                      .map((i) => `${i.itemName} (x${i.requestedQuantity})`)
                      .join(", ");

                    return (
                      <tr key={req.id} className="hover:bg-accent/40 transition-colors group">
                        <td className="py-3 px-4 font-mono font-medium text-foreground whitespace-nowrap">
                          {req.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{req.userName}</div>
                          <div className="text-[11px] text-muted-foreground">
                            Clearance: Level {req.userClearance}
                          </div>
                          {req.scheduledPickup && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 w-fit">
                              <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>
                                Pickup: {new Date(req.scheduledPickup).toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                                {new Date(req.scheduledPickup).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          )}
                          {req.borrowerPickupAvailability && !req.scheduledPickup && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 w-fit">
                              <Clock className="w-3 h-3 text-primary" />
                              <span>Avail: {req.borrowerPickupAvailability}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-[200px]">
                          <div className="font-medium text-foreground truncate">
                            {req.projectName || "General Project"}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {req.purpose || "No specific purpose provided"}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-[250px]">
                          <div className="font-medium text-foreground truncate" title={itemNames}>
                            {itemNames}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {(req.items || []).length} item line
                            {(req.items || []).length !== 1 ? "s" : ""} · {totalQty} unit
                            {totalQty !== 1 ? "s" : ""}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={getRequestDisplayStatus(req)} />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1">
                            <Link to={`/board/requests/${req.id}`}>
                              <Eye className="w-3.5 h-3.5" />
                              <span>{req.decisionStatus === "PENDING" ? "Review" : "View"}</span>
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
