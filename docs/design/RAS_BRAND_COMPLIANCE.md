# IEEE RAS Brand Identity Compliance Certificate

**Project**: IEEE RAS INSAT Logistics Platform  
**Guideline Baseline**: IEEE Robotics & Automation Society Visual Identity Guidelines (Q4 2025 Canonical Update)  
**Status**: VERIFIED & ENFORCED

---

## 1. Official Canonical Color Palette

Per Section 2 of the IEEE RAS Visual Identity Guidelines, only the canonical colors and official tints are permitted in the application.

### Primary Brand Palette & Official Tints

| Color Name     | Hex Code  | RGB            | Official Tints (80%, 60%, 40%, 20%)                              | Usage / Semantics                                                             |
| :------------- | :-------- | :------------- | :--------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **RAS Red**    | `#861F41` | `134, 31, 65`  | 80% `#A54F63`<br>60% `#BD7A87`<br>40% `#D4A5AD`<br>20% `#EAD1D5` | Primary brand accent, interactive highlights, brand badges, secondary buttons |
| **RAS Purple** | `#772583` | `119, 37, 131` | 80% `#96529A`<br>60% `#B17CB3`<br>40% `#CBA7CC`<br>20% `#E5D2E5` | Primary brand anchor, primary action buttons, active navigation markers       |
| **IEEE Blue**  | `#00629B` | `0, 98, 155`   | 80% `#007DAF`<br>60% `#5B9CC3`<br>40% `#95BCD6`<br>20% `#CADCEA` | Master brand touchpoint, informational states, external links                 |
| **IEEE Navy**  | `#002855` | `0, 40, 85`    | 80% `#2D4D76`<br>60% `#627596`<br>40% `#94A1B8`<br>20% `#C8CEDA` | Deep contrast surfaces, dark container backgrounds (e.g. Design Lab showcase) |

### Supporting Accents

- **IEEE Orange**: `#FFA300` (Accent Supporting)
- **IEEE Gold**: `#FFC72C` (Accent Supporting)

### Semantic System Separation (Crucial Compliance Rule)

- **Destructive Actions**: Semantic red (`hsl(0, 84%, 60%)` / `#EF4444`) is strictly isolated from **RAS Red** (`#861F41`). Under no circumstances is the official society color degraded into an error or destructive signifier.
- **Warning Actions**: Amber (`hsl(38, 92%, 50%)` / `#F59E0B`) is used for overdue warnings, strikes notices, and pending flags.
- **Success Actions**: Emerald (`hsl(142, 71%, 45%)` / `#10B981`) is used for confirmed handovers, completed returns, and approved items.
- **Informational Actions**: IEEE Blue (`#00629B` / `hsl(201, 100%, 30%)`) is used for neutral status notifications.

### Deprecated & Prohibited Colors

The following outdated or hallucinated hex codes from legacy materials are strictly forbidden:

- `❌ #862633` (Superseded legacy maroon)
- `❌ #5F2167` (Superseded legacy violet)
- `❌ #990000` (Generic web red)

---

## 2. Typography Standard

- **Canonical Digital Typeface**: **Open Sans** (Google Fonts).
- **Weights Implemented**:
  - Regular (`400`): Body copy, table cells, secondary metadata.
  - Medium (`500`): Navigation labels, secondary actions.
  - Semi-Bold (`600`): Subheadings, badge labels, buttons.
  - Bold (`700`): Section headers, metric counters, modal titles.
- **Font Stack Definition**:
  ```css
  font-family:
    "Open Sans",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  ```
- **Prohibited Substitutions**: Generic system Inter or Roboto as default root font without Open Sans precedence.

---

## 3. Official Logo Integrity & Clear Space

### Official Asset Inventory & Provenance

| Asset Path                      | Description                                                                               | Dimensions           | Provenance & Source URL                                                                                          |
| :------------------------------ | :---------------------------------------------------------------------------------------- | :------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `src/assets/ras_logo_full.png`  | Official 4-color combined lockup (IEEE Master Brand + RAS wordmark + planetary oval mark) | 1274 × 469 px PNG    | IEEE Robotics & Automation Society Resource Center (`https://www.ieee-ras.org/`). Approved combined treatment.   |
| `src/assets/ras_logo_white.svg` | Official white vector knockout logo for dark surfaces (IEEE Navy)                         | 204 × 83 viewBox SVG | IEEE RAS Official Vector Identity Package (`https://www.ieee-ras.org/`).                                         |
| `src/assets/ieee_mb_wh.png`     | Official IEEE Master Brand white mark                                                     | 142 × 41 px PNG      | IEEE Brand Experience Portal (`https://brand-experience.ieee.org/guidelines/brand-identity/ieee-master-brand/`). |

### IEEE Master Brand Relationship

- `ras_logo_full.png` is an **approved IEEE/RAS combined treatment** integrating the IEEE Master Brand directly atop the RAS wordmark.
- Therefore, no redundant secondary IEEE Master Brand mark is added in the header to prevent overcrowding and maintain official lockup integrity.
- `src/assets/ieee_mb_wh.png` is reserved for standalone IEEE affiliation representation where the society logo is not present (e.g. footer/about sections).

### Sizing & Clear-Space Requirements

- **Digital Minimum Width**: $\ge 100\text{px}$ (enforced via CSS in `src/components/shared/AppBrand.tsx`).
- **No Noncompliant Collapsed Mode**: Shrunken representations of the full logo under $100\text{px}$ are strictly forbidden. The noncompliant 32px collapsed mode has been removed from `AppBrand`.
- **Digital Clear Space**: For current digital and promotional usage, the required exclusion perimeter is:
  $$\text{Clear Space} \ge \tfrac{1}{2} \times \text{height of the RAS oval}$$
- **Print Clear Space**:
  $$\text{Clear Space} \ge 1 \times \text{height of the RAS oval}$$
- **Aspect Ratio**: Locked to original proportions (`object-contain`); distortion, stretching, color shifting, or drop shadows are forbidden.

---

## 4. Theme Scope: Light Theme Only

- The Stage 1 implementation and MVP strictly support **Light Theme Only**.
- Base surfaces: `#F8FAFC` (near-white canvas), `#FFFFFF` (card surfaces), `#E2E8F0` (neutral borders).
- Dead dark-mode configuration (`darkMode: ["class"]`, `dark:` utility classes) has been removed.
- Dark mode is neither promised nor implied in documentation.

---

## 5. Verification Checkpoints

| Requirement           | Implementation Target                                                                               | Verification Result                                    |
| :-------------------- | :-------------------------------------------------------------------------------------------------- | :----------------------------------------------------- |
| Canonical Colors      | `src/styles/ras-brand.css`, `tailwind.config.js`                                                    | ✅ Passed (`#861F41`, `#772583`, `#00629B`, `#002855`) |
| Official Tints        | CSS variables `--ras-red-80/60/40/20`, `--ras-purple-80/60/40/20`, `--ieee-blue-*`, `--ieee-navy-*` | ✅ Passed (All values synchronized)                    |
| Clear-Space Rule      | Digital $\ge \frac{1}{2} \times$ oval height; Print $\ge 1 \times$ oval height                      | ✅ Passed                                              |
| Open Sans Font        | `index.html`, `tailwind.config.js`                                                                  | ✅ Loaded from Google Fonts                            |
| Minimum Touch Targets | `button.tsx`, `MobileBottomNav.tsx`, all mobile controls                                            | ✅ All interactive mobile controls $\ge 44\text{px}$   |
| Logo Provenance       | Verified against official IEEE RAS Brand Kit                                                        | ✅ Passed                                              |
| Zero Legacy Colors    | Automated grep scan across codebase                                                                 | ✅ 0 matches for `#862633` or `#5F2167`                |
| Light Theme Enforced  | No `darkMode: ["class"]`, no `dark:` styles                                                         | ✅ Passed                                              |
