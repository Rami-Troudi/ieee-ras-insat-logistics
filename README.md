# IEEE RAS INSAT Logistics Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-729b1b.svg)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-1.63-green.svg)](https://playwright.dev/)
[![IEEE Brand](https://img.shields.io/badge/IEEE%20RAS-Brand%20Compliant-861F41.svg)](docs/design/RAS_BRAND_COMPLIANCE.md)

The official web platform for managing hardware inventory, borrow requests, active equipment loans, physical returns, and disciplinary ledgers for the **IEEE Robotics & Automation Society (RAS) INSAT Student Branch Chapter**.

---

## 1. Final Pre-Backend Freeze Status

This is the frontend-only pre-backend freeze branch, `codex/pre-backend-freeze`. Current readiness and command results are recorded in [`FINAL_FREEZE_AUDIT.md`](FINAL_FREEZE_AUDIT.md).

- **Zero Backend Code**: No server endpoints, Cloudflare Workers, Hono routes, D1/Drizzle schemas, Resend emails, or Cron jobs are present in this stage.
- **3 Canonical Roles**: `MEMBER`, `OPERATOR`, `SUPERADMIN`. Authorized identity administration assigns roles and clearance; project membership does not change identity or authorization.
- **Formal Online Request Gating**: Only **Class C** (Sensors/Modules) and **Class E** (Development Boards) equipment can be requested online. All other equipment classes (A, B, D, F, G) require physical desk interaction.
- **Borrower Stock Privacy**: Borrowers interact via the `BorrowerCatalogItem` DTO, which strictly redacts exact quantities, tracking modes, individual asset serials, and physical cabinet/shelf storage coordinates.
- **Simplified Physical Handover & Returns**:
  - No digital appointment booking or member-side extension/return forms.
  - Equipment returns and due-date adjustments are exclusively managed in-person by Operators.
  - Returns classified as `DAMAGED` update inventory and its audit trail. An operator may explicitly request a damage incident; returns do not automatically recommend or issue strikes.

---

## 2. Features & Product Architecture

### 2.1 Borrower Experience (`/app`)

- **Catalogue (`/app/inventory`)**: Categorized photo-first equipment grid with qualitative availability indicators (`Available`, `Limited`, `Out of stock`).
- **Cart (`/app/cart`)**: Fast item addition and quantity adjustments for Class C & E items, expected return date selector, and submission directly to the logistics review queue.
- **Activity (`/app/activity`)**: Consolidated tracking across four states: `Waiting for Approval`, `Ready to Pick Up` (48h reservation), `With You` (active loans), and `History`.
- **Persistent Local Identity**: Permanent onboarding storage on device; auto-associates all QR and web interactions.

### 2.2 Operator Console (`/board`)

- **Dashboard (`/board`)**: Real-time metrics for pending requests, items currently out, items due today, and overdue loans.
- **Requests Queue (`/board/requests`)**: Review, stock reservation, and handover confirmation with asset serial assignment.
- **Equipment Out (`/board/borrowed`)**: Inline loan due-date updating and fast return inspection modal (`Good`, `Needs attention`, `Damaged`, `Lost`).
- **Inventory Ledger (`/board/inventory`)**: Multi-state stock conservation (`total = available + allocated + borrowed + damaged + maintenance + lost`).
- **People & Discipline (`/board/people`)**: Member clearance levels, active loans, and disciplinary strikes.
- **Secondary Hub (`/board/more`)**: Audits, incident reports, export utilities, and structured audit logs.

---

## 3. Getting Started & Verification

### Prerequisites

- Node.js 20+
- npm 10+

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Full Quality Verification Pipeline

```bash
# 1. Check code formatting
npm run format:check

# 2. Run ESLint static analysis
npm run lint

# 3. Strict TypeScript type check
npm run typecheck

# 4. Automated unit and integration tests (Vitest)
npm run test

# 5. Full End-to-End test suite (Playwright across 5 viewports)
npm run test:e2e

# 6. Production build verification
npm run build
```

---

## 4. Architecture & Design Documentation

- [Pre-Backend Domain Contract & Freeze Specification](docs/architecture/pre-backend-domain-contract.md)
- [Current Product UX & Viewport Specifications](docs/design/current-product-ux.md)
- [IEEE RAS Brand Compliance Guide](docs/design/RAS_BRAND_COMPLIANCE.md)
- [Design System Specification](docs/design/design-system.md)
- [Archived stage and QA documents](docs/archive/README.md)
- [Field UX Research & Interaction Foundations](docs/design/ux-research.md)

---

## 5. Stage 4 Backend Handover Instructions

When implementing the Stage 4 backend:

1. Target Cloudflare Workers with Hono routing, Cloudflare D1 SQL database with Drizzle ORM, and Better Auth.
2. Honor the domain contract specified in [`docs/architecture/pre-backend-domain-contract.md`](docs/architecture/pre-backend-domain-contract.md).
3. Preserve the exact DTO boundary between `BorrowerCatalogItem` and operator-facing `InventoryItemSummary`.
4. Implement the 48-hour allocation expiration worker / cron job to release uncollected reservations back to available stock.
5. Strictly enforce the 3 canonical roles (`MEMBER`, `OPERATOR`, `SUPERADMIN`) and online request rejection for non-C/E classes.
