# Final Pre-Backend Freeze Audit

**Repository:** `Rami-Troudi/ieee-ras-insat-logistics`  
**Branch:** `codex/pre-backend-freeze`  
**Audit date:** 2026-09-24  
**Scope:** Frontend and mock-domain remediation only. No backend code was added.

## Fixes completed

- Board mutations resolve the actor from `actorUserId` and the current user profile. Caller-supplied roles and names do not authorize writes. CSV export no longer accepts an actor-role argument; sensitive exports require a real superadmin.
- Inventory creation, stock movement, asset changes, audit operations, discipline, projects, requests, loans, allocation release/expiry, user administration, and audit logging now enforce their applicable operator or superadmin gate.
- A damaged return always records inventory movement and condition notes. It creates an incident only when the operator explicitly opts in. It never creates a strike recommendation or issues a strike automatically.
- Project assignment changes project membership only. It does not change role, affiliation, or clearance. `EUROBOT` is no longer a clearance source.
- Active strikes are derived from `StrikeRecord` status and expiry. Profile status and `strikesCount` are refreshed projections. Strikes 1–4 require an operator; Strike 5 and permanent blacklist changes require a superadmin. Stale semester data is rebuilt from the current date when issuing an expiring strike.
- Audit snapshots and movement deltas use on-site stock: `available + allocated + damaged + maintenance`. Borrowed and lost units are excluded. Positive and negative corrections require a reason and write inventory and audit events with actor, timestamp, before/after state, and tracked asset identifiers where applicable.
- Retirement removes units from owned total and the individual-asset registry together. Direct ownership correction and retirement are superadmin-only; physical audit reconciliation is operator-authorized.
- Insights now count requests in the calendar month, omit the average duration when there is no valid loan data, count only currently active strikes, and no longer expose `extensionFrequencyPercent`.
- The domain and UX documents now match the implemented DTO, audit, strike, project, and return behavior. Stage and old QA documents are in `docs/archive/` with a historical/non-authoritative banner.
- CI is named for the pre-backend freeze and installs Chromium dependencies before running Playwright. Common board, controller, sensor-module, oscilloscope, and motor catalog images use stable local illustrations.

## Backend implementation rules

1. Resolve every actor from the authenticated server session and stored user record. Ignore client-supplied role, name, clearance, and project membership for authorization.
2. Keep project membership separate from identity, affiliation, role, and clearance administration.
3. Calculate active strikes from records where `status === ACTIVE` and `expiresAt` is absent or later than now. Do not write `strikesCount` as an independent source of truth. Require superadmin authority for Strike 5 and permanent blacklist changes.
4. Store semester date ranges and select the range containing the current time when assigning semester-expiring strikes.
5. Define on-site inventory as `available + allocated + damaged + maintenance`. Exclude borrowed and lost units from physical audit counts and movement deltas.
6. Apply each correction and its inventory/audit events in one database transaction. Preserve signed quantity, before/after state, reason, actor, timestamp, and serial/asset identifiers. Preserve the registry invariant: individually tracked asset count equals owned `totalQuantity`.
7. Return inspection changes inventory and records condition notes. Create a damage incident only from explicit operator escalation; do not automatically create a recommendation or strike.
8. Implement allocation expiry as a backend scheduled worker that releases reservations atomically and emits a traceable system event.

## Remaining limitations

- The repository remains a frontend with mock/local data. Server authentication, durable transactions, concurrency control, database constraints, and the allocation-expiry worker remain Stage 4 work.
- Negative physical corrections currently write off identified available units from owned quantity and the asset registry. Reconciliation of allocated, borrowed, damaged, or maintenance units must use their dedicated custody/state workflows.
- The audit correction UI uses browser prompts for reasons and serial numbers. It is functional for this freeze but should be replaced by a validated backend-connected form during implementation.
- The replacement equipment illustrations are local approximations, not product photographs.
- The production build succeeds with a vendor annotation notice from Zod and a main JavaScript chunk above 500 kB. The Vitest run also prints existing React `act(...)` warnings from session tests.

## Verification results

| Command                | Result                                                      |
| ---------------------- | ----------------------------------------------------------- |
| `npm run format:check` | Passed                                                      |
| `npm run lint`         | Passed                                                      |
| `npm run typecheck`    | Passed                                                      |
| `npm run test`         | Passed — 12 files, 88 tests                                 |
| `npm run test:e2e`     | Passed — 21 Chromium tests across five configured viewports |
| `npm run build`        | Passed — with the warnings listed above                     |
