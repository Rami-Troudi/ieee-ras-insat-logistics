import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useBoardActionCenter } from "../hooks/useActionCenter";
import {
  Clock,
  AlertTriangle,
  ClipboardList,
  UserCheck,
  RotateCcw,
  ArrowRight,
  Search,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export const BoardActionCenterPage: React.FC = () => {
  const { actions, isLoading } = useBoardActionCenter();
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const counts = useMemo(() => {
    return {
      all: actions.length,
      strikes: actions.filter(
        (a) => a.type === "DISCIPLINARY_RECOMMENDATION" || a.type === "INCIDENT_OPEN"
      ).length,
      overdue: actions.filter((a) => a.type === "LOAN_OVERDUE").length,
      returns: actions.filter((a) => a.type === "RETURN_PENDING").length,
      extensions: actions.filter((a) => a.type === "EXTENSION_PENDING").length,
      requests: actions.filter(
        (a) => a.type === "REQUEST_PENDING" || a.type === "REQUEST_AWAITING_HANDOVER"
      ).length,
      accounts: actions.filter((a) => a.type === "USER_UNPROCESSED").length,
    };
  }, [actions]);

  const filteredActions = useMemo(() => {
    return actions.filter((item) => {
      if (
        selectedType === "STRIKES" &&
        item.type !== "DISCIPLINARY_RECOMMENDATION" &&
        item.type !== "INCIDENT_OPEN"
      )
        return false;
      if (selectedType === "OVERDUE" && item.type !== "LOAN_OVERDUE") return false;
      if (selectedType === "RETURNS" && item.type !== "RETURN_PENDING") return false;
      if (selectedType === "EXTENSIONS" && item.type !== "EXTENSION_PENDING") return false;
      if (
        selectedType === "REQUESTS" &&
        item.type !== "REQUEST_PENDING" &&
        item.type !== "REQUEST_AWAITING_HANDOVER"
      )
        return false;
      if (selectedType === "ACCOUNTS" && item.type !== "USER_UNPROCESSED") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchId = item.entityId.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchId) return false;
      }
      return true;
    });
  }, [actions, selectedType, searchQuery]);

  if (isLoading) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading logistics action center queue..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="Logistics Action Center"
        description="Unified operational triage queue. Prioritized by real-time domain urgency to prevent supply bottlenecks and enforce policy."
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="default">
              <Link to="/board/requests">Review All Requests ({counts.requests})</Link>
            </Button>
          </div>
        }
      />

      {/* Metric Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setSelectedType(selectedType === "STRIKES" ? "ALL" : "STRIKES")}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedType === "STRIKES"
              ? "border-destructive bg-destructive/10 ring-2 ring-destructive"
              : "border-destructive/30 bg-destructive/5 hover:border-destructive/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-destructive tracking-wider">
              Strikes & Inc.
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
          </div>
          <span className="text-xl font-bold text-destructive block mt-1">{counts.strikes}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Critical Sanctions</p>
        </button>

        <button
          onClick={() => setSelectedType(selectedType === "OVERDUE" ? "ALL" : "OVERDUE")}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedType === "OVERDUE"
              ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500"
              : "border-border bg-card hover:border-amber-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-amber-600 tracking-wider">
              Overdue
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-xl font-bold text-foreground block mt-1">{counts.overdue}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Past Due Date</p>
        </button>

        <button
          onClick={() => setSelectedType(selectedType === "RETURNS" ? "ALL" : "RETURNS")}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedType === "RETURNS"
              ? "border-secondary bg-secondary/10 ring-2 ring-secondary"
              : "border-border bg-card hover:border-secondary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-secondary-foreground tracking-wider">
              Returns
            </span>
            <RotateCcw className="w-3.5 h-3.5 text-secondary" />
          </div>
          <span className="text-xl font-bold text-foreground block mt-1">{counts.returns}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Physical Intake</p>
        </button>

        <button
          onClick={() => setSelectedType(selectedType === "EXTENSIONS" ? "ALL" : "EXTENSIONS")}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedType === "EXTENSIONS"
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
          <p className="text-[10px] text-muted-foreground mt-0.5">Time Extensions</p>
        </button>

        <button
          onClick={() => setSelectedType(selectedType === "REQUESTS" ? "ALL" : "REQUESTS")}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedType === "REQUESTS"
              ? "border-primary bg-primary/10 ring-2 ring-primary"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
              Requests
            </span>
            <ClipboardList className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground block mt-1">{counts.requests}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Pending Review</p>
        </button>

        <button
          onClick={() => setSelectedType(selectedType === "ACCOUNTS" ? "ALL" : "ACCOUNTS")}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedType === "ACCOUNTS"
              ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500"
              : "border-border bg-card hover:border-emerald-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-emerald-600 tracking-wider">
              Accounts
            </span>
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-xl font-bold text-foreground block mt-1">{counts.accounts}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">New Registrations</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <Button
            size="sm"
            variant={selectedType === "ALL" ? "default" : "outline"}
            onClick={() => setSelectedType("ALL")}
            className="h-8 text-xs"
          >
            All Items ({counts.all})
          </Button>
          <Button
            size="sm"
            variant={selectedType === "STRIKES" ? "default" : "outline"}
            onClick={() => setSelectedType("STRIKES")}
            className="h-8 text-xs"
          >
            Strikes & Inc. ({counts.strikes})
          </Button>
          <Button
            size="sm"
            variant={selectedType === "OVERDUE" ? "default" : "outline"}
            onClick={() => setSelectedType("OVERDUE")}
            className="h-8 text-xs"
          >
            Overdue ({counts.overdue})
          </Button>
          <Button
            size="sm"
            variant={selectedType === "RETURNS" ? "default" : "outline"}
            onClick={() => setSelectedType("RETURNS")}
            className="h-8 text-xs"
          >
            Returns ({counts.returns})
          </Button>
          <Button
            size="sm"
            variant={selectedType === "EXTENSIONS" ? "default" : "outline"}
            onClick={() => setSelectedType("EXTENSIONS")}
            className="h-8 text-xs"
          >
            Extensions ({counts.extensions})
          </Button>
          <Button
            size="sm"
            variant={selectedType === "REQUESTS" ? "default" : "outline"}
            onClick={() => setSelectedType("REQUESTS")}
            className="h-8 text-xs"
          >
            Requests ({counts.requests})
          </Button>
          <Button
            size="sm"
            variant={selectedType === "ACCOUNTS" ? "default" : "outline"}
            onClick={() => setSelectedType("ACCOUNTS")}
            className="h-8 text-xs"
          >
            Accounts ({counts.accounts})
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search action queue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>
      </div>

      {/* Action Queue List */}
      <div className="space-y-3 pt-2">
        {filteredActions.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">Action queue is clear</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No immediate items requiring board operational triage for the selected criteria.
            </p>
          </div>
        ) : (
          filteredActions.map((action) => {
            const isCritical = action.priority === "CRITICAL";
            const isHigh = action.priority === "HIGH";
            const isMedium = action.priority === "MEDIUM";

            const urgencyBg = isCritical
              ? "border-destructive/40 bg-destructive/5 hover:border-destructive"
              : isHigh
                ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500"
                : isMedium
                  ? "border-secondary/40 bg-secondary/5 hover:border-secondary"
                  : "border-border bg-card hover:border-primary/40";

            return (
              <div
                key={action.id}
                className={`p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${urgencyBg}`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isCritical
                          ? "bg-destructive text-destructive-foreground"
                          : isHigh
                            ? "bg-amber-500 text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {action.priority}
                    </span>
                    {action.badgeLabel && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {action.badgeLabel}
                      </span>
                    )}
                    <span className="text-xs font-mono text-muted-foreground font-semibold">
                      {action.entityId}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(action.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-foreground truncate">{action.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{action.description}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button asChild variant="default" size="sm" className="h-8 gap-1.5 text-xs">
                    <Link to={action.route}>
                      <span>Process Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </PageContainer>
  );
};
