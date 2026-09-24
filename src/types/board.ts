import { EquipmentClass } from "./inventory";
import { Role } from "./users";

// --- 1. Allocation Model ---
export type AllocationStatus = "ACTIVE" | "HANDED_OVER" | "RELEASED" | "EXPIRED";

export interface AllocationRecord {
  id: string;
  requestId: string;
  requestLineId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  assetIds?: string[];
  status: AllocationStatus;
  allocatedAt: string;
  expiresAt: string; // 48h from allocation
  allocatedBy: string;
  allocatedByName?: string;
  releasedAt?: string;
  releasedBy?: string;
  releaseReason?: string;
}

// --- 2. Inventory Movements & Event Ledger ---
export type InventoryEventType =
  | "ADD"
  | "REMOVE"
  | "CORRECT"
  | "CONSUME"
  | "DAMAGE"
  | "REPAIR"
  | "RETIRE"
  | "RECOVER"
  | "ALLOCATE"
  | "RELEASE_ALLOCATION"
  | "HANDOVER"
  | "RETURN";

export interface InventoryQuantityState {
  total: number;
  available: number;
  allocated: number;
  borrowed: number;
  damaged: number;
  maintenance: number;
  lost: number;
}

export interface InventoryEvent {
  id: string;
  itemId: string;
  itemName: string;
  assetId?: string;
  assetIds?: string[];
  type: InventoryEventType;
  quantity: number;
  beforeState: InventoryQuantityState;
  afterState: InventoryQuantityState;
  reason: string;
  actorUserId: string;
  actorName: string;
  timestamp: string;
}

// --- 3. Inventory Audits ---
export type InventoryAuditStatus = "IN_PROGRESS" | "RECONCILED" | "CANCELLED";
export type AuditItemStatus = "PENDING_COUNT" | "MATCHED" | "DISCREPANCY" | "RECONCILED";

export interface InventoryAuditItem {
  itemId: string;
  itemName: string;
  category: string;
  equipmentClass: EquipmentClass;
  expectedSnapshotQuantity: number; // On-site quantity at snapshot: available + allocated + damaged + maintenance
  movementsSinceSnapshot: number; // Net on-site quantity changes after T0
  adjustedExpectedQuantity: number; // expectedSnapshotQuantity + on-site movementsSinceSnapshot
  physicalCount?: number;
  countedAt?: string;
  discrepancy?: number; // physicalCount - adjustedExpectedQuantity
  status: AuditItemStatus;
  resolutionNotes?: string;
  resolutionEventId?: string;
}

export interface InventoryAudit {
  id: string;
  title: string;
  startedAt: string;
  updatedAt?: string;
  startedBy: string;
  startedByName: string;
  completedAt?: string;
  completedBy?: string;
  status: InventoryAuditStatus;
  snapshotAt: string;
  items: InventoryAuditItem[];
  notes?: string;
}

// --- 4. Incidents, Recommendations, Strikes, Compensation & Semester ---
export type RecommendationSourceType =
  "OVERDUE_14_DAYS" | "DAMAGE" | "LOST" | "POLICY_BREACH" | "SAFETY_VIOLATION";

export type RecommendationStatus = "PENDING_REVIEW" | "APPLIED" | "DISMISSED";

export interface DisciplinaryRecommendation {
  id: string;
  userId: string;
  userName: string;
  sourceType: RecommendationSourceType;
  sourceEntityId: string; // e.g. loanId or auditId
  suggestedStrikeLevel: 1 | 2 | 3 | 4 | 5;
  description: string;
  status: RecommendationStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  decisionNotes?: string;
}

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
export type IncidentCategory = "OVERDUE" | "DAMAGE" | "LOST" | "POLICY_BREACH" | "SAFETY_VIOLATION";

export interface IncidentRecord {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: IncidentCategory;
  relatedLoanId?: string;
  relatedItemId?: string;
  reportedBy: string;
  reportedByName: string;
  reportedAt: string;
  resolutionNotes?: string;
  strikeIssuedId?: string;
  compensationId?: string;
}

export type StrikeStatus = "ACTIVE" | "EXPIRED" | "OVERTURNED";

export interface StrikeRecord {
  id: string;
  userId: string;
  userName: string;
  level: 1 | 2 | 3 | 4 | 5;
  status: StrikeStatus;
  reason: string;
  incidentId?: string;
  issuedBy: string;
  issuedByName: string;
  issuedAt: string;
  expiresAt?: string;
  overturnedBy?: string;
  overturnedAt?: string;
  notes?: string;
}

export type CompensationStatus = "PENDING" | "PAID" | "WAIVED" | "APPEALED" | "CLOSED";

export interface CompensationRecord {
  id: string;
  incidentId?: string;
  userId: string;
  userName: string;
  amount: number; // in TND
  assessment: string;
  status: CompensationStatus;
  createdAt: string;
  updatedAt: string;
  receiptNumber?: string;
  settledBy?: string;
  settledAt?: string;
  notes?: string;
}

export interface SemesterConfig {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

// --- 5. Append-Only Audit Log ---
export interface AuditEvent {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entityType:
    | "REQUEST"
    | "LOAN"
    | "INVENTORY"
    | "USER"
    | "PROJECT"
    | "AUDIT"
    | "INCIDENT"
    | "STRIKE"
    | "COMPENSATION"
    | "EXPORT";
  entityId: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  createdAt: string;
}

// --- 7. Board Insights Analytics ---
export interface BoardInsightsData {
  inventory: {
    totalDistinctItems: number;
    totalUnits: number;
    availableUnits: number;
    allocatedUnits: number;
    borrowedUnits: number;
    damagedUnits: number;
    maintenanceUnits: number;
    lostUnits: number;
  };
  borrowing: {
    totalRequestsCount: number;
    requestsThisMonth: number;
    approvalRatePercent: number;
    partialApprovalRatePercent: number;
    activeLoansCount: number;
    averageDurationDays: number | null;
    overdueLoansCount: number;
    overdueRatePercent: number;
  };
  equipment: {
    topBorrowedItems: { id: string; name: string; equipmentClass: string; borrowCount: number }[];
    frequentlyUnavailableItems: { id: string; name: string; availableRatio: number }[];
    mostDamagedItems: { id: string; name: string; damagedCount: number }[];
  };
  projects: {
    projectsCount: number;
    equipmentByProject: { projectId: string; projectName: string; activeUnits: number }[];
    requestsByProject: { projectId: string; projectName: string; requestCount: number }[];
  };
  discipline: {
    activeStrikesByLevel: Record<number, number>;
    pendingRecommendationsCount: number;
    openIncidentsCount: number;
    totalCompensationDue: number;
  };
}
