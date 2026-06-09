# 10 — UI/UX Design System & Wireframes

## 1. Design Philosophy — Stitch Design System

HealthEcosystem follows **Stitch Design principles**: enterprise-grade, healthcare-focused, dashboard-centric interfaces with clean typography, purposeful color, and smooth micro-interactions.

### Design Pillars

| Pillar | Implementation |
|--------|----------------|
| Clarity | High information density without clutter; clear visual hierarchy |
| Trust | Professional medical aesthetic; consistent status indicators |
| Efficiency | Keyboard shortcuts, bulk actions, smart defaults, minimal clicks |
| Accessibility | WCAG 2.1 AA; 4.5:1 contrast; focus rings; screen reader labels |
| Responsiveness | Mobile-first patient app; adaptive admin dashboards |
| Motion | Framer Motion for page transitions, skeleton loading, status changes |

---

## 2. Design Tokens

### 2.1 Color Palette

```css
:root {
  /* Primary — Medical Teal */
  --primary-50:  #E6F7F5;
  --primary-100: #B3E8E2;
  --primary-200: #80D9CF;
  --primary-300: #4DCABC;
  --primary-400: #1ABBA9;
  --primary-500: #0D9488;   /* Primary action */
  --primary-600: #0B7A71;
  --primary-700: #086058;
  --primary-800: #064740;
  --primary-900: #032E28;

  /* Secondary — Deep Navy */
  --secondary-500: #1E3A5F;
  --secondary-700: #152A45;
  --secondary-900: #0C1A2B;

  /* Accent — Clinical Blue */
  --accent-500: #3B82F6;
  --accent-600: #2563EB;

  /* Semantic */
  --success:     #10B981;
  --warning:     #F59E0B;
  --error:       #EF4444;
  --info:        #3B82F6;

  /* Status Colors (LIMS) */
  --status-ordered:     #94A3B8;
  --status-collected:   #3B82F6;
  --status-processing:  #F59E0B;
  --status-verified:    #8B5CF6;
  --status-approved:    #10B981;
  --status-rejected:    #EF4444;
  --status-reported:    #0D9488;
  --status-critical:    #DC2626;

  /* Neutral */
  --gray-50:  #F8FAFC;
  --gray-100: #F1F5F9;
  --gray-200: #E2E8F0;
  --gray-300: #CBD5E1;
  --gray-400: #94A3B8;
  --gray-500: #64748B;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1E293B;
  --gray-900: #0F172A;

  /* Surfaces */
  --background:       #FFFFFF;
  --surface:          #FFFFFF;
  --surface-elevated: #FFFFFF;
  --border:           #E2E8F0;
  --text-primary:     #0F172A;
  --text-secondary:   #64748B;
  --text-muted:       #94A3B8;
}

.dark {
  --background:       #0F172A;
  --surface:          #1E293B;
  --surface-elevated: #334155;
  --border:           #475569;
  --text-primary:     #F8FAFC;
  --text-secondary:   #94A3B8;
  --text-muted:       #64748B;

  /* Glassmorphism (dark mode) */
  --glass-bg:     rgba(30, 41, 59, 0.7);
  --glass-border: rgba(71, 85, 105, 0.4);
}
```

### 2.2 Typography

```css
:root {
  --font-sans:  'Inter', system-ui, sans-serif;
  --font-mono:  'JetBrains Mono', monospace;
  --font-display: 'Plus Jakarta Sans', var(--font-sans);

  /* Scale */
  --text-xs:   0.75rem;    /* 12px — badges, captions */
  --text-sm:   0.875rem;   /* 14px — table cells, labels */
  --text-base: 1rem;       /* 16px — body text */
  --text-lg:   1.125rem;   /* 18px — card titles */
  --text-xl:   1.25rem;    /* 20px — section headers */
  --text-2xl:  1.5rem;     /* 24px — page titles */
  --text-3xl:  1.875rem;   /* 30px — dashboard KPIs */
  --text-4xl:  2.25rem;    /* 36px — hero metrics */

  --leading-tight:  1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  --weight-normal:  400;
  --weight-medium:  500;
  --weight-semibold: 600;
  --weight-bold:    700;
}
```

### 2.3 Spacing Scale

```
4px (1)  · 8px (2)  · 12px (3)  · 16px (4)  · 20px (5)
24px (6) · 32px (8) · 40px (10) · 48px (12) · 64px (16)
```

### 2.4 Border Radius

```
--radius-sm:  4px    /* badges, inputs */
--radius-md:  8px    /* cards, buttons */
--radius-lg:  12px   /* modals, panels */
--radius-xl:  16px   /* dashboard cards */
--radius-full: 9999px /* avatars, pills */
```

### 2.5 Shadows & Glassmorphism

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.05);
--shadow-md:  0 4px 6px rgba(0,0,0,0.07);
--shadow-lg:  0 10px 15px rgba(0,0,0,0.10);

/* Glassmorphism (used sparingly on dashboard KPI cards, modals) */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
}
```

---

## 3. Component Library

### 3.1 Core Components (Shadcn UI + Custom)

| Component | Variants | Usage |
|-----------|----------|-------|
| `Button` | primary, secondary, outline, ghost, destructive, link | Actions |
| `Card` | default, glass, stat, interactive | Content containers |
| `DataTable` | sortable, filterable, paginated, selectable, expandable | All list views |
| `StatusBadge` | sample status, order status, payment status, device status | Status indicators |
| `StatCard` | with trend, with sparkline, with icon | Dashboard KPIs |
| `Sidebar` | collapsible, nested, with branch switcher | Navigation |
| `CommandPalette` | ⌘K search across patients, orders, samples | Power user navigation |
| `FilterPanel` | date range, multi-select, search, saved filters | Advanced filtering |
| `TimelineView` | vertical, with icons, with status colors | Patient timeline |
| `BarcodeScanner` | camera, manual input | Sample collection |
| `EmptyState` | with illustration, with action button | Zero-data views |
| `ErrorState` | with retry, with support link | Error handling |
| `SkeletonLoader` | table, card, detail, dashboard | Loading states |
| `Toast` | success, error, warning, info | Notifications |
| `ConfirmDialog` | destructive, with reason input | Critical actions |
| `FileUpload` | drag-drop, with preview, S3 direct upload | Documents |
| `DateRangePicker` | presets (today, week, month, custom) | Date filtering |
| `BranchSwitcher` | dropdown with search | Multi-branch context |
| `PatientSearchCombobox` | UHID/phone/name search with avatar | Order entry |
| `ResultEntryGrid` | inline edit, auto-flag, reference range display | Lab results |
| `ReportPreview` | PDF viewer, with sign-off | Report review |
| `QueueBoard` | real-time, with call action | Reception queue |
| `DeviceStatusCard` | online/offline, last message, error count | Device monitoring |

### 3.2 Accessibility Standards

| Requirement | Standard |
|-------------|----------|
| Color contrast | WCAG 2.1 AA (4.5:1 text, 3:1 UI) |
| Focus indicators | 2px solid ring, offset 2px |
| Keyboard navigation | Full tab order; arrow keys in tables |
| Screen readers | ARIA labels on all interactive elements |
| Motion | `prefers-reduced-motion` respected |
| Touch targets | Minimum 44×44px on mobile |
| Form labels | Always visible; error messages linked via `aria-describedby` |

---

## 4. Layout System

### 4.1 Admin Portal Shell

```
┌──────────────────────────────────────────────────────────────────────┐
│  ┌─────────┐  HealthEcosystem          🔔  🌙  Branch ▾  👤 Admin  │
│  │  LOGO   │  ─────────────────────────────────────────────────────│
│  └─────────┘  Breadcrumb: Dashboard > LIMS > Samples               │
├──────────────┬───────────────────────────────────────────────────────┤
│              │                                                       │
│  Dashboard   │   Page Title                          [+ Action Btn] │
│  ──────────  │   ─────────────────────────────────────────────────  │
│  Patients    │                                                       │
│  LIMS        │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│    Orders    │   │ KPI 1   │ │ KPI 2   │ │ KPI 3   │ │ KPI 4   │  │
│    Samples   │   │  1,247  │ │   89%   │ │   23    │ │  ₹4.2L  │  │
│    Results   │   └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│    Reports   │                                                       │
│    Test Mstr │   ┌─ Filters ──────────────────────────────────────┐  │
│  EHR         │   │ Status ▾  Date Range ▾  Branch ▾  🔍 Search   │  │
│  PMS         │   └──────────────────────────────────────────────┘  │
│  Billing     │                                                       │
│  Devices     │   ┌─ Data Table ─────────────────────────────────┐  │
│  Collection  │   │ □  ID      Patient    Test     Status   TAT   │  │
│  Analytics   │   │ □  S-001   Raj Patel   CBC     ● Proc   2h   │  │
│  Admin       │   │ □  S-002   Priya S.    LFT     ● Coll   4h   │  │
│  ──────────  │   │ □  S-003   Amit K.     TSH     ● Ver    1h   │  │
│  Settings    │   │ □  S-004   Sunita R.   HbA1c   ● Appr   ✓    │  │
│              │   └──────────────────────────────────────────────┘  │
│              │   ◄ 1  2  3  ...  78 ►     Showing 1-20 of 1543   │
│              │                                                       │
├──────────────┴───────────────────────────────────────────────────────┤
│  © 2026 HealthEcosystem  ·  v1.0.0  ·  Branch: Andheri CC          │
└──────────────────────────────────────────────────────────────────────┘

Sidebar: 240px expanded / 64px collapsed
Content: max-width 1440px, padding 24px
Header: 64px fixed height
```

---

## 5. Screen Wireframes

### 5.1 Login Page

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│         ┌──────────────────────────────────────────┐              │
│         │                                          │              │
│         │         🏥 HealthEcosystem               │              │
│         │         Enterprise Healthcare Platform    │              │
│         │                                          │              │
│         │  ┌────────────────────────────────────┐  │              │
│         │  │ Email                              │  │              │
│         │  │ admin@lab.com                      │  │              │
│         │  └────────────────────────────────────┘  │              │
│         │  ┌────────────────────────────────────┐  │              │
│         │  │ Password                        👁  │  │              │
│         │  │ ••••••••••                         │  │              │
│         │  └────────────────────────────────────┘  │              │
│         │                                          │              │
│         │  ☐ Remember me        Forgot password?    │              │
│         │                                          │              │
│         │  ┌────────────────────────────────────┐  │              │
│         │  │           Sign In                   │  │              │
│         │  └────────────────────────────────────┘  │              │
│         │                                          │              │
│         │  ──────── or continue with ────────      │              │
│         │  [ Google ]  [ Microsoft ]               │              │
│         │                                          │              │
│         └──────────────────────────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Components:** Card (glass), TextInput, Button, Checkbox, Divider
**States:** Loading (button spinner), Error (inline validation), MFA redirect

---

### 5.2 Admin Dashboard

```
┌─ Sidebar ─┬─ Main Content ──────────────────────────────────────────┐
│           │  Dashboard                    Today ▾  Andheri CC ▾      │
│ Dashboard │  ─────────────────────────────────────────────────────  │
│ Patients  │                                                          │
│ LIMS      │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ EHR       │  │ Orders   │ │ Samples  │ │ Revenue  │ │ TAT Avg  │  │
│ PMS       │  │ Today    │ │ Pending  │ │ Today    │ │          │  │
│ Billing   │  │   247    │ │    34    │ │ ₹4.2L   │ │  4.2 hrs │  │
│ Devices   │  │ ↑ 12%    │ │ ↓ 3     │ │ ↑ 8%    │ │ ↓ 0.3h  │  │
│ Analytics │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│ Admin     │                                                          │
│           │  ┌─ Sample Pipeline ──────────┐ ┌─ Revenue Trend ──────┐  │
│           │  │ Collected ████████ 89      │ │     📈 Line Chart    │  │
│           │  │ Processing ██████ 67       │ │     Last 7 days      │  │
│           │  │ Verified ████ 45           │ │                      │  │
│           │  │ Approved ███ 34              │ │                      │  │
│           │  │ Reported ██ 23             │ │                      │  │
│           │  └────────────────────────────┘ └──────────────────────┘  │
│           │                                                          │
│           │  ┌─ Pending Actions ──────────────────────────────────┐  │
│           │  │ ⚠ 12 results pending verification                  │  │
│           │  │ ⚠ 3 critical/panic values awaiting review          │  │
│           │  │ ⚠ 2 devices offline > 30 minutes                   │  │
│           │  │ ℹ 45 home collection requests for today             │  │
│           │  └────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  ┌─ Recent Orders ─────────────────────────────────────┐  │
│           │  │ Order#    Patient      Tests    Amount   Status    │  │
│           │  │ ORD-4521  Raj Patel     CBC,LFT  ₹1,200  ● Done    │  │
│           │  │ ORD-4520  Priya Shah    HbA1c    ₹450    ● Proc    │  │
│           │  │ ORD-4519  Amit Kumar    Package  ₹2,800  ● Coll    │  │
│           │  └────────────────────────────────────────────────────┘  │
└───────────┴──────────────────────────────────────────────────────────┘
```

**Components:** StatCard (×4), BarChart, LineChart, Callout, DataTable
**Real-time:** WebSocket updates on sample pipeline counts

---

### 5.3 Patient Registration

```
┌─ Sidebar ─┬─ Main Content ──────────────────────────────────────────┐
│           │  ← Back    Register New Patient                         │
│           │  ─────────────────────────────────────────────────────  │
│           │                                                          │
│           │  ┌─ Personal Information ─────────────────────────────┐  │
│           │  │ First Name *        Last Name *                     │  │
│           │  │ [Raj          ]     [Patel         ]                │  │
│           │  │                                                     │  │
│           │  │ Date of Birth *     Gender *       Blood Group      │  │
│           │  │ [📅 15/03/1985 ]    [Male ▾]      [B+ ▾]           │  │
│           │  │                                                     │  │
│           │  │ Phone *             Email                         │  │
│           │  │ [+91 9876543210]    [raj@email.com]                │  │
│           │  │                                                     │  │
│           │  │ Address                                             │  │
│           │  │ [Flat 302, Sunrise Apts, Andheri West, Mumbai 400058]│  │
│           │  └─────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  ┌─ Identification ───────────────────────────────────┐  │
│           │  │ ID Type ▾           ID Number                       │  │
│           │  │ [Aadhaar     ]      [XXXX-XXXX-1234]               │  │
│           │  │                                                     │  │
│           │  │ ABHA Address        ABHA Number                     │  │
│           │  │ [rajpatel@abdm  ]   [Link ABHA →]                  │  │
│           │  └─────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  ┌─ Consent ──────────────────────────────────────────┐  │
│           │  │ ☑ Treatment consent                               │  │
│           │  │ ☑ Data sharing for diagnostic purposes            │  │
│           │  │ ☐ Marketing communications                        │  │
│           │  │ ☐ ABDM Health Information Exchange                │  │
│           │  └─────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  UHID Preview: AND-2506-000042                           │
│           │                                                          │
│           │  [Cancel]                        [Register Patient →]  │
└───────────┴──────────────────────────────────────────────────────────┘
```

---

### 5.4 Patient Detail / 360 View

```
┌─ Sidebar ─┬─ Main Content ──────────────────────────────────────────┐
│           │  ← Patients    Raj Patel    UHID: AND-2506-000042       │
│           │  ─────────────────────────────────────────────────────  │
│           │  ┌────────┐                                              │
│           │  │ Avatar │  Raj Patel, 41M, B+    📞 9876543210       │
│           │  │   RP   │  ABHA: rajpatel@abdm    ✉ raj@email.com     │
│           │  └────────┘  Family: Patel Family (3 members)          │
│           │              [Edit] [New Order] [Book Appointment]      │
│           │  ─────────────────────────────────────────────────────  │
│           │  [Timeline] [Orders] [Reports] [EHR] [Billing] [Docs]  │
│           │  ─────────────────────────────────────────────────────  │
│           │                                                          │
│           │  Timeline                                                │
│           │  │                                                       │
│           │  ●── Jun 8, 2026 — Report Released                       │
│           │  │   CBC Report — All normal                             │
│           │  │   📎 Download PDF                                     │
│           │  │                                                       │
│           │  ●── Jun 7, 2026 — Sample Collected                      │
│           │  │   CBC + LFT at Andheri Collection Center               │
│           │  │                                                       │
│           │  ●── Jun 5, 2026 — Consultation                          │
│           │  │   Dr. Sharma — General checkup                         │
│           │  │   Dx: Hypertension (I10)                               │
│           │  │                                                       │
│           │  ●── May 20, 2026 — Patient Registered                   │
│           │      UHID: AND-2506-000042                                 │
│           │                                                          │
└───────────┴──────────────────────────────────────────────────────────┘
```

---

### 5.5 LIMS — Order Entry

```
┌─ Sidebar ─┬─ Main Content ──────────────────────────────────────────┐
│           │  New Lab Order                                           │
│           │  ─────────────────────────────────────────────────────  │
│           │                                                          │
│           │  Patient: [🔍 Search by UHID / Phone / Name          ]  │
│           │  ┌────────────────────────────────────────────────────┐  │
│           │  │ 👤 Raj Patel · UHID: AND-2506-000042 · 41M · B+  │  │
│           │  └────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  Referring Doctor: [Dr. Sharma                    ]       │
│           │  Priority: [Routine ▾]    Source: [Walk-in ▾]             │
│           │                                                          │
│           │  ┌─ Add Tests ────────────────────────────────────────┐  │
│           │  │ 🔍 Search tests or packages...                      │  │
│           │  │ [CBC] [LFT] [KFT] [HbA1c] [Thyroid Panel] [+ More] │  │
│           │  └────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  ┌─ Order Items ──────────────────────────────────────┐  │
│           │  │ #  Test/Package       Sample    Price    Remove    │  │
│           │  │ 1  Complete Blood Count  EDTA    ₹350    ✕         │  │
│           │  │ 2  Liver Function Test   Serum   ₹650    ✕         │  │
│           │  │ 3  HbA1c                   EDTA    ₹450    ✕         │  │
│           │  │                                                     │  │
│           │  │ Subtotal:                              ₹1,450      │  │
│           │  │ Discount: [0     ] %                  -₹0         │  │
│           │  │ GST (5%):                               ₹72.50     │  │
│           │  │ Total:                                 ₹1,522.50    │  │
│           │  └────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  [Save Draft]  [Confirm & Collect Sample →]  [Bill →]   │
└───────────┴──────────────────────────────────────────────────────────┘
```

---

### 5.6 LIMS — Sample Tracking Board

```
┌─ Sidebar ─┬─ Main Content ──────────────────────────────────────────┐
│           │  Sample Tracking              🔴 Live  Branch: All ▾     │
│           │  ─────────────────────────────────────────────────────  │
│           │                                                          │
│           │  ┌─ Kanban Board ─────────────────────────────────────┐  │
│           │  │ Collected(12)│ In Transit(5)│ Received(8)│Processing│  │
│           │  │──────────────│──────────────│─────────────│──────────│  │
│           │  │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐│┌────────┐│  │
│           │  │ │S-4521    │ │ │S-4518    │ │ │S-4515    │││S-4510  ││  │
│           │  │ │CBC       │ │ │LFT       │ │ │TSH       │││HbA1c   ││  │
│           │  │ │Raj Patel │ │ │Priya S.  │ │ │Amit K.   │││Sunita  ││  │
│           │  │ │2h ago    │ │ │1h ago    │ │ │45m ago   │││30m ago ││  │
│           │  │ └──────────┘ │ └──────────┘ │ └──────────┘│└────────┘│  │
│           │  │ ┌──────────┐ │              │              │┌────────┐│  │
│           │  │ │S-4520    │ │              │              ││S-4509  ││  │
│           │  │ │LFT+KFT   │ │              │              ││CBC     ││  │
│           │  │ └──────────┘ │              │              │└────────┘│  │
│           │  └──────────────┴──────────────┴──────────────┴──────────┘  │
│           │                                                          │
│           │  ┌ Verified(6) ──┐ ┌ Approved(4) ─┐ ┌ Reported(23) ──┐  │
│           │  │ Awaiting path │ │ Ready to      │ │ Released today│  │
│           │  │ review        │ │ release       │ │               │  │
│           │  └───────────────┘ └───────────────┘ └───────────────┘  │
└───────────┴──────────────────────────────────────────────────────────┘
```

**Interaction:** Drag-and-drop between columns (with permission check); click card → sample detail drawer

---

### 5.7 LIMS — Result Entry & Verification

```
┌─ Sidebar ─┬─ Main Content ──────────────────────────────────────────┐
│           │  Result Entry — S-4510 · HbA1c · Sunita Rani             │
│           │  ─────────────────────────────────────────────────────  │
│           │  Patient: Sunita Rani (62F) · Barcode: BC-250608-4510   │
│           │  Collected: Jun 8, 07:30 · Received: Jun 8, 09:15       │
│           │  Device: Cobas c501 (Roche) · Auto-imported ✓             │
│           │  ─────────────────────────────────────────────────────  │
│           │                                                          │
│           │  ┌─ Results ──────────────────────────────────────────┐  │
│           │  │ Parameter       Result   Unit   Ref Range    Flag   │  │
│           │  │ HbA1c           7.2      %     4.0-5.6      ▲ HIGH  │  │
│           │  │ eAG             160      mg/dL  —           —      │  │
│           │  └────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  ┌─ AI Insight ───────────────────────────────────────┐  │
│           │  │ ⚠ HbA1c elevated — consistent with uncontrolled    │  │
│           │  │   diabetes. Previous: 6.8% (Mar 2026). Trend: ↑     │  │
│           │  └────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  Tech Notes: [Auto-imported from Cobas c501         ]     │
│           │                                                          │
│           │  [Reject Sample]  [Save Draft]  [Verify & Forward →]    │
└───────────┴──────────────────────────────────────────────────────────┘
```

---

### 5.8 Device Monitoring Dashboard

```
┌─ Sidebar ─┬─ Main Content ──────────────────────────────────────────┐
│           │  Device Monitoring                    Branch: Lab ▾      │
│           │  ─────────────────────────────────────────────────────  │
│           │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│           │  │ Total    │ │ Online   │ │ Offline  │ │ Errors   │  │
│           │  │   24     │ │   21     │ │    2     │ │   3      │  │
│           │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│           │                                                          │
│           │  ┌─ Device Grid ──────────────────────────────────────┐  │
│           │  │ ┌─────────────────┐  ┌─────────────────┐           │  │
│           │  │ │ 🟢 Cobas c501   │  │ 🟢 Architect    │           │  │
│           │  │ │ Roche · HL7     │  │ Abbott · ASTM   │           │  │
│           │  │ │ Msgs: 1,247/hr  │  │ Msgs: 892/hr    │           │  │
│           │  │ │ Last: 2s ago    │  │ Last: 5s ago    │           │  │
│           │  │ └─────────────────┘  └─────────────────┘           │  │
│           │  │ ┌─────────────────┐  ┌─────────────────┐           │  │
│           │  │ │ 🔴 XN-1000      │  │ 🟡 AU5800       │           │  │
│           │  │ │ Sysmex · HL7    │  │ Beckman · ASTM  │           │  │
│           │  │ │ ⚠ Offline 32m   │  │ ⚠ 3 parse errors│           │  │
│           │  │ │ [Reconnect]     │  │ [View Errors]   │           │  │
│           │  │ └─────────────────┘  └─────────────────┘           │  │
│           │  └────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  ┌─ Recent Errors ────────────────────────────────────┐  │
│           │  │ Time     Device      Error                  Retry  │  │
│           │  │ 09:42    AU5800      Sample ID not matched  [↻]   │  │
│           │  │ 09:38    AU5800      Checksum mismatch      [↻]   │  │
│           │  │ 09:15    XN-1000     Connection timeout     [↻]   │  │
│           │  └────────────────────────────────────────────────────┘  │
└───────────┴──────────────────────────────────────────────────────────┘
```

---

### 5.9 Billing — Invoice Detail

```
┌─ Sidebar ─┬─ Main Content ──────────────────────────────────────────┐
│           │  Invoice INV-2506-00891              Status: ● Partial   │
│           │  ─────────────────────────────────────────────────────  │
│           │  Patient: Raj Patel · UHID: AND-2506-000042              │
│           │  Branch: Andheri CC · Date: Jun 8, 2026                   │
│           │  ─────────────────────────────────────────────────────  │
│           │  ┌─ Line Items ───────────────────────────────────────┐  │
│           │  │ Item                  Qty   Rate     GST    Amount  │  │
│           │  │ Complete Blood Count   1   ₹350    5%     ₹367.50  │  │
│           │  │ Liver Function Test    1   ₹650    5%     ₹682.50  │  │
│           │  │ HbA1c                  1   ₹450    5%     ₹472.50  │  │
│           │  │─────────────────────────────────────────────────── │  │
│           │  │ Subtotal:                              ₹1,450.00  │  │
│           │  │ CGST (2.5%):                              ₹36.25  │  │
│           │  │ SGST (2.5%):                              ₹36.25  │  │
│           │  │ Total:                                  ₹1,522.50  │  │
│           │  │ Paid:                                   ₹1,000.00  │  │
│           │  │ Balance:                                  ₹522.50  │  │
│           │  └────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  ┌─ Payments ─────────────────────────────────────────┐  │
│           │  │ Jun 8 · UPI · ₹1,000 · ✓ Success · TXN-789012     │  │
│           │  └────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  [Print] [Email] [Collect Payment ₹522.50] [Void]     │
└───────────┴──────────────────────────────────────────────────────────┘
```

---

### 5.10 Patient Mobile App — Home

```
┌─────────────────────────┐
│  HealthEcosystem    🔔  │
│  ─────────────────────  │
│  Hi, Raj 👋             │
│  ABHA: rajpatel@abdm    │
│                         │
│  ┌─────────────────────┐│
│  │ Quick Actions       ││
│  │ ┌────┐ ┌────┐ ┌────┐││
│  │ │Book│ │Home│ │Appt│││
│  │ │Test│ │Coll│ │Book│││
│  │ └────┘ └────┘ └────┘││
│  └─────────────────────┘│
│                         │
│  Recent Reports         │
│  ┌─────────────────────┐│
│  │ 📋 CBC — Jun 8      ││
│  │ All Normal · [View] ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ 📋 LFT — May 15     ││
│  │ 1 Abnormal · [View] ││
│  └─────────────────────┘│
│                         │
│  Upcoming               │
│  ┌─────────────────────┐│
│  │ 🏠 Home Collection  ││
│  │ Jun 10 · 7-9 AM    ││
│  └─────────────────────┘│
│                         │
│  ┌──┬──┬──┬──┬──┐      │
│  │🏠│📋│📅│💳│👤│      │
│  └──┴──┴──┴──┴──┘      │
└─────────────────────────┘
```

---

### 5.11 Doctor Portal — Schedule & Patients

```
┌─ Sidebar ─┬─ Main Content ──────────────────────────────────────────┐
│           │  My Schedule — Dr. Sharma · Jun 8, 2026                 │
│           │  ─────────────────────────────────────────────────────  │
│           │  ◄ Jun 7  │  Today  │  Jun 9 ►                          │
│           │                                                          │
│           │  ┌─ Time Grid ────────────────────────────────────────┐  │
│           │  │ 09:00 │ Raj Patel — General Checkup        ● Done  │  │
│           │  │ 09:30 │ [Available Slot]                                │  │
│           │  │ 10:00 │ Priya Shah — Follow-up               ● Now   │  │
│           │  │ 10:30 │ Amit Kumar — New Patient             ○ Next  │  │
│           │  │ 11:00 │ [Available Slot]                                │  │
│           │  │ 11:30 │ Sunita Rani — Teleconsult            ○ Upcoming│  │
│           │  │ 12:00 │ ── Lunch Break ──                               │  │
│           │  │ 14:00 │ Vikram Mehta — Report Review         ○         │  │
│           │  └──────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  Today's Queue: 5 appointments · 2 completed · 1 active   │
│           │  [Start Teleconsult]  [View Patient]  [Write Prescription]│
└───────────┴──────────────────────────────────────────────────────────┘
```

---

### 5.12 Franchise Dashboard

```
┌─ Sidebar ─┬─ Main Content ──────────────────────────────────────────┐
│           │  Franchise Overview — Partner X · June 2026              │
│           │  ─────────────────────────────────────────────────────  │
│           │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│           │  │ Branches │ │ Orders   │ │ Revenue  │ │ Share    │  │
│           │  │    8     │ │  3,421   │ │ ₹42.5L  │ │ ₹8.5L   │  │
│           │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│           │                                                          │
│           │  ┌─ Branch Performance ───────────────────────────────┐  │
│           │  │ Branch          Orders  Revenue   TAT    Status   │  │
│           │  │ Pune FC-01       487    ₹6.2L    4.1h   🟢      │  │
│           │  │ Pune FC-02       412    ₹5.1L    4.5h   🟢      │  │
│           │  │ Nashik FC-01     356    ₹4.8L    5.2h   🟡      │  │
│           │  │ Kolhapur FC-01   298    ₹3.9L    3.8h   🟢      │  │
│           │  └──────────────────────────────────────────────────┘  │
│           │                                                          │
│           │  ┌─ Revenue Share ──────────┐ ┌─ Test Mix ─────────────┐  │
│           │  │  📊 Pie Chart            │ │  📊 Bar Chart          │  │
│           │  │  Your share: 20%         │ │  Top tests by volume   │  │
│           │  └──────────────────────────┘ └────────────────────────┘  │
└───────────┴──────────────────────────────────────────────────────────┘
```

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column; bottom nav (patient app); hamburger sidebar |
| Tablet | 640–1024px | Collapsed sidebar; 2-column grid for KPIs |
| Desktop | 1024–1440px | Full sidebar; 4-column KPI grid |
| Wide | > 1440px | Full sidebar; max-width content container |

---

## 7. Animation Specifications (Framer Motion)

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Page transition | 200ms | ease-out | Route changes |
| Card hover | 150ms | ease | Interactive cards |
| Skeleton pulse | 1500ms | linear, infinite | Loading states |
| Status change | 300ms | spring( stiffness: 300 ) | Sample status updates |
| Modal enter | 200ms | ease-out | Dialogs, drawers |
| Toast slide | 250ms | ease-out | Notifications |
| Sidebar collapse | 200ms | ease-in-out | Navigation toggle |
| KPI count-up | 600ms | ease-out | Dashboard numbers |

---

## 8. Dark Mode

All components support dark mode via `next-themes` with class strategy. Key differences:

- Background: `#0F172A` (gray-900)
- Surface: `#1E293B` (gray-800)
- Glassmorphism enabled on dashboard KPI cards
- Status colors remain consistent (adjusted brightness)
- Charts use dark-theme palette variants

---

## 9. Screen Inventory (Complete)

| Portal | Screen Count | Key Screens |
|--------|:------------:|-------------|
| Admin Portal | 45+ | Dashboard, Patients, Orders, Samples, Results, Reports, Test Master, Devices, Billing, Branches, Users, Franchise, Analytics, Audit, Settings |
| Doctor Portal | 15+ | Schedule, Patients, Consultation, Prescriptions, Reports, Teleconsult |
| Lab Workstation | 12+ | Sample Board, Result Entry, Verification Queue, Barcode Scan, Report Review |
| Patient App | 18+ | Home, Book Test, Home Collection, Appointments, Reports, History, Payments, Profile |
| Franchise Dashboard | 10+ | Overview, Branches, Revenue, Performance, Settings |
| Corporate Portal | 8+ | Employees, Bulk Orders, Reports, Billing |

---

## 10. Phase 1 Approval Checklist

- [ ] Design tokens (colors, typography, spacing) approved
- [ ] Component library scope approved
- [ ] Admin portal wireframes approved
- [ ] LIMS workflow screens approved
- [ ] Patient app wireframes approved
- [ ] Doctor portal wireframes approved
- [ ] Dark mode approach approved
- [ ] Accessibility standards confirmed
- [ ] Ready to proceed to Phase 2 implementation
