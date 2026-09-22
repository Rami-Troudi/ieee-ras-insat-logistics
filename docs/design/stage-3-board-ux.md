# STAGE 3 DESIGN: BOARD & SUPERADMIN OPERATIONAL UX

## 1. Design Principles for Operational Custodians

The Stage 3 Board interface is engineered for fast, high-density operational workflows at the physical logistics bench while maintaining strict adherence to IEEE RAS brand standards and mobile accessibility.

### Core UX Rules:

- **Triage Priority First**: Critical sanctions, delinquent loans, and pending handovers are surfaced immediately via the Action Center triage metrics.
- **Zero Information Loss**: Line-item review, borrower dossier, item stock history, and disciplinary strikes are accessible within 1 click.
- **Dual-Density Viewports**: High-density table layouts on desktop ($\ge 1024\text{px}$) that seamlessly transform into actionable touch cards on mobile ($\le 768\text{px}$).
- **Mobile Touch Compliance**: Every interactive control, action trigger, and filter chip meets the $\ge 44 \times 44\text{px}$ minimum touch target rule on mobile viewports.

---

## 2. Feature Workflows & Interface Specifications

### 2.1 Logistics Action Center (`/board`)

- **Triage Counter Grid**: Categorized operational tiles (`Strikes & Incidents`, `Overdue Loans`, `Pending Returns`, `Time Extensions`, `Borrow Requests`, `New Accounts`).
- **Urgency Matrix**: Critical priority items flagged with pulse badges and direct triage modals.
- **Active 48h Reservation Tracker**: Visual countdown timers for approved requests awaiting physical pickup.

### 2.2 Master Inventory & Stock Ledger (`/board/inventory` & `/board/inventory/:itemId`)

- **Real-Time Stock Balances**: Instant visibility of Total, Available, 48h Allocated, Borrowed, and Damaged units.
- **Stock Mutation Modal**: Direct custodial adjustment for adding, maintaining, repairing, or retiring equipment units with mandatory reason logging.
- **Stock Lifecycle Event Ledger**: Chronological audit trail showing every stock change, actor, and before/after delta.

### 2.3 Borrow Requests & Line-Item Review (`/board/requests` & `/board/requests/:requestId`)

- **Line-Item Decision Matrix**: Granular per-item quantity approval/rejection rather than monolithic accept/reject.
- **Borrower Dossier Inspection**: Embedded sidebar displaying the member's verified affiliation, clearance level, active strikes count, and active loan history.
- **Superadmin Class G Gate**: Visual warning and disabled state for Class G equipment when viewed by Level V Board members, requiring Level VI Superadmin authorization.
- **Physical Handover Modal**: Serial number capture / validation and handover notes recording.

### 2.4 Active Loans & Intake Inspection (`/board/loans` & `/board/loans/:loanId`)

- **Overdue Visual Telemetry**: Red badge indicators and overdue day counters for delinquent custody.
- **Physical Intake Modal**: Condition assessment selector (`GOOD`, `MINOR_ISSUE`, `DAMAGED`, `MAINTENANCE`, `LOST`) with automatic incident escalation for damaged/lost hardware.
- **Extension Request Action**: Approve/reject pending due date extension requests with custom date selection.

### 2.5 Semester Physical Audits (`/board/audits` & `/board/audits/:auditId`)

- **Audit Campaign Manager**: Initialize semester stock audits with automated $T_0$ snapshot capture.
- **Physical Counting Interface**: Quick keypad/input for recorded bin counts.
- **Discrepancy Reconciliation Drawer**: Interactive resolution of missing or excess items with mandatory category classification (`CORRECT`, `DAMAGE`, `RETIRE`, `RECOVER`).

### 2.6 Disciplinary Operations & Progressive Strikes (`/board/incidents`)

- **Human-in-the-Loop Sanction Review**: Review automated recommendations triggered by damaged/lost returns or overdue loans.
- **Progressive Strike Issuer**: Form modal supporting Strikes 1 to 5 with automatic account status elevation (`RESTRICTED` on Strike 4, `BLACKLISTED` on Strike 5).
- **Strike 5 Superadmin Shield**: Explicit permission gate preventing Board members from issuing permanent blacklists without Chairman authorization.
- **Financial Compensation Tracker**: Record, track, and verify damage compensation payments.

### 2.7 Operational Insights & Fleet Telemetry (`/board/insights`)

- **Utilization Charts**: Equipment category distribution, loan velocity, and average loan duration metrics.
- **Reliability KPIs**: On-time return percentage, damage frequency rate, and active member engagement.

### 2.8 CSV Data Export Center (`/board/exports`)

- **Downloadable Reports**: Master inventory catalog, active loans ledger, overdue reports, borrow requests history, and project rosters.
- **Protected Datasets**: User account directories and immutable system audit logs restricted to Level VI Superadmin with prominent lock icons and permission badges.

---

## 3. Responsive Breakpoints & Accessibility Audit

| Viewport                    | Layout Strategy                         | Touch Target Standards                                                 | Navigation Pattern                      |
| --------------------------- | --------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------- |
| **Mobile (375px–430px)**    | Single-column cards, full-width buttons | Minimum $44\text{px}$ height on all clickable elements                 | Fixed bottom navigation + "More" drawer |
| **Tablet (768px)**          | Collapsible grid, responsive cards      | Minimum $44\text{px}$ interactive area                                 | Bottom nav / collapsible sidebar        |
| **Desktop (1024px–1440px)** | Multi-column, high-density data tables  | Compact button heights ($36\text{px}$–$40\text{px}$) with hover states | Fixed persistent left sidebar           |
