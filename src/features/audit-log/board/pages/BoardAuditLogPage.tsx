import React, { useState, useMemo } from "react";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useBoardAuditLog } from "../hooks/useBoardAuditLog";
import { ScrollText, Search, Eye } from "lucide-react";

export const BoardAuditLogPage: React.FC = () => {
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const { data: events = [], isLoading } = useBoardAuditLog();

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (actionFilter !== "ALL" && !evt.action.startsWith(actionFilter)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchReason = evt.reason?.toLowerCase().includes(q) || false;
        const matchActor =
          evt.actorUserId.toLowerCase().includes(q) || evt.actorName.toLowerCase().includes(q);
        const matchTarget = evt.entityId.toLowerCase().includes(q);
        const matchAction = evt.action.toLowerCase().includes(q);
        if (!matchReason && !matchActor && !matchTarget && !matchAction) return false;
      }
      return true;
    });
  }, [events, actionFilter, searchQuery]);

  if (isLoading) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading system audit log records..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="System Audit Log"
        description="Immutable chronological record of administrative logistics actions, physical inventory balance mutations, clearance assignments, and disciplinary decisions."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto text-xs">
          <Button
            size="sm"
            variant={actionFilter === "ALL" ? "default" : "outline"}
            onClick={() => setActionFilter("ALL")}
            className="h-8 text-xs"
          >
            All Events ({events.length})
          </Button>
          <Button
            size="sm"
            variant={actionFilter === "REQUEST" ? "default" : "outline"}
            onClick={() => setActionFilter("REQUEST")}
            className="h-8 text-xs"
          >
            Requests
          </Button>
          <Button
            size="sm"
            variant={actionFilter === "RETURN" ? "default" : "outline"}
            onClick={() => setActionFilter("RETURN")}
            className="h-8 text-xs"
          >
            Returns
          </Button>
          <Button
            size="sm"
            variant={
              actionFilter === "STOCK" || actionFilter === "INVENTORY" ? "default" : "outline"
            }
            onClick={() => setActionFilter("INVENTORY")}
            className="h-8 text-xs"
          >
            Stock Mutations
          </Button>
          <Button
            size="sm"
            variant={actionFilter === "STRIKE" ? "default" : "outline"}
            onClick={() => setActionFilter("STRIKE")}
            className="h-8 text-xs text-destructive"
          >
            Strikes
          </Button>
          <Button
            size="sm"
            variant={
              actionFilter === "USER" || actionFilter === "CLEARANCE" ? "default" : "outline"
            }
            onClick={() => setActionFilter("USER")}
            className="h-8 text-xs text-primary"
          >
            Clearances
          </Button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by action, actor, target ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
            <ScrollText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No audit events found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your action type or search term.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Reason / Details</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEvents.map((evt) => {
                    const isSelected = selectedEventId === evt.id;

                    return (
                      <React.Fragment key={evt.id}>
                        <tr
                          className={`hover:bg-accent/40 transition-colors ${
                            isSelected ? "bg-accent/60" : ""
                          }`}
                        >
                          <td className="py-3 px-4 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                            {new Date(evt.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono">
                              {evt.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">
                            <div className="font-semibold text-foreground">
                              {evt.actorName || evt.actorUserId}
                            </div>
                            <div className="text-[10px]">{evt.actorRole}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">
                            <span className="text-[10px] font-semibold text-foreground">
                              {evt.entityType}:
                            </span>{" "}
                            {evt.entityId}
                          </td>
                          <td className="py-3 px-4 font-medium text-foreground">
                            {evt.reason || "-"}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedEventId(isSelected ? null : evt.id)}
                              className="h-7 px-2 text-xs"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              <span>{isSelected ? "Hide" : "Inspect"}</span>
                            </Button>
                          </td>
                        </tr>
                        {isSelected && Boolean(evt.before || evt.after) && (
                          <tr className="bg-muted/30">
                            <td colSpan={6} className="py-3 px-4">
                              <div className="p-3 rounded-lg bg-card border border-border text-xs font-mono">
                                <div className="text-[10px] font-semibold text-muted-foreground mb-1">
                                  Raw Event Payload ({evt.id}):
                                </div>
                                <pre className="text-[11px] text-foreground overflow-x-auto">
                                  {JSON.stringify(
                                    { before: evt.before, after: evt.after },
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
