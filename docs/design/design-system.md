# IEEE RAS INSAT Logistics Platform — Design System Specification
**Version**: 1.0.0 (Stage 1 Baseline)  
**Target Platform**: Responsive Web (Mobile 375px → Desktop 1440px+)  
**Framework**: React 19 + TypeScript + Tailwind CSS + Radix UI Primitives  

---

## 1. System Architecture & Philosophy

The IEEE RAS INSAT Logistics Platform serves two distinct user constituencies with radically different operational workflows:
1. **Club Members & Students**: Primary workflows are equipment discovery, cart drafting, request tracking, and personal loan management. Needs a spacious, clear, 5-tab mobile interface or clean desktop sidebar.
2. **Logistics Board Members & Superadmins**: Physical hardware custodians operating on the floor or in storage closets. Needs a high-density, multi-metric console on desktop and a high-efficiency 4-tab + More sheet bottom navigation on mobile.

The design system enforces strict IEEE RAS Q4 2025 brand fidelity, high ergonomic density without clutter, WCAG 2.2 AA accessibility, and zero domain confusion.

---

## 2. Design Tokens & Foundations

### 2.1 Color Tokens
All color tokens are declared in `src/styles/ras-brand.css` and mapped to Tailwind semantic variables in `src/styles/tokens.css`.

| Semantic Token | Value / Underlying Variable | Role & Usage |
| :--- | :--- | :--- |
| `primary` | `#772583` (`--ras-purple`) | Core brand authority, primary buttons, active navigation states |
| `primary-foreground` | `#FFFFFF` | Text on primary brand backgrounds |
| `secondary` | `#861F41` (`--ras-red`) | High-priority brand accent, secondary emphasis actions, badge highlights |
| `secondary-foreground`| `#FFFFFF` | Text on secondary brand backgrounds |
| `background` | `#FFFFFF` (Light) / `#0A0F1D` (Dark) | Base viewport background |
| `card` / `popover` | `#FFFFFF` (Light) / `#111827` (Dark) | Elevated panels, cards, sheets, dialogs |
| `destructive` | `hsl(0, 84%, 60%)` (`#EF4444`) | Dangerous actions (delete, revoke, cancel). Strictly independent of brand red |
| `warning` | `hsl(38, 92%, 50%)` (`#F59E0B`) | Overdue loans, strikes warnings, pending allocations |
| `success` | `hsl(142, 71%, 45%)` (`#10B981`) | Verified items, active approved loans, completed audits |
| `muted` | `hsl(220, 14%, 96%)` / `hsl(215, 28%, 17%)` | Subdued backgrounds, table alternate rows |
| `border` | `hsl(220, 13%, 91%)` / `hsl(215, 28%, 18%)` | Clean dividing lines, card borders |

### 2.2 Typography Tokens
- **Font Family**: `'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif`
- **Scale**:
  - `xs`: 12px (0.75rem) — Badges, metadata, timestamp captions
  - `sm`: 14px (0.875rem) — Table cells, secondary navigation, input values
  - `base`: 16px (1rem) — Body text, primary button labels, cards
  - `lg`: 18px (1.125rem) — Card headers, subheadings
  - `xl`: 20px (1.25rem) — Section titles
  - `2xl`: 24px (1.5rem) — Page titles, hero metric figures
  - `3xl`: 30px (1.875rem) — High-impact dashboard counters

### 2.3 Spatial Tokens & Layout
- **Border Radius**: Base `0.5rem` (8px). Inputs and cards use `rounded-lg` (8px) or `rounded-xl` (12px).
- **Minimum Touch Targets**: $\ge 44\text{px}$ height/width on all mobile interactive targets per WCAG 2.5.5.
- **Breakpoints**:
  - `sm`: 640px (Large phones / phablets)
  - `md`: 768px (Tablets)
  - `lg`: 1024px (Desktop boundary — sidebars render, mobile nav hidden)
  - `xl`: 1280px (Wide desktop)
  - `2xl`: 1440px (High-resolution workstation displays)

---

## 3. Component Taxonomy & Patterns

### 3.1 Core Primitives (`src/components/ui/`)
- `Button`: Standardized with variants (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`) and sizes (`sm`, `default`, `lg`, `icon`). Includes `active:scale-[0.98]` tactile press feedback and minimum 44px touch envelope on mobile.
- `Input`: Integrated focus ring with `var(--ring)`, accessible placeholder contrast, and clear state.
- `Badge`: Compact status token with semantic variants.
- `Dialog` & `AlertDialog`: Radix-based accessible modal dialogs with backdrop blur and trap focus.
- `Sheet`: Slide-over side/bottom sheet used for mobile navigation drawer.
- `Table`: Responsive tabular display for inventory ledgers and audit records.
- `Skeleton`: Content-placeholder pulse animation for async loading states.

### 3.2 Domain-Specific Shared Components (`src/components/shared/`)
- `AppBrand`: Compliant IEEE RAS logo lockup with minimum digital width enforcement ($\ge 100\text{px}$), clear space, and responsive scaling.
- `StatusBadge`: 10-state domain badge rendering icon + color + textual description (no color-alone dependency):
  - `PENDING`, `APPROVED`, `PARTIALLY_APPROVED`, `REJECTED`, `EXPIRED`, `WAITING`, `HANDED_OVER`, `ACTIVE`, `CLOSED`, `RETURNED`, `DUE_SOON`, `OVERDUE`, `RESTRICTED`.
- `QuantitySelector`: Accessible numeric counter with `-` / `+` touch controls, direct keyboard input, and strict min/max boundary constraints.
- `SearchInput`: Search text field with leading glass icon, clear button, and accessible labeling.
- `ResponsiveDialog`: Context-aware component rendering a floating modal on desktop ($\ge 1024\text{px}$) and an ergonomic slide-up drawer on mobile ($< 1024\text{px}$).
- `FeedbackStates`: Standardized `EmptyState` and `ErrorState` components with iconography, explanatory text, and primary call-to-action buttons.

### 3.3 Navigation Shells
- **Member Desktop Shell (`DesktopSidebar`)**: 64-width sticky sidebar with brand lockup, primary destinations (`Home`, `Inventory`, `My Requests`, `My Loans`, `Favorites`), dev tools link, and bottom profile drawer.
- **Board Desktop Shell (`DesktopBoardSidebar`)**: High-density 64-width sticky sidebar with 10 operational departments (`Action Center`, `Inventory`, `Requests`, `Loans`, `Projects`, `Users`, `Audits`, `Incidents`, `Insights`, `Exports`).
- **Member Mobile Nav (`MobileBottomNav`)**: Fixed bottom navigation bar with 5 primary thumb-zone tabs (`Home`, `Inventory`, `Requests`, `Loans`, `Profile`). Includes iOS safe-area bottom padding.
- **Board Mobile Nav (`MobileBoardBottomNav`)**: High-priority 4-action bottom bar (`Action`, `Requests`, `Loans`, `Inventory`) plus a 5th `More` tab that launches a comprehensive bottom drawer containing secondary management links.

---

## 4. Persona Switcher Architecture (`useDevPersona`)

To test role-gated interfaces across the club hierarchy without requiring a live backend, the application features an in-memory persona switcher:
1. **Rami Troudi (IEEE Member)**: Level III Clearance, Active, IEEE Affiliation.
2. **New Student (Unprocessed)**: Level I Clearance, Pending Verification, External Affiliation.
3. **Eurobot Team Lead**: Level V Clearance, Active, Project Allocation Lead.
4. **Borrower (Strike 2 Active)**: Level III Clearance, Restricted Status, 2 Active Strikes.
5. **Emna Taghlet (Logistics Board)**: Level V Clearance, Logistics Board Operator.
6. **Amine Elkadhi (RAS Chairman)**: Level VI Clearance, Superadmin.

The switcher persists selection in `localStorage` (`ras_dev_persona_id`) and is guarded by `import.meta.env.DEV`.

---

## 5. Accessibility Compliance (WCAG 2.2 AA)

1. **Color Contrast**: All text pairings exceed the 4.5:1 ratio for normal text and 3:1 for large text.
2. **Non-Color Reliance**: Every `StatusBadge` couples color with a distinctive SVG icon and human-readable text label.
3. **Keyboard Navigation**: All interactive elements display a prominent visible focus ring (`ring-2 ring-primary ring-offset-2`).
4. **Touch Target Size**: All mobile touch targets (buttons, nav items, selectors) are engineered to $\ge 44\times 44\text{px}$.
5. **Reduced Motion**: Motion styles respect `prefers-reduced-motion: reduce` in `globals.css`.
