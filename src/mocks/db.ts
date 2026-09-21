import {
  InventoryItemSummary,
  BorrowRequest,
  LoanRecord,
  AppNotification,
  UserProfile,
  ProjectSummary,
} from "@/types";
import { INITIAL_INVENTORY } from "./seed/inventory";
import { INITIAL_PROJECTS } from "./seed/projects";
import { INITIAL_REQUESTS } from "./seed/requests";
import { INITIAL_LOANS } from "./seed/loans";
import { INITIAL_NOTIFICATIONS } from "./seed/notifications";
import { INITIAL_USER_PROFILES } from "./seed/users";

export interface MockDatabaseSchema {
  inventory: InventoryItemSummary[];
  projects: ProjectSummary[];
  requests: BorrowRequest[];
  loans: LoanRecord[];
  notifications: AppNotification[];
  userProfiles: Record<string, UserProfile>;
  favorites: Record<string, string[]>; // userId -> itemId[]
}

const STORAGE_KEY = "ras_insat_mock_db_v1";

class MockDatabase {
  private data: MockDatabaseSchema;

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
      favorites: {
        "p-member-ieee": ["item-stm32-f4", "item-pololu-driver", "item-keysight-dso", "item-rpi-4"],
      },
    };
  }

  private loadFromStorage(): MockDatabaseSchema {
    if (typeof window === "undefined" || !window.localStorage) {
      return this.getDefaultData();
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
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
  }

  public getSnapshot(): MockDatabaseSchema {
    return JSON.parse(JSON.stringify(this.data));
  }

  public mutate(mutator: (draft: MockDatabaseSchema) => void): void {
    mutator(this.data);
    this.saveToStorage(this.data);
  }
}

export const mockDb = new MockDatabase();
