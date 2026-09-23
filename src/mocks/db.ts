import {
  InventoryItemSummary,
  BorrowRequest,
  LoanRecord,
  AppNotification,
  UserProfile,
  ProjectSummary,
  AllocationRecord,
  InventoryEvent,
  InventoryAudit,
  IncidentRecord,
  DisciplinaryRecommendation,
  StrikeRecord,
  CompensationRecord,
  AuditEvent,
  SemesterConfig,
} from "@/types";
import { INITIAL_INVENTORY } from "./seed/inventory";
import { INITIAL_PROJECTS } from "./seed/projects";
import { INITIAL_REQUESTS } from "./seed/requests";
import { INITIAL_LOANS } from "./seed/loans";
import { INITIAL_NOTIFICATIONS } from "./seed/notifications";
import { INITIAL_USER_PROFILES } from "./seed/users";
import { INITIAL_ALLOCATIONS } from "./seed/allocations";
import { INITIAL_INVENTORY_EVENTS } from "./seed/inventory-events";
import { INITIAL_AUDITS } from "./seed/audits";
import { INITIAL_INCIDENTS } from "./seed/incidents";
import { INITIAL_RECOMMENDATIONS } from "./seed/recommendations";
import { INITIAL_STRIKES } from "./seed/strikes";
import { INITIAL_COMPENSATIONS } from "./seed/compensations";
import { INITIAL_AUDIT_EVENTS } from "./seed/audit-events";
import { INITIAL_SEMESTERS } from "./seed/semesters";

export interface MockDatabaseSchema {
  inventory: InventoryItemSummary[];
  projects: ProjectSummary[];
  requests: BorrowRequest[];
  loans: LoanRecord[];
  notifications: AppNotification[];
  userProfiles: Record<string, UserProfile>;
  allocations: AllocationRecord[];
  inventoryEvents: InventoryEvent[];
  audits: InventoryAudit[];
  incidents: IncidentRecord[];
  recommendations: DisciplinaryRecommendation[];
  strikes: StrikeRecord[];
  compensations: CompensationRecord[];
  auditEvents: AuditEvent[];
  semesters: SemesterConfig[];
}

// The old demo store remains untouched for recovery during the mock schema change.
const STORAGE_KEY = "ras_insat_mock_db_v4";

class MockDatabase {
  private data: MockDatabaseSchema;
  private listeners = new Set<() => void>();

  constructor() {
    this.data = this.loadFromStorage();
  }

  private getDefaultData(): MockDatabaseSchema {
    return {
      inventory: JSON.parse(JSON.stringify(INITIAL_INVENTORY)),
      projects: JSON.parse(JSON.stringify(INITIAL_PROJECTS)),
      requests: JSON.parse(JSON.stringify(INITIAL_REQUESTS)),
      loans: JSON.parse(JSON.stringify(INITIAL_LOANS)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
      userProfiles: JSON.parse(JSON.stringify(INITIAL_USER_PROFILES)),
      allocations: JSON.parse(JSON.stringify(INITIAL_ALLOCATIONS)),
      inventoryEvents: JSON.parse(JSON.stringify(INITIAL_INVENTORY_EVENTS)),
      audits: JSON.parse(JSON.stringify(INITIAL_AUDITS)),
      incidents: JSON.parse(JSON.stringify(INITIAL_INCIDENTS)),
      recommendations: JSON.parse(JSON.stringify(INITIAL_RECOMMENDATIONS)),
      strikes: JSON.parse(JSON.stringify(INITIAL_STRIKES)),
      compensations: JSON.parse(JSON.stringify(INITIAL_COMPENSATIONS)),
      auditEvents: JSON.parse(JSON.stringify(INITIAL_AUDIT_EVENTS)),
      semesters: JSON.parse(JSON.stringify(INITIAL_SEMESTERS)),
    };
  }

  private loadFromStorage(): MockDatabaseSchema {
    if (typeof window === "undefined" || !window.localStorage) {
      return this.getDefaultData();
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with default to guarantee new tables exist
        return {
          ...this.getDefaultData(),
          ...parsed,
        };
      }
    } catch (e) {
      console.warn("Failed to load mock db from localStorage:", e);
    }
    const def = this.getDefaultData();
    this.saveToStorage(def);
    return def;
  }

  private saveToStorage(data: MockDatabaseSchema): void {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save mock db to localStorage:", e);
    }
  }

  public resetToDefault(): void {
    this.data = this.getDefaultData();
    this.saveToStorage(this.data);
    this.listeners.forEach((listener) => listener());
  }

  public reset(): void {
    this.resetToDefault();
  }

  public getSnapshot(): MockDatabaseSchema {
    return JSON.parse(JSON.stringify(this.data));
  }

  public mutate<T>(mutator: (draft: MockDatabaseSchema) => T): T {
    const draft = this.getSnapshot();
    const result = mutator(draft);
    this.data = draft;
    this.saveToStorage(this.data);
    this.listeners.forEach((listener) => listener());
    return result;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const mockDb = new MockDatabase();
