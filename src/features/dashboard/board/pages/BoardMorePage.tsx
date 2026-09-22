import React from "react";
import { Link } from "react-router-dom";
import {
  FolderGit2,
  BarChart3,
  CheckCircle2,
  Download,
  AlertTriangle,
  ScrollText,
  ArrowRight,
} from "lucide-react";

export const BoardMorePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">More Operations</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Projects, inventory audits, telemetry insights, and administration.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Operations & Audits */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Logistics Tools
          </h2>
          <div className="space-y-1">
            <Link
              to="/board/projects"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium text-foreground"
            >
              <div className="flex items-center gap-3">
                <FolderGit2 className="w-4 h-4 text-primary" />
                <span>Projects</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <Link
              to="/board/insights"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium text-foreground"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 text-secondary" />
                <span>Insights & Analytics</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <Link
              to="/board/audits"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium text-foreground"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Physical Inventory Audits</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <Link
              to="/board/exports"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium text-foreground"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Data Exports</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Administration */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Administration
          </h2>
          <div className="space-y-1">
            <Link
              to="/board/incidents"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium text-foreground"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span>Incidents & Sanctions</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <Link
              to="/board/audit-log"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium text-foreground"
            >
              <div className="flex items-center gap-3">
                <ScrollText className="w-4 h-4 text-muted-foreground" />
                <span>Administrative Audit Log</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
