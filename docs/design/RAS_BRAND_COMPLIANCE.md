# IEEE RAS Brand Identity Compliance Certificate
**Project**: IEEE RAS INSAT Logistics Platform  
**Guideline Baseline**: IEEE Robotics & Automation Society Visual Identity Guidelines (Q4 2025 Canonical Update)  
**Status**: VERIFIED & ENFORCED  

---

## 1. Official Canonical Color Palette

Per Section 2 of the IEEE RAS Visual Identity Guidelines, only the canonical colors and official tints are permitted in the application.

### Primary Brand Palette
| Color Name | Hex Code | RGB | HSL | Official Tints Defined | Usage / Semantics |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RAS Dark Red** | `#861F41` | `134, 31, 65` | `340°, 62%, 32%` | 80% (`#9E4C67`), 60% (`#B6798D`), 40% (`#CEA5B3`), 20% (`#E7D2D9`) | Primary brand accent, interactive highlights, brand badges, secondary buttons |
| **RAS Dark Purple** | `#772583` | `119, 37, 131` | `292°, 56%, 33%` | 80% (`#92519C`), 60% (`#AD7CB5`), 40% (`#C9A8CE`), 20% (`#E4D3E7`) | Primary brand anchor, primary action buttons, sidebar active markers |
| **IEEE Blue** | `#00629B` | `0, 98, 155` | `202°, 100%, 30%` | 80%, 60%, 40%, 20% | Master brand touchpoint, informational states, external links |
| **IEEE Navy** | `#002855` | `0, 40, 85` | `212°, 100%, 17%` | — | Deep contrast backgrounds, dark surface containers, footer grounding |

### Semantic System Separation (Crucial Compliance Rule)
- **Destructive Actions**: Semantic red (`hsl(0, 84%, 60%)` / `#EF4444`) is strictly isolated from **RAS Dark Red** (`#861F41`). Under no circumstances is the official society color degraded into an error or destructive signifier.
- **Warning Actions**: Amber (`hsl(38, 92%, 50%)` / `#F59E0B`) is used for overdue warnings, strikes notices, and pending flags.
- **Success Actions**: Emerald (`hsl(142, 71%, 45%)` / `#10B981`) is used for confirmed handovers, completed returns, and approved items.

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
  font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  ```
- **Prohibited Substitutions**: Generic system Inter or Roboto as default root font without Open Sans precedence.

---

## 3. Official Logo Integrity & Clear Space

### Official Asset Inventory
- `src/assets/ras_logo_full.png`: Official 4-color stacked logo (IEEE Master Brand + RAS wordmark + globe symbol).
- `src/assets/ras_logo_white.svg`: Official white vector knockout logo for dark surfaces (IEEE Navy).
- `src/assets/ieee_mb_wh.png`: Official IEEE Master Brand white mark.

### Sizing & Dimension Safeguards
- **Digital Minimum Width**: $\ge 100\text{px}$ (strictly enforced via CSS `min-w-[100px]` in `src/components/shared/AppBrand.tsx`).
- **Minimum Height**: $\ge 32\text{px}$ for lockup; oval symbol $\ge 17\text{px}$.
- **Clear-Space Boundary**: An exclusion perimeter equal to the height of the capital letter **"I"** in the IEEE wordmark is enforced on all four sides. No typography, bounding boxes, or decorative graphics infringe upon this clear-space.
- **Aspect Ratio**: Locked to original proportions (`object-contain`); distortion, stretching, color shifting, or unauthorized drop shadows are prevented.

---

## 4. Verification Checkpoints

| Requirement | Implementation Target | Verification Result |
| :--- | :--- | :--- |
| Canonical Colors | `src/styles/ras-brand.css`, `tailwind.config.js` | ✅ Passed (`#861F41`, `#772583`, `#00629B`, `#002855`) |
| Official Tints | CSS variables `--ras-red-80/60/40/20`, `--ras-purple-80/60/40/20` | ✅ Passed |
| Open Sans Font | `index.html`, `tailwind.config.js` | ✅ Loaded from Google Fonts |
| Min Touch Targets | `button.tsx`, `MobileBottomNav.tsx` | ✅ All interactive elements $\ge 44\text{px}$ |
| Zero Legacy Colors | Automated grep scan across codebase | ✅ 0 matches for `#862633` or `#5F2167` |
