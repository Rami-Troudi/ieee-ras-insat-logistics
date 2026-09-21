# Stage 2 Member Logistics Architecture & Domain Specification

## 1. Domain Entities & Type Modularization

To support the complete Member logistics journey while keeping Stage 1 boundaries intact, the domain types were modularized cleanly under `src/types/`:

- **`src/types/common.ts`**:
  - Re-exports `ClearanceLevel` (`I` through `VI`), `UserRole` (`MEMBER`, `BOARD`, `SUPERADMIN`), `EquipmentCategory`, `ItemClass` (`A` through `G`), and `DomainStatus`.
  - Added domain statuses: `CANCELLED` and `RETURN_REQUESTED` to support member-side cancellation of pending requests and partial return declarations before physical board verification.
- **`src/types/users.ts`**:
  - `UserClearanceInfo`, `StrikeRecord` (reason, date, cleared status), `UserProfile`, and `MemberSession`.
- **`src/types/projects.ts`**:
  - `Project` entity (`id`, `name`, `code`, `description`, `status`, `leadId`, `memberIds`).
- **`src/types/inventory.ts`**:
  - `SerializedUnit` (status, condition, serialNumber, qrCode, notes).
  - `InventoryItem` (specs, consumables, requiredClearance, minimumClass, itemClass, loanRule: direct vs project-linked, isConsumable).
  - `ItemClassPolicy` definition with clear handling rules for Class A through Class G.
- **`src/types/requests.ts`**:
  - `RequestLineItem` (itemId, itemName, itemThumbnail, itemClass, requestedQuantity, approvedQuantity, allocatedSerialNumbers, rejectionReason).
  - `BorrowRequest` (id, requestNumber, requester, projectId, purpose, estimatedReturnDate, status: `PENDING` | `APPROVED` | `PARTIALLY_APPROVED` | `REJECTED` | `EXPIRED` | `CANCELLED`, pickupDeadline, timeline).
  - `CreateBorrowRequestInput`.
- **`src/types/loans.ts`**:
  - `LoanItem` (itemId, itemName, itemThumbnail, serialNumber, conditionAtDispatch).
  - `ActiveLoan` (id, loanNumber, requestId, borrower, projectId, purpose, checkoutDate, originalDueDate, currentDueDate, status: `ACTIVE` | `RETURN_REQUESTED` | `RETURNED` | `PARTIALLY_RETURNED` | `OVERDUE` | `DUE_SOON`, items, extensionRequests, returnDeclarations).
  - `ExtensionRequestInput`, `ReturnDeclarationInput`.
- **`src/types/notifications.ts`**:
  - `MemberNotification` (id, userId, title, message, type, isRead, link, createdAt).

---

## 2. In-Memory Mock Datastore & Scenario Engine

Implemented in `src/mocks/db.ts` with transparent `localStorage` persistence and reset capability:

- **Isolated Scenarios**:
  - Pre-seeded with 12 diverse inventory items spanning Classes A to G (e.g., Class A STM32/RPi, Class B Heavy Actuators, Class D Lithium Polymer Battery Packs, Class F Soldering Iron, Class G Resin SLA 3D Printer).
  - Pre-seeded requests: Pending (`REQ-2025-001`), Approved with 48-Hour Pickup Window Countdown (`REQ-2025-002`), Partially Approved with line item details (`REQ-2025-003`).
  - Pre-seeded loans: Active loan on track (`LOAN-2025-001`), Overdue high-risk loan (`LOAN-2025-002`), Active loan with pending extension (`LOAN-2025-003`), Loan with pending partial return declaration (`LOAN-2025-004`).
  - Pre-seeded notifications: 4 initial notifications linking directly to requests and loans.
- **Transactional State Management**:
  - Cart operations persist in `localStorage['ieee_ras_borrow_cart']`.
  - Favorites persist in `localStorage['ieee_ras_member_favorites']`.
  - Demo reset button available in `MemberProfilePage` wipes and re-seeds cleanly.

---

## 3. Policy & Eligibility Rule Engine

Implemented in `src/features/inventory/utils/eligibility.ts`:

- **Clearance Level Hierarchy**: Clearance rank comparison (I=1 through VI=6). Members cannot borrow items exceeding their clearance.
- **Strike System & Account Restrictions**:
  - Active strikes counted from user profile.
  - $\ge 2$ active strikes $\to$ Borrowing privileges suspended (`RESTRICTED` status).
- **Overdue Loans Gate**:
  - Any loan with status `OVERDUE` immediately blocks new request submissions.
- **Item Class Directives**:
  - **Class B / Class D**: Must be associated with an active IEEE RAS registered project (standalone personal requests blocked).
  - **Class F**: Permanent lab use only; cannot be taken off-campus.
  - **Class G**: Supervised access required; direct checkout prohibited.
- **Borrow Limits**:
  - General members: Max 3 concurrent active loans, max 14 days standard duration.

---

## 4. Public Service Boundaries

All features consume public domain services from `src/services/` backed by contract interfaces:

- `inventoryService`: `getItems`, `getItemById`, `getCategories`, `toggleFavorite`, `getFavorites`
- `requestsService`: `getRequests`, `getRequestById`, `createRequest`, `cancelRequest`
- `loansService`: `getLoans`, `getLoanById`, `requestExtension`, `declareReturn`
- `notificationsService`: `getNotifications`, `markAsRead`, `markAllAsRead`
- `profileService`: `getProfile`, `updateProfile`, `resetDemoData`

In Stage 4, these contracts can be swapped for Hono/Drizzle REST API implementations without altering UI component imports.
