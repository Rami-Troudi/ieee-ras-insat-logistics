import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useBoardUsers } from "../hooks/useBoardUsers";
import { Users, Search, Eye } from "lucide-react";

export const BoardUsersPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users = [], isLoading } = useBoardUsers();

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const userStatus = u.status || u.accountStatus || "ACTIVE";
      if (statusFilter !== "ALL" && userStatus !== statusFilter) return false;
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const displayName = (u.name || u.fullName || "").toLowerCase();
        const matchName = displayName.includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchId = u.id.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchId) return false;
      }
      return true;
    });
  }, [users, statusFilter, roleFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: users.length,
      pending: users.filter((u) => (u.status || u.accountStatus) === "PENDING" || !u.isProcessed)
        .length,
      active: users.filter((u) => (u.status || u.accountStatus) === "ACTIVE").length,
      restricted: users.filter((u) => (u.status || u.accountStatus) === "RESTRICTED").length,
      banned: users.filter((u) => (u.status || u.accountStatus) === "BANNED" || u.isBanned).length,
    };
  }, [users]);

  if (isLoading) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading registered users and clearances..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="User Accounts & Clearances"
        description="Verify member affiliations (IEEE RAS / Aerobotix), approve pending registrations, review disciplinary standing, and manage clearance levels."
      />

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto text-xs">
          <Button
            size="sm"
            variant={statusFilter === "ALL" ? "default" : "outline"}
            onClick={() => setStatusFilter("ALL")}
            className="h-8 text-xs"
          >
            All Users ({counts.all})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "PENDING" ? "default" : "outline"}
            onClick={() => setStatusFilter("PENDING")}
            className="h-8 text-xs text-primary font-semibold"
          >
            Pending Approval ({counts.pending})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "ACTIVE" ? "default" : "outline"}
            onClick={() => setStatusFilter("ACTIVE")}
            className="h-8 text-xs"
          >
            Active ({counts.active})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "RESTRICTED" ? "default" : "outline"}
            onClick={() => setStatusFilter("RESTRICTED")}
            className="h-8 text-xs text-amber-600"
          >
            Restricted ({counts.restricted})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "BANNED" ? "default" : "outline"}
            onClick={() => setStatusFilter("BANNED")}
            className="h-8 text-xs text-destructive"
          >
            Banned ({counts.banned})
          </Button>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
          <span className="text-muted-foreground text-[11px] font-semibold uppercase">Role:</span>
          {(["ALL", "MEMBER", "BOARD", "SUPERADMIN"] as const).map((r) => (
            <Button
              key={r}
              size="sm"
              variant={roleFilter === r ? "secondary" : "ghost"}
              onClick={() => setRoleFilter(r)}
              className="h-7 px-2 text-xs"
            >
              {r}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search user by name, email, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No users found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              No accounts matching the selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Member Name & Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Clearance Level</th>
                    <th className="py-3 px-4">Affiliation Status</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Strikes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => {
                    const userStatus = user.status || user.accountStatus || "ACTIVE";
                    const isBanned = user.isBanned || userStatus === "BANNED";
                    const isPending = userStatus === "PENDING" || !user.isProcessed;
                    const strikeTotal = user.strikesCount ?? user.strikeCount ?? 0;
                    const displayName = user.name || user.fullName || user.id;

                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-accent/40 transition-colors ${
                          isPending ? "bg-primary/5" : isBanned ? "bg-destructive/5" : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{displayName}</div>
                          <div className="text-[11px] text-muted-foreground">{user.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              user.role === "SUPERADMIN"
                                ? "bg-purple-100 text-purple-800 border border-purple-300"
                                : user.role === "BOARD"
                                  ? "bg-secondary text-secondary-foreground"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-primary">
                            Level {user.clearance || user.clearanceLevel || "I"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">
                            {user.affiliation ||
                              user.verifiedAffiliation ||
                              user.claimedAffiliation ||
                              "INSAT Student"}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {user.isProcessed ? "✓ Verified" : "Claimed (Unverified)"}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={userStatus} />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-semibold">
                          <span
                            className={
                              strikeTotal > 0 ? "text-destructive font-bold" : "text-emerald-600"
                            }
                          >
                            {strikeTotal} strike{strikeTotal !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1">
                            <Link to={`/board/users/${user.id}`}>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Manage</span>
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
