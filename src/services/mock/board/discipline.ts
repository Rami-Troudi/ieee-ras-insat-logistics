import {
  IBoardDisciplineService,
  CreateIncidentPayload,
  IssueStrikePayload,
  RecordCompensationPayload,
  UpdateCompensationStatusPayload,
} from "@/services/contracts/board/discipline";
import {
  IncidentRecord,
  DisciplinaryRecommendation,
  StrikeRecord,
  CompensationRecord,
} from "@/types";
import { mockDb } from "@/mocks/db";
import { mockBoardAuditLogService } from "./audit-log";
import {
  refreshStrikeDerivedProfile,
  requireOperatorInDraft,
  requireSuperadminInDraft,
} from "../authorization";
import { buildSemesterConfigs } from "@/mocks/seed/semesters";

class MockBoardDisciplineService implements IBoardDisciplineService {
  private async simulateLatency(): Promise<void> {
    await new Promise((res) => setTimeout(res, 50));
  }

  async getRecommendations(status?: string): Promise<DisciplinaryRecommendation[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    let recs = [...snapshot.recommendations];
    if (status && status !== "ALL") {
      recs = recs.filter((r) => r.status === status);
    }
    return recs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async reviewRecommendation(
    recommendationId: string,
    action: "APPLY" | "DISMISS",
    decisionNotes: string,
    actorUserId: string,
    _actorRole: string
  ): Promise<DisciplinaryRecommendation> {
    await this.simulateLatency();
    let updatedRec: DisciplinaryRecommendation | null = null;

    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      const rec = draft.recommendations.find((r) => r.id === recommendationId);
      if (!rec) throw new Error("Recommendation not found");

      rec.status = action === "APPLY" ? "APPLIED" : "DISMISSED";
      rec.decisionNotes = decisionNotes;
      rec.reviewedAt = new Date().toISOString();
      rec.reviewedBy = actor.name;

      updatedRec = { ...rec };
    });

    if (updatedRec) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "",
        actorRole: "OPERATOR",
        action: `RECOMMENDATION_${action}`,
        entityType: "INCIDENT",
        entityId: recommendationId,
        after: updatedRec,
        reason: decisionNotes,
      });

      return updatedRec;
    }
    throw new Error("Failed to review recommendation");
  }

  async getIncidents(filters?: {
    status?: string;
    category?: string;
    userId?: string;
  }): Promise<IncidentRecord[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    let incidents = [...snapshot.incidents];

    if (filters?.status && filters.status !== "ALL") {
      incidents = incidents.filter((i) => i.status === filters.status);
    }
    if (filters?.category && filters.category !== "ALL") {
      incidents = incidents.filter((i) => i.category === filters.category);
    }
    if (filters?.userId) {
      incidents = incidents.filter((i) => i.userId === filters.userId);
    }

    return incidents.sort(
      (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    );
  }

  async getIncidentById(incidentId: string): Promise<IncidentRecord | null> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    const incident = snapshot.incidents.find((i) => i.id === incidentId);
    return incident ? { ...incident } : null;
  }

  async createIncident(
    payload: CreateIncidentPayload,
    actorUserId: string,
    _actorRole: string
  ): Promise<IncidentRecord> {
    await this.simulateLatency();
    let newIncident: IncidentRecord | null = null;

    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      const user = draft.userProfiles[payload.userId];
      if (!user) throw new Error("User not found");
      const userName = user.name;

      newIncident = {
        id: `inc-2026-${String(draft.incidents.length + 1).padStart(4, "0")}`,
        userId: payload.userId,
        userName,
        title: payload.title,
        description: payload.description,
        severity: payload.severity,
        status: "OPEN",
        category: payload.category,
        relatedLoanId: payload.relatedLoanId,
        relatedItemId: payload.relatedItemId,
        reportedBy: actorUserId,
        reportedByName: actor.name,
        reportedAt: new Date().toISOString(),
      };

      draft.incidents.unshift(newIncident);
    });

    if (newIncident) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "",
        actorRole: "OPERATOR",
        action: "INCIDENT_CREATED",
        entityType: "INCIDENT",
        entityId: (newIncident as IncidentRecord).id,
        after: newIncident,
        reason: payload.title,
      });

      return newIncident;
    }
    throw new Error("Failed to create incident");
  }

  async resolveIncident(
    incidentId: string,
    resolutionNotes: string,
    actorUserId: string,
    _actorRole: string
  ): Promise<IncidentRecord> {
    await this.simulateLatency();
    let resolvedIncident: IncidentRecord | null = null;

    mockDb.mutate((draft) => {
      requireOperatorInDraft(draft, actorUserId);
      const inc = draft.incidents.find((i) => i.id === incidentId);
      if (!inc) throw new Error("Incident not found");

      inc.status = "RESOLVED";
      inc.resolutionNotes = resolutionNotes;

      resolvedIncident = { ...inc };
    });

    if (resolvedIncident) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "",
        actorRole: "OPERATOR",
        action: "INCIDENT_RESOLVED",
        entityType: "INCIDENT",
        entityId: incidentId,
        after: resolvedIncident,
        reason: resolutionNotes,
      });

      return resolvedIncident;
    }
    throw new Error("Failed to resolve incident");
  }

  async getStrikes(userId?: string): Promise<StrikeRecord[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    let strikes = [...snapshot.strikes];
    if (userId) {
      strikes = strikes.filter((s) => s.userId === userId);
    }
    const now = Date.now();
    return strikes
      .map((strike) =>
        strike.status === "ACTIVE" && strike.expiresAt && Date.parse(strike.expiresAt) <= now
          ? { ...strike, status: "EXPIRED" as const }
          : strike
      )
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }

  async issueStrike(
    payload: IssueStrikePayload,
    actorUserId: string,
    _actorRole: string
  ): Promise<StrikeRecord> {
    await this.simulateLatency();
    let newStrike: StrikeRecord | null = null;

    mockDb.mutate((draft) => {
      if (!Number.isInteger(payload.level) || payload.level < 1 || payload.level > 5)
        throw new Error("Strike level must be between 1 and 5");
      const actor =
        payload.level === 5
          ? requireSuperadminInDraft(draft, actorUserId)
          : requireOperatorInDraft(draft, actorUserId);

      const user = draft.userProfiles[payload.userId];
      if (!user) throw new Error("User not found");

      const nowIso = new Date().toISOString();
      let currentSemester = draft.semesters.find(
        (semester) =>
          Date.parse(semester.startDate) <= Date.parse(nowIso) &&
          Date.parse(semester.endDate) >= Date.parse(nowIso)
      );
      if (!currentSemester) {
        draft.semesters = buildSemesterConfigs(new Date(nowIso));
        currentSemester = draft.semesters.find(
          (semester) =>
            Date.parse(semester.startDate) <= Date.parse(nowIso) &&
            Date.parse(semester.endDate) >= Date.parse(nowIso)
        );
      }
      const semesterEnd = currentSemester?.endDate;
      if (payload.level < 5 && !semesterEnd)
        throw new Error("Current semester dates are not configured");

      const strikeId = `strk-${crypto.randomUUID()}`;
      newStrike = {
        id: strikeId,
        userId: payload.userId,
        userName: user.name,
        level: payload.level,
        status: "ACTIVE",
        reason: payload.reason,
        incidentId: payload.incidentId,
        issuedBy: actorUserId,
        issuedByName: actor.name,
        issuedAt: nowIso,
        expiresAt: payload.level === 5 ? undefined : semesterEnd, // Strike 5 does not expire
        notes: payload.notes,
      };

      draft.strikes.unshift(newStrike);

      if (!user.strikes) user.strikes = [];
      user.strikes.push({
        id: strikeId,
        date: nowIso,
        reason: payload.reason,
        severity:
          payload.level === 1 ? "WARNING" : payload.level <= 3 ? "RESTRICTION" : "SUSPENSION",
        resolved: false,
        level: payload.level,
      });

      refreshStrikeDerivedProfile(draft, user.id);

      // Notify Member
      draft.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: user.id,
        title: `Disciplinary Strike ${payload.level} Issued`,
        message: `A disciplinary Strike ${payload.level} has been recorded on your logistics account. Reason: ${payload.reason}`,
        type: "STRIKE_ISSUED",
        read: false,
        link: `/app/profile`,
        createdAt: nowIso,
      });
    });

    if (newStrike) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "",
        actorRole: "OPERATOR",
        action: "STRIKE_ISSUED",
        entityType: "STRIKE",
        entityId: (newStrike as StrikeRecord).id,
        after: newStrike,
        reason: payload.reason,
      });

      return newStrike;
    }
    throw new Error("Failed to issue strike");
  }

  async overturnStrike(
    strikeId: string,
    reason: string,
    actorUserId: string,
    _actorRole: string
  ): Promise<StrikeRecord> {
    await this.simulateLatency();
    let overturnedStrike: StrikeRecord | null = null;

    mockDb.mutate((draft) => {
      const existing = draft.strikes.find((entry) => entry.id === strikeId);
      if (!existing) throw new Error("Strike record not found");
      if (existing.level === 5) requireSuperadminInDraft(draft, actorUserId);
      else requireOperatorInDraft(draft, actorUserId);
      const strike = draft.strikes.find((s) => s.id === strikeId);
      if (!strike) throw new Error("Strike record not found");

      strike.status = "OVERTURNED";
      strike.overturnedBy = actorUserId;
      strike.overturnedAt = new Date().toISOString();
      strike.notes = `${strike.notes || ""}\nOverturn reason: ${reason}`.trim();

      const user = draft.userProfiles[strike.userId];
      if (user) {
        if (strike.level === 5 && user.manualBlacklisted !== true) user.isBanned = false;
        refreshStrikeDerivedProfile(draft, user.id);
      }

      overturnedStrike = { ...strike };
    });

    if (overturnedStrike) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "",
        actorRole: "OPERATOR",
        action: "STRIKE_OVERTURNED",
        entityType: "STRIKE",
        entityId: strikeId,
        after: overturnedStrike,
        reason,
      });

      return overturnedStrike;
    }
    throw new Error("Failed to overturn strike");
  }

  async getCompensations(userId?: string): Promise<CompensationRecord[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    let comps = [...snapshot.compensations];
    if (userId) {
      comps = comps.filter((c) => c.userId === userId);
    }
    return comps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async recordCompensation(
    payload: RecordCompensationPayload,
    actorUserId: string,
    _actorRole: string
  ): Promise<CompensationRecord> {
    await this.simulateLatency();
    let newComp: CompensationRecord | null = null;

    mockDb.mutate((draft) => {
      requireSuperadminInDraft(draft, actorUserId);
      const user = draft.userProfiles[payload.userId];
      if (!user) throw new Error("User not found");
      if (!Number.isFinite(payload.amount) || payload.amount <= 0)
        throw new Error("Compensation amount must be positive");
      const userName = user.name;

      newComp = {
        id: `cmp-2026-${String(draft.compensations.length + 1).padStart(4, "0")}`,
        incidentId: payload.incidentId,
        userId: payload.userId,
        userName,
        amount: payload.amount,
        assessment: payload.assessment,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      draft.compensations.unshift(newComp);
    });

    if (newComp) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "",
        actorRole: "SUPERADMIN",
        action: "COMPENSATION_RECORDED",
        entityType: "COMPENSATION",
        entityId: (newComp as CompensationRecord).id,
        after: newComp,
        reason: payload.assessment,
      });

      return newComp;
    }
    throw new Error("Failed to record compensation");
  }

  async updateCompensationStatus(
    payload: UpdateCompensationStatusPayload,
    actorUserId: string,
    _actorRole: string
  ): Promise<CompensationRecord> {
    await this.simulateLatency();
    let updatedComp: CompensationRecord | null = null;

    mockDb.mutate((draft) => {
      requireSuperadminInDraft(draft, actorUserId);
      const comp = draft.compensations.find((c) => c.id === payload.compensationId);
      if (!comp) throw new Error("Compensation record not found");

      comp.status = payload.status;
      comp.updatedAt = new Date().toISOString();
      if (payload.receiptNumber) comp.receiptNumber = payload.receiptNumber;
      if (payload.notes) comp.notes = payload.notes;

      if (payload.status === "PAID" || payload.status === "WAIVED") {
        comp.settledBy = actorUserId;
        comp.settledAt = new Date().toISOString();
      }

      updatedComp = { ...comp };
    });

    if (updatedComp) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "",
        actorRole: "SUPERADMIN",
        action: "COMPENSATION_UPDATED",
        entityType: "COMPENSATION",
        entityId: payload.compensationId,
        after: updatedComp,
        reason: `Compensation marked as ${payload.status}`,
      });

      return updatedComp;
    }
    throw new Error("Failed to update compensation status");
  }
}

export const mockBoardDisciplineService = new MockBoardDisciplineService();
