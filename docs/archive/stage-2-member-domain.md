# Stage 2 Member Logistics Architecture & Domain Specification

## 1. Domain Entities & Type Modularization

To support the complete Member logistics journey while keeping Stage 1 foundations intact, domain types are modularized under `src/types/`:

- **`src/types/common.ts`**:
  - `ClearanceLevel` (`I` through `VI`), `UserRole` (`MEMBER`, `BOARD`, `SUPERADMIN`), `EquipmentCategory`, `EquipmentClass` (`A` through `G`), `UserStatus` (`ACTIVE`, `SUSPENDED`, `BANNED`, `BLACKLISTED`), and `DomainStatus`.
  - Multidimensional operational statuses:
    - **Requests**:
      - `decisionStatus`: `"PENDING" | "APPROVED" | "PARTIALLY_APPROVED" | "REJECTED"`
      - `handoverStatus`: `"WAITING" | "HANDED_OVER"`
      - `lifecycleStatus`: `"ACTIVE" | "CLOSED" | "CANCELLED" | "EXPIRED"`
      - Derived presentation status: `getRequestDisplayStatus(request)`
    - **Loans**:
      - `lifecycleStatus`: `"ACTIVE" | "CLOSED"`
      - `dueStatus`: `"ON_TIME" | "DUE_SOON" | "OVERDUE"`
      - `returnStatus`: `"NONE" | "PENDING_CONFIRMATION" | "PARTIAL" | "COMPLETE"`
      - `extensionStatus`: `"NONE" | "PENDING" | "APPROVED" | "REJECTED"`
      - Derived presentation status: `getLoanDisplayStatus(loan)`
- **`src/types/users.ts`**:
  - `UserPersona` (`id`, `name`, `email`, `role`, `clearance`, `affiliation`, `isProcessed`, `status`, `strikesCount`), `UserProfile`, `StrikeRecord` (`id`, `issuedAt`, `reason`, `resolved`, `notes`).
- **`src/types/projects.ts`**:
  - `Project` (`id`, `name`, `code`, `description`, `status`, `leadId`, `memberIds`).
- **`src/types/inventory.ts`**:
  - `InventoryItem` (`id`, `name`, `code`, `category`, `equipmentClass`, `totalQuantity`, `availableQuantity`, `specifications`, `description`, `imageUrl`).
- **`src/types/requests.ts`**:
  - `RequestLineItem` (`id`, `itemId`, `itemName`, `equipmentClass`, `category`, `requestedQuantity`, `approvedQuantity`, `handedOverQuantity`, `returnedQuantity`, `damagedQuantity`, `lostQuantity`, `status`, `rejectionReason`).
  - `BorrowRequest` (`id`, `userId`, `userName`, `userEmail`, `userClearance`, `projectId`, `projectName`, `purpose`, `expectedReturnDate`, `decisionStatus`, `handoverStatus`, `lifecycleStatus`, `reviewedBy`, `reviewedAt`, `pickupDeadline`, `timeline`, `items`).
  - `CreateBorrowRequestInput`.
- **`src/types/loans.ts`**:
  - `LoanLineItem` (`id`, `itemId`, `itemName`, `equipmentClass`, `category`, `serialNumbers`, `conditionOnHandover`, `borrowedQuantity`, `returnedQuantity`, `returnRequestedQuantity`).
  - `LoanRecord` (`id`, `requestId`, `userId`, `userName`, `userEmail`, `projectId`, `projectName`, `purpose`, `borrowDate`, `dueDate`, `lifecycleStatus`, `dueStatus`, `returnStatus`, `extensionStatus`, `items`, `extensionRequests`, `returnRequests`).
  - `RequestExtensionPayload`, `RequestReturnPayload`.
- **`src/types/notifications.ts`**:
  - `MemberNotification` (`id`, `userId`, `title`, `message`, `type`, `read`, `link`, `createdAt`).

---

## 2. In-Memory Mock Datastore & Scenario Engine

Implemented in `src/mocks/db.ts` with transparent `localStorage` sync and state restoration:

- **Seed Entities**:
  - **Inventory**: Spanning Classes A through G (e.g. `item-resistors-kit` [Class B], `item-pololu-driver` [Class C], `item-screwdriver-set` [Class D], `item-stm32-f4` [Class E], `item-arduino-uno` [Class E], `item-soldering-station` [Class F], `item-oscilloscope` [Class G]).
  - **Requests**:
    - `REQ-2026-0001`: Active PENDING request under initial review.
    - `REQ-2026-0045`: Active APPROVED request awaiting physical collection within the 48-hour pickup window.
    - `REQ-2026-0142`: Active PARTIALLY_APPROVED request with line-item decision breakdown.
    - `REQ-2026-0201`: CANCELLED request.
  - **Loans**:
    - `LN-2026-0089`: Active on-track loan.
    - `LN-2026-0042`: Active OVERDUE loan.
    - `LN-2026-0015`: Active loan with PENDING extension request.
    - `LN-2026-0003`: Active loan with PENDING return declaration.
  - **Personas**:
    - Standard IEEE Member (`p-member-ieee`: Level III clearance, Active, 0 strikes).
    - Restricted Member (`p-member-restricted`: Level III clearance, 2 active strikes, explicit Board review required).
    - Provisional Registrant (`p-member-unprocessed`: Level I clearance, unverified affiliation, `isProcessed: false`).
    - Board Custodian (`p-board-custodian`: Level V clearance, Board role).
    - Superadmin (`p-superadmin`: Level VI clearance, Superadmin role).

---

## 3. Authoritative Policy & Eligibility Rules

Implemented in `src/features/inventory/utils/eligibility.ts`:

- **Clearance Level Hierarchy**:
  - **Level I (External Individuals)**: Restricted to Class A (Consumables) and Class B (Expendable Resources).
  - **Level II (Aerobotix)**: Eligible for Classes A, B, and C.
  - **Level III (IEEE Members)**: Eligible for Classes A through E. Class F is permitted only under active Level V+ supervision.
  - **Level IV (Trusted Individuals)**: Granted exceptional access by Level VI across standard classes (including Class F without mandatory Level V+ supervision). Class G requires explicit Level VI authorization.
  - **Level V (RAS Board & Eurobot)**: Full operational access; can supervise Class F. Class G requires explicit Level VI authorization.
  - **Level VI (RAS Chairman & Logistics Manager)**: Highest authority; only level granting Class G authorization.

- **Workflow Ordering & Off-Workflow Direct Classes (B & D)**:
  - Clearance level is evaluated **before** direct counter classification:
    - Level I + Class B $\to$ Clearance satisfied $\to$ Direct Board counter interaction.
    - Level I + Class D $\to$ **Insufficient clearance** (Class D requires Level III+).
    - Level II + Class D $\to$ **Insufficient clearance** (Class D requires Level III+).
    - Level III + Class D $\to$ Clearance satisfied $\to$ Direct Board counter interaction.
  - Classes B and D are handled directly at the workshop counter and cannot be placed in the online reservation cart.

- **Disciplinary Strike System**:
  - **Strike 1**: Formal warning recorded; standard borrowing remains permitted.
  - **Strike 2**: Explicit Board review required for all borrow requests; Classes F and G are strictly unavailable.
  - **Strike 3**: Cumulative Strike 2 restrictions maintained; Class E equipment may only be used **under supervision** in the lab; Classes F and G remain unavailable.
  - **Strike 4**: Complete suspension of borrowing privileges until the end of the semester.
  - **Strike 5**: Permanent blacklist / account ban.
  - **Late Returns**: Equipment overdue by > 2 weeks leads to manual human review and strike recommendation by the Logistics Custodian, not automatic strikes.

- **Provisional Accounts**:
  - Newly registered users (`isProcessed: false`) are permitted to browse and submit borrow requests. Identity and affiliation are verified and updated by the Logistics Board during processing.

- **Strict Returnable Quantity Formula**:
  $$\text{maxReturnable} = \text{borrowedQuantity} - \text{returnedQuantity} - \text{alreadyPendingReturnQuantity}$$

---

## 4. Public Service Boundaries

All feature modules interact with data strictly through public service contracts:

- `src/services/contracts/auth.ts` $\to$ `authService`: `registerMember`, `getCurrentSession`, `setSession`, `clearSession`, `subscribeSession`
- `src/services/contracts/inventory.ts` $\to$ `inventoryService`: `getItems`, `getItemById`, `getCategories`, `toggleFavorite`, `getFavorites`
- `src/services/contracts/requests.ts` $\to$ `requestService`: `getUserRequests`, `getRequest`, `createRequest`, `cancelRequest`
- `src/services/contracts/loans.ts` $\to$ `loanService`: `getUserLoans`, `getLoan`, `requestExtension`, `requestReturn`
- `src/services/contracts/profile.ts` $\to$ `profileService`, `notificationService`, `projectService`: `getUserProfile`, `updateUserProfile`, `getUserNotifications`, `markNotificationAsRead`, `markAllNotificationsAsRead`, `listMine`, `listActive`
