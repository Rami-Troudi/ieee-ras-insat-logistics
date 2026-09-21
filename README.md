# IEEE RAS INSAT Logistics Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-729b1b.svg)](https://vitest.dev/)
[![IEEE Brand](https://img.shields.io/badge/IEEE%20RAS-Brand%20Compliant-861F41.svg)](docs/design/RAS_BRAND_COMPLIANCE.md)

The official web platform for managing hardware inventory, borrow requests, active equipment loans, physical returns, and disciplinary ledgers for the **IEEE Robotics & Automation Society (RAS) INSAT Student Branch Chapter**.

---

## Features (Stage 1: Foundation & Application Shell)

- **Authoritative IEEE RAS Visual Identity**:
  - Canonical Q4 2025 colors: **RAS Dark Red** (`#861F41`), **RAS Dark Purple** (`#772583`), **IEEE Blue** (`#00629B`), **IEEE Navy** (`#002855`), and official 80/60/40/20% tints.
  - Official Open Sans typography hierarchy.
  - Strict isolation between semantic destructive actions (`#EF4444`) and the brand accent red (`#861F41`).
- **Responsive Dual-Shell Architecture**:
  - **Member Portal (`/app`)**: Clean, spacious interface with a persistent desktop sidebar ($\ge 1024$px) or an ergonomic 5-tab mobile bottom bar (`Home`, `Inventory`, `Requests`, `Loans`, `Profile`).
  - **Board Console (`/board`)**: High-density 10-department operational sidebar on desktop and a high-efficiency 4-tab bar (`Action`, `Requests`, `Loans`, `Inventory`) + slide-up `More` drawer on mobile.
- **In-Memory Dev Persona Switcher**:
  - Instant role and clearance flipping (`useDevPersona`) across 6 real club profiles (Member, Unprocessed, Eurobot Lead, Strike 2 Restricted, Logistics Board, Superadmin Chairman).
- **Design System & Component Library**:
  - Radix UI accessible primitives (`Dialog`, `Sheet`, `DropdownMenu`, `AlertDialog`, `Table`).
  - Multi-dimensional `StatusBadge` covering 10 domain statuses with icon + color + text.
  - Tactile bound-checked `QuantitySelector` and accessible `SearchInput`.
  - Responsive dialog/drawer hybrid pattern (`ResponsiveDialog`).
- **Development Design Lab (`/_dev/design`)**:
  - Visual catalog showcasing tokens, components, contrast ratios, and simulated latency states.
- **Typed Mock Service Layer**:
  - `IInventoryService` contract and `MockInventoryService` with simulated latency integrated with TanStack Query.

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
