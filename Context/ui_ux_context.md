# IEEE RAS INSAT Logistics Platform
# UI/UX Implementation Context

**Document type:** UI/UX implementation context  
**Purpose:** Authoritative design and interaction guidance for frontend implementation  
**Target:** Responsive React web application for desktop, tablet, and mobile browsers  
**Audience:** Frontend developers, full-stack developers, coding agents, reviewers, future RAS maintainers  
**Status:** Implementation-ready  

---

# 1. Product Vision

The IEEE RAS INSAT Logistics Platform is a responsive web application for managing equipment requests, loans, returns, projects, inventory operations, sanctions, and logistics oversight.

The platform must feel significantly simpler than the business logic behind it.

The backend may contain:
- clearance rules;
- regulatory checks;
- stock allocations;
- loan state machines;
- partial approvals;
- partial returns;
- strike logic;
- audit events;
- concurrency handling.

The user interface must expose only the information required for the user to make the next correct decision.

The core UX objective is:

> A normal member should be able to find equipment and submit a valid request in under 1–2 minutes without needing to understand the logistics policy implementation.

The Board experience should optimize for:

> Seeing what requires attention, making a correct decision quickly, and confirming real-world actions with minimal navigation.

The product must prioritize:
1. clarity;
2. ease of use;
3. consistency;
4. responsiveness;
5. accessibility;
6. low cognitive load;
7. operational reliability;
8. explicit system feedback;
9. prevention of mistakes;
10. maintainability.

---

# 2. Product Personality

The product should feel:

- professional;
- technical;
- modern;
- precise;
- trustworthy;
- clean;
- compact without feeling crowded;
- appropriate for a robotics/engineering organization.

The product should **not** feel:
- playful;
- gamified;
- childish;
- excessively futuristic;
- like a generic SaaS template;
- like an AI-generated dashboard;
- visually noisy;
- dependent on gradients or glassmorphism;
- overloaded with cards;
- full of decorative animations;
- over-designed.

The visual language should communicate:

> "This is an operational engineering tool."

---

# 3. Fundamental UX Principles

## 3.1 Progressive disclosure

Do not show all policy details, stock mechanics, or system state unless relevant.

Example:

Do not display:

```text
Clearance III allows Class E according to policy rule X.
```

By default show:

```text
Eligible to request
```

Then allow the user to view:

```text
Why?
```

if they want more detail.

---

## 3.2 Recognition over recall

Users should never need to remember:
- equipment class rules;
- strike restrictions;
- project memberships;
- clearance permissions;
- required next steps.

The platform should surface the relevant rule at the relevant moment.

Example:

```text
Class F
Requires supervision
```

rather than expecting Board members to remember the policy manually.

---

## 3.3 Prevent errors instead of explaining them later

Prefer:
- disabled impossible actions;
- maximum quantity controls;
- inline warnings;
- validation before submission;
- explicit confirmation for destructive/sensitive actions.

Avoid allowing invalid data and then returning generic backend errors.

---

## 3.4 Every page should have one obvious primary action

Examples:

Inventory:
```text
Add to cart
```

Cart:
```text
Submit request
```

Request review:
```text
Approve selected items
```

Return confirmation:
```text
Confirm return
```

Audit:
```text
Finalize audit
```

Secondary actions must be visually subordinate.

---

## 3.5 Preserve real-world workflow

The software should mirror actual physical logistics.

Examples:
- approval is not handover;
- return request is not return confirmation;
- a request can be approved before equipment is physically received;
- inventory only returns to available stock after Board confirmation.

Never collapse distinct real-world actions merely to reduce UI screens.

---

## 3.6 Explain unusual states in plain language

Avoid exposing internal technical status names unless useful.

Instead of:

```text
PARTIALLY_APPROVED
```

show:

```text
Partially approved
2 of 3 STM32 approved
```

Instead of:

```text
ALLOCATION_EXPIRED
```

show:

```text
Approval expired
The equipment was not collected within 48 hours.
```

---

# 4. Anti-Slop UI Rules

These rules are mandatory.

## 4.1 No excessive cards

Do not wrap every text block in a card.

Use cards only when they represent:
- a distinct entity;
- an actionable group;
- a summary metric;
- a mobile replacement for a table row.

Desktop operational interfaces should prefer:
- structured lists;
- tables;
- sections;
- restrained panels.

---

## 4.2 Avoid excessive rounded corners

Use consistent moderate radius.

Recommended:
- controls: 6–8 px;
- cards/panels: 8–12 px;
- dialogs: 10–12 px.

Do not use:
- 24–32 px rounded rectangles everywhere;
- pill-shaped containers for ordinary content.

Pills are reserved for:
- statuses;
- filters;
- compact tags.

---

## 4.3 Avoid decorative gradients

Do not use gradients as default decoration.

A gradient may only be used if it has a functional visual purpose.

Default surfaces should be:
- solid;
- neutral;
- high contrast;
- easy to scan.

---

## 4.4 Avoid glassmorphism

No blurred transparent panels as a default design system.

The application is an operational logistics system.

---

## 4.5 Avoid excessive shadows

Use very subtle elevation only when hierarchy requires it:
- dropdowns;
- dialogs;
- floating menus;
- sticky elements.

Normal sections should rely on:
- spacing;
- borders;
- background contrast.

---

## 4.6 No fake "AI dashboard" aesthetic

Do not use:
- giant meaningless KPI tiles;
- random sparkline charts;
- neon icons;
- excessive iconography;
- decorative data visualizations;
- oversized hero sections inside the app;
- giant typography on operational pages.

Every visual element must communicate useful information.

---

## 4.7 No unnecessary animation

Animations must support comprehension.

Allowed:
- menu opening;
- modal transitions;
- state change feedback;
- accordion expansion;
- subtle loading transitions.

Avoid:
- bouncing buttons;
- floating cards;
- continuous motion;
- decorative entrance animations;
- counters that animate every page load.

Respect `prefers-reduced-motion`.

---

# 5. Design System Foundations

## 5.1 Typography

Use a highly legible modern sans-serif.

Preferred:
- Inter;
- Geist;
- system-ui fallback.

Typography should emphasize hierarchy through:
- size;
- weight;
- spacing.

Avoid using multiple font families.

Suggested scale:

```text
Page title        28–32 px desktop / 24–28 px mobile
Section title     20–24 px
Card/title        16–18 px
Body              14–16 px
Secondary text    13–14 px
Metadata          12–13 px
```

Use semibold rather than bold for most headings.

---

## 5.2 Spacing

Use a consistent 4 px base spacing system.

Typical spacing:

```text
4 px
8 px
12 px
16 px
20 px
24 px
32 px
40 px
48 px
```

Avoid arbitrary spacing values.

---

## 5.3 Color strategy

Use a neutral base palette.

Recommended semantic categories:

- neutral: default content;
- primary/accent: main actions and active navigation;
- success: approved, returned, available;
- warning: due soon, partial, low availability;
- danger: overdue, damage, restriction, destructive action;
- information: contextual notices.

Do not encode critical status only by color.

Always pair color with:
- text;
- icon;
- label.

---

## 5.4 Contrast

Target WCAG 2.2 AA minimum contrast.

Text:
- normal text: at least 4.5:1;
- large text: at least 3:1.

Interactive component boundaries and focus indicators must remain visible.

---

# 6. Responsive Strategy

The website must be designed mobile-first but not as a stretched mobile interface on desktop.

The desktop version should take advantage of:
- tables;
- wider layouts;
- persistent navigation;
- simultaneous context.

The mobile version should prioritize:
- cards;
- stacked actions;
- bottom navigation;
- thumb-friendly controls;
- progressive disclosure.

---

# 7. Breakpoints

Suggested implementation breakpoints:

```text
< 640 px       Mobile
640–767 px     Large mobile / small tablet
768–1023 px    Tablet
1024–1279 px   Small desktop
>= 1280 px     Desktop
```

Do not implement layouts based purely on device names.

Use available viewport width.

---

# 8. Layout Constraints

Desktop content should generally use:

```text
max-width: 1440 px
```

Operational table pages may use more width where necessary.

Normal content pages:
```text
max-width: 1200–1280 px
```

Avoid stretching forms and paragraphs across very wide screens.

---

# 9. Mobile Ergonomics

## 9.1 Touch targets

Interactive targets should be at least:

```text
44 × 44 px
```

Prefer 48 px where practical.

---

## 9.2 Thumb reach

Frequent mobile actions should be near:
- bottom;
- center;
- lower half of the screen.

Avoid placing all primary actions only in the top-right corner.

---

## 9.3 Sticky actions

For long mobile forms or review pages, primary actions may use a sticky bottom action area.

Example:

```text
[ Submit request ]
```

The sticky bar must:
- not obscure content;
- respect safe-area insets;
- remain compact.

---

## 9.4 Mobile tables

Do not horizontally shrink large desktop tables into unreadable tables.

Convert rows into cards.

Example desktop:

| Borrower | Project | Due | Status |
|---|---|---|---|

Mobile:

```text
Rami Troudi
Eurobot 2027

Due: 30 Sep
Active

[ Open ]
```

Horizontal scrolling is acceptable only for specialized dense admin views where cards would remove essential comparison ability.

---

# 10. Desktop Navigation

Normal Member:

```text
Home
Inventory
My Requests
My Loans
Favorites
```

Secondary:
```text
Notifications
Profile
```

Recommended layout:
- persistent left sidebar;
- top bar for search/context/actions;
- central content area.

---

# 11. Mobile Navigation

Use bottom navigation for primary member functions.

Recommended:

```text
Home
Inventory
Requests
Loans
Profile
```

Notifications should appear:
- in the top bar;
- through a badge.

Favorites can live inside:
- Inventory;
- Profile;
- Home shortcuts.

Do not overload bottom navigation with more than five main destinations.

---

# 12. Board Navigation

Desktop Board navigation:

```text
Action Center
Inventory
Requests
Loans
Projects
Users
Audits
Incidents
Insights
Exports
```

Secondary/system:
```text
Notifications
Profile
```

Superadmin-only areas should appear only when authorized.

Do not show disabled admin navigation items to unauthorized users.

---

# 13. Member Information Architecture

```text
Home
├── Current loans summary
├── Due soon
├── Recent request
├── Quick actions
└── Favorites / recent items

Inventory
├── Search
├── Filters
├── Item list
└── Item details

Cart
└── Submit request

My Requests
├── Pending
├── Approved / partial
├── Rejected
└── Expired

My Loans
├── Active
├── Overdue
├── Partial return
├── Extension
└── Timeline

Profile
├── Personal information
├── Affiliation status
├── Clearance
├── Projects
└── Account settings
```

---

# 14. Board Information Architecture

```text
Action Center
├── Pending requests
├── Returns
├── Extensions
├── Accounts to process
├── Overdue loans
├── Strike recommendations
├── Inventory warnings
└── Audit discrepancies

Inventory
├── Catalogue
├── Item detail
├── Stock operation
└── History

Requests
├── Pending
├── Approved
├── Partial
├── Rejected
└── Expired

Loans
├── Active
├── Overdue
├── By project
└── By borrower

Projects
├── Overview
├── Members
├── Equipment
└── History

Users
├── Accounts to process
├── Members
├── Board
└── Restrictions

Audits
├── New audit
├── In progress
└── History

Incidents
├── Damage
├── Loss
├── Strikes
└── Compensation

Insights
Exports
```

---

# 15. Member Home

The member home screen should answer:

1. What do I currently have?
2. Is anything due soon?
3. What happened to my latest request?
4. What can I do next?

Suggested layout:

```text
Welcome, Rami

Current equipment
3 items borrowed
1 due in 2 days

[ View my loans ]

Quick actions
[ Browse equipment ]
[ Return equipment ]

Recent request
REQ-2026-0142
Partially approved

Favorites / recently used
```

Do not show operational analytics to members.

---

# 16. Inventory Experience

## 16.1 Search

Search must be persistent and prominent.

Desktop:
- search field at top;
- filters in sidebar or filter toolbar.

Mobile:
- full-width search field;
- filter button opens bottom sheet/drawer.

Search supports:
- partial match;
- aliases;
- tags;
- category terms.

Search is not AI-powered.

---

## 16.2 Inventory filters

Required filters:

- availability;
- class;
- category;
- condition;
- borrowable by me;
- tracking mode;
- low availability;
- low stock;
- favorites.

Active filters should be visible as removable chips.

Example:

```text
[ Available × ] [ Class E × ] [ Favorites × ]
```

Provide:
```text
Clear all
```

---

# 17. Inventory Card/List Item

Member-facing summary:

```text
STM32
Electronic Resource · Class E

3 available
Eligible to request

[ Add to cart ]
```

Optional:
```text
★
```

Do not expose:
- audit information;
- internal allocation counts;
- technical database state;
- unnecessary stock breakdown.

---

# 18. Item Detail

Must contain:

```text
Name
Image if available
Description
Class
Category
Current availability
Eligibility
Quantity selector
Favorite control
Add to cart
```

If not eligible:

```text
Not available with your current access
[ Why? ]
```

If unavailable:

```text
Currently unavailable
```

Do not show an enabled `Add to cart` button.

---

# 19. Quantity Controls

Use:
```text
[-] 2 [+]
```

Also allow keyboard entry on desktop if useful.

Rules:
- minimum 1;
- maximum dynamically constrained;
- never permit negative values;
- show stock limitation immediately.

Example:

```text
Only 3 currently available.
```

---

# 20. Cart Experience

The cart must clearly separate:

1. requested equipment;
2. contextual request information.

Example:

```text
Borrowing Request

STM32
Quantity 2
Remove

N20 Motor
Quantity 2
Remove

Project
[ Eurobot 2027 ▼ ]

Purpose
[ ... ]

Requested return date
[ ... ]

[ Submit request ]
```

---

# 21. Project Selection

Users can select only projects assigned by Board/Superadmin.

Never expose arbitrary project creation inside the borrowing flow.

If no projects are assigned and policy allows general use:

```text
Personal / General RAS Use
```

Otherwise omit project selection.

---

# 22. Form Design Standards

Forms must:
- use visible labels;
- never rely on placeholder-only labels;
- show errors next to relevant fields;
- preserve user input after validation failures;
- use correct input types;
- use browser autofill where appropriate;
- avoid unnecessary fields.

Errors should be specific:

Bad:
```text
Invalid input
```

Good:
```text
Return date must be after today's date.
```

---

# 23. Request Submission

Before final submission, show concise summary.

If useful:

```text
3 equipment types
9 total units
Project: Eurobot 2027
Return date: 30 Sep
```

Submit button:

```text
Submit request
```

Avoid generic:
```text
Confirm
```

---

# 24. Submission Success

Success screen/state:

```text
Request submitted

REQ-2026-0142

Waiting for Board review

[ View request ]
[ Continue browsing ]
```

Do not leave the user wondering whether submission succeeded.

---

# 25. My Requests

Separate requests from active loans.

A request exists before handover.

Useful groupings:
- waiting;
- approved;
- partially approved;
- rejected;
- expired.

Request card should show:
- request ID;
- creation date;
- project;
- short item summary;
- current state.

---

# 26. Partial Approval UX

Always show requested versus approved.

Example:

```text
Partially approved

Requested   Approved
STM32     3     2
Motors    2     2
Sensors   8     5

Board note:
Only 2 STM32 boards are currently available.
```

Never hide changed quantities behind a generic status.

---

# 27. 48-Hour Pickup Window

Approved equipment remains internally allocated for 48 hours.

User-facing UI should show:

```text
Approved
Collect before 23 Sep, 16:30

31h remaining
```

Avoid a stressful second-by-second countdown.

Use:
- hours remaining;
- due timestamp.

When near expiry:
```text
Approval expires in 4 hours
```

Expired:

```text
Approval expired
The equipment was not collected within 48 hours.
```

---

# 28. Cancellation UX

Member:
- may cancel PENDING request.

Board/Superadmin:
- may cancel pending or approved request.

Cancellation must require confirmation:

```text
Cancel this request?

This action will release any allocated equipment.

[ Keep request ]
[ Cancel request ]
```

Active loans cannot be cancelled.

The UI must not display cancellation once equipment has been handed over.

---

# 29. My Loans

This page represents physically held equipment.

Each active loan card should show:

```text
Eurobot 2027
Due 30 Sep

STM32 ×2
Motors ×2
Sensors ×5

7 days remaining

[ Return items ]
[ Request extension ]
[ View timeline ]
```

---

# 30. Due-Date Communication

Use human-readable urgency.

Examples:

```text
Due in 7 days
Due tomorrow
Due today
Overdue by 3 days
```

Do not force users to mentally calculate dates.

Still display exact due date nearby.

---

# 31. Return Workflow

Member:
```text
Return items
```

Screen:

```text
Select what you are returning

STM32
Borrowed 2
Returning [-] 1 [+]

Motors
Borrowed 2
Returning [-] 2 [+]

[ Request return ]
```

After submission:

```text
Return requested

Bring the selected equipment to the Board.
Inventory will update after the physical return is confirmed.
```

---

# 32. Extension Workflow

Modal/page:

```text
Request extension

Current due date
30 Sep

Requested new date
[ 05 Oct ]

Reason
[ ... ]

[ Submit request ]
```

Pending extension state must not replace official due date.

Show:

```text
Current due date: 30 Sep
Requested date: 05 Oct
Extension pending
```

---

# 33. Timeline

Timelines should be:
- chronological;
- human-readable;
- concise.

Example:

```text
21 Sep · 14:10
Request submitted

21 Sep · 15:22
Partially approved

21 Sep · 18:04
Equipment handed over

26 Sep · 10:42
Extension requested
```

Do not expose:
- database event IDs;
- raw API payloads;
- internal inventory event names.

---

# 34. Board Action Center

This is the Board landing page.

Primary goal:

> What needs attention now?

Sections/cards may include:

```text
7 New Requests
3 Returns
2 Extension Requests
1 Account to Process
4 Overdue Loans
1 Strike Recommendation
2 Inventory Warnings
1 Audit Discrepancy
```

Priority ordering:
1. urgent/safety/restriction issues;
2. overdue;
3. returns;
4. pending requests;
5. extensions;
6. account processing;
7. stock warnings;
8. informational items.

Action Center items must link directly to the relevant object.

---

# 35. Board Request Review

Request detail should show:

```text
Borrower
Affiliation
Clearance
Verification status
Project
Purpose
Requested return
Request timestamp
```

Then line items:

```text
STM32

Requested: 3
Available: 2
Approve: [-] 2 [+]
```

Policy warnings appear beside relevant line item.

Example:

```text
Class F
Requires supervision
```

or:

```text
Class G
Level VI approval required
```

---

# 36. Board Approval Actions

Primary:
```text
Approve selected items
```

Secondary:
```text
Reject request
```

Reject action should request:
- reason or optional note depending policy.

Do not place Approve and Reject as equal ambiguous buttons directly beside each other without semantic styling.

---

# 37. Handover Screen

Approval and handover are separate.

Handover view should show:
- approved quantities;
- borrower;
- project;
- due date;
- exact individually tracked assets where relevant.

Board selects actual asset units at handover.

Confirmation:

```text
Confirm handover?

2 × STM32
2 × Motor
5 × Sensor

Borrower: Rami
Due: 30 Sep

[ Cancel ]
[ Confirm handover ]
```

---

# 38. Return Confirmation Screen

Board sees:
- requested returned quantities;
- physical quantities received;
- condition.

For individual assets:

```text
STM32-002
Condition out: Good
Condition in:
[ Good ▼ ]
```

Possible values:
- Good;
- Minor issue;
- Damaged;
- Lost where applicable.

Final:
```text
Confirm return
```

This action updates inventory.

---

# 39. Account Processing

Account processing should be fast.

Example:

```text
Rami Troudi

Declared affiliation
IEEE Member

Email
...

Suggested clearance
Level III

[ Confirm ]
[ Change clearance ]
```

Do not require complex administrative forms unless required.

---

# 40. Eurobot Assignment

Adding user to official Eurobot project automatically makes them minimum Level V.

UI must explicitly warn:

```text
Assigning this user to Eurobot will grant Level V clearance.
```

Then:

```text
[ Cancel ]
[ Assign to Eurobot ]
```

This prevents accidental privilege escalation.

---

# 41. Superadmin / Level VI

Level VI / Superadmin actions require stronger confirmation.

Examples:
- granting Level IV;
- changing privileged roles;
- Class G approval;
- permanent blacklist.

Use confirmation dialogs with explicit consequence text.

Do not use generic:
```text
Are you sure?
```

Use:
```text
This will permanently blacklist the user from RAS Logistics.

[ Cancel ]
[ Permanently blacklist ]
```

---

# 42. Inventory Management

Board inventory detail should show operational data:

```text
Arduino Uno

Total functioning   18
Available           12
Borrowed             5
Damaged              1

[ Add stock ]
[ Adjust ]
[ Mark damaged ]
[ Maintenance ]
[ View history ]
```

Do not allow direct free-form editing of stock counters.

All stock changes must use explicit operations.

---

# 43. Stock Operation Modal

Required fields:
- operation type;
- quantity;
- reason;
- optional comment.

Example:

```text
Add stock

Quantity
[ 5 ]

Reason
[ Purchase ▼ ]

Comment
[ Optional ]

[ Cancel ]
[ Add stock ]
```

Corrections must display before/after values.

---

# 44. Inventory Audit UX

Audit should behave like a checklist.

Header:

```text
Inventory Audit
September 2026

32 / 86 items checked
```

Item:

```text
STM32

Expected: 6
Physical count: [ 6 ]

Matches
```

Mismatch:

```text
Arduino Uno

Expected: 18
Physical: 17

Difference: -1

[ Add note ]
```

Finalization must show summary before committing adjustments.

---

# 45. Strike UX

Strikes are sensitive actions.

System-generated strike recommendation:

```text
Strike recommendation

Rami Troudi
Loan overdue by 15 days

Related loan:
LOAN-142
```

Actions:
```text
Dismiss recommendation
Issue strike
```

The recommendation must never apply the strike automatically.

---

# 46. High-Severity Sanctions

Strike 4 and Strike 5 require explicit consequence confirmation.

Example Strike 4:

```text
This will prevent the user from borrowing RAS equipment until the semester ends.
```

Strike 5:

```text
This permanently blacklists the user from RAS Logistics.
```

Require:
- confirmation dialog;
- reason;
- actor identity automatically logged.

---

# 47. Insights Dashboard

Insights is not the Action Center.

Action Center:
> What needs action?

Insights:
> What is happening?

Recommended top metrics:

```text
Active loans
Overdue loans
Available inventory
Damaged equipment
```

Recommended charts:
- requests over time;
- most borrowed equipment;
- inventory health;
- borrowing by project;
- overdue trend.

Keep chart count low.

Every chart must answer a real logistics question.

---

# 48. Empty States

Every empty state must help the user.

Bad:

```text
No records
```

Good:

```text
You do not have any active loans.

Browse available equipment when you need something.

[ Browse inventory ]
```

Board:

```text
No requests require attention.

Everything is currently up to date.
```

---

# 49. Loading States

Use skeletons for:
- tables;
- cards;
- summaries.

Use inline loading indicators for:
- button actions;
- small asynchronous operations.

Do not replace an entire page with a spinner when only one section is loading.

Prevent duplicate submission by disabling the action while pending.

---

# 50. Error Handling

Errors must explain:
1. what happened;
2. why if known;
3. what the user can do.

Example concurrency conflict:

```text
Only 1 STM32 is still available.
Another request may have been approved while you were reviewing this request.

[ Update quantities ]
```

Never show raw HTTP codes as the main message.

Technical details may be logged internally.

---

# 51. Toasts

Use toasts for transient confirmations:

```text
Favorite added
Stock updated
Notification marked as read
```

Do not use a toast as the only confirmation for:
- loan approval;
- submission;
- strike issuance;
- handover;
- return confirmation.

Important state changes require visible persistent UI feedback.

---

# 52. Confirmation Dialogs

Required for:
- cancelling approved request;
- stock correction;
- destructive inventory operation;
- issuing major strike;
- permanent blacklist;
- role/clearance escalation;
- finalizing audit.

Not required for:
- adding favorite;
- changing filters;
- opening item;
- basic navigation.

Avoid confirmation fatigue.

---

# 53. Status Semantics

Use consistent vocabulary across the entire product.

Examples:

```text
Pending
Approved
Partially approved
Rejected
Expired

Active
Returned
Partially returned
Overdue

Available
Borrowed
Damaged
Maintenance
Lost
Retired
```

Do not alternate between synonyms such as:
- accepted / approved;
- waiting / pending;
- completed / returned.

Choose one product vocabulary and keep it stable.

---

# 54. Status Visual Semantics

Suggested:

```text
Pending            neutral/information
Approved           success
Partially approved warning
Rejected           danger/neutral depending context
Expired            muted
Active             information
Due soon           warning
Overdue            danger
Returned           success
Damaged            danger
Maintenance        warning
```

Always pair:
- color;
- text;
- icon if helpful.

---

# 55. Accessibility

Target WCAG 2.2 AA.

Mandatory:
- semantic HTML;
- keyboard navigation;
- visible focus indicators;
- correct labels;
- ARIA only where native semantics are insufficient;
- screen-reader status announcements where needed;
- no color-only meaning;
- reduced motion support;
- sufficient contrast;
- logical tab order;
- accessible dialogs;
- accessible dropdowns and comboboxes.

---

# 56. Keyboard UX

Desktop users should be able to:
- tab through forms logically;
- activate buttons with Enter/Space;
- close dialogs with Escape;
- navigate menus without mouse where practical.

Do not implement custom controls that break browser keyboard behavior unless necessary.

---

# 57. Focus Management

When:
- a dialog opens -> focus moves inside dialog;
- dialog closes -> focus returns to triggering control;
- validation fails -> focus moves to first invalid field or error summary;
- navigation occurs -> main content receives appropriate focus.

---

# 58. Accessibility of Tables

Desktop tables should use:
- semantic `<table>`;
- header cells;
- sortable column buttons where applicable;
- accessible labels.

Do not use arbitrary div grids if semantic table data is being presented.

---

# 59. Form Accessibility

Each form input requires:
- visible label;
- associated error;
- help text if necessary.

Do not rely on placeholder text as label.

Required fields should be clearly marked.

---

# 60. Content Style

Use short, direct language.

Good:

```text
Request submitted
```

Bad:

```text
Your request has been successfully submitted to the system for further processing.
```

Good:

```text
Only 2 are available.
```

Bad:

```text
The requested quantity exceeds currently allocatable inventory.
```

Internal technical terminology belongs in developer logs, not member UI.

---

# 61. Dates and Time

Show human-readable dates.

Examples:

```text
30 Sep 2026
21 Sep · 14:10
Due tomorrow
Overdue by 3 days
```

Avoid ambiguous numeric-only dates when international interpretation matters.

Use one consistent timezone for stored timestamps and localize display.

---

# 62. Data Density

Desktop admin interfaces can be dense.

Member interfaces should be lighter.

Board tables should support:
- search;
- filtering;
- sorting;
- pagination if needed;
- sticky headers for long lists.

Do not create pagination unless the dataset size actually warrants it.

---

# 63. Performance UX

Target:
- fast first meaningful render;
- immediate feedback to clicks;
- no layout shifts;
- optimistic updates only for low-risk reversible actions.

Good optimistic candidates:
- favorites;
- notification read state.

Do not optimistically commit:
- stock movement;
- approval;
- handover;
- return;
- strike.

These require confirmed backend success.

---

# 64. Offline / Connectivity

The application is not required to work offline.

However:
- show clear failure if connection is lost;
- preserve unsent form input where practical;
- never silently assume a sensitive action succeeded.

---

# 65. Notifications

In-app notification center is authoritative.

Notification card contains:
- concise event;
- timestamp;
- relevant entity;
- direct destination.

Example:

```text
Your extension request was approved.
New due date: 05 Oct

5 minutes ago
```

Click opens the exact loan/request.

---

# 66. Email UX

Emails are supplementary.

They should contain:
- short title;
- key outcome;
- direct link to relevant page.

The website remains source of truth.

Email failure must not affect business operation.

---

# 67. Insights Visualization Standards

Charts must:
- use labels;
- show units;
- use accessible colors;
- avoid 3D effects;
- avoid decorative chart junk;
- avoid more categories than readable;
- have clear titles describing the question.

Good:
```text
Borrow requests by month
```

Bad:
```text
Activity Insights
```

Prefer:
- line chart for time;
- bar chart for ranked categories;
- stacked bar only when composition matters.

Avoid pie charts unless there are very few categories and comparison remains obvious.

---

# 68. Role-Aware UI

Frontend visibility improves usability but is not authorization.

The backend must enforce all permissions.

The frontend may:
- hide inaccessible actions;
- hide irrelevant navigation;
- explain unavailable actions.

Never assume:
```text
button hidden = secure
```

---

# 69. Policy Explanation Pattern

If a rule blocks an action:

```text
Not eligible to request

This item requires Level III access.
Your current verified clearance is Level II.

[ Learn more ]
```

Avoid exposing the entire regulation automatically.

---

# 70. Visual Hierarchy

Each operational page should follow:

```text
Page title
Short context / status
Primary actions
Important warnings
Main content
Secondary metadata
History/details
```

Do not place five equally strong primary buttons in the header.

---

# 71. Iconography

Use one coherent icon library.

Recommended:
- Lucide.

Icons should supplement labels, not replace important text.

Good:
```text
[ + Add stock ]
```

Bad:
```text
[ + ]
```

for an ambiguous action.

---

# 72. Destructive Actions

Use danger styling only for genuinely destructive/sensitive actions:
- reject;
- cancel approved request;
- retire;
- mark lost;
- strike;
- blacklist.

Do not overuse red for ordinary warnings.

---

# 73. Member Workflow Summary

The member's mental model must remain:

```text
Find equipment
      ↓
Add to cart
      ↓
Submit request
      ↓
Wait for Board decision
      ↓
Collect equipment
      ↓
Use it
      ↓
Return equipment
```

Optional branches:

```text
Request extension
Partial return
Cancel pending request
```

---

# 74. Board Workflow Summary

Board mental model:

```text
Open Action Center
      ↓
Select pending task
      ↓
Review context + policy
      ↓
Make decision
      ↓
Confirm real-world action
      ↓
System updates state automatically
```

The Board should rarely need to manually synchronize multiple pages.

---

# 75. Core Screens to Implement First

Recommended implementation order:

## Member
1. Authentication;
2. Home;
3. Inventory;
4. Item details;
5. Cart;
6. My Requests;
7. Request details;
8. My Loans;
9. Loan details / timeline;
10. Return flow;
11. Extension flow;
12. Profile.

## Board
13. Action Center;
14. Request review;
15. Handover;
16. Return confirmation;
17. Inventory management;
18. Stock operation;
19. Users/account processing;
20. Projects;
21. Inventory audit;
22. Incidents/strikes;
23. Insights;
24. Exports.

---

# 76. Reusable Components

Recommended shared component system:

```text
AppShell
Sidebar
MobileBottomNav
TopBar

PageHeader
SectionHeader
EmptyState
ErrorState
Skeleton

StatusBadge
PolicyNotice
AlertBanner

SearchInput
FilterBar
FilterDrawer
FilterChip

ItemCard
ItemTableRow
QuantitySelector
FavoriteButton

RequestCard
LoanCard
Timeline
TimelineEvent

DataTable
ResponsiveList

FormField
DateField
SelectField
Combobox

Dialog
ConfirmationDialog
Drawer
BottomSheet

MetricCard
ChartContainer

Toast
NotificationItem
```

Do not create unique one-off components when a shared primitive solves the same interaction.

---

# 77. Desktop vs Mobile Component Rules

Desktop:
- sidebar;
- tables;
- inline filters;
- wider dialogs;
- multi-column sections.

Mobile:
- bottom navigation;
- cards;
- filter drawer/bottom sheet;
- full-width dialogs where appropriate;
- stacked forms;
- sticky primary action when useful.

The information architecture remains the same.

Only presentation changes.

---

# 78. Testing Expectations

Every major screen should be tested at minimum at:

```text
375 px
430 px
768 px
1024 px
1440 px
```

Also test:
- long names;
- long item descriptions;
- zero results;
- one item;
- large quantities;
- long project names;
- overdue states;
- partial approvals;
- permission restrictions;
- loading;
- network error;
- empty states.

---

# 79. UX Acceptance Criteria

The UI/UX implementation is acceptable when:

1. member can submit a valid request without documentation;
2. main member workflow can be completed comfortably on a phone;
3. Board can process a request without opening unrelated pages;
4. mobile layout does not depend on horizontal scrolling for ordinary flows;
5. all sensitive actions communicate consequences;
6. policy restrictions are surfaced at the point of action;
7. partial approvals are unambiguous;
8. partial returns are unambiguous;
9. approval and physical handover are clearly separated;
10. return request and confirmed return are clearly separated;
11. loading/error/empty states exist;
12. keyboard navigation works;
13. focus states are visible;
14. contrast meets WCAG AA;
15. no status depends only on color;
16. inventory cannot be directly edited without explicit operation workflow;
17. responsive UI feels intentionally designed on both desktop and mobile;
18. no unnecessary decorative UI reduces information density;
19. all common actions have clear labels;
20. user always knows the current state and next possible action.

---

# 80. Non-Goals

Do not add during UI implementation:
- AI assistant;
- chat interface;
- gamification;
- social feed;
- reservation calendar;
- QR management;
- visual cabinet map;
- animated 3D inventory;
- unnecessary real-time dashboards;
- excessive personalization;
- theme marketplace;
- complicated onboarding tutorial.

If a first-time workflow requires a tutorial to understand basic borrowing, redesign the workflow instead.

---

# 81. Final Design Principle

The interface should hide complexity without hiding consequences.

The backend is sophisticated because the logistics process is sophisticated.

The frontend should remain calm.

A member should feel:

> "I find what I need, request it, track it, and return it."

A Board member should feel:

> "I see exactly what requires attention, why it requires attention, and what action I need to take."

Every UI decision should be evaluated against those two statements.
