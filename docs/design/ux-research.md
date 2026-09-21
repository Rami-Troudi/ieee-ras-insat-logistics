# Stage 1 UX Research & Interaction Foundations

**Project**: IEEE RAS INSAT Logistics Platform  
**Authors**: Antigravity Engineering & UX Architecture  
**Baseline**: Stage 1 Hardened Architecture  
**Date**: September 2026

---

## 1. Context & Operational Framework (Evidence-Categorized)

To ensure technical rigor, all observations, operational data, and constraints are explicitly categorized into three distinct evidential classes:

1. `[KNOWN PROJECT FACT]` — Directly derived from the normative _IEEE RAS INSAT Logistics — Regulations and Policies (v1.1.1)_ or project specification.
2. `[REFERENCE PRODUCT OBSERVATION]` — Grounded observations from verified shipped production products (Shopify Polaris, Linear, Baymard Institute mobile benchmarks, GitHub Mobile).
3. `[DESIGN ASSUMPTION]` — Deliberate engineering assumptions made to guide ergonomic decisions in the absence of telemetry.

### 1.1 Project Operational Facts

- `[KNOWN PROJECT FACT]` **Annual Scale**: The platform manages at most roughly 1,000 requests per calendar year. High-throughput distributed scaling is a non-goal; data correctness, auditability, and regulatory compliance are primary.
- `[KNOWN PROJECT FACT]` **Normative Equipment Classes**: The system governs seven distinct equipment tiers: Class A (Consumables), Class B (Expendable Resources), Class C (Light Resources), Class D (Light Equipment), Class E (Electronic Resources), Class F (Heavy Equipment), and Class G (High-Value Electronics).
- `[KNOWN PROJECT FACT]` **Clearance Hierarchy**: Strict clearance levels I through VI dictate request permissions, supervisory requirements, and maximum borrowing quotas.
- `[KNOWN PROJECT FACT]` **Operational Deadlines & Sanctions**: Loan pickups must occur within a strict 48-hour window following approval. A progressive 5-strike disciplinary ledger governs restrictions and semester bans.
- `[KNOWN PROJECT FACT]` **Web-Only Scope**: The platform is purely a responsive React web application. There is no native iOS/Android application.

### 1.2 Design Assumptions

- `[DESIGN ASSUMPTION]` **Physical Floor Custodianship**: When processing checkouts or returns at the INSAT robotics lockers, board members frequently hold physical components in one hand while interacting with a mobile device with the other. Therefore, touch targets must be at least 44×44px, and destructive actions must require confirmation dialogs.
- `[DESIGN ASSUMPTION]` **Event-Driven Volatility**: Request volume concentrates around academic robotics competitions (Eurobot, TUNIROBOTS). During these periods, batch line-item review and quick status triaging take precedence over detailed item exploration.

---

## 2. Targeted Shipped-Product Research (Lazyweb & Benchmark Pass)

### 2.1 Pattern: Mobile Filter Drawer

- **Reference / Source**: Baymard Institute Mobile E-Commerce Benchmarks & Shopify Polaris Mobile Filters.
- **Why it Works**: Trying to fit desktop faceted navigation onto mobile viewports creates layout instability and excessive vertical scrolling. A slide-up bottom drawer (`Sheet`) keeps the primary viewport uncluttered while providing a dedicated tactile surface for attribute selection. Persistent "Apply" and "Reset" footers prevent accidental page thrashing.
- **How We Adapt It**: Implemented in `FilterDrawer` with an explicit bottom sheet containing Class, Availability, and Category options, anchored by a full-width "Apply Filters" button ($\ge 44\text{px}$ touch target).
- **What We Intentionally Do Differently**: E-commerce filter drawers often hide selected filters inside the drawer. We immediately project active selections as removable `FilterChip` components onto the main view, enabling one-tap removal without reopening the drawer.

### 2.2 Pattern: Admin Operational Action Queue

- **Reference / Source**: Linear Mobile Triage & GitHub Mobile Notifications Inbox.
- **Why it Works**: Operational custodians need a prioritized queue sorted by urgency (e.g. items due today, requests awaiting approval, returns requiring physical inspection) rather than a raw, unorganized table.
- **How We Adapt It**: Implemented in `BoardActionCenterPage` using prioritized metric counters (Safety/Strikes, Overdue Loans, Pending Returns, New Requests) and urgent action cards with direct action buttons (`Quick Review`, `Inspect & Confirm`).
- **What We Intentionally Do Differently**: Linear allows swipe-to-archive; in RAS logistics, equipment custody actions (handover, inspection, damage flags) require explicit regulatory logging and cannot be dismissed without a recorded decision.

### 2.3 Pattern: Responsive Data Presentation (Table vs. Cards Fallback)

- **Reference / Source**: Stripe Dashboard Mobile & GOV.UK Responsive Data Tables.
- **Why it Works**: Wide data tables with 6+ columns cause awkward horizontal scrolling and clipped content on mobile viewports ($< 768\text{px}$). Transforming tabular rows into self-contained cards preserves hierarchy and keeps metadata readable without horizontal panning.
- **How We Adapt It**: Implemented in `ResponsiveDataTable` combined with `MobileEntityCard`. On desktop ($\ge 1024\text{px}$), items render as a compact, scan-friendly `Table`. On mobile, each entity renders as a `MobileEntityCard` displaying status badges, key-value metadata, and touch actions.
- **What We Intentionally Do Differently**: Many table-to-card fallbacks omit column headers entirely, leading to ambiguous numbers. `MobileEntityCard` explicitly pairs each datum with its uppercase label (e.g. `AVAILABLE: 5 / 8`) to maintain clarity.

### 2.4 Pattern: Mobile Operational Navigation (4 Tabs + "More" Drawer)

- **Reference / Source**: Linear Mobile App Navigation & Discord Mobile Bottom Nav.
- **Why it Works**: Mobile thumb navigation cannot comfortably support more than 4 to 5 tabs without overcrowding or illegible labels. High-density admin platforms with 10+ destinations need to separate high-frequency tasks from secondary views.
- **How We Adapt It**: Implemented in `MobileBoardBottomNav` with 4 operational tabs (`Action`, `Requests`, `Loans`, `Inventory`) and a 5th `More` trigger that opens a structured bottom sheet containing secondary departments (`Projects`, `Users`, `Audits`, `Incidents`, `Insights`, `Exports`, `Notifications`, `Profile`).
- **What We Intentionally Do Differently**: Board profile and notifications routes are kept strictly within `/board/*` so administrators never get ejected into the Member layout when checking their custodian profile or operational alerts.

### 2.5 Pattern: Non-Color-Alone Semantic Feedback

- **Reference / Source**: WCAG 2.2 AA Criterion 1.4.1 (Use of Color) & Atlassian Design System Lozenge / Badge Guidelines.
- **Why it Works**: Using color alone (e.g. red dot vs. green dot) fails for color-blind users and causes confusion in variable lighting.
- **How We Adapt It**: Implemented in `StatusBadge` using declarative `STATUS_CONFIG` covering all 25 domain states. Every badge pairs a contrasting background tint with a distinctive Lucide SVG icon and an explicit text label (e.g. `Clock + "Pending Review"`, `AlertCircle + "Damaged"`).
- **What We Intentionally Do Differently**: We strictly isolate semantic destructive red (`hsl(0, 84%, 60%)`) from brand RAS Red (`#861F41`). The society's brand color is never degraded into an error signifier.

---

## 3. Persona Interaction Workflows

### 3.1 The Member Paradigm

- **Workflow**: Find equipment $\to$ Check clearance eligibility $\to$ Add to cart $\to$ Submit request $\to$ Track approval $\to$ 48h pickup window $\to$ Active loan due date tracking $\to$ Return.
- **Ergonomics**: 5-tab mobile bottom nav (`Home`, `Inventory`, `Requests`, `Loans`, `Profile`), large touch buttons, clear status badges, and prominent loan due-date alerts.

### 3.2 The Board Paradigm

- **Workflow**: Monitor Action Center $\to$ Triage incoming requests $\to$ Validate clearance $\to$ Approve full or partial quantities $\to$ Physical handover inspection $\to$ Return verification $\to$ Incident / strike issuance.
- **Ergonomics**: High-density desktop sidebar with 10 operational views; mobile navigation prioritizing immediate actions with secondary links in the `More` sheet.

---

## 4. Key Architectural Decisions in Stage 1

1. **Strict IEEE Brand Enforcement**: Canonical Q4 2025 colors (`#861F41`, `#772583`, `#00629B`, `#002855`) and Open Sans typography are used exclusively. Legacy or generic colors (`#862633`, `#5F2167`) are strictly eliminated.
2. **Light Theme Only**: To reduce complexity and ensure contrast fidelity, the platform is strictly light theme only.
3. **Public Service Boundary**: UI components import exclusively from `src/services/inventory.ts`, abstracting the underlying `MockInventoryService` for seamless swapping in Stage 4.
4. **Isolated Development Persona System**: The dev switcher UI is hidden in production (`!import.meta.env.DEV`), avoids `localStorage` writes in production, and provides role-aware navigation during development.
