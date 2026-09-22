import { IInventoryService } from "./contracts/inventory";
import { IRequestService } from "./contracts/requests";
import { ILoanService } from "./contracts/loans";
import { INotificationService } from "./contracts/notifications";
import { IProfileService, IProjectService, IFavoritesService } from "./contracts/profile";
import { IAuthService } from "./contracts/auth";

import { mockInventoryService } from "./mock/inventory";
import { mockRequestService } from "./mock/requests";
import { mockLoanService } from "./mock/loans";
import { mockNotificationService } from "./mock/notifications";
import { mockProfileService, mockProjectService, mockFavoritesService } from "./mock/profile";
import { mockAuthService } from "./mock/auth";

export const inventoryService: IInventoryService = mockInventoryService;
export const requestService: IRequestService = mockRequestService;
export const loanService: ILoanService = mockLoanService;
export const notificationService: INotificationService = mockNotificationService;
export const profileService: IProfileService = mockProfileService;
export const projectService: IProjectService = mockProjectService;
export const favoritesService: IFavoritesService = mockFavoritesService;
export const authService: IAuthService = mockAuthService;

export * from "./contracts/inventory";
export * from "./contracts/requests";
export * from "./contracts/loans";
export * from "./contracts/notifications";
export * from "./contracts/profile";
export * from "./contracts/auth";
