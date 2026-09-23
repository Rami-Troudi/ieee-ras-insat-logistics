# Current Product UX Specification

## 1. Design Vision & Philosophy

The logistics portal minimizes unnecessary digital interaction, channeling all real-world equipment transfers through high-trust, physical logistics desk touchpoints. The digital platform focuses on:

1. Fast, friction-free equipment discovery and cart request submission.
2. Clear status tracking without false digital declarations (no member-initiated return forms or appointment booking systems).
3. Fast operational desk workflows for operators (single-click stock reservation, serial assignment upon physical handover, instant return inspection).

---

## 2. Borrower UX Architecture (`/app`)

### 2.1 Navigation & Shell

- **Desktop (>= 1024px)**: Fixed left sidebar featuring direct links to:
  - **Catalogue** (`/app/inventory`): Item browsing and search.
  - **Activity** (`/app/activity`): Consolidated request and loan lifecycle views.
  - **Design Lab** (`/_dev/design`): Developer style guide (dev mode).
  - Secondary footer links for Notifications and Profile.
- **Mobile (< 1024px)**: Fixed bottom navigation bar with icon + label tabs (`Catalogue`, `Activity`, `Profile`) and header top bar with cart badge.

### 2.2 Discovery & Cart Submission

- **Catalogue Grid**: Items displayed with qualitative availability indicators (`Available`, `Limited`, `Out of stock`).
- **Item Details**: Displays equipment details, datasheet link, and contextual action:
  - Class C & E: `Add to cart` button.
  - Class A & B: `"Available at RAS workspace"` notice.
  - Class F: `"Ask logistics team"` notice.
  - Class G / High-Value: Restricted notice.
- **Cart & Submission**:
  - Quantity controls (1 to 99).
  - Expected return date picker (mandatory, minimum date today).
  - Optional note textarea.
  - Clear success state directing borrowers to `/app/activity`.

### 2.3 Member Activity States

Consolidated under `/app/activity` in four clear operational sections:

1. **Waiting for Approval**: Active pending requests undergoing logistics review. Allows self-cancellation.
2. **Ready to Pick Up**: Approved requests held under 48-hour reservation awaiting physical pickup at the desk.
3. **With You (Active Loans)**: Currently held equipment with expected return dates. Displays clear instructions: `"Bring equipment to the logistics desk for physical return inspection."` Strictly lacks digital return or extension buttons.
4. **History**: Past closed loans and historical requests.

---

## 3. Operator UX Architecture (`/board`)

### 3.1 Information Architecture

The operator shell is strictly organized into six core sections:

1. **Dashboard** (`/board`): Real-time metrics (Pending requests, Active loans, Overdue loans, Low stock warnings).
2. **Requests** (`/board/requests`): Triage queue for pending, approved, and rejected requests.
3. **Borrowed** (`/board/borrowed`): Active loans management with instant return modal and direct due-date inline editor.
4. **Inventory** (`/board/inventory`): Item catalog, asset tracking, stock movement logging, and audit adjustments.
5. **People** (`/board/people`): Member directory, clearance oversight, and disciplinary strike management.
6. **More** (`/board/more`): Secondary tools including audits, incident reports, data exports, and audit logs.

### 3.2 Key Operator Workflows

- **Request Approval**: One-click approval reserves stock and creates a 48h allocation.
- **Physical Handover**: On borrower arrival, operator assigns individual asset serial numbers (if individually tracked) and confirms physical handover, transitioning request to an active loan.
- **Direct Due-Date Adjustment**: Operator can update the expected return date directly from the borrowed list without complex request-counter-offer cycles.
- **Physical Return & Inspection**: Operator inspects returned items, selects condition (`Good`, `Needs attention`, `Damaged`, `Lost`), and enters inspection notes. Damaged selections automatically initiate an incident and disciplinary strike recommendation.

---

## 4. Responsive Viewport Specifications

| Viewport         | Device Class                         | Width x Height | Layout & Interaction Rules                                                                      |
| ---------------- | ------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------- |
| **mobile-375**   | Small Handset (iPhone SE)            | 375 x 667      | Single-column stack, bottom nav active, compact card padding (p-3), touch targets minimum 44px. |
| **mobile-430**   | Large Handset (iPhone 14/15 Pro Max) | 430 x 932      | Single-column stack, bottom nav active, full-width search input, expanded card whitespace.      |
| **tablet-768**   | Tablet Portrait (iPad Mini/Air)      | 768 x 1024     | Two-column grid for inventory cards, bottom nav active, modal dialogs centered with max-w-lg.   |
| **desktop-1024** | Compact Desktop / Laptop             | 1024 x 768     | Desktop sidebar expands (240px fixed), bottom nav hidden, multi-column inventory grid.          |
| **desktop-1440** | Widescreen Desktop                   | 1440 x 900     | Max-w-6xl container constraints, comfortable table density, sticky top bar controls.            |
