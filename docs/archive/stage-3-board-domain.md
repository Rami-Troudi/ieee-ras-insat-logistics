# STAGE 3 ARCHITECTURE: BOARD & SUPERADMIN OPERATIONAL DOMAIN

## 1. Architectural Philosophy: Unified Domain Datastore

Stage 3 implements the complete Board Custodian and Superadmin operational frontend without creating an isolated admin silo or fake universe. All roles—Members, Board Custodians (Level V), and Superadmins (Level VI)—operate against **one central, coherent mock datastore** (`mockDb`).

```
[ UI Layer (Member & Board) ]
           │
           ▼
[ TanStack Query Hooks (useBoardRequests, useBoardLoans, useBoardInventory, etc.) ]
           │
           ▼
[ Public Service Contracts (src/services/contracts/board/*) ]
           │
           ▼
[ Mock Implementations (src/services/mock/board/*) ]
           │
           ▼
[ Central Mock Database (src/mocks/db.ts) ]
  ├── Inventory (Stock balances & Asset tracking)
  ├── Requests (Multidimensional request state)
  ├── Loans (Active custody & Return items)
  ├── Allocations (48h reservation timers)
  ├── Inventory Events (Immutable stock movement history)
  ├── Semester Audits (T0 snapshots & Reconciliations)
  ├── Incidents & Recommendations (Disciplinary dossier)
  ├── Strikes & Compensations (Progressive sanctions)
  ├── Audit Events (Administrative audit log)
  └── User Profiles & Semesters
```

---

## 2. Cross-Role Lifecycle State Machines

Every operation performed by a Board member immediately mutates the shared domain state visible to Members in real time.

```
MEMBER                                                    BOARD / SUPERADMIN
  │                                                               │
  ├────────── Submit Borrow Request ─────────► [ REQ: PENDING ]   │
  │                                                   │           │
  │                                                   ▼           │
  │                                            Line-Item Review ──┤ (Partial / Full Approval)
  │                                                   │           │
  │   [ 48h Pickup Timer Active ]                     ▼           │
  │◄──────── In-App Notification ────────── [ REQ: APPROVED ]     │
  │   [ Stock: available → allocated ]                │           │
  │                                                   ▼           │
  │   [ Member Visits Workshop Counter ]       Physical Handover ─┤ (Serial scanning / verification)
  │                                                   │           │
  │   [ REQ: CLOSED ]                                 ▼           │
  │   [ Stock: allocated → borrowed ]        [ LOAN: ACTIVE ]     │
  │                                             │           │     │
  │                                             │           │     │
  │── Submit Extension Request ────────────────►│           ├─────┤ Extension Decision (Approve/Reject)
  │                                             │           │     │
  │── Declare Return (Pending Intake) ─────────►│           │     │
  │                                             │           │     │
  │   [ Member Brings Equipment to Bench ]      ▼           │     │
  │                                       Return Inspection ──────┤ (Condition: GOOD / DAMAGED / LOST)
  │                                             │                 │
  │   [ Stock: borrowed → available ]           ▼                 │
  │   [ LOAN: CLOSED ]                   Return Confirmed         │
  │                                             │                 │
  │                                             ├─ If DAMAGED/LOST:
  │                                             ▼
  │                                      Incident Created ────────┤ (Auto-logged incident + recommendation)
  │                                             │                 │
  │◄── Sanction Notice ─────────────────── Issue Strike ──────────┤ (Progressive Sanctions 1–5)
```

---

## 3. Stock Allocation & Inventory Reservation Invariants

To eliminate race conditions and over-allocation, inventory balances are governed by the following mathematical invariants:

$$\text{Total Quantity} = \text{Available} + \text{Allocated} + \text{Borrowed} + \text{Damaged} + \text{In Maintenance}$$

### State Transitions:

1. **Request Approved (48h Reservation Window)**:
   $$\text{Available} \leftarrow \text{Available} - Q_{\text{approved}}, \quad \text{Allocated} \leftarrow \text{Allocated} + Q_{\text{approved}}$$
   An `AllocationRecord` is created with an expiration timestamp ($T_0 + 48\text{h}$).
2. **Allocation Expiry / Board Cancellation**:
   $$\text{Allocated} \leftarrow \text{Allocated} - Q, \quad \text{Available} \leftarrow \text{Available} + Q$$
3. **Physical Handover**:
   $$\text{Allocated} \leftarrow \text{Allocated} - Q, \quad \text{Borrowed} \leftarrow \text{Borrowed} + Q$$
   The request is marked `handoverStatus: "HANDED_OVER"`, `lifecycleStatus: "CLOSED"`, and an active `LoanRecord` is created.
4. **Return Intake (Condition: GOOD / MINOR_ISSUE)**:
   $$\text{Borrowed} \leftarrow \text{Borrowed} - Q_{\text{returned}}, \quad \text{Available} \leftarrow \text{Available} + Q_{\text{returned}}$$
5. **Return Intake (Condition: DAMAGED / MAINTENANCE)**:
   $$\text{Borrowed} \leftarrow \text{Borrowed} - Q_{\text{returned}}, \quad \text{Damaged} \leftarrow \text{Damaged} + Q_{\text{returned}}$$
   An `IncidentRecord` (Category: `DAMAGE`) and `DisciplinaryRecommendation` are appended.
6. **Return Intake (Condition: LOST)**:
   $$\text{Borrowed} \leftarrow \text{Borrowed} - Q_{\text{lost}}, \quad \text{Total} \leftarrow \text{Total} - Q_{\text{lost}}$$
   An `IncidentRecord` (Category: `LOST`) and `DisciplinaryRecommendation` (Strike Level 2) are created.

---

## 4. Role Hierarchy & Superadmin Authority Gates

The system enforces strict multi-level access control:

| Capability                                       | Member (Level I–IV) | Board Custodian (Level V)  | Superadmin / Chairman (Level VI) |
| ------------------------------------------------ | ------------------- | -------------------------- | -------------------------------- |
| Browse Equipment & Cart                          | Yes                 | Yes                        | Yes                              |
| Submit Borrow / Return / Extension               | Yes                 | Yes                        | Yes                              |
| Review Standard Requests (Classes A–F)           | No                  | **Yes**                    | **Yes**                          |
| **Approve High-Value Equipment (Class G)**       | No                  | **Blocked (Throws Error)** | **Authorized Only**              |
| Confirm Physical Handover & Return Intake        | No                  | **Yes**                    | **Yes**                          |
| Start Semester Audits & Reconcile                | No                  | **Yes**                    | **Yes**                          |
| Issue Strikes 1 to 4                             | No                  | **Yes**                    | **Yes**                          |
| **Issue Strike 5 (Permanent Blacklist)**         | No                  | **Blocked (Throws Error)** | **Authorized Only**              |
| **Grant Manual Level IV Clearance**              | No                  | **Blocked (Throws Error)** | **Authorized Only**              |
| **Elevate User Role to Board / Superadmin**      | No                  | **Blocked (Throws Error)** | **Authorized Only**              |
| Export Standard CSV (Inventory, Loans, Projects) | No                  | **Yes**                    | **Yes**                          |
| **Export Sensitive CSV (Users, Audit Log)**      | No                  | **Blocked (Throws Error)** | **Authorized Only**              |

---

## 5. Semester Physical Inventory Audits & Discrepancy Reconciliation

Physical audit campaigns enforce rigorous hardware accounting:

1. **Audit Initialization**: Captures snapshot expected quantities for all inventory items at $T_0$.
2. **Physical Count Recording**: Custodians enter actual physical counts from cabinet bins. If $\text{Physical} \neq \text{Expected}$, status becomes `DISCREPANCY` with calculated delta.
3. **Completion Gate**: An audit **cannot be completed** while unreconciled discrepancies exist (`mockBoardAuditService.completeAudit` throws an error).
4. **Reconciliation Actions**:
   - `CORRECT`: Adjusts snapshot count for counting errors.
   - `DAMAGE`: Relocates missing units to damaged pool and generates an incident.
   - `RETIRE`: Permanently writes off missing equipment from total stock with justification.
   - `RECOVER`: Adds newly discovered units into available pool.

---

## 6. Immutable Administrative Audit Logging

All custodial and administrative actions append an audit record to `mockDb.data.auditEvents`:

- Actor User ID, Name, and Role.
- Target Entity Type (`REQUEST`, `LOAN`, `INVENTORY`, `USER`, `AUDIT`, `DISCIPLINE`, `EXPORT`).
- Action Type (`REQUEST_APPROVED`, `HANDOVER_CONFIRMED`, `RETURN_INSPECTED`, `CLEARANCE_MODIFIED`, `STRIKE_ISSUED`, `CSV_EXPORTED`, etc.).
- Before & After State Snapshots.
- Timestamp and Justification Notes.
