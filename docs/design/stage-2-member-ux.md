# Stage 2 Member UX & Interaction Specification

## 1. Member Navigation & Shell Integration

The Member experience operates inside `MemberLayout` with unified responsive navigation:

- **TopBar**: Features real-time Cart counter badge and Notifications unread indicator.
- **Desktop Sidebar**: Highlights active section (`Dashboard`, `Equipment Catalog`, `My Requests`, `Active Loans`, `Saved Items`, `Notifications`, `My Profile`).
- **Mobile Bottom Bar**: Compact touch-friendly navigation bar (minimum 44×44 px touch targets) with quick access to Home, Inventory, Requests, Loans, and Profile.

---

## 2. Equipment Discovery & Eligibility

- **Filter Bar & Mobile Filter Drawer**:
  - Category, Availability (`ALL`, `AVAILABLE`, `BORROWED`), and Item Class (`ALL`, `CLASS_A` through `CLASS_G`).
  - Active filters rendered as removable `FilterChip`s with accessible 44px dismiss touch targets on mobile.
  - Search input with instantaneous filtering across name, code, model, and tags.
- **Visual Eligibility Cues**:
  - Cards and detail views display badge status: `Eligible`, `Clearance Required (Lv X)`, `Project Required`, or `Restricted`.
  - Class B and Class D items display `Direct Board Review Required` only when member clearance meets the required threshold (Level I for Class B, Level III for Class D); otherwise, `Insufficient Clearance` is prioritized.
  - Strike 3 members receive explicit advisories indicating Class E is restricted to direct supervision, while Classes F and G remain unavailable.
  - Non-eligible items disable the "Add to Cart" CTA and display contextual explanatory notices explaining the exact constraint.
- **Equipment Detail Page**:
  - High-resolution preview, availability metrics, item classification policies, full technical specifications table, serialized unit status list, and quantity stepper.

---

## 3. Borrow Cart & Request Submission Lifecycle

- **Multi-item Cart**:
  - Real-time verification of item limits, clearance levels, strike restrictions, and required project association.
  - If a Class C item is in the cart, a Project selection dropdown becomes strictly required, populated only with projects the current member is actively assigned to.
  - Strike 2 advisory banners alert users that Class C+ items cannot be checked out.
  - Strike 3 advisory banners inform members that Class E items require direct supervisor presence during lab sessions.
  - Provisional / unregistered users see an alert explaining that membership review is pending before checkouts can be processed.
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
  - Overdue warning alerts prominently displayed when `dueDate` has passed.
  - Serialized unit breakdown with condition at dispatch.
  - Multidimensional custody status and return status displayed cleanly via `getLoanDisplayStatus(loan)`.
- **Due Date Extension**:
  - Reusable modal to request additional days with reason and new target return date.
  - Maximum 1 extension per loan; disabled if loan is currently overdue.
- **Partial Return Declaration (RHF + Zod)**:
  - Form validation powered by React Hook Form and Zod with strict returnable quantity caps:
    $$\text{maxReturnable} = \text{borrowedQuantity} - \text{returnedQuantity} - \text{alreadyPendingReturnQuantity}$$
  - Enforces mobile-friendly minimum 44px inputs for quantity controls and condition notes.
  - Physical inspection disclaimer emphasizing that custody records remain active until physical handover and board verification in the INSAT robotics lab.
