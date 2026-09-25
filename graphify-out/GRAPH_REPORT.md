# Graph Report - ieee-ras-insat-logistics  (2026-09-25)

## Corpus Check
- 250 files · ~151,012 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1681 nodes · 3936 edges · 157 communities (107 shown, 50 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `93fbd5e4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui_ux_context.md
- mock/board/audits.ts
- BoardIncidentsPage.tsx
- ProjectSummary
- worker/index.ts
- useBoardRequests.ts
- types/index.ts
- class-variance-authority
- UserPersona
- catalogAccess.ts
- mock/board/allocations.ts
- mock/board/inventory.ts
- IEEE RAS INSAT Logistics Platform — Implementation Context
- LoanRecord
- board/index.tsx
- services/index.ts
- compilerOptions
- useSession
- LoadingState.tsx
- implementations.ts
- mock/notifications.ts
- dates.ts
- BoardLoginPage.tsx
- useBoardUsers.ts
- BorrowRequest
- board-rpc.ts
- Stage 1 Quality Assurance & Browser Verification Report
- requireOperatorInDraft
- MemberNotificationsPage.tsx
- DesignLabPage.tsx
- Pre-Backend Domain Contract & Freeze Specification
- 2. Feature Workflows & Interface Specifications
- IEEE RAS Brand Identity Compliance Certificate
- types/requests.ts
- mock/requests.ts
- devDependencies
- cn
- navigation.test.tsx
- IEEE RAS INSAT Logistics Platform — Design System Specification
- context guidelines.md
- README.md
- IEEE RAS INSAT Logistics Platform
- Current Product UX Specification
- scripts
- MockDatabase
- lucide-react
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
- MockProfileService
- 16. Loan state model
- 27. Insights dashboard
- Stage 2 Member Logistics Architecture & Domain Specification
- Stage 2 Member UX & Interaction Specification
- 2. Targeted Shipped-Product Research (Lazyweb & Benchmark Pass)
- schema.ts
- 11. Management Responsibilities
- 6. Disciplinary Actions
- 5. Design System Foundations
- 9. Mobile Ergonomics
- Stage 2 Quality Assurance & Verification Report
- 2. Design Tokens & Foundations
- package.json
- mock/inventory.ts
- humanAvailability.ts
- 10. User Responsibilities
- 8. Compensation Policy
- 11. Policy engine
- 23. Stock alerts
- 4. Application roles
- Tracking modes
- 4. State Machines & Lifecycles
- vercel.json
- vite-env.d.ts
- 5. Clearance model
- 16. Inventory Experience
- 75. Core Screens to Implement First
- 13. Internal stock allocation (not a reservation feature)
- 3. Normative equipment classes
- responsive-viewports.spec.ts
- @eslint/js
- @testing-library/jest-dom
- globals
- date-fns
- @hono/node-server
- postcss
- tailwindcss
- Turso Cloud Skills
- @testing-library/react
- Authentication & Authorization
- @types/node
- @libsql/client
- typescript
- typescript-eslint
- vite
- @radix-ui/react-avatar
- @radix-ui/react-slot
- Vercel Marketplace
- @radix-ui/react-tooltip
- D1PreparedStatement
- Production deployment on Vercel Hobby
- bootstrap-superadmin.mjs
- dependencies
- react
- clsx
- react-dom
- drizzle-orm
- eslint
- react-router-dom
- @hookform/resolvers
- @radix-ui/react-alert-dialog
- @radix-ui/react-dialog
- @testing-library/user-event
- @radix-ui/react-popover
- @radix-ui/react-separator
- react-hook-form
- tailwind-merge
- tailwindcss-animate
- @tanstack/react-query
- vaul
- zod
- prettier
- @types/react-dom
- @vitejs/plugin-react
- vitest
- migrate.mjs
- Go
- JavaScript / TypeScript
- Python
- Rust
- common.ts
- eslint-plugin-react-hooks
- env.ts
- security.ts
- runtime-env.ts
- api-backend.test.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 97 edges
2. `useSession()` - 59 edges
3. `Button` - 39 edges
4. `requireOperatorInDraft()` - 39 edges
5. `IEEE RAS INSAT Logistics Platform — Implementation Context` - 37 edges
6. `LoadingState()` - 29 edges
7. `UserProfile` - 29 edges
8. `BorrowRequest` - 26 edges
9. `UserPersona` - 26 edges
10. `ProjectSummary` - 24 edges

## Surprising Connections (you probably didn't know these)
- `handler` --calls--> `createRuntimeEnv()`  [EXTRACTED]
  api/[...path].ts → src/worker/runtime-env.ts
- `DropdownMenuSubTrigger` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts
- `DropdownMenuSubContent` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts
- `DropdownMenuCheckboxItem` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts
- `DropdownMenuRadioItem` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (157 total, 50 thin omitted)

### Community 0 - "ui_ux_context.md"
Cohesion: 0.03
Nodes (77): 10. Desktop Navigation, 11. Mobile Navigation, 12. Board Navigation, 13. Member Information Architecture, 14. Board Information Architecture, 15. Member Home, 17. Inventory Card/List Item, 18. Item Detail (+69 more)

### Community 1 - "mock/board/audits.ts"
Cohesion: 0.22
Nodes (8): IBoardAuditService, ReconcileAuditDiscrepancyPayload, RecordPhysicalCountPayload, StartAuditPayload, auditLog(), MockBoardAuditService, onSiteQuantity(), InventoryAudit

### Community 2 - "BoardIncidentsPage.tsx"
Cohesion: 0.07
Nodes (32): useBoardCompensations(), useBoardIncidents(), useBoardRecommendations(), useBoardStrikes(), useCreateIncident(), useIssueStrike(), useOverturnStrike(), useRecordCompensation() (+24 more)

### Community 3 - "ProjectSummary"
Cohesion: 0.11
Nodes (16): BoardProjectFilterParams, CreateProjectParams, ProjectMemberParams, UpdateProjectParams, useAddProjectMember(), useBoardProjectDetail(), useRemoveProjectMember(), useUpdateProject() (+8 more)

### Community 4 - "worker/index.ts"
Cohesion: 0.18
Nodes (13): trustedAuthOrigin(), AppUser, AppContext, requireBoard(), requireMember(), resolveIdentity(), cleanExpiredSecurityData(), expireAllocations() (+5 more)

### Community 5 - "useBoardRequests.ts"
Cohesion: 0.21
Nodes (12): ConfirmHandoverParams, RejectEntireRequestParams, ReviewBorrowRequestParams, useBoardRequestDetail(), useConfirmHandover(), useReviewBorrowRequest(), BoardRequestDetailPage(), HandoverPayload (+4 more)

### Community 6 - "types/index.ts"
Cohesion: 0.09
Nodes (20): EQUIPMENT_IMAGES, INITIAL_ALLOCATIONS, INITIAL_AUDIT_EVENTS, INITIAL_AUDITS, INITIAL_COMPENSATIONS, INITIAL_INCIDENTS, INITIAL_INVENTORY_EVENTS, INITIAL_INVENTORY (+12 more)

### Community 8 - "UserPersona"
Cohesion: 0.10
Nodes (16): RootRedirect(), PRESET_PERSONAS, SessionProvider(), SessionProviderProps, DevPersonaContext, DevPersonaContextType, PROD_DEFAULT_PERSONA, SessionContext (+8 more)

### Community 9 - "catalogAccess.ts"
Cohesion: 0.10
Nodes (22): BorrowCartProvider(), CartAction, cartReducer(), CartContext, CartContextValue, CartLineItem, CartState, defaultReturnDate() (+14 more)

### Community 10 - "mock/board/allocations.ts"
Cohesion: 0.39
Nodes (3): IBoardAllocationService, MockBoardAllocationService, AllocationRecord

### Community 11 - "mock/board/inventory.ts"
Cohesion: 0.15
Nodes (18): MockDatabaseSchema, CreateInventoryItemPayload, IBoardInventoryService, MutateStockPayload, UpdateAssetPayload, ReturnInspectionLineItem, bucketForState, assetStates (+10 more)

### Community 12 - "IEEE RAS INSAT Logistics Platform — Implementation Context"
Cohesion: 0.07
Nodes (26): 10. Shopping cart and request submission, 12. Approval and partial approval, 14. Cancellation rules, 15. Physical handover, 17. Returns, 18. Extensions, 19. Inventory stock operations, 1. Product goal (+18 more)

### Community 13 - "LoanRecord"
Cohesion: 0.12
Nodes (12): ConfirmReturnMutationParams, INITIAL_LOANS, member, BoardLoanFilterParams, ConfirmReturnPayload, IBoardLoanService, ILoanService, makeId() (+4 more)

### Community 14 - "board/index.tsx"
Cohesion: 0.10
Nodes (45): AlertBanner(), AlertBannerProps, AlertBannerVariant, VARIANT_CONFIG, LoadingState(), PageContainer(), PageContainerProps, PageHeader() (+37 more)

### Community 15 - "services/index.ts"
Cohesion: 0.05
Nodes (52): App(), Providers(), ProvidersProps, QUERY_KEYS, queryClient, router, useExportCsv(), BoardExportsPage() (+44 more)

### Community 16 - "compilerOptions"
Cohesion: 0.08
Nodes (25): api, DOM, DOM.Iterable, ES2022, src, vite.config.ts, compilerOptions, allowImportingTsExtensions (+17 more)

### Community 17 - "useSession"
Cohesion: 0.14
Nodes (27): DEFAULT_EQUIPMENT_IMAGE, SENSOR_EQUIPMENT_IMAGE, EmptyState(), EmptyStateProps, ErrorState(), ErrorStateProps, Button, ButtonProps (+19 more)

### Community 18 - "LoadingState.tsx"
Cohesion: 0.21
Nodes (11): LoadingSkeleton, LoadingStateProps, SearchInput(), SearchInputProps, Skeleton(), useBoardLoanDetail(), useBoardLoans(), useConfirmReturn() (+3 more)

### Community 19 - "implementations.ts"
Cohesion: 0.18
Nodes (15): mockDb, ExportResult, IBoardExportService, IProjectService, activeStrikeCount(), activeStrikesForUser(), IdentityDraft, refreshStrikeDerivedProfile() (+7 more)

### Community 20 - "mock/notifications.ts"
Cohesion: 0.23
Nodes (4): INotificationService, MockNotificationService, AppNotification, NotificationType

### Community 21 - "dates.ts"
Cohesion: 0.23
Nodes (6): calculatePickupWindow(), formatRelativeTime(), isDatePast(), IBoardInsightsService, MockBoardInsightsService, BoardInsightsData

### Community 22 - "BoardLoginPage.tsx"
Cohesion: 0.28
Nodes (6): loadTurnstile(), TurnstileField(), TurnstileFieldProps, Window, FormData, schema

### Community 23 - "useBoardUsers.ts"
Cohesion: 0.10
Nodes (29): BoardUserFilterParams, ProcessUserParams, UpdateClearanceParams, UpdateRoleParams, UpdateStatusParams, useBoardUserDetail(), useProcessUser(), useUpdateUserClearance() (+21 more)

### Community 24 - "BorrowRequest"
Cohesion: 0.17
Nodes (5): IBoardRequestService, IRequestService, MockBoardRequestService, MockRequestService, BorrowRequest

### Community 25 - "board-rpc.ts"
Cohesion: 0.27
Nodes (31): audit(), confirmReturn(), decode(), dispatchBoardRpc(), expireDue(), expireOne(), exportCsv(), fail() (+23 more)

### Community 26 - "Stage 1 Quality Assurance & Browser Verification Report"
Cohesion: 0.12
Nodes (15): 1. Executive Summary, 2. Automated Quality Gates, 3. Real Browser DevTools Viewport Audit, 4. Role Shell & Board Ergonomics Verification, 5. Visual System & Design Lab (`/_dev/design`), 6. Strict Stage 2 Boundary Audit (Zero Premature Domain Logic), Board Console (`/board`), Development Persona Switcher & Production Session Isolation (`useSession` / `useDevPersona`) (+7 more)

### Community 27 - "requireOperatorInDraft"
Cohesion: 0.26
Nodes (8): requireOperatorInDraft(), createAuditEvent(), MockBoardInventoryService, assertInventoryConserved(), inventoryState(), moveUnits(), recordInventoryEvent(), now()

### Community 28 - "MemberNotificationsPage.tsx"
Cohesion: 0.30
Nodes (11): BoardNotificationsPage(), MemberNotificationsPage(), useMarkAllNotificationsAsRead(), useMarkNotificationAsRead(), useResetDemoData(), useUpdateContactInfo(), useUserNotifications(), useUserProfile() (+3 more)

### Community 29 - "DesignLabPage.tsx"
Cohesion: 0.10
Nodes (25): DevPersonaSwitcher(), FilterDrawer(), PolicyNotice(), PolicyNoticeProps, QuantitySelector(), QuantitySelectorProps, DomainStatus, STATUS_CONFIG (+17 more)

### Community 30 - "Pre-Backend Domain Contract & Freeze Specification"
Cohesion: 0.14
Nodes (14): 1. Architecture Overview & Freeze Scope, 2.1 Canonical Roles, 2.2 Clearance Hierarchy, 2.3 Access Control Boundaries, 2. Canonical Identity & RBAC Matrix, 3.1 Equipment Classes & Online Request Gating, 3.2 Borrower Stock Privacy DTO, 3.3 Stock Quantity Conservation Invariant (+6 more)

### Community 31 - "2. Feature Workflows & Interface Specifications"
Cohesion: 0.14
Nodes (13): 1. Design Principles for Operational Custodians, 2.1 Logistics Action Center (`/board`), 2.2 Master Inventory & Stock Ledger (`/board/inventory` & `/board/inventory/:itemId`), 2.3 Borrow Requests & Line-Item Review (`/board/requests` & `/board/requests/:requestId`), 2.4 Active Loans & Intake Inspection (`/board/loans` & `/board/loans/:loanId`), 2.5 Semester Physical Audits (`/board/audits` & `/board/audits/:auditId`), 2.6 Disciplinary Operations & Progressive Strikes (`/board/incidents`), 2.7 Operational Insights & Fleet Telemetry (`/board/insights`) (+5 more)

### Community 32 - "IEEE RAS Brand Identity Compliance Certificate"
Cohesion: 0.14
Nodes (13): 1. Official Canonical Color Palette, 2. Typography Standard, 3. Official Logo Integrity & Clear Space, 4. Theme Scope: Light Theme Only, 5. Verification Checkpoints, Deprecated & Prohibited Colors, IEEE Master Brand Relationship, IEEE RAS Brand Identity Compliance Certificate (+5 more)

### Community 33 - "types/requests.ts"
Cohesion: 0.13
Nodes (12): InventoryAuditItem, EquipmentClass, LoanDueStatus, LoanLifecycleStatus, LoanLineItem, LoanReturnStatus, LoanStatus, PickupWindowStatus (+4 more)

### Community 34 - "mock/requests.ts"
Cohesion: 0.15
Nodes (5): INITIAL_REQUESTS, member, ScenarioManager, CreateBorrowRequestPayload, RequestLineItem

### Community 35 - "devDependencies"
Cohesion: 0.13
Nodes (15): autoprefixer, drizzle-kit, eslint-plugin-react-refresh, jsdom, devDependencies, autoprefixer, drizzle-kit, eslint-plugin-react-refresh (+7 more)

### Community 36 - "cn"
Cohesion: 0.06
Nodes (56): ConfirmationDialog(), ConfirmationDialogProps, ActiveFilter, FilterBar(), FilterBarProps, FilterChip(), FilterChipProps, FilterDrawerProps (+48 more)

### Community 37 - "navigation.test.tsx"
Cohesion: 0.10
Nodes (22): AppBrand(), AppBrandProps, DesktopBoardSidebar(), DesktopSidebar(), MobileBoardBottomNav(), MobileBottomNav(), TopBar(), BOARD_MOBILE_TABS (+14 more)

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
Cohesion: 0.12
Nodes (16): scripts, bootstrap:superadmin, build, db:generate, db:migrate, deploy:preview, deploy:production, dev (+8 more)

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

### Community 63 - "schema.ts"
Cohesion: 0.11
Nodes (17): appUsers, auditEvents, authAccounts, authRateLimits, authSessions, authUsers, authVerifications, idempotencyKeys (+9 more)

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

### Community 71 - "mock/inventory.ts"
Cohesion: 0.43
Nodes (3): IInventoryService, inventoryService, InventoryQueryFilter

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

### Community 81 - "vercel.json"
Cohesion: 0.22
Nodes (8): maxDuration, crons, framework, functions, api/**/*.ts, headers, rewrites, $schema

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

### Community 97 - "Turso Cloud Skills"
Cohesion: 0.22
Nodes (9): Further reading, [turso-cloud-auth](turso-cloud-auth/overview.md), Turso Cloud features, [turso-cloud-go](turso-cloud-go/overview.md), [turso-cloud-js](turso-cloud-js/overview.md), [turso-cloud-py](turso-cloud-py/overview.md), [turso-cloud-rust](turso-cloud-rust/overview.md), Turso Cloud Skills (+1 more)

### Community 99 - "Authentication & Authorization"
Cohesion: 0.22
Nodes (9): Auth tokens, Authentication & Authorization, Database URL, Docs, External auth providers (JWKS), Fine-grained permissions, Invalidating tokens, Platform tokens (CLI / API) (+1 more)

### Community 117 - "Vercel Marketplace"
Cohesion: 0.22
Nodes (9): Dangerous operations — require explicit user consent, Docs, In-Function SQLite — `@tursodatabase/vercel-experimental` (BETA), Inspecting state (safe, autonomous), Provisioning a new database, Regions, Security: never read secrets, Using an already-provisioned database (+1 more)

### Community 119 - "D1PreparedStatement"
Cohesion: 0.16
Nodes (3): LibSqlPreparedStatement, toD1Result(), D1PreparedStatement

### Community 120 - "Production deployment on Vercel Hobby"
Cohesion: 0.33
Nodes (5): Local development, One-time project setup, Operating limits and recovery, Production deployment on Vercel Hobby, Release checks

### Community 122 - "dependencies"
Cohesion: 0.29
Nodes (7): better-auth, hono, dependencies, better-auth, hono, @radix-ui/react-dropdown-menu, @radix-ui/react-dropdown-menu

### Community 148 - "Go"
Cohesion: 0.40
Nodes (4): Docs, Go, Local-first with sync — `tursogo`, Remote-only — `libsql-client-go`

### Community 149 - "JavaScript / TypeScript"
Cohesion: 0.40
Nodes (5): Docs, JavaScript / TypeScript, Local-first with sync — `@tursodatabase/sync`, Package quick reference, Remote-only — `@tursodatabase/serverless` (recommended)

### Community 150 - "Python"
Cohesion: 0.40
Nodes (4): Docs, Local-first with sync — `pyturso`, Python, Remote-only — `libsql`

### Community 151 - "Rust"
Cohesion: 0.40
Nodes (4): Docs, Local-first with sync — `turso`, Remote-only — `libsql`, Rust

### Community 154 - "common.ts"
Cohesion: 0.50
Nodes (3): DomainStatus, PaginatedResult, PaginationParams

### Community 157 - "env.ts"
Cohesion: 0.40
Nodes (7): createAuth(), AuthDatabase, authSchema, escapeHtml(), sendEmail(), D1Result, Env

### Community 158 - "security.ts"
Cohesion: 0.24
Nodes (7): D1Database, databaseRateLimit(), digest(), jsonError(), rateLimit(), sameOrigin(), verifyTurnstile()

### Community 159 - "runtime-env.ts"
Cohesion: 0.31
Nodes (7): handler, createAuthDatabase(), createLibSqlClient(), RateLimit, app, createRuntimeEnv(), database()

## Knowledge Gaps
- **568 isolated node(s):** `viewports`, `name`, `private`, `version`, `type` (+563 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `navigation.test.tsx`, `board/index.tsx`, `useSession`, `LoadingState.tsx`, `DesignLabPage.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `MockDatabase` connect `MockDatabase` to `types/index.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `BorrowRequest` connect `BorrowRequest` to `types/requests.ts`, `mock/requests.ts`, `useBoardRequests.ts`, `types/index.ts`, `mock/board/inventory.ts`, `requireOperatorInDraft`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `viewports`, `name`, `private` to the rest of the system?**
  _568 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui_ux_context.md` be split into smaller, more focused modules?**
  _Cohesion score 0.02564102564102564 - nodes in this community are weakly interconnected._
- **Should `BoardIncidentsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06994535519125683 - nodes in this community are weakly interconnected._
- **Should `ProjectSummary` be split into smaller, more focused modules?**
  _Cohesion score 0.11051693404634581 - nodes in this community are weakly interconnected._