import {
  IncidentRecord,
  DisciplinaryRecommendation,
  StrikeRecord,
  CompensationRecord,
  IncidentSeverity,
  IncidentCategory,
} from "@/types";

export interface CreateIncidentPayload {
  userId: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  category: IncidentCategory;
  relatedLoanId?: string;
  relatedItemId?: string;
}

export interface IssueStrikePayload {
  userId: string;
  level: 1 | 2 | 3 | 4 | 5;
  reason: string;
  incidentId?: string;
  notes?: string;
}

export interface RecordCompensationPayload {
  incidentId?: string;
  userId: string;
  amount: number;
  assessment: string;
}

export interface UpdateCompensationStatusPayload {
  compensationId: string;
  status: "PAID" | "WAIVED" | "APPEALED" | "CLOSED";
  receiptNumber?: string;
  notes?: string;
}

export interface IBoardDisciplineService {
  getRecommendations(status?: string): Promise<DisciplinaryRecommendation[]>;
  reviewRecommendation(
    recommendationId: string,
    action: "APPLY" | "DISMISS",
    decisionNotes: string,
    actorUserId: string,
    actorRole: string
  ): Promise<DisciplinaryRecommendation>;
  getIncidents(filters?: {
    status?: string;
    category?: string;
    userId?: string;
  }): Promise<IncidentRecord[]>;
  getIncidentById(incidentId: string): Promise<IncidentRecord | null>;
  createIncident(
    payload: CreateIncidentPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<IncidentRecord>;
  resolveIncident(
    incidentId: string,
    resolutionNotes: string,
    actorUserId: string,
    actorRole: string
  ): Promise<IncidentRecord>;
  getStrikes(userId?: string): Promise<StrikeRecord[]>;
  issueStrike(
    payload: IssueStrikePayload,
    actorUserId: string,
    actorRole: string
  ): Promise<StrikeRecord>;
  overturnStrike(
    strikeId: string,
    reason: string,
    actorUserId: string,
    actorRole: string
  ): Promise<StrikeRecord>;
  getCompensations(userId?: string): Promise<CompensationRecord[]>;
  recordCompensation(
    payload: RecordCompensationPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<CompensationRecord>;
  updateCompensationStatus(
    payload: UpdateCompensationStatusPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<CompensationRecord>;
}
