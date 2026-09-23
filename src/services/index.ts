import { IInventoryService } from "./contracts/inventory";
import { IRequestService } from "./contracts/requests";
import { ILoanService } from "./contracts/loans";
import { INotificationService } from "./contracts/notifications";
import { IProfileService, IProjectService } from "./contracts/profile";
import { IAuthService } from "./contracts/auth";

import { mockInventoryService } from "./mock/inventory";
import { mockRequestService } from "./mock/requests";
import { mockLoanService } from "./mock/loans";
import { mockNotificationService } from "./mock/notifications";
import { mockProfileService, mockProjectService } from "./mock/profile";
import { mockAuthService } from "./mock/auth";

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

import { mockBoardAllocationService } from "./mock/board/allocations";
import { mockBoardRequestService } from "./mock/board/requests";
import { mockBoardLoanService } from "./mock/board/loans";
import { mockBoardInventoryService } from "./mock/board/inventory";
import { mockBoardUserService } from "./mock/board/users";
import { mockBoardProjectService } from "./mock/board/projects";
import { mockBoardAuditService } from "./mock/board/audits";
import { mockBoardDisciplineService } from "./mock/board/discipline";
import { mockBoardInsightsService } from "./mock/board/insights";
import { mockBoardExportService } from "./mock/board/exports";
import { mockBoardAuditLogService } from "./mock/board/audit-log";

// Member Public Services
export const inventoryService: IInventoryService = mockInventoryService;
export const requestService: IRequestService = mockRequestService;
export const loanService: ILoanService = mockLoanService;
export const notificationService: INotificationService = mockNotificationService;
export const profileService: IProfileService = mockProfileService;
export const projectService: IProjectService = mockProjectService;
export const authService: IAuthService = mockAuthService;

// Board Public Services
export const boardAllocationService: IBoardAllocationService = mockBoardAllocationService;
export const boardRequestService: IBoardRequestService = mockBoardRequestService;
export const boardLoanService: IBoardLoanService = mockBoardLoanService;
export const boardInventoryService: IBoardInventoryService = mockBoardInventoryService;
export const boardUserService: IBoardUserService = mockBoardUserService;
export const boardProjectService: IBoardProjectService = mockBoardProjectService;
export const boardAuditService: IBoardAuditService = mockBoardAuditService;
export const boardDisciplineService: IBoardDisciplineService = mockBoardDisciplineService;
export const boardInsightsService: IBoardInsightsService = mockBoardInsightsService;
export const boardExportService: IBoardExportService = mockBoardExportService;
export const boardAuditLogService: IBoardAuditLogService = mockBoardAuditLogService;

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
