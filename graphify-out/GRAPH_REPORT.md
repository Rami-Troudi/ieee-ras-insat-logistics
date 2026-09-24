# Graph Report - ieee-ras-insat-logistics  (2026-09-24)

## Corpus Check
- 220 files · ~134,285 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1428 nodes · 3472 edges · 114 communities (92 shown, 22 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1d16f7ad`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui_ux_context.md
- BorrowRequest
- BoardIncidentsPage.tsx
- ProjectSummary
- useSession
- useBoardUsers.ts
- types/index.ts
- dependencies
- UserPersona
- BorrowerCatalogItem
- requireOperatorInDraft
- mock/board/inventory.ts
- IEEE RAS INSAT Logistics Platform — Implementation Context
- LoanRecord
- DesignLabPage.tsx
- services/index.ts
- compilerOptions
- member/index.tsx
- board/index.tsx
- button.tsx
- cn
- InventoryAudit
- utils.ts
- authorization.ts
- QuickOnboardingModal.tsx
- BoardAuditDetailPage.tsx
- Stage 1 Quality Assurance & Browser Verification Report
- BoardItemDetailPage.tsx
- MemberNotificationsPage.tsx
- UserMenu.tsx
- Pre-Backend Domain Contract & Freeze Specification
- 2. Feature Workflows & Interface Specifications
- IEEE RAS Brand Identity Compliance Certificate
- components.test.tsx
- MobileBoardBottomNav.tsx
- devDependencies
- ConfirmationDialog.tsx
- mock/board/exports.ts
- IEEE RAS INSAT Logistics Platform — Design System Specification
- context guidelines.md
- README.md
- IEEE RAS INSAT Logistics Platform
- Current Product UX Specification
- scripts
- MockDatabase
- mock/board/audit-log.ts
- 24. Discipline and strikes
- STAGE 3 ARCHITECTURE: BOARD & SUPERADMIN OPERATIONAL DOMAIN
- STAGE 3 QUALITY ASSURANCE (QA) RESULTS & VERIFICATION MATRIX
- Stage 1 UX Research & Interaction Foundations
- 2. Item Classification
- 4.1 Borrowing Procedure
- 4. Anti-Slop UI Rules
- 3. Clearance Levels
- 7. Strike System
- 32. Recommended architecture and stack
- 3. Fundamental UX Principles
- RegisterPage.tsx
- 16. Loan state model
- 27. Insights dashboard
- Stage 2 Member Logistics Architecture & Domain Specification
- Stage 2 Member UX & Interaction Specification
- 2. Targeted Shipped-Product Research (Lazyweb & Benchmark Pass)
- BoardProjectsPage.tsx
- 11. Management Responsibilities
- 6. Disciplinary Actions
- 5. Design System Foundations
- 9. Mobile Ergonomics
- Stage 2 Quality Assurance & Verification Report
- 2. Design Tokens & Foundations
- package.json
- humanAvailability.ts
- MockNotificationService
- 10. User Responsibilities
- 8. Compensation Policy
- 11. Policy engine
- 23. Stock alerts
- 4. Application roles
- Tracking modes
- 4. State Machines & Lifecycles
- common.ts
- vite-env.d.ts
- 5. Clearance model
- 16. Inventory Experience
- 75. Core Screens to Implement First
- 13. Internal stock allocation (not a reservation feature)
- 3. Normative equipment classes
- responsive-viewports.spec.ts
- @eslint/js
- eslint-plugin-react-hooks
- eslint-plugin-react-refresh
- globals
- jsdom
- @playwright/test
- postcss
- tailwindcss
- @testing-library/jest-dom
- @testing-library/react
- @testing-library/user-event
- @types/node
- @types/react
- typescript
- typescript-eslint
- vite

## God Nodes (most connected - your core abstractions)
1. `cn()` - 97 edges
2. `useSession()` - 61 edges
3. `Button` - 40 edges
4. `requireOperatorInDraft()` - 38 edges
5. `IEEE RAS INSAT Logistics Platform — Implementation Context` - 37 edges
6. `LoadingState()` - 29 edges
7. `UserProfile` - 29 edges
8. `BorrowRequest` - 26 edges
9. `UserPersona` - 25 edges
10. `ProjectSummary` - 24 edges

## Surprising Connections (you probably didn't know these)
- `AlertDialogOverlay` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `DialogOverlay` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dialog.tsx → src/lib/utils.ts
- `DialogFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dialog.tsx → src/lib/utils.ts
- `DropdownMenuSubTrigger` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts
- `DropdownMenuSubContent` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (114 total, 22 thin omitted)

### Community 0 - "ui_ux_context.md"
Cohesion: 0.03
Nodes (77): 10. Desktop Navigation, 11. Mobile Navigation, 12. Board Navigation, 13. Member Information Architecture, 14. Board Information Architecture, 15. Member Home, 17. Inventory Card/List Item, 18. Item Detail (+69 more)

### Community 1 - "BorrowRequest"
Cohesion: 0.05
Nodes (33): DEFAULT_EQUIPMENT_IMAGE, EQUIPMENT_IMAGES, SENSOR_EQUIPMENT_IMAGE, getBorrowerCatalogAccess(), isFormalRequestClass(), clearanceToNumber(), EligibilityResult, evaluateItemEligibility() (+25 more)

### Community 2 - "BoardIncidentsPage.tsx"
Cohesion: 0.07
Nodes (32): useBoardCompensations(), useBoardIncidents(), useBoardRecommendations(), useBoardStrikes(), useCreateIncident(), useIssueStrike(), useOverturnStrike(), useRecordCompensation() (+24 more)

### Community 3 - "ProjectSummary"
Cohesion: 0.08
Nodes (19): BoardProjectFilterParams, CreateProjectParams, ProjectMemberParams, UpdateProjectParams, useAddProjectMember(), useBoardProjectDetail(), useRemoveProjectMember(), useUpdateProject() (+11 more)

### Community 4 - "useSession"
Cohesion: 0.11
Nodes (28): RootRedirect(), DesktopBoardSidebar(), DesktopSidebar(), DevPersonaSwitcher(), EmptyState(), EmptyStateProps, ErrorState(), ErrorStateProps (+20 more)

### Community 5 - "useBoardUsers.ts"
Cohesion: 0.12
Nodes (28): BoardUserFilterParams, ProcessUserParams, UpdateClearanceParams, UpdateRoleParams, UpdateStatusParams, useBoardUserDetail(), useProcessUser(), useUpdateUserClearance() (+20 more)

### Community 6 - "types/index.ts"
Cohesion: 0.09
Nodes (21): MockDatabaseSchema, INITIAL_ALLOCATIONS, INITIAL_AUDIT_EVENTS, INITIAL_AUDITS, INITIAL_COMPENSATIONS, INITIAL_INCIDENTS, INITIAL_INVENTORY_EVENTS, INITIAL_LOANS (+13 more)

### Community 7 - "dependencies"
Cohesion: 0.04
Nodes (45): class-variance-authority, clsx, date-fns, @hookform/resolvers, lucide-react, dependencies, class-variance-authority, clsx (+37 more)

### Community 8 - "UserPersona"
Cohesion: 0.08
Nodes (23): App(), Providers(), ProvidersProps, queryClient, router, PRESET_PERSONAS, DevPersonaProvider(), SessionProvider() (+15 more)

### Community 9 - "BorrowerCatalogItem"
Cohesion: 0.10
Nodes (19): BorrowCartProvider(), CartAction, cartReducer(), CartContext, CartContextValue, CartLineItem, CartState, defaultReturnDate() (+11 more)

### Community 10 - "requireOperatorInDraft"
Cohesion: 0.16
Nodes (16): ConfirmHandoverParams, ReviewBorrowRequestParams, IBoardAllocationService, HandoverPayload, ReviewRequestPayload, requireOperatorInDraft(), MockBoardAllocationService, createAuditEvent() (+8 more)

### Community 11 - "mock/board/inventory.ts"
Cohesion: 0.15
Nodes (15): CreateInventoryItemPayload, IBoardInventoryService, MutateStockPayload, UpdateAssetPayload, bucketForState, MockBoardInventoryService, StockBucket, InventoryEvent (+7 more)

### Community 12 - "IEEE RAS INSAT Logistics Platform — Implementation Context"
Cohesion: 0.07
Nodes (26): 10. Shopping cart and request submission, 12. Approval and partial approval, 14. Cancellation rules, 15. Physical handover, 17. Returns, 18. Extensions, 19. Inventory stock operations, 1. Product goal (+18 more)

### Community 13 - "LoanRecord"
Cohesion: 0.15
Nodes (11): ConfirmReturnMutationParams, BoardLoanFilterParams, ConfirmReturnPayload, IBoardLoanService, ReturnInspectionLineItem, ILoanService, makeId(), MockBoardLoanService (+3 more)

### Community 14 - "DesignLabPage.tsx"
Cohesion: 0.16
Nodes (15): QUERY_KEYS, PageContainer(), PageContainerProps, PageHeader(), PageHeaderProps, SectionHeader(), SectionHeaderProps, useBoardAuditLog() (+7 more)

### Community 15 - "services/index.ts"
Cohesion: 0.14
Nodes (18): IBoardInsightsService, boardAllocationService, boardAuditLogService, boardAuditService, boardDisciplineService, boardExportService, boardInsightsService, boardInventoryService (+10 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2022, src, vite.config.ts, compilerOptions, allowImportingTsExtensions, baseUrl (+16 more)

### Community 17 - "member/index.tsx"
Cohesion: 0.16
Nodes (12): MemberActivityPage(), MemberCartPage(), useLoanDetail(), useUserLoans(), MemberLoanDetailPage(), useCancelRequest(), useCreateRequest(), useRequestDetail() (+4 more)

### Community 18 - "board/index.tsx"
Cohesion: 0.18
Nodes (17): BoardDashboardPage(), BoardMorePage(), useBoardLoanDetail(), useBoardLoans(), useConfirmReturn(), useUpdateLoanDueDate(), BoardBorrowedPage(), BoardLoanDetailPage() (+9 more)

### Community 19 - "button.tsx"
Cohesion: 0.21
Nodes (12): AlertBanner(), AlertBannerProps, AlertBannerVariant, VARIANT_CONFIG, LoadingSkeleton, LoadingState(), LoadingStateProps, Button (+4 more)

### Community 20 - "cn"
Cohesion: 0.18
Nodes (17): EntityMetadataItem, MobileEntityCard(), MobileEntityCardProps, DataTableColumn, ResponsiveDataTable(), ResponsiveDataTableProps, Separator, Skeleton() (+9 more)

### Community 21 - "InventoryAudit"
Cohesion: 0.20
Nodes (8): IBoardAuditService, ReconcileAuditDiscrepancyPayload, RecordPhysicalCountPayload, StartAuditPayload, auditLog(), MockBoardAuditService, onSiteQuantity(), InventoryAudit

### Community 22 - "utils.ts"
Cohesion: 0.15
Nodes (11): AppBrand(), AppBrandProps, BOARD_MORE_ITEMS, BOARD_NAV_ITEMS, MEMBER_NAV_ITEMS, MOBILE_MEMBER_TABS, NavItem, ForgotFormData (+3 more)

### Community 23 - "authorization.ts"
Cohesion: 0.21
Nodes (8): mockDb, activeStrikeCount(), activeStrikesForUser(), IdentityDraft, refreshStrikeDerivedProfile(), requireMember(), requireMemberInDraft(), ScenarioManager

### Community 24 - "QuickOnboardingModal.tsx"
Cohesion: 0.18
Nodes (12): OnboardingFormData, onboardingSchema, ResponsiveDialog(), ResponsiveDialogProps, DialogContent, DialogDescription, DialogFooter(), DialogHeader() (+4 more)

### Community 25 - "BoardAuditDetailPage.tsx"
Cohesion: 0.22
Nodes (14): DomainStatus, STATUS_CONFIG, StatusBadge(), StatusBadgeProps, StatusConfigItem, BadgeProps, useBoardAuditDetail(), useBoardAudits() (+6 more)

### Community 26 - "Stage 1 Quality Assurance & Browser Verification Report"
Cohesion: 0.12
Nodes (15): 1. Executive Summary, 2. Automated Quality Gates, 3. Real Browser DevTools Viewport Audit, 4. Role Shell & Board Ergonomics Verification, 5. Visual System & Design Lab (`/_dev/design`), 6. Strict Stage 2 Boundary Audit (Zero Premature Domain Logic), Board Console (`/board`), Development Persona Switcher & Production Session Isolation (`useSession` / `useDevPersona`) (+7 more)

### Community 27 - "BoardItemDetailPage.tsx"
Cohesion: 0.24
Nodes (11): SearchInput(), SearchInputProps, Input, InputProps, useBoardInventory(), useBoardItemDetail(), useBoardItemEvents(), useCreateInventoryItem() (+3 more)

### Community 28 - "MemberNotificationsPage.tsx"
Cohesion: 0.28
Nodes (12): BoardNotificationsPage(), MemberNotificationsPage(), useMarkAllNotificationsAsRead(), useMarkNotificationAsRead(), useResetDemoData(), useUpdateContactInfo(), useUserNotifications(), useUserProfile() (+4 more)

### Community 29 - "UserMenu.tsx"
Cohesion: 0.25
Nodes (11): UserMenuProps, Badge(), badgeVariants, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem (+3 more)

### Community 30 - "Pre-Backend Domain Contract & Freeze Specification"
Cohesion: 0.14
Nodes (14): 1. Architecture Overview & Freeze Scope, 2.1 Canonical Roles, 2.2 Clearance Hierarchy, 2.3 Access Control Boundaries, 2. Canonical Identity & RBAC Matrix, 3.1 Equipment Classes & Online Request Gating, 3.2 Borrower Stock Privacy DTO, 3.3 Stock Quantity Conservation Invariant (+6 more)

### Community 31 - "2. Feature Workflows & Interface Specifications"
Cohesion: 0.14
Nodes (13): 1. Design Principles for Operational Custodians, 2.1 Logistics Action Center (`/board`), 2.2 Master Inventory & Stock Ledger (`/board/inventory` & `/board/inventory/:itemId`), 2.3 Borrow Requests & Line-Item Review (`/board/requests` & `/board/requests/:requestId`), 2.4 Active Loans & Intake Inspection (`/board/loans` & `/board/loans/:loanId`), 2.5 Semester Physical Audits (`/board/audits` & `/board/audits/:auditId`), 2.6 Disciplinary Operations & Progressive Strikes (`/board/incidents`), 2.7 Operational Insights & Fleet Telemetry (`/board/insights`) (+5 more)

### Community 32 - "IEEE RAS Brand Identity Compliance Certificate"
Cohesion: 0.14
Nodes (13): 1. Official Canonical Color Palette, 2. Typography Standard, 3. Official Logo Integrity & Clear Space, 4. Theme Scope: Light Theme Only, 5. Verification Checkpoints, Deprecated & Prohibited Colors, IEEE Master Brand Relationship, IEEE RAS Brand Identity Compliance Certificate (+5 more)

### Community 33 - "components.test.tsx"
Cohesion: 0.22
Nodes (9): ActiveFilter, FilterBar(), FilterBarProps, FilterChip(), FilterChipProps, KeyValueRow(), KeyValueRowProps, Metric() (+1 more)

### Community 34 - "MobileBoardBottomNav.tsx"
Cohesion: 0.23
Nodes (11): FilterDrawer(), FilterDrawerProps, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+3 more)

### Community 35 - "devDependencies"
Cohesion: 0.15
Nodes (13): autoprefixer, eslint, devDependencies, autoprefixer, eslint, prettier, @types/react-dom, @vitejs/plugin-react (+5 more)

### Community 36 - "ConfirmationDialog.tsx"
Cohesion: 0.29
Nodes (11): ConfirmationDialog(), ConfirmationDialogProps, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader() (+3 more)

### Community 37 - "mock/board/exports.ts"
Cohesion: 0.29
Nodes (9): DatasetCardConfig, ExportDatasetType, ExportResult, IBoardExportService, requireOperator(), requireSuperadmin(), escapeCsvField(), MockBoardExportService (+1 more)

### Community 38 - "IEEE RAS INSAT Logistics Platform — Design System Specification"
Cohesion: 0.17
Nodes (11): 1.1 Canonical Stage Roadmap, 1. System Architecture & Philosophy, 3.1 Core Primitives (`src/components/ui/`), 3.2 Domain-Specific Shared Components (`src/components/shared/`), 3.3 Navigation Shells, 3. Component Taxonomy & Patterns, 4. Persona Switcher Architecture (`useDevPersona`), 5. Accessibility Compliance (WCAG 2.2 AA) (+3 more)

### Community 39 - "context guidelines.md"
Cohesion: 0.18
Nodes (10): 12. Decision Authority, 13. Operational Rules Summary, 14. Contact Information, 15. Document Metadata, 1. Purpose, 5. Returning Items, 9. Acceptance of Terms, Class B (+2 more)

### Community 40 - "README.md"
Cohesion: 0.24
Nodes (6): Archived Stage and QA Documents, Backend implementation rules, Final Pre-Backend Freeze Audit, Fixes completed, Remaining limitations, Verification results

### Community 41 - "IEEE RAS INSAT Logistics Platform"
Cohesion: 0.18
Nodes (11): 1. Final Pre-Backend Freeze Status, 2.1 Borrower Experience (`/app`), 2.2 Operator Console (`/board`), 2. Features & Product Architecture, 3. Getting Started & Verification, 4. Architecture & Design Documentation, 5. Stage 4 Backend Handover Instructions, Development (+3 more)

### Community 42 - "Current Product UX Specification"
Cohesion: 0.20
Nodes (10): 1. Design Vision & Philosophy, 2.1 Navigation & Shell, 2.2 Discovery & Cart Submission, 2.3 Member Activity States, 2. Borrower UX Architecture (`/app`), 3.1 Information Architecture, 3.2 Key Operator Workflows, 3. Operator UX Architecture (`/board`) (+2 more)

### Community 43 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, format, format:check, lint, test, test:e2e (+2 more)

### Community 45 - "mock/board/audit-log.ts"
Cohesion: 0.38
Nodes (3): IBoardAuditLogService, MockBoardAuditLogService, AuditEvent

### Community 46 - "24. Discipline and strikes"
Cohesion: 0.22
Nodes (9): 24. Discipline and strikes, Human-in-the-loop enforcement, Semester expiry, Strike 1, Strike 2, Strike 3, Strike 4, Strike 5 (+1 more)

### Community 47 - "STAGE 3 ARCHITECTURE: BOARD & SUPERADMIN OPERATIONAL DOMAIN"
Cohesion: 0.22
Nodes (8): 1. Architectural Philosophy: Unified Domain Datastore, 2. Cross-Role Lifecycle State Machines, 3. Stock Allocation & Inventory Reservation Invariants, 4. Role Hierarchy & Superadmin Authority Gates, 5. Semester Physical Inventory Audits & Discrepancy Reconciliation, 6. Immutable Administrative Audit Logging, STAGE 3 ARCHITECTURE: BOARD & SUPERADMIN OPERATIONAL DOMAIN, State Transitions:

### Community 48 - "STAGE 3 QUALITY ASSURANCE (QA) RESULTS & VERIFICATION MATRIX"
Cohesion: 0.22
Nodes (8): 1. Executive Summary & Verification Verdict, 2. Automated Quality Gates Matrix, 3. Unit & Integration Test Coverage Breakdown, 4. End-to-End Playwright Journeys, 5. Responsive & Touch Target Audit, Board Journeys (`e2e/board-journey.spec.ts`):, Member Journeys (`e2e/member-journey.spec.ts`):, STAGE 3 QUALITY ASSURANCE (QA) RESULTS & VERIFICATION MATRIX

### Community 49 - "Stage 1 UX Research & Interaction Foundations"
Cohesion: 0.22
Nodes (8): 1.1 Project Operational Facts, 1.2 Design Assumptions, 1. Context & Operational Framework (Evidence-Categorized), 3.1 The Member Paradigm, 3.2 The Board Paradigm, 3. Persona Interaction Workflows, 4. Key Architectural Decisions in Stage 1, Stage 1 UX Research & Interaction Foundations

### Community 50 - "2. Item Classification"
Cohesion: 0.25
Nodes (8): 2. Item Classification, Class A — Consumables, Class B — Expendable Resources, Class C — Light Resources, Class D — Light Equipment, Class E — Electronic Resources, Class F — Heavy Equipment, Class G — High-Value Electronics

### Community 51 - "4.1 Borrowing Procedure"
Cohesion: 0.25
Nodes (8): 4.1 Borrowing Procedure, 4. Logistics Usage Policy, Class A, Class B, Class C, Class D, Class E, Class F

### Community 52 - "4. Anti-Slop UI Rules"
Cohesion: 0.25
Nodes (8): 4.1 No excessive cards, 4.2 Avoid excessive rounded corners, 4.3 Avoid decorative gradients, 4.4 Avoid glassmorphism, 4.5 Avoid excessive shadows, 4.6 No fake "AI dashboard" aesthetic, 4.7 No unnecessary animation, 4. Anti-Slop UI Rules

### Community 53 - "3. Clearance Levels"
Cohesion: 0.29
Nodes (7): 3. Clearance Levels, Level I — External Individuals, Level II — Aerobotix Members, Level III — IEEE Members, Level IV — Trusted Individuals, Level V — RAS Board and Eurobot Members, Level VI — RAS Chairman and Logistics Manager

### Community 54 - "7. Strike System"
Cohesion: 0.29
Nodes (7): 7. Strike System, Strike 1 — Warning, Strike 2 — Second Warning, Strike 3 — Last Warning, Strike 4 — Disciplinary Ban, Strike 5 — Permanent Ban, Strike Expiration

### Community 55 - "32. Recommended architecture and stack"
Cohesion: 0.29
Nodes (7): 32. Recommended architecture and stack, Auth, Backend, Code/CI, Data, Frontend, Notifications/automation

### Community 56 - "3. Fundamental UX Principles"
Cohesion: 0.29
Nodes (7): 3.1 Progressive disclosure, 3.2 Recognition over recall, 3.3 Prevent errors instead of explaining them later, 3.4 Every page should have one obvious primary action, 3.5 Preserve real-world workflow, 3.6 Explain unusual states in plain language, 3. Fundamental UX Principles

### Community 57 - "RegisterPage.tsx"
Cohesion: 0.33
Nodes (4): PolicyNotice(), PolicyNoticeProps, RegisterFormData, registerSchema

### Community 58 - "16. Loan state model"
Cohesion: 0.33
Nodes (6): 16. Loan state model, Due state, Handover, Loan lifecycle, Request decision, Return progress

### Community 59 - "27. Insights dashboard"
Cohesion: 0.33
Nodes (6): 27. Insights dashboard, Borrowing, Discipline, Equipment, Inventory, Projects

### Community 60 - "Stage 2 Member Logistics Architecture & Domain Specification"
Cohesion: 0.33
Nodes (5): 1. Domain Entities & Type Modularization, 2. In-Memory Mock Datastore & Scenario Engine, 3. Authoritative Policy & Eligibility Rules, 4. Public Service Boundaries, Stage 2 Member Logistics Architecture & Domain Specification

### Community 61 - "Stage 2 Member UX & Interaction Specification"
Cohesion: 0.33
Nodes (5): 1. Member Navigation & Shell Integration, 2. Equipment Discovery & Eligibility, 3. Borrow Cart & Request Submission, 4. Active Loans & Lifecycle Management, Stage 2 Member UX & Interaction Specification

### Community 62 - "2. Targeted Shipped-Product Research (Lazyweb & Benchmark Pass)"
Cohesion: 0.33
Nodes (6): 2.1 Pattern: Mobile Filter Drawer, 2.2 Pattern: Admin Operational Action Queue, 2.3 Pattern: Responsive Data Presentation (Table vs. Cards Fallback), 2.4 Pattern: Mobile Operational Navigation (4 Tabs + "More" Drawer), 2.5 Pattern: Non-Color-Alone Semantic Feedback, 2. Targeted Shipped-Product Research (Lazyweb & Benchmark Pass)

### Community 63 - "BoardProjectsPage.tsx"
Cohesion: 0.53
Nodes (4): useBoardProjects(), useCreateProject(), BoardProjectsPage(), ProjectCategory

### Community 64 - "11. Management Responsibilities"
Cohesion: 0.40
Nodes (5): 11. Management Responsibilities, Continuous Improvement, Fair Enforcement, Item Maintenance, Record Keeping

### Community 65 - "6. Disciplinary Actions"
Cohesion: 0.40
Nodes (5): 6.1 Irreversible Damage or Destruction, 6.2 Failure to Surrender Borrowed Items, 6.3 Breach of Borrowing Policies, 6.4 Reckless Endangerment, 6. Disciplinary Actions

### Community 66 - "5. Design System Foundations"
Cohesion: 0.40
Nodes (5): 5.1 Typography, 5.2 Spacing, 5.3 Color strategy, 5.4 Contrast, 5. Design System Foundations

### Community 67 - "9. Mobile Ergonomics"
Cohesion: 0.40
Nodes (5): 9.1 Touch targets, 9.2 Thumb reach, 9.3 Sticky actions, 9.4 Mobile tables, 9. Mobile Ergonomics

### Community 68 - "Stage 2 Quality Assurance & Verification Report"
Cohesion: 0.40
Nodes (4): 1. Automated Test & Quality Gates Summary, 2. Playwright End-to-End Scenarios Verified, 3. Responsive Breakpoint Inspection (Chrome), Stage 2 Quality Assurance & Verification Report

### Community 69 - "2. Design Tokens & Foundations"
Cohesion: 0.40
Nodes (5): 2.1 Color Tokens, 2.2 Canonical Tints, 2.3 Typography Tokens, 2.4 Spatial Tokens & Layout, 2. Design Tokens & Foundations

### Community 70 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 73 - "10. User Responsibilities"
Cohesion: 0.50
Nodes (4): 10. User Responsibilities, Honest Reporting, Proper Handling, Timely Returns

### Community 74 - "8. Compensation Policy"
Cohesion: 0.50
Nodes (4): 8.1 Determining Compensation, 8.2 Payment Timeline, 8.3 Appeals, 8. Compensation Policy

### Community 75 - "11. Policy engine"
Cohesion: 0.50
Nodes (4): 11. Policy engine, Item, Request, User

### Community 76 - "23. Stock alerts"
Cohesion: 0.50
Nodes (4): 23. Stock alerts, LOW_AVAILABILITY, LOW_FUNCTIONING_STOCK, LOW_STOCK

### Community 77 - "4. Application roles"
Cohesion: 0.50
Nodes (4): 4. Application roles, BOARD, MEMBER, SUPERADMIN

### Community 78 - "Tracking modes"
Cohesion: 0.50
Nodes (4): 8. Inventory model, INDIVIDUAL_ASSET, QUANTITY, Tracking modes

### Community 79 - "4. State Machines & Lifecycles"
Cohesion: 0.50
Nodes (4): 4.1 Borrow Request Lifecycle, 4.2 Allocation Reservation Expiry, 4.3 Loan Lifecycle & Physical Return Inspection, 4. State Machines & Lifecycles

### Community 81 - "common.ts"
Cohesion: 0.50
Nodes (3): DomainStatus, PaginatedResult, PaginationParams

### Community 82 - "vite-env.d.ts"
Cohesion: 0.50
Nodes (3): *.jpg, *.png, *.svg

### Community 83 - "5. Clearance model"
Cohesion: 0.67
Nodes (3): 5. Clearance model, Account-derived clearance, Automatic rules

### Community 84 - "16. Inventory Experience"
Cohesion: 0.67
Nodes (3): 16.1 Search, 16.2 Inventory filters, 16. Inventory Experience

### Community 85 - "75. Core Screens to Implement First"
Cohesion: 0.67
Nodes (3): 75. Core Screens to Implement First, Board, Member

## Knowledge Gaps
- **485 isolated node(s):** `viewports`, `name`, `private`, `version`, `type` (+480 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `components.test.tsx`, `MobileBoardBottomNav.tsx`, `ConfirmationDialog.tsx`, `useSession`, `DesignLabPage.tsx`, `button.tsx`, `utils.ts`, `QuickOnboardingModal.tsx`, `RegisterPage.tsx`, `BoardItemDetailPage.tsx`, `UserMenu.tsx`, `BoardAuditDetailPage.tsx`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `useSession()` connect `useSession` to `BoardIncidentsPage.tsx`, `ProjectSummary`, `useBoardUsers.ts`, `DesignLabPage.tsx`, `member/index.tsx`, `board/index.tsx`, `button.tsx`, `QuickOnboardingModal.tsx`, `BoardAuditDetailPage.tsx`, `BoardItemDetailPage.tsx`, `MemberNotificationsPage.tsx`, `UserMenu.tsx`, `BoardProjectsPage.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `MockBoardDisciplineService` connect `BoardIncidentsPage.tsx` to `types/index.ts`, `services/index.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `viewports`, `name`, `private` to the rest of the system?**
  _485 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui_ux_context.md` be split into smaller, more focused modules?**
  _Cohesion score 0.02564102564102564 - nodes in this community are weakly interconnected._
- **Should `BorrowRequest` be split into smaller, more focused modules?**
  _Cohesion score 0.051203277009728626 - nodes in this community are weakly interconnected._
- **Should `BoardIncidentsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06994535519125683 - nodes in this community are weakly interconnected._