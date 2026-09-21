# Stage 1 UX Research & Interaction Foundations
**Project**: IEEE RAS INSAT Logistics Platform  
**Authors**: Antigravity Autonomous Engineering & UX Team  
**Date**: September 2026  

---

## 1. Context & Operational Environment

The IEEE Robotics & Automation Society (RAS) INSAT Student Branch chapter manages hundreds of high-value robotics components, development boards (STM32, Arduino, ESP32, Raspberry Pi), actuators (Dynamixel, stepper motors, brushed DC), power systems (LiPo batteries, bench supplies), and specialized sensor equipment (LiDAR, ultrasonic, IMUs).

### 1.1 Field Realities & Constraints
1. **The Physical Logistics Cabinet**: The equipment is housed in physical club lockers and workshop labs at INSAT. Space is cramped, lighting is variable, and board members often interact with the platform using one hand while holding a robotic chassis or hardware box in the other.
2. **Competition Crunch Cycles**: Ahead of flagship events (Eurobot, TUNIROBOTS, National Robotics Cup), request volume spikes by 400%. The system must facilitate rapid batch checkout, quick approval triaging, and unambiguous loan tracking.
3. **Regulatory Accountability**: The platform enforces the official *IEEE RAS INSAT Logistics Regulations and Policies*, requiring strict clearance enforcement (Levels I–VI), 48-hour pickup deadlines, multi-step loan lifecycles, and a progressive 5-strike disciplinary ledger.

---

## 2. Persona Workflows & UX Principles

### 2.1 The Two Primary Paradigms
- **The Member Paradigm (Self-Service & Transparency)**:
  - Members want to quickly discover what equipment is in stock, whether their clearance level permits borrowing it, draft a request cart, and know exactly when their approved items are ready for pickup.
  - Ergonomics: Focused mobile bottom navigation (5 tabs), clean item cards, clear status badges, and prominent loan due-date alerts.
- **The Board Paradigm (High-Density Triage & Custodianship)**:
  - Board members need to triage incoming requests, physically inspect returned components, verify item serials, initiate inventory audits, and issue strikes.
  - Ergonomics: High-density desktop sidebar with 10 operational views; mobile navigation prioritizing immediate actions (`Action Center`, `Requests`, `Loans`, `Inventory`) with secondary links organized in an accessible slide-up bottom sheet (`More`).

---

## 3. Design Inspiration & Component Benchmarks

### 3.1 21st.dev & Radix UI Patterns
- **Responsive Dialog / Drawer Hybrids**: Inspired by modern mobile-first web applications (Vaul drawers on mobile, centered modal dialogs on desktop). This ensures one-handed thumb dismissal on iOS/Android while retaining a roomy window on desktop monitors.
- **Quantity Selector**: Replaced generic text inputs with bound-checked tactile increment/decrement controls, avoiding keyboard popups on mobile when simply adjusting quantities from 1 to 3.
- **Status Indicators**: Followed modern accessibility best practices where color is never the sole carrier of semantic meaning. Every badge incorporates a standardized Lucide icon, contrasting tint background, and clear text label.

---

## 4. Key Architectural Decisions in Stage 1

1. **Strict IEEE Brand Enforcement**: Canonical Q4 2025 colors (`#861F41`, `#772583`, `#00629B`, `#002855`) and Open Sans typography are used exclusively. Legacy or generic colors are eliminated.
2. **Separation of Semantic Destructive from Brand Red**: Brand Dark Red (`#861F41`) is reserved for high-visibility brand accents and primary navigation elements, while semantic Red (`#EF4444`) is strictly reserved for destructive or critical error actions.
3. **Development Persona Switcher**: Embedded directly into the application shell (`TopBar` and `_dev/design`), allowing instantaneous persona flipping across 6 key student and leadership roles to validate access rules.
4. **Mock Service Architecture**: A typed `IInventoryService` contract and `MockInventoryService` with simulated 250ms latency were integrated with TanStack Query, enabling realistic async state testing prior to backend implementation.
