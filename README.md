# IEEE RAS INSAT Logistics Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-729b1b.svg)](https://vitest.dev/)
[![IEEE Brand](https://img.shields.io/badge/IEEE%20RAS-Brand%20Compliant-861F41.svg)](docs/design/RAS_BRAND_COMPLIANCE.md)

The official web platform for managing hardware inventory, borrow requests, active equipment loans, physical returns, and disciplinary ledgers for the **IEEE Robotics & Automation Society (RAS) INSAT Student Branch Chapter**.

---

## Features & Product Architecture

- **Authoritative IEEE RAS Visual Identity**:
  - Canonical colors: **RAS Dark Red** (`#861F41`), **RAS Dark Purple** (`#772583`), **IEEE Blue** (`#00629B`), **IEEE Navy** (`#002855`).
  - Strict isolation between semantic destructive actions and the brand accent red.
- **Mobile-First Borrower Experience (`/app`)**:
  - **Instant Visual Catalogue Landing**: Borrowers land directly on `/app` with a responsive photo-first equipment grid (2 cols mobile, 3 tablet, 4–5 desktop) with categories and simple availability indicators (`Available`, `Limited`, `Unavailable`). Raw internal stock quantities remain Board-only.
  - **QR Code Fast Onboarding & Persistent Session**: First-time scan prompts a clean student account creation modal (Name, Email, Student ID, Phone). The borrower stays permanently logged in on their device with all requests automatically attributed to their personal info.
  - **Simplified 2-Tab Navigation**: `Catalogue` and `Activity` for zero distraction.
  - **Streamlined Visual Cart**: Fast add/increment for Class C and E resources, friendly return date selector, and optional purpose note.
  - **Unified Activity Hub**: Consolidates `Ready to pick up`, `With you` (active loans), `Waiting` (pending requests), and `Past` (with 1-click `[Request again]`).
- **Operational Board Console (`/board`)**:
  - **Action-Oriented Dashboard**: 4 top metrics (`Pending Requests`, `Items Out`, `Due Today`, `Overdue`) with quick 1-click approvals for standard requests.
  - **Equipment Out (`/board/borrowed`)**: Rapid search by student or item, direct inline return date editing, and fast return intake modal (`Good`, `Needs attention`, `Damaged`, `Lost`).
  - **Secondary Tools Hub (`/board/more`)**: Clean secondary access for Projects, Insights, Physical Audits, Data Exports, Incidents, and Audit Log.
- **Robust Preserved Domain Engine**:
  - Central mock datastore (`STORAGE_KEY = ras_insat_mock_db_v3`), multi-dimensional inventory ledger, allocations, asset tracking, permissions, and audit logs preserved underneath the simple UI.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Check Prettier code formatting
npm run format:check

# Run ESLint 9 static analysis
npm run lint

# Run TypeScript strict typecheck
npm run typecheck

# Run automated unit tests
npm run test

# Production build
npm run build
```

---

## Documentation

- [IEEE RAS Brand Compliance Guide](docs/design/RAS_BRAND_COMPLIANCE.md)
- [Design System Specification](docs/design/design-system.md)
- [Stage 1 QA & Browser Audit Report](docs/design/stage-1-qa.md)
- [Field UX Research & Interaction Foundations](docs/design/ux-research.md)

---

## License

This project is maintained for the IEEE RAS INSAT Student Branch Chapter.
