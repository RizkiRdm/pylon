# DESIGN.md — Pylon
<!-- AI-READABLE: YES. Explicit rules. No ambiguous language. -->
<!-- VERSION: 1.0 | STATUS: DRAFT | DATE: 2026-05-04 -->
<!-- Cross-reference: PRD.md for user personas, ARCHITECTURE.md for system context -->

---

# OVERVIEW

**Product Type:** Developer tool — cloud IDE / AI builder
**Primary Context:** Desktop browser (min 1280px wide)
**Design Priority Order:** Usability > Consistency > Aesthetics
**Density Target:** High information density — developers prefer to see more, not less
**Mode:** Dark mode primary; light mode optional (V2)

---

# 1. VISUAL THEME & ATMOSPHERE

| Attribute | Value |
|---|---|
| Theme | Dark, focused, low-distraction |
| Feel | Professional terminal / IDE — NOT playful or consumer |
| Motion | Minimal — only functional animations |
| Brand tone | Tool-first. No mascots, no cheerful copy. |
| Inspiration | VSCode sidebar density + Linear's precision + Vercel's clean whites-on-dark |

**Core Principle:**
The UI must never compete with the user's content. Every chrome element should recede. The project, the code, the agent output — that is the focus.

---

# 2. COLOR PALETTE & ROLES

## Base Scale (Dark Theme)

```
background-base     : #0a0a0a   — Page background
background-subtle   : #111111   — Cards, panels, sidebars
background-muted    : #1a1a1a   — Input fields, code blocks
background-elevated : #222222   — Modals, dropdowns, tooltips
border-default      : #2a2a2a   — Standard dividers
border-strong       : #3a3a3a   — Active component borders
```

## Text Scale

```
text-primary        : #f0f0f0   — Primary content, headings
text-secondary      : #a0a0a0   — Labels, metadata, captions
text-muted          : #606060   — Placeholders, disabled states
text-disabled       : #404040   — Inactive elements
```

## Semantic Colors

```
accent-brand        : #6366f1   — Primary action buttons, active states (indigo)
accent-brand-hover  : #4f46e5   — Hover state for brand actions
accent-success      : #22c55e   — Build complete, commit success, test pass
accent-warning      : #f59e0b   — Paused state, rate limit warning, idle warning
accent-error        : #ef4444   — Build failed, API error, validation error
accent-info         : #3b82f6   — Informational banners, tooltip highlights
```

## Code / Terminal Colors

```
code-background     : #0d0d0d   — Code block and terminal backgrounds
code-text           : #d4d4d4   — Default code text
code-comment        : #6a9955   — Comments (green — VSCode default)
code-string         : #ce9178   — Strings (orange)
code-keyword        : #569cd6   — Keywords (blue)
code-function       : #dcdcaa   — Function names (yellow)
code-variable       : #9cdcfe   — Variables (light blue)
```

## Accessibility Constraints
- REQUIRED: All text on background MUST meet WCAG AA (4.5:1 contrast ratio minimum)
- REQUIRED: Interactive elements MUST meet WCAG AA for large text (3:1 minimum)
- PROHIBITED: Color as the only signal for state — always pair with icon or label
- REQUIRED: Focus indicators MUST be visible (2px solid accent-brand ring)

---

# 3. TYPOGRAPHY RULES

## Font Stack

```
Primary (UI)     : "Inter", system-ui, -apple-system, sans-serif
Monospace (Code) : "JetBrains Mono", "Fira Code", "Cascadia Code", monospace
```

## Type Scale

| Role | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| heading-xl | 24px | 600 | 1.3 | Page titles |
| heading-lg | 20px | 600 | 1.3 | Section headers |
| heading-md | 16px | 600 | 1.4 | Card titles, panel headers |
| body-lg | 15px | 400 | 1.6 | Primary body text |
| body-md | 14px | 400 | 1.6 | Secondary content, labels |
| body-sm | 13px | 400 | 1.5 | Metadata, captions, badges |
| code-md | 13px | 400 | 1.7 | Inline code, file paths |
| code-sm | 12px | 400 | 1.7 | Terminal output, logs |

## Typography Rules
- REQUIRED: Font size MUST NOT go below 12px in any interactive element
- REQUIRED: Line height MUST NOT go below 1.5 for body text
- PROHIBITED: More than 2 font weights on a single screen (400 and 600 only)
- PROHIBITED: Italic text outside of error messages or code comments
- REQUIRED: Monospace font for ALL code, file paths, terminal output, API keys, hashes

---

# 4. SPACING SYSTEM

## Base Unit: 4px

```
spacing-1  :  4px  — micro gaps (icon + label)
spacing-2  :  8px  — tight internal padding
spacing-3  : 12px  — standard internal padding
spacing-4  : 16px  — component padding (buttons, inputs)
spacing-5  : 20px  — card padding
spacing-6  : 24px  — section gaps
spacing-8  : 32px  — major section separators
spacing-12 : 48px  — page-level margins
spacing-16 : 64px  — hero spacing
```

## Spacing Rules
- REQUIRED: All spacing values MUST come from the 4px base unit scale
- PROHIBITED: Arbitrary pixel values (e.g., 7px, 13px, 22px) in layout
- REQUIRED: Consistent padding within component families (all cards same padding)

---

# 5. COMPONENT SPECIFICATIONS

## Buttons

| Variant | Background | Text | Border | Use Case |
|---|---|---|---|---|
| primary | accent-brand | text-primary | none | Main CTA (Build, Export) |
| secondary | background-elevated | text-primary | border-strong | Secondary actions |
| ghost | transparent | text-secondary | none | Icon buttons, toolbar items |
| danger | accent-error at 15% opacity | accent-error | accent-error at 30% | Destructive actions only |
| disabled | background-muted | text-disabled | none | Any disabled state |

**Button Rules:**
- REQUIRED: Min height 36px for all clickable buttons
- REQUIRED: Min width 80px for labeled buttons
- REQUIRED: Loading state for all async actions (spinner inside button, button disabled)
- PROHIBITED: Submit buttons without loading state on async forms
- REQUIRED: Danger buttons MUST require confirmation for irreversible actions

## Input Fields

```
background     : background-muted
border         : border-default
border (focus) : accent-brand (2px)
border (error) : accent-error (1px)
text           : text-primary
placeholder    : text-muted
padding        : 8px 12px
border-radius  : 6px
height         : 36px (single line)
```

**Input Rules:**
- REQUIRED: Error state MUST show red border + error message below (never tooltip only)
- REQUIRED: Password fields MUST have show/hide toggle
- REQUIRED: API key fields MUST show masked value (last 4 chars only) after save
- PROHIBITED: Auto-complete on API key fields

## Cards / Panels

```
background    : background-subtle
border        : 1px solid border-default
border-radius : 8px
padding       : 20px
```

**Active/Selected state:**
```
border        : 1px solid accent-brand at 60% opacity
background    : accent-brand at 4% opacity
```

## Navigation (Sidebar)

```
width          : 240px (expanded) / 52px (collapsed)
background     : background-subtle
item height    : 36px
item padding   : 0 12px
item (default) : text-secondary, transparent bg
item (active)  : text-primary, accent-brand at 10% bg
item (hover)   : text-primary, background-muted
```

## Code / Terminal Display

```
background    : code-background
font          : JetBrains Mono 13px
line-height   : 1.7
padding       : 16px
border-radius : 6px
border        : 1px solid border-default
overflow      : auto (horizontal scroll — NEVER wrap)
```

**Rules:**
- REQUIRED: Copy button on every code block
- REQUIRED: Language label on every code block
- PROHIBITED: Word wrapping in code blocks

## Agent Output Stream

```
background    : code-background
font          : JetBrains Mono 12px
padding       : 12px 16px
line-height   : 1.6
color         : code-text
accent-lines  : agent actions in accent-brand, errors in accent-error
```

- REQUIRED: Auto-scroll to bottom while streaming
- REQUIRED: "Scroll lock" toggle so user can scroll up and pause auto-scroll
- REQUIRED: Timestamps on each agent action line

## Skeleton / Loading States

- REQUIRED: Skeleton placeholders for all list and card content (not spinners)
- Skeleton color: linear-gradient shimmer between background-muted and background-elevated
- Animation: shimmer left-to-right, 1.5s cycle, ease-in-out
- PROHIBITED: Spinner-only loading for content areas

## Empty States

- REQUIRED: Every empty list/view MUST have: icon + headline + subtext + CTA
- Copy tone: Direct, action-oriented. Example: "No projects yet. Build your first one."
- PROHIBITED: "Nothing here" or "No data" without context or action

## Badges / Status Indicators

| Status | Color | Label |
|---|---|---|
| idle | border-strong | Idle |
| building | accent-brand | Building... |
| paused | accent-warning | Paused |
| completed | accent-success | Complete |
| failed | accent-error | Failed |

- REQUIRED: Status badges MUST have icon + label (never color alone)

---

# 6. LAYOUT PRINCIPLES

## Grid System

```
Container max-width : 1440px
Main layout         : sidebar (240px) + main content (flex-1)
Content max-width   : 1100px (for readable line lengths)
Column grid         : 12-column, 24px gutters
Mobile breakpoint   : NOT a MVP concern (desktop only)
```

## Z-Index Contract

```
z-base      :    0 — Default content
z-sticky    :  100 — Sticky headers, toolbars
z-dropdown  :  200 — Dropdowns, select menus
z-overlay   :  300 — Modal overlays (dark backdrop)
z-modal     :  400 — Modal dialogs, drawers
z-toast     :  500 — Toast notifications
z-tooltip   :  600 — Tooltips (highest)
```

## Layout Rules
- REQUIRED: Sidebar MUST remain visible on all interior pages
- REQUIRED: Main content area MUST have min-padding of 24px on all sides
- PROHIBITED: Horizontal overflow on any page (except inside code blocks)
- REQUIRED: Toast notifications MUST appear bottom-right, stack upward

---

# 7. MOTION & INTERACTION

## Animation Budget
- Page transitions: NONE (instant — developer tools don't need page fades)
- Component mount (modals, dropdowns): 120ms ease-out
- Component unmount: 80ms ease-in
- Hover transitions (bg color, border): 80ms ease
- Skeleton shimmer: 1.5s ease-in-out infinite

## Hover States
- Interactive text links: underline on hover
- Buttons: darken background 8%
- Nav items: background-muted
- Cards (clickable): border-strong + subtle lift (box-shadow: 0 2px 8px rgba(0,0,0,0.3))

## Rules
- PROHIBITED: Animations longer than 300ms on UI controls
- PROHIBITED: Entrance animations for list items (no stagger animations)
- PROHIBITED: Parallax, scroll-triggered animations, or decorative motion
- REQUIRED: Respect `prefers-reduced-motion` — all animations MUST be disabled when set

---

# 8. ICONOGRAPHY

- Icon library: Lucide Icons (consistent with Shadcn ecosystem)
- Icon size: 16px (inline), 20px (standalone/nav)
- Icon color: inherits text color of parent element
- PROHIBITED: Custom SVG icons (use Lucide only for consistency)
- PROHIBITED: Font icons (no Font Awesome, no Material Icons)

---

# 9. ANTI-PATTERNS (BANNED)

The following patterns are PROHIBITED in Pylon's UI:

| Pattern | Reason |
|---|---|
| Gradients on backgrounds | Adds visual noise; distracts from content |
| Glassmorphism | Performance cost; low contrast; not accessible |
| Neumorphism | Low contrast; not accessible |
| Confetti / celebration animations | Developer tool — not a consumer game |
| Full-page loading spinners | Skeleton states required instead |
| Modal on top of modal | Never layer modals |
| Auto-playing media | Jarring; disruptive |
| Tooltips as the only error source | Always pair with inline error text |
| Color as the only status indicator | Always pair with icon/label |
| Hover-only states for critical info | Touch and keyboard users can't hover |
| Right-click-only actions | All actions must have primary UI entry point |
| More than 3 primary CTAs on one screen | Forces prioritization |
| Sans-serif font in code contexts | Monospace required in all code areas |
| Italic text in UI labels | Reserved for code comments only |
| Truncated text without tooltip | If truncated, always show full text on hover |
| Horizontal scrolling at page level | Never — only inside code blocks |
