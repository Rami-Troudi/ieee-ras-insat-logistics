# Stage 2 Member UX & Interaction Specification

## 1. Member Navigation & Shell Integration

The Member experience operates inside `MemberLayout` with unified responsive navigation:

- **TopBar**: Dynamic role indicator, quick cart counter badge, notifications indicator, and user profile menu.
- **Desktop Sidebar**: Primary navigation sections (`Dashboard`, `Equipment Catalog`, `My Requests`, `My Loans`, `Saved Items`, `Notifications`, `My Profile`).
- **Mobile Bottom Navigation**: Compact touch-friendly navigation bar adhering to $\ge 44\times 44$ px touch targets on mobile (`Home`, `Inventory`, `Requests`, `Loans`, `Profile`).

---

## 2. Equipment Discovery & Eligibility

- **Filtering & Search**:
  - Filter by Category, Stock Availability (`ALL`, `AVAILABLE`, `BORROWED`), and Equipment Class (`ALL`, `CLASS_A` through `CLASS_G`).
  - Mobile filter drawer with accessible $\ge 44$ px touch targets.
  - Search input with real-time matching across name, code, category, and specifications.
- **Visual Eligibility Cues**:
  - Clear badge indicators: `Eligible`, `Clearance Req.`, `Direct Board`, `Supervised (Lv V+)`, `Level VI Auth Req.`, `Provisional`, `Board Review Req.`, `Supervised (Strike 3)`, `Restricted`, or `Out of Stock`.
  - Class B and Class D items display `Direct Board` only after clearance eligibility is established (Level I for Class B, Level III for Class D); otherwise, `Clearance Req.` is displayed.
  - Strike 3 members receive explicit advisories that Class E requires supervision, and Classes F and G are unavailable.
  - Ineligible items disable the "Add to Cart" CTA and show contextual policy notices explaining the reason.
- **Item Detail View**:
  - High-resolution preview, availability metrics, equipment classification policies, full technical specifications, and quantity selector.

---

## 3. Borrow Cart & Request Submission

- **Borrow Request Cart**:
  - Multi-item collection with real-time stock and eligibility checks.
  - Optional Project assignment dropdown populated with projects the current member belongs to.
  - Advisory banners for special standing:
    - Strike 2: Advisory that all requests require explicit Board review; Classes F and G are unavailable.
    - Strike 3: Advisory that all requests require explicit Board review; Class E requires supervision, and Classes F and G are unavailable.
    - Provisional accounts: Informational notice that requests can be submitted and affiliation will be verified during processing.
    - Class F items: Notice regarding Level V+ supervision requirement in the lab.
    - Class G items: Notice regarding explicit Level VI authorization requirement.
  - Target return date picker and technical justification / purpose textarea.
- **Request Detail & Tracking**:
  - Multidimensional state inspection: Decision Status, Handover Status, and Lifecycle Status.
  - **Line Item Decision Breakdown**: Shows approved vs rejected quantities per item with board review notes.
  - **48-Hour Pickup Window Countdown**: Approved requests awaiting handover display a prominent countdown banner indicating remaining time before reservation expiration.
  - **Cancellation Flow**: Allows members to cancel active PENDING requests with a confirmation dialog and optional reason.

---

## 4. Active Loans & Lifecycle Management

- **Loan Overview & Detail**:
  - Multidimensional state tracking: Lifecycle Status (`ACTIVE` / `CLOSED`), Due Status (`ON_TIME` / `DUE_SOON` / `OVERDUE`), Return Status (`NONE` / `PENDING_CONFIRMATION` / `PARTIAL` / `COMPLETE`), and Extension Status.
  - Prominent warning banners for overdue loans.
  - Serialized unit breakdown and handover condition records.
- **Due Date Extension**:
  - Modal to request a new proposed return date with justification.
  - Preserves official due date in the UI while extension is pending review.
- **Return Declaration Flow**:
  - Form validation with strict returnable quantity caps:
    $$\text{maxReturnable} = \text{borrowedQuantity} - \text{returnedQuantity} - \text{alreadyPendingReturnQuantity}$$
  - Enforces $\ge 44$ px interactive touch targets on mobile.
  - Physical inspection disclaimer emphasizing that custody records remain active until physical handover and board verification in the INSAT robotics lab.
