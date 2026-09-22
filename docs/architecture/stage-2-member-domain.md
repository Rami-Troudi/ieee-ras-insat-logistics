# Stage 2 Member Logistics Architecture & Domain Specification

## 1. Domain Entities & Type Modularization

To support the complete Member logistics journey while keeping Stage 1 boundaries intact, the domain types are modularized cleanly under `src/types/`:

- **`src/types/common.ts`**:
  - Re-exports `ClearanceLevel` (`I` through `VI`), `UserRole` (`MEMBER`, `BOARD`, `SUPERADMIN`), `EquipmentCategory`, `ItemClass` (`A` through `G`), and `DomainStatus`.
  - Multidimensional operational statuses:
    - Requests: `overallStatus`, `approvalStatus` (`PENDING`, `APPROVED`, `PARTIALLY_APPROVED`, `REJECTED`), `fulfillmentStatus` (`AWAITING_PICKUP`, `FULFILLED`, `EXPIRED`, `CANCELLED`). Display status is derived via `getRequestDisplayStatus(request)`.
    - Loans: `custodyStatus` (`ACTIVE`, `CLOSED`), `returnStatus` (`NONE`, `PENDING_CONFIRMATION`, `CONFIRMED_PARTIAL`, `CONFIRMED_FULL`), `overdueStatus` (`ON_TIME`, `DUE_SOON`, `OVERDUE`). Display status is derived via `getLoanDisplayStatus(loan)`.
- **`src/types/users.ts`**:
  - `UserClearanceInfo`, `StrikeRecord` (`id`, `issuedAt`, `reason`, `resolved`, `notes`), `UserProfile` (`strikesCount` represents count of active unresolved strikes), `MemberSession`, and `RegistrationFormValues`.
- **`src/types/projects.ts`**:
  - `Project` entity (`id`, `name`, `code`, `description`, `status`, `leadId`, `memberIds`).
- **`src/types/inventory.ts`**:
  - `SerializedUnit` (status, condition, serialNumber, qrCode, notes).
  - `InventoryItem` (specs, requiredClearance, minimumClass, itemClass, loanRule, isConsumable).
  - `ItemClassPolicy` definition with clear handling rules for Class A through Class G.
- **`src/types/requests.ts`**:
  - `RequestLineItem` (itemId, itemName, itemThumbnail, itemClass, requestedQuantity, approvedQuantity, allocatedSerialNumbers, rejectionReason).
  - `BorrowRequest` (id, requestNumber, requester, projectId, purpose, estimatedReturnDate, status, overallStatus, approvalStatus, fulfillmentStatus, pickupDeadline, timeline).
  - `CreateBorrowRequestInput`.
- **`src/types/loans.ts`**:
  - `LoanItem` (id, itemId, itemName, itemThumbnail, serialNumbers, conditionOnHandover, borrowedQuantity, returnedQuantity, returnRequestedQuantity).
  - `ActiveLoan` (id, loanNumber, requestId, borrower, projectId, projectName, purpose, borrowDate, dueDate, status, custodyStatus, returnStatus, overdueStatus, items, extensionRequests, returnSubmissions).
  - `ExtensionRequestInput`, `ReturnSubmissionInput`.
- **`src/types/notifications.ts`**:
  - `MemberNotification` (id, userId, title, message, type, isRead, link, createdAt).

---

## 2. In-Memory Mock Datastore & Scenario Engine

Implemented in `src/mocks/db.ts` with transparent `localStorage` persistence and reset capability:

- **Isolated Scenarios & Seed Entities**:
  - Pre-seeded inventory spanning Classes A through G (e.g., `item-stm32-f4` [Class A], `item-dynamixel-xm` [Class B], `item-lipo-battery` [Class C], `item-nema17` [Class C], `item-rpi4` [Class D], `item-fluke-87v` [Class E], `item-soldering-ts101` [Class F], `item-elegoo-mars` [Class G]).
  - Pre-seeded requests: `REQ-2026-0001` (Pending review), `REQ-2026-0045` (Approved with active 48-Hour pickup window), `REQ-2026-0142` (Partially approved with line item decision breakdown), `REQ-2026-0201` (Cancelled).
  - Pre-seeded loans: `LN-2026-0089` (Active loan on track with custody items), `LN-2026-0042` (Overdue high-risk custody loan), `LN-2026-0015` (Active loan with pending due date extension), `LN-2026-0003` (Active loan with pending partial return declaration).
  - Pre-seeded users: Standard IEEE Member (`p-member-ieee`), Restricted Strike 2 Borrower (`p-member-strike2` with 2 active unresolved strikes), Provisional Unprocessed Registrant (`p-member-unprocessed`).
- **Transactional State Management**:
  - Cart operations persist in `localStorage['ieee_ras_borrow_cart']`.
  - Favorites persist in `localStorage['ieee_ras_member_favorites']`.
  - Reset Demo Data restores database to canonical seed fixtures.

---

## 3. Authoritative Policy & Eligibility Engine

Implemented in `src/features/inventory/utils/eligibility.ts`:

- **Clearance Level Hierarchy**: Clearance rank comparison (I=1 through VI=6).
- **Clearance Precedence for Direct/Off-Workflow Classes (Class B & Class D)**:
  - Clearance eligibility is evaluated **first**:
    - Level I + Class B $\to$ Clearance satisfied, eligible for Direct Board off-workflow review.
    - Level I + Class D $\to$ **Insufficient clearance** (Class D requires Level III+).
    - Level II + Class D $\to$ **Insufficient clearance** (Class D requires Level III+).
    - Level III + Class D $\to$ Clearance satisfied, eligible for Direct Board off-workflow review.
- **Strike System & Cumulative Restrictions**:
  - Active strikes (`resolved === false`) dictate sanctions:
    - **Strike 1**: Formal advisory / warning recorded; standard borrowing remains permitted.
    - **Strike 2**: Borrowing restricted — Class C and above blocked for standard members.
    - **Strike 3**: Cumulative sanctions maintained; Class E equipment may only be used **under direct supervision**; Classes F and G remain unavailable.
- **Overdue Loans Gate**:
  - Any loan with status `OVERDUE` immediately blocks new borrow request submissions.
- **Class Directives**:
  - **Class A**: High availability, general member access.
  - **Class B**: Direct Board / off-workflow review once Level I+ clearance is established.
  - **Class C**: Project-linked, requires active assigned IEEE RAS project.
  - **Class D**: Direct Board / off-workflow review once Level III+ clearance is established.
  - **Class E**: Precision lab instrumentation; under Strike 3 requires direct supervision.
  - **Class F**: Permanent lab use only; strictly non-removable from premises.
  - **Class G**: Hazardous / specialized equipment; strictly supervised workshop access only.

---

## 4. Public Service Boundaries

All Member UI features consume domain services through clean public module exports:

- `inventoryService`: `getItems`, `getItemById`, `getCategories`, `toggleFavorite`, `getFavorites`
- `requestsService`: `getRequests`, `getRequestById`, `createRequest`, `cancelRequest`
- `loansService`: `getLoans`, `getLoanById`, `requestExtension`, `declareReturn`
- `notificationsService`: `getNotifications`, `markAsRead`, `markAllAsRead`
- `profileService`: `getProfile`, `updateProfile`, `resetDemoData`
