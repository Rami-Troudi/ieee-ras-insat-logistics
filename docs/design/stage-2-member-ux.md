# Stage 2 Member UX & Interaction Specification

## 1. Member Navigation & Shell Integration

The Member experience operates inside `MemberLayout` with unified responsive navigation:

- **TopBar**: Features real-time Cart counter badge and Notifications unread indicator.
- **Desktop Sidebar**: Highlights active section (`Dashboard`, `Equipment Catalog`, `My Requests`, `Active Loans`, `Saved Items`, `Notifications`, `My Profile`).
- **Mobile Bottom Bar**: Compact navigation bar with quick access to Home, Inventory, Requests, Loans, and Profile.

---

## 2. Equipment Discovery & Eligibility

- **Filter Bar & Mobile Filter Drawer**:
  - Category, Availability (`ALL`, `AVAILABLE`, `BORROWED`), and Item Class (`ALL`, `CLASS_A` - `CLASS_G`).
  - Active filters rendered as removable `FilterChip`s.
  - Search input with instantaneous filtering across name, code, model, and tags.
- **Visual Eligibility Cues**:
  - Cards and detail views display badge status: `Eligible`, `Clearance Required (Lv X)`, `Project Required (Class B/D)`, or `Restricted`.
  - Non-eligible items disable the "Add to Cart" CTA and show contextual explanatory banners explaining the exact constraint.
- **Equipment Detail Page**:
  - High-resolution preview, availability metrics, item classification policies, full technical specifications table, serialized unit status list, and quantity stepper.

---

## 3. Borrow Cart & Request Submission Lifecycle

- **Multi-item Cart**:
  - Real-time verification of item limits and required project association.
  - If a Class B or D item is in the cart, a Project selection dropdown becomes strictly required.
  - Estimated return date defaults to +14 days with validation against maximum permitted loan duration.
  - Justification / Purpose textarea with live character counter.
- **Request Detail & Tracking**:
  - Visual status timeline: `Submitted` $\to$ `Under Review` $\to$ `Decision` $\to$ `Ready for Pickup` $\to$ `Dispatched`.
  - **Partial Approval Support**: Displays line-item breakdown indicating approved vs rejected quantities with board reviewer notes.
  - **48-Hour Pickup Window Countdown**: For approved requests, displays prominent deadline banner with remaining hours/minutes countdown until expiration.
  - **Cancellation Flow**: Allows members to cancel pending requests with confirmation dialog and cancellation reason.

---

## 4. Active Loans & Lifecycle Management

- **Loan Overview & Detail**:
  - Overdue warning alerts prominently displayed when `currentDueDate` has passed.
  - Serialized unit breakdown with condition at dispatch.
- **Due Date Extension**:
  - Reusable modal to request additional days with reason and new target return date.
  - Maximum 1 extension per loan; disabled if loan is currently overdue.
- **Partial Return Declaration**:
  - Checkbox selection of specific serialized units being returned.
  - Physical inspection disclaimer emphasizing that loans remain active until physical handover and board verification in the INSAT robotics lab.
