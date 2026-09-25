import { IInventoryService } from "./contracts/inventory";
import { IRequestService } from "./contracts/requests";
import { ILoanService } from "./contracts/loans";
import { INotificationService } from "./contracts/notifications";
import { IProfileService, IProjectService } from "./contracts/profile";
import { IAuthService } from "./contracts/auth";

// Board services
import { IBoardAllocationService } from "./contracts/board/allocations";
import { IBoardRequestService } from "./contracts/board/requests";
import { IBoardLoanService } from "./contracts/board/loans";
import { IBoardInventoryService } from "./contracts/board/inventory";
import { IBoardUserService } from "./contracts/board/users";
import { IBoardProjectService } from "./contracts/board/projects";
import { IBoardAuditService } from "./contracts/board/audits";
import { IBoardDisciplineService } from "./contracts/board/discipline";
import { IBoardInsightsService } from "./contracts/board/insights";
import { IBoardExportService } from "./contracts/board/exports";
import { IBoardAuditLogService } from "./contracts/board/audit-log";

import {
  remoteInventoryService,
  remoteRequestService,
  remoteLoanService,
  remoteNotificationService,
  remoteProfileService,
  remoteProjectService,
  remoteAuthService,
  remoteBoardAllocationService,
  remoteBoardRequestService,
  remoteBoardLoanService,
  remoteBoardInventoryService,
  remoteBoardUserService,
  remoteBoardProjectService,
  remoteBoardAuditService,
  remoteBoardDisciplineService,
  remoteBoardInsightsService,
  remoteBoardExportService,
  remoteBoardAuditLogService,
} from "./remote";

const mockServices =
  import.meta.env.MODE !== "production" ? await import("./mock/implementations") : undefined;

// Member Public Services
export const inventoryService: IInventoryService =
  mockServices?.mockInventoryService ?? (remoteInventoryService as IInventoryService);
export const requestService: IRequestService =
  mockServices?.mockRequestService ?? (remoteRequestService as IRequestService);
export const loanService: ILoanService =
  mockServices?.mockLoanService ?? (remoteLoanService as ILoanService);
export const notificationService: INotificationService =
  mockServices?.mockNotificationService ?? (remoteNotificationService as INotificationService);
export const profileService: IProfileService =
  mockServices?.mockProfileService ?? (remoteProfileService as IProfileService);
export const projectService: IProjectService =
  mockServices?.mockProjectService ?? (remoteProjectService as IProjectService);
export const authService: IAuthService =
  mockServices?.mockAuthService ?? (remoteAuthService as IAuthService);

// Board Public Services
export const boardAllocationService: IBoardAllocationService =
  mockServices?.mockBoardAllocationService ??
  (remoteBoardAllocationService as IBoardAllocationService);
export const boardRequestService: IBoardRequestService =
  mockServices?.mockBoardRequestService ?? (remoteBoardRequestService as IBoardRequestService);
export const boardLoanService: IBoardLoanService =
  mockServices?.mockBoardLoanService ?? (remoteBoardLoanService as IBoardLoanService);
export const boardInventoryService: IBoardInventoryService =
  mockServices?.mockBoardInventoryService ??
  (remoteBoardInventoryService as IBoardInventoryService);
export const boardUserService: IBoardUserService =
  mockServices?.mockBoardUserService ?? (remoteBoardUserService as IBoardUserService);
export const boardProjectService: IBoardProjectService =
  mockServices?.mockBoardProjectService ?? (remoteBoardProjectService as IBoardProjectService);
export const boardAuditService: IBoardAuditService =
  mockServices?.mockBoardAuditService ?? (remoteBoardAuditService as IBoardAuditService);
export const boardDisciplineService: IBoardDisciplineService =
  mockServices?.mockBoardDisciplineService ??
  (remoteBoardDisciplineService as IBoardDisciplineService);
export const boardInsightsService: IBoardInsightsService =
  mockServices?.mockBoardInsightsService ?? (remoteBoardInsightsService as IBoardInsightsService);
export const boardExportService: IBoardExportService =
  mockServices?.mockBoardExportService ?? (remoteBoardExportService as IBoardExportService);
export const boardAuditLogService: IBoardAuditLogService =
  mockServices?.mockBoardAuditLogService ?? (remoteBoardAuditLogService as IBoardAuditLogService);

// Re-exports
export * from "./contracts/inventory";
export * from "./contracts/requests";
export * from "./contracts/loans";
export * from "./contracts/notifications";
export * from "./contracts/profile";
export * from "./contracts/auth";

export * from "./contracts/board/allocations";
export * from "./contracts/board/requests";
export * from "./contracts/board/loans";
export * from "./contracts/board/inventory";
export * from "./contracts/board/users";
export * from "./contracts/board/projects";
export * from "./contracts/board/audits";
export * from "./contracts/board/discipline";
export * from "./contracts/board/insights";
export * from "./contracts/board/exports";
export * from "./contracts/board/audit-log";
