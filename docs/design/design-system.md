# IEEE RAS INSAT Logistics Platform — Design System Specification

**Version**: 1.1.0 (Stage 1 Hardened Baseline)  
**Target Platform**: Responsive Web (Mobile 375px → Workstation 1440px+)  
**Framework**: React 19 + TypeScript + Tailwind CSS + Radix UI Primitives  
**Theme Scope**: Light Theme Only

---

## 1. System Architecture & Philosophy

The IEEE RAS INSAT Logistics Platform serves two distinct user constituencies with different operational ergonomics:

1. **Club Members & Students**: Primary workflows are equipment catalog discovery, request cart drafting, loan tracking, and return coordination. Managed through a spacious 5-tab mobile interface or clean desktop sidebar.
2. **Logistics Board Members & Superadmins**: Physical hardware custodians operating on the lab floor or in storage closets. Managed through a high-density, multi-metric console on desktop and a high-efficiency 4-action bottom nav with a slide-up "More" drawer on mobile.

The design system enforces strict IEEE RAS Q4 2025 brand fidelity, high ergonomic density without clutter, WCAG 2.2 AA accessibility, and zero domain confusion.

### 1.1 Canonical Stage Roadmap

- **Stage 1**: Foundation + Design System + Shell (Frozen baseline)
- **Stage 2**: Complete Member Experience (Catalog, Cart, Borrow Requests, Active Loans, Returns, Favorites, Notifications, Profile)
- **Stage 3**: Complete Board + Superadmin Experience (Action Center, Requests Approval, Loan Handovers, Inventory Operations, Audits, Incidents, Insights, Exports, Board Profile & Notifications)
- **Stage 4**: Real Backend + Rules Enforcement + D1/Drizzle + Security Hardening

---

## 2. Design Tokens & Foundations

### 2.1 Color Tokens

All color tokens are declared in `src/styles/ras-brand.css` and mapped to Tailwind semantic variables in `src/styles/tokens.css`. Light theme only.

| Semantic Token         | Value / Underlying Variable       | Role & Usage                                                                 |
| :--------------------- | :-------------------------------- | :--------------------------------------------------------------------------- |
| `primary`              | `#772583` (`--ras-purple`)        | Core brand authority, primary buttons, active navigation markers             |
| `primary-foreground`   | `#FFFFFF`                         | Text on primary brand backgrounds                                            |
| `secondary`            | `#861F41` (`--ras-red`)           | Brand accent, secondary emphasis buttons, active badge highlights            |
| `secondary-foreground` | `#FFFFFF`                         | Text on secondary brand backgrounds                                          |
| `background`           | `#F8FAFC` (`--background`)        | Base viewport background (clean near-white)                                  |
| `card` / `popover`     | `#FFFFFF` (`--card`)              | Elevated panels, cards, sheets, dialogs                                      |
| `destructive`          | `hsl(0, 84%, 60%)` (`#EF4444`)    | Dangerous actions (delete, revoke, strike). Strictly isolated from brand red |
| `warning`              | `hsl(38, 92%, 50%)` (`#F59E0B`)   | Overdue loans, strikes warnings, pending allocations                         |
| `success`              | `hsl(142, 76%, 36%)` (`#16A34A`)  | Verified items, active approved loans, completed returns                     |
| `info`                 | `hsl(201, 100%, 30%)` (`#00629B`) | IEEE Blue, informational states, neutral notifications                       |
| `muted`                | `hsl(214, 32%, 91%)` (`#E2E8F0`)  | Subdued backgrounds, table alternate rows                                    |
| `border`               | `hsl(214, 32%, 91%)` (`#E2E8F0`)  | Clean dividing lines, card borders                                           |

### 2.2 Canonical Tints

- **RAS Red (`#861F41`)**: 80% `#A54F63`, 60% `#BD7A87`, 40% `#D4A5AD`, 20% `#EAD1D5`
- **RAS Purple (`#772583`)**: 80% `#96529A`, 60% `#B17CB3`, 40% `#CBA7CC`, 20% `#E5D2E5`
- **IEEE Blue (`#00629B`)**: 80% `#007DAF`, 60% `#5B9CC3`, 40% `#95BCD6`, 20% `#CADCEA`
- **IEEE Navy (`#002855`)**: 80% `#2D4D76`, 60% `#627596`, 40% `#94A1B8`, 20% `#C8CEDA`

### 2.3 Typography Tokens

- **Font Family**: `"Open Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Scale**:
  - `xs`: 12px (0.75rem) — Badges, metadata, timestamp captions
  - `sm`: 14px (0.875rem) — Table cells, secondary navigation, input values
  - `base`: 16px (1rem) — Body text, primary button labels, cards
  - `lg`: 18px (1.125rem) — Card headers, subheadings
  - `xl`: 20px (1.25rem) — Section titles
  - `2xl`: 24px (1.5rem) — Page titles, hero metric figures
  - `3xl`: 30px (1.875rem) — High-impact dashboard counters

### 2.4 Spatial Tokens & Layout

- **Border Radius**: Base `0.5rem` (8px). Inputs and cards use `rounded-lg` (8px) or `rounded-xl` (12px).
- **Minimum Touch Targets**: $\ge 44\times 44\text{px}$ on all mobile interactive controls per WCAG 2.5.5.
- **Breakpoints**: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1440px.

---

## 3. Component Taxonomy & Patterns

### 3.1 Core Primitives (`src/components/ui/`)

- `Button`: Standardized with variants (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`, `brandRed`). Size `sm` maintains $\ge 44\text{px}$ height on mobile while scaling to compact 36px on desktop (`sm:min-h-[36px] sm:h-9`).
- `Input`: Responsive form input with focus ring and touch envelope.
- `Badge`: Semantic status tag with variant coloring (`default`, `secondary`, `destructive`, `outline`, `success`, `warning`, `info`, `danger`).
- `Dialog` & `AlertDialog`: Radix-based modal overlays with accessible focus trap.
- `Sheet`: Slide-up drawer for mobile navigation and filters.
- `Table`: Clean tabular layout for desktop data grids.
- `Skeleton`: Pulse placeholder animation for async loading.

### 3.2 Domain-Specific Shared Components (`src/components/shared/`)

- `AppBrand`: Compliant IEEE RAS combined logo lockup. Digital minimum width $\ge 100\text{px}$, clear space $\ge \frac{1}{2} \times$ oval height. Noncompliant 32px collapsed mode removed.
- `StatusBadge`: Declarative `STATUS_CONFIG` covering all 25 domain states:
  - `PENDING`, `APPROVED`, `PARTIALLY_APPROVED`, `REJECTED`, `EXPIRED`, `WAITING`, `HANDED_OVER`, `ACTIVE`, `CLOSED`, `RETURNED`, `PARTIALLY_RETURNED`, `AVAILABLE`, `BORROWED`, `DAMAGED`, `MAINTENANCE`, `LOST`, `RETIRED`, `DUE_SOON`, `OVERDUE`, `RESTRICTED`, `BANNED`, `SUCCESS`, `WARNING`, `ERROR`, `INFO`.
- `ResponsiveDialog`: Responsive modal dialog rendering as a bottom sheet on mobile ($< 1024\text{px}$) and a modal dialog on desktop ($\ge 1024\text{px}$) via `useIsDesktop()` hook.
- `ResponsiveDataTable` & `MobileEntityCard`: Adaptive data presentation showing desktop table on workstations and touch-friendly card lists on mobile phones.
- `FilterBar`, `FilterChip`, `FilterDrawer`: Reusable filtering foundation with inline desktop toolbar, swipeable mobile sheet, and removable filter chips.
- `AlertBanner`: Notification alert banner across 4 semantic variants (`info`, `warning`, `danger`, `success`).
- `PolicyNotice`: Standardized regulatory reference component citing specific rule sections.
- `FavoriteButton`: Accessible toggle button for bookmarking items ($\ge 44\times 44\text{px}$ touch target).
- `ConfirmationDialog`: Reusable destructive operation confirmation modal.
- `Metric` & `KeyValueRow`: Operational stat counter cards and metadata inspectors.
- `LoadingState`: Multi-variant loading skeleton (`table`, `cards`, `list`, `section`).
- `UserMenu`: Role-aware user avatar menu with clearance indicators and context-aware routing.

### 3.3 Navigation Shells

- **Member Desktop Shell (`DesktopSidebar`)**: 64-width sticky sidebar (`Home`, `Inventory`, `My Requests`, `My Loans`, `Favorites`, `Notifications`, `Profile`).
- **Board Desktop Shell (`DesktopBoardSidebar`)**: High-density 64-width sticky sidebar with 10 operational departments plus Board-scoped `Notifications` and `Profile`.
- **Member Mobile Nav (`MobileBottomNav`)**: 5-tab bottom navigation (`Home`, `Inventory`, `Requests`, `Loans`, `Profile`).
- **Board Mobile Nav (`MobileBoardBottomNav`)**: 4-action operational bottom bar plus a `More` drawer containing secondary board links, board notifications, and board profile.

---

## 4. Persona Switcher Architecture (`useDevPersona`)

The application features role-based persona switching for fast role-shell testing:

1. **Rami Troudi (IEEE Member)**: Level III Clearance, Active, IEEE Affiliation.
2. **New Student (Unprocessed)**: Level I Clearance, Pending Verification, External Affiliation.
3. **Eurobot Team Lead**: Level V Clearance, Active, Project Allocation Lead.
4. **Borrower (Strike 2 Active)**: Level III Clearance, Restricted Status, 2 Active Strikes.
5. **Emna Taghlet (Logistics Board)**: Level V Clearance, Logistics Board Operator.
6. **Amine Elkadhi (RAS Chairman)**: Level VI Clearance, Superadmin.

### Shell Transition Rules:

- Selecting `MEMBER` $\to$ immediately navigates to `/app`.
- Selecting `BOARD` $\to$ immediately navigates to `/board`.
- Selecting `SUPERADMIN` $\to$ immediately navigates to `/board`.

### Production Isolation:

- Development: `DevPersonaSwitcher` is mounted in `TopBar`, persists in `localStorage` (`ras_dev_persona_id`), and provides quick shell hopping.
- Production: `import.meta.env.DEV` is false; `DevPersonaSwitcher` renders `null`, no fake personas are initialized, and no `localStorage` keys are set. Fallback to generic `PROD_DEFAULT_PERSONA`.

---

## 5. Accessibility Compliance (WCAG 2.2 AA)

1. **Color Contrast**: All text pairings exceed the 4.5:1 ratio for normal text and 3:1 for large text.
2. **Non-Color Reliance**: Every `StatusBadge` couples color with a distinctive SVG icon and human-readable text label.
3. **Keyboard Navigation**: All interactive elements display a prominent visible focus ring (`ring-2 ring-primary`).
4. **Touch Target Size**: All mobile touch targets (buttons, nav items, selectors) are $\ge 44\times 44\text{px}$.
5. **Reduced Motion**: Respects `prefers-reduced-motion: reduce`.
