# IEEE RAS INSAT Logistics Platform — Implementation Context

**Status:** Frozen MVP context  
**Version:** 1.0  
**Date:** 2026-09-21  
**Source of truth for policy:** *IEEE RAS INSAT Logistics — Regulations and Policies, v1.1.1*  

> This file is the implementation handoff for developers and coding agents. The regulations are normative. When application behavior conflicts with the regulations, the regulations win unless they are formally amended.

---

## 1. Product goal

Build a **fully free responsive React web application** for IEEE RAS INSAT logistics. It must work well on desktop, tablet, and mobile browsers; there is **no native mobile application**.

The platform replaces the current form/spreadsheet workflow for operations that require formal logging and becomes the operational source of truth for:

- user accounts, roles, clearance, and account processing;
- inventory state and item lifecycle;
- borrow requests and shopping-cart submission;
- full and partial approvals;
- internal stock allocation before handover;
- physical handover and active loans;
- partial and complete returns;
- loan extensions;
- project/team assignments and project equipment views;
- stock operations and inventory audits;
- incidents, compensation, strikes, restrictions, and bans;
- board action center;
- insights/statistics;
- user-facing timelines;
- append-only audit logging;
- CSV exports;
- in-app and email notifications.

Expected scale is small: **at most roughly 1,000 requests/year**. Optimize for correctness, maintainability, authorization, and traceability rather than infrastructure scale.

---

## 2. Non-goals for MVP

Do **not** build:

- Android/iOS native apps;
- user reservation/calendar booking;
- borrowing templates/kits;
- an internal QR-code generation/printing subsystem;
- cabinet/shelf graphical modeling;
- advanced location hierarchy;
- RFID/NFC;
- AI/LLM search;
- vector search;
- procurement/purchasing workflows;
- microservices;
- Redis/Kafka/Elasticsearch;
- a data warehouse;
- a custom backup subsystem.

External QR labels may simply point to the website or an item URL.

---

## 3. Normative equipment classes

The regulation defines:

- **Class A — Consumables**: consumed during use.
- **Class B — Expendable Resources**: minor/light/easily replaceable resources.
- **Class C — Light Resources**: small, countable, usually non-electronic parts.
- **Class D — Light Equipment**: light tools, primarily non-electric.
- **Class E — Electronic Resources**: electronic/sensitive items, often PCBs.
- **Class F — Heavy Equipment**: equipment requiring experience and/or supervision.
- **Class G — High Value Electronics**: rare, high-value, difficult-to-replace electronics.

### Platform logging scope

The regulation is the law for the system. Therefore the borrowing workflow must exist wherever the regulation requires a form/notification or explicit controlled grant.

**Logged through the platform:**

- Class A — form required by regulation;
- Class C — form required;
- Class E — form + board notification;
- Class F — form + notification + supervision/clearance controls;
- Class G — controlled grant by Level VI.

**No full borrow-request workflow required:**

- Class B — direct request under the regulation;
- Class D — direct request under the regulation.

Class B/D may still exist in the inventory catalogue if the club wants global stock visibility, but ordinary B/D usage is not forced through the formal borrowing workflow.

---

## 4. Application roles

There are exactly **three application roles**.

### MEMBER
Can:

- register/login;
- browse/search/filter inventory;
- favorite items;
- build a shopping cart;
- submit borrow requests;
- cancel own pending requests;
- see own requests and active loans;
- request partial/complete returns;
- request extensions;
- see notifications and own timeline/history.

### BOARD
Operational logistics role.

A Board user is automatically at least **Clearance Level V**.

Can additionally:

- process user accounts and verify affiliation/clearance;
- create/manage projects and assign members;
- process borrow requests;
- approve partially or fully;
- reject/cancel requests;
- confirm physical handovers;
- confirm returns and condition;
- manage stock operations;
- run inventory audits;
- manage incidents and applicable sanctions;
- view project equipment;
- use the Action Center and Insights Dashboard;
- use non-sensitive exports allowed by the permission matrix.

### SUPERADMIN
A Superadmin is an authorized **Clearance Level VI** authority under the regulations.

Has Board capabilities plus sensitive functions including:

- assigning/revoking privileged roles where allowed;
- managing Level IV exceptional clearance;
- Level VI-only approvals/grants;
- Class G grants;
- permanent/blacklist-level disciplinary actions;
- sensitive exports;
- system/policy configuration exposed by the application.

**Invariant:** UI role and logistics clearance are separate concepts even though Board implies minimum Level V and Superadmin implies Level VI.

---

## 5. Clearance model

Use clearance levels defined by the regulations:

| Clearance | Meaning | Regulatory access summary |
|---|---|---|
| I | External individual | A, B |
| II | Active Aerobotix member | A, B, C |
| III | Active IEEE member | A-E; F only under required supervision |
| IV | Trusted individual | exceptional, manually granted |
| V | RAS Board and Eurobot members | logistics/supervision privileges |
| VI | RAS Chairman / Logistics authority | highest logistics authority; only authority to grant G |

### Automatic rules

- `role = BOARD` => clearance is at least Level V.
- `role = SUPERADMIN` => clearance is Level VI.
- official assignment to the **Eurobot** project/team => clearance is at least Level V.
- Level IV is **never inferred automatically**; it is manually granted by Level VI.

### Account-derived clearance

At registration, the user provides affiliation information. The platform may derive a **provisional** clearance from that data, but it remains unprocessed until the Board processes the account.

Example:

```text
claimed IEEE member -> provisional Level III
```

The user may submit a first request before account processing. A sensitive approval must not rely blindly on an unprocessed self-declaration; the Board can process/correct the account as part of handling the first relevant request.

---

## 6. Account lifecycle

Registration must not require manual approval before first use.

```text
REGISTER
  -> account created
  -> login allowed
  -> browse inventory
  -> submit first request
```

Required registration data:

- full name;
- email;
- phone number;
- affiliation;
- IEEE membership claim/status;
- Aerobotix claim/status;
- password.

Passwords must never be stored/read as plaintext. Use Better Auth and secure hashing/session handling.

Account processing state:

```text
UNPROCESSED -> PROCESSED
```

Processing allows Board/Superadmin to confirm/correct affiliation and clearance.

Recommended account access states:

```text
ACTIVE
RESTRICTED
BANNED
BLACKLISTED
```

Do not delete a user solely because they are banned; historical accountability must remain intact.

---

## 7. Projects and teams

Projects are administrative entities. Examples:

- Eurobot;
- Robocup;
- Line Follower;
- internal RAS project.

Rules:

- users cannot self-declare project membership;
- Board/Superadmin assigns users to projects;
- official Eurobot membership automatically gives minimum Level V;
- a request may optionally be associated with one of the user's assigned projects;
- a project never replaces human accountability.

Correct loan association:

```text
loan.borrower_user_id = person
loan.project_id = optional project
```

Never use a project itself as the sole borrower.

Board project view must show:

- project members;
- active project-associated equipment;
- responsible borrowers;
- overdue equipment;
- damaged/lost equipment;
- project borrowing history/statistics.

---

## 8. Inventory model

Each catalogue item should support at least:

- id;
- name;
- description;
- category;
- regulatory class A-G;
- tracking mode;
- total quantity;
- functioning quantity/current state;
- available quantity;
- allocated quantity;
- borrowed quantity;
- damaged quantity;
- maintenance quantity;
- lost quantity where relevant;
- low-stock/low-functioning threshold(s);
- optional image;
- active/inactive flag.

Physical location for MVP may be a simple optional text field only. No hierarchical cabinet model is required at launch.

### Tracking modes

#### QUANTITY
For fungible/many-identical resources.

Examples: LEDs, screws, glue sticks, generic cables.

#### INDIVIDUAL_ASSET
For assets that benefit from per-unit history.

Examples: Arduino #001, STM32 #004, camera #003.

Individual asset lifecycle:

```text
AVAILABLE
BORROWED
DAMAGED
MAINTENANCE
LOST
RETIRED
```

---

## 9. Search and favorites

Search must be deterministic, not AI-based.

Support:

- case-insensitive partial matching;
- normalized names;
- aliases/synonyms/tags;
- category/class filtering.

Filters should include:

- availability;
- regulatory class;
- category;
- condition/lifecycle state;
- tracking mode;
- borrowable by current user;
- low stock;
- low availability;
- favorites.

Favorites are a simple `(user_id, item_id)` relation. They confer no priority, allocation, or entitlement.

---

## 10. Shopping cart and request submission

A formal logged borrow is created through a shopping cart.

Cart line example:

```text
STM32 x3
Arduino Uno x2
IR Sensor x8
```

Request metadata:

- optional project chosen only from projects assigned to that user;
- purpose/justification;
- requested return date;
- terms/policy acceptance if required by the club process.

Each request line must distinguish:

```text
requested_quantity
approved_quantity
handed_over_quantity
returned_quantity
damaged_quantity
lost_quantity
```

This is mandatory for correct partial workflows.

---

## 11. Policy engine

The backend is authoritative. Never trust frontend-only checks.

For each request/line, evaluate:

### User
- role;
- clearance;
- account processing state;
- active strikes/restrictions/bans;
- project membership if a project is selected.

### Item
- class;
- logging requirement;
- available/requestable stock;
- lifecycle/condition;
- supervision/Level VI requirements.

### Request
- requested quantity;
- requested return date;
- project;
- purpose.

Possible policy outcomes include:

```text
ELIGIBLE
REQUIRES_ACCOUNT_PROCESSING
REQUIRES_SUPERVISION
REQUIRES_LEVEL_VI
INELIGIBLE
```

Do not duplicate policy logic in many frontend components. Centralize it in backend/domain services.

---

## 12. Approval and partial approval

Board/Superadmin can:

- approve all lines;
- partially approve quantities;
- reject lines/request;
- add an optional decision reason.

A formal approval is not yet an active loan.

```text
REQUEST APPROVED
  -> stock allocated internally
  -> awaiting physical handover
```

---

## 13. Internal stock allocation (not a reservation feature)

There is **no user reservation feature**. However, once a request is approved, approved stock must be internally committed to prevent double approval.

```text
requestable_available = physical/functioning_available - active_allocations
```

Example:

```text
physical available = 5
allocated to approved requests = 2
requestable = 3
```

Allocation and approval must be in the same atomic database transaction.

### Allocation timeout

Approved but uncollected allocations expire after **48 hours**.

On expiry:

- release allocation;
- mark the approval/request as expired or requiring re-approval;
- notify user/Board as appropriate.

Board/Superadmin may explicitly extend/cancel the allocation if a legitimate exception is needed.

---

## 14. Cancellation rules

Member:

- may cancel an own request while `PENDING`.

Board/Superadmin:

- may cancel `PENDING`, `APPROVED`, or `PARTIALLY_APPROVED` requests before physical handover.

Once any item has been physically handed over and an active loan exists, the operation is **not cancellable**. It must be closed through the return workflow.

---

## 15. Physical handover

Approval is not possession.

```text
APPROVED
  -> board physically gives equipment
  -> board confirms actual quantity handed over
  -> active loan created/activated
```

For important/individual assets, record condition at handover.

Suggested condition values:

```text
GOOD
MINOR_ISSUE
DAMAGED
```

Only `handed_over_quantity` affects the active loan/borrowed count.

---

## 16. Loan state model

Do not use one overloaded `status` enum because multiple conditions can coexist.

Separate dimensions:

### Request decision
```text
PENDING
APPROVED
PARTIALLY_APPROVED
REJECTED
```

### Handover
```text
WAITING
HANDED_OVER
```

### Loan lifecycle
```text
ACTIVE
CLOSED
```

### Return progress
```text
NONE
PARTIAL
COMPLETE
```

### Due state
```text
ON_TIME
OVERDUE
```

The UI may derive a composite label such as:

```text
ACTIVE · PARTIALLY RETURNED · 4 DAYS OVERDUE
```

---

## 17. Returns

A member may request a partial or complete return of currently held quantities.

The request itself does **not** restore stock.

```text
member requests return
  -> RETURN_REQUESTED
  -> Board physically receives/inspects
  -> Board confirms accepted quantity and condition
  -> stock/lifecycle updated atomically
```

Validation invariants:

- returned quantity <= handed over quantity - already returned/lost/damaged finalizations;
- user cannot return an item they never received;
- Board confirmation is required before availability increases.

For important assets, record `condition_at_return`.

---

## 18. Extensions

For an active loan, member can request an extension with:

- requested new due date;
- reason.

Board/Superadmin can approve/reject.

Never overwrite history. Store at least:

```text
original_due_date
requested_due_date
approved_due_date
reason
requested_at
decided_at
decided_by
```

The current effective due date may be derived from the latest approved extension.

---

## 19. Inventory stock operations

Board/Superadmin can perform explicit stock operations:

```text
ADD
REMOVE
CORRECT
CONSUME
DAMAGE
REPAIR
RETIRE
RECOVER
```

Each operation requires:

- actor;
- item/asset;
- quantity where relevant;
- timestamp;
- reason;
- optional comment.

No silent mutation of inventory quantities.

---

## 20. Inventory state + movement ledger

Use a practical hybrid model:

1. **Current state/snapshot** for fast reads.
2. **Append-only inventory events** for reconstruction and auditability.

Example ledger:

```text
+18 INITIAL_STOCK
-2 HANDOVER
+1 RETURN
-1 DAMAGE
+5 ADD/PURCHASE
```

Do not implement pure event sourcing. Current counters/state and events must update in the **same database transaction**.

---

## 21. Concurrency invariants

The system's main technical risk is state consistency, not scale.

Any operation that checks and consumes availability must be atomic:

```text
BEGIN
  re-check available/requestable quantity
  create allocation or handover
  update current stock state
  append inventory event
  append audit event where applicable
COMMIT
```

On any failure: `ROLLBACK`.

Must prevent:

- negative availability;
- double allocation;
- approval above current requestable stock;
- handover above approved quantity;
- return above outstanding quantity;
- Class G grant without Level VI;
- new formal borrowing by banned/blacklisted users;
- selecting a project the user is not assigned to;
- direct deletion/rewrite of historical events through normal application APIs.

---

## 22. Inventory audits

Board/Superadmin can start an inventory audit.

At audit start, freeze/store an **expected snapshot**.

For each audited item:

```text
expected_at_start
movements_during_audit
adjusted_expected
physical_count
difference
```

Do not compare only against live current quantity because ordinary operations may occur during an audit.

Finalizing an audit:

- records discrepancies;
- records missing/extra/damaged observations;
- any reconciliation correction creates explicit inventory events;
- creates audit-log entries.

---

## 23. Stock alerts

Differentiate three concepts:

### LOW_STOCK
Especially meaningful for consumables; replenishment may be required.

### LOW_AVAILABILITY
Owned/functioning stock exists but much is currently borrowed/allocated.

### LOW_FUNCTIONING_STOCK
A significant share is damaged/lost/maintenance/retired.

Do not treat a reusable item with many active loans as automatically needing purchase.

---

## 24. Discipline and strikes

The regulations define the disciplinary system and are authoritative.

### Trigger categories

- irreversible damage/destruction of Class D or higher -> strike condition; non-IEEE users additionally owe compensation under the regulation;
- failure to surrender borrowed items **two weeks past the due date** -> strike condition;
- borrowing-policy breach/loophole exploitation -> immediate strike condition;
- reckless endangerment -> direct ban condition.

### Human-in-the-loop enforcement

Automations may create **recommendations**, not silently punish.

```text
system detects condition
  -> strike/disciplinary recommendation
  -> Board/authorized review
  -> sanction issued
```

### Strike 1
Warning; no direct consequence.

### Strike 2
Implementation decision fixed for MVP:

- all formal borrowing requests require explicit Board approval;
- Classes F and G are unavailable to the user while Strike 2 is active;
- compensation may be associated where applicable.

### Strike 3
Apply the regulation literally: the user cannot use **Class E items unsupervised**.

### Strike 4
Ban from use of RAS items for the active semester.

Effects:

- cannot submit new formal borrow requests;
- existing active loans remain visible and must still be returned;
- strike expires at semester end.

### Strike 5
Permanent ban / blacklist.

Does not expire at semester end.

### Semester expiry

Strikes 1-4 expire each semester. Strike 5 / blacklist does not.

Never delete historical strike records. Use states such as:

```text
ACTIVE
EXPIRED
OVERTURNED
```

---

## 25. Incidents and compensation

Board/Superadmin can create an incident linked to:

- user;
- loan;
- item/asset;
- damage/loss type;
- description;
- decision;
- associated strike where relevant;
- compensation where applicable.

Compensation should support at least:

```text
PENDING
PAID
WAIVED
APPEALED
CLOSED
```

Store replacement-cost assessment and payment/decision history as required by the regulations.

---

## 26. Action Center

Board/Superadmin landing page should answer: **what requires attention now?**

Generate dynamically from source entities; do not maintain a separate duplicated action-task table.

Examples:

- pending borrow requests;
- unprocessed accounts relevant to current requests;
- approved requests awaiting handover;
- return requests awaiting confirmation;
- extension requests;
- overdue loans;
- 14+ day overdue strike recommendations;
- incident/disciplinary items requiring review;
- low-stock/low-functioning alerts;
- audit discrepancies.

---

## 27. Insights dashboard

Distinct from Action Center. It answers **what is happening over time?**

Use direct queries over the operational database; no separate analytics stack.

Include useful metrics such as:

### Inventory
- total/functioning/available/borrowed/damaged/maintenance/lost;
- low-stock counts;
- low-functioning counts.

### Borrowing
- requests per month/semester;
- approved/partially approved/rejected;
- active loans;
- average loan duration;
- extension frequency;
- overdue count/rate;
- return delays.

### Equipment
- most borrowed;
- frequently unavailable;
- frequently damaged.

### Projects
- requests and active equipment by project;
- overdue/damaged project equipment.

### Discipline
- active strike distribution (Board/Superadmin visibility only).

---

## 28. Timelines

Provide human-readable timelines for loans/requests and possibly project/user views.

Typical events:

```text
request submitted
account processed/clearance verified if relevant
partial/full approval
allocation created
handover confirmed
extension requested
extension approved/rejected
partial return requested
return confirmed
incident recorded
loan closed
```

Timeline is a view derived from authoritative events/entities, not a separate mutable history.

---

## 29. Append-only audit log

Sensitive/admin operations must create audit events containing enough information to understand the mutation:

```text
actor_user_id
action
entity_type
entity_id
before_summary / before_json
after_summary / after_json
reason where required
timestamp
```

Normal application APIs must not support editing/deleting prior audit entries.

Corrections are represented by new compensating events.

Optional hardening: hash-chain audit events (`previous_hash`, `event_hash`) for tamper detection. This is optional for MVP, not blockchain.

---

## 30. Notifications

Use:

- in-app notifications (authoritative user channel);
- email via Resend (secondary convenience channel).

Useful events:

- request submitted;
- approved/partially approved/rejected;
- allocation/handover readiness;
- allocation expired after 48h;
- return requested/confirmed;
- extension requested/decision;
- due soon;
- overdue;
- strike/restriction issued;
- low-stock alerts for Board.

Business transactions must succeed even if email delivery fails. Notification delivery is decoupled from transaction correctness.

---

## 31. Data exports

CSV is sufficient for MVP.

Potential exports:

- inventory;
- current availability;
- active loans;
- overdue loans;
- borrowing history;
- users;
- projects;
- project equipment;
- stock movements;
- audit results;
- strikes;
- incidents;
- compensation;
- aggregated statistics.

Sensitive disciplinary/audit exports require Superadmin.

Log export actions in the audit log.

---

## 32. Recommended architecture and stack

### Frontend

```text
React
Vite
TypeScript
React Router
TanStack Query
Tailwind CSS
shadcn/ui
```

### Backend

```text
Cloudflare Workers
Hono
TypeScript
```

### Data

```text
Cloudflare D1
Drizzle ORM
```

### Auth

```text
Better Auth
```

### Notifications/automation

```text
Resend
Cloudflare Cron
```

### Code/CI

```text
GitHub
GitHub Actions
```

Architecture style: **modular monolith**, one repository, one backend API, one relational database.

```text
Responsive React Client
          |
          v
Cloudflare Worker / Hono
          |
  +-------+---------+------------------+
  |                 |                  |
Auth/Identity   Policy Engine     Domain Services
                                      |
                 +--------------------+-------------------+
                 |                    |                   |
             Inventory            Borrowing           Discipline
                 |                    |                   |
                 +--------------------+-------------------+
                                      |
                                 Cloudflare D1
                                      |
                          Events / Audit / Insights
                                      |
                             Notifications / Exports
```

---

## 33. Suggested data model

Minimum logical entities/tables:

```text
users
projects
user_projects

items
asset_units
favorites

borrow_requests
borrow_request_items
borrow_allocations

loans
loan_items

return_requests
return_request_items
returns
return_items

extension_requests

inventory_events
inventory_audits
inventory_audit_items

strikes
restrictions
incidents
compensations

notifications
audit_events

semesters
```

Exact columns/constraints are part of the next technical-design phase.

---

## 34. Permission and authority invariants

Backend must always enforce:

- Member cannot process requests, change clearance, or mutate stock.
- Board is minimum Level V.
- Superadmin is Level VI.
- Eurobot assignment gives minimum Level V.
- Level IV is manual and Level VI-controlled.
- Class G grant requires Level VI.
- Unprocessed account claims are not blindly trusted for sensitive decisions.
- Project selection requires active assignment to that project.
- Strike restrictions are checked before approval/handover.
- Banned/blacklisted users cannot start new formal logged borrowing.
- Existing loans remain returnable even when a user becomes banned.

---

## 35. MVP acceptance criteria

MVP is acceptable when at least all of the following work end-to-end:

1. Responsive desktop/mobile website.
2. Account creation/login without pre-approval.
3. User can submit first request while account is unprocessed.
4. Board can process account and correct/confirm clearance.
5. MEMBER/BOARD/SUPERADMIN permissions work server-side.
6. Board => Level V; Superadmin => Level VI; Eurobot => minimum Level V; Level IV manual.
7. Inventory catalogue supports class/tracking/state.
8. Smart deterministic search + filters.
9. Favorites.
10. Shopping cart.
11. Request submission.
12. Full/partial approval.
13. Atomic internal allocation.
14. Allocation expires after 48h if no handover.
15. Correct cancellation rules.
16. Physical handover confirmation.
17. Active-loan tracking using multi-dimensional states.
18. Partial return request and Board-confirmed return.
19. Extensions with preserved history.
20. Stock operations with mandatory event logging.
21. Current inventory state and movement ledger remain consistent.
22. Inventory audits with audit-start snapshot and movement handling.
23. Low-stock/low-availability/low-functioning distinction.
24. Project assignments are admin-controlled.
25. Project equipment view works.
26. Strikes 1-5 follow regulations and fixed MVP interpretations.
27. Strikes 1-4 expire at semester end; Strike 5 remains permanent.
28. Incidents/compensation can be recorded.
29. Action Center works from live domain state.
30. Insights dashboard produces correct statistics.
31. Loan/request timeline is complete.
32. Sensitive actions create append-only audit events.
33. CSV exports work with appropriate permissions.
34. In-app notifications work; email failures do not corrupt transactions.

---

## 36. Guiding engineering principle

The project does **not** have a scalability problem. The critical engineering problems are:

1. authorization and clearance correctness;
2. inventory concurrency and double-allocation prevention;
3. correct accounting for partial approval/handover/return;
4. consistent enforcement of the regulation;
5. traceability and dispute-resistant history;
6. maintainability for future RAS boards.

Whenever implementation choices conflict, prefer the option that makes these six properties easier to verify.
