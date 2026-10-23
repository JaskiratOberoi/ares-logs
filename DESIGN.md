---
name: Ares Sales
description: Field visit records for Ares Labs, filed the way a hospital is navigated — colour-coded department signage on a warm white ground with a charcoal rail and one gold.
colors:
  ink: "#15191e"
  ink-2: "#3f4854"
  ink-3: "#5b6472"
  ground: "#f4f3ee"
  ground-2: "#ebeae3"
  panel: "#ffffff"
  rule: "#d6d4cb"
  rule-soft: "#e6e4dc"
  rail: "#1f2a37"
  rail-2: "#2b3845"
  rail-3: "#36465a"
  rail-text: "#c9d3de"
  rail-muted: "#9fb0c3"
  gold: "#d9a520"
  gold-2: "#e8bc45"
  gold-deep: "#8a6a05"
  gold-tint: "#fbf1d4"
  gold-shadow: "#a67b12"
  teal: "#1b8a8f"
  blue: "#2f5fa8"
  green: "#3c8c4f"
  plum: "#7a3e8c"
  amber: "#e07b00"
  amber-ink: "#8f4e00"
  amber-tint: "#fdf0dd"
  red: "#c8322b"
  red-tint: "#fbe4e2"
typography:
  brand:
    fontFamily: "Michroma, Overpass, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.34em"
  display:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  blade:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  entry:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  body-small:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
  dept-code:
    fontFamily: "Overpass, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.1em"
  serial:
    fontFamily: "Overpass Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.04em"
rounded:
  none: "0px"
  control: "6px"
  pip: "2px"
  scrollbar: "8px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "12px"
  base: "16px"
  lg: "20px"
  xl: "28px"
  gutter: "32px"
  section: "48px"
components:
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.rail}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-gold-hover:
    backgroundColor: "{colors.gold-2}"
  button-rail:
    backgroundColor: "{colors.rail}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-rail-hover:
    backgroundColor: "{colors.rail-2}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.panel}"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.red}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-danger-hover:
    backgroundColor: "{colors.red-tint}"
  button-sm:
    padding: "0 14px"
    height: "36px"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
    height: "44px"
  input-focus:
    backgroundColor: "{colors.panel}"
  field-label:
    textColor: "{colors.ink-3}"
    typography: "{typography.label}"
  nav-blade:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.rail-text}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "54px"
  nav-blade-hover:
    backgroundColor: "{colors.rail-2}"
    textColor: "#ffffff"
  nav-blade-active:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.rail}"
  dept-block:
    backgroundColor: "{colors.rail}"
    textColor: "#ffffff"
    typography: "{typography.dept-code}"
    rounded: "{rounded.none}"
    width: "84px"
    height: "58px"
  blade-title:
    backgroundColor: "{colors.rail}"
    textColor: "#ffffff"
    typography: "{typography.blade}"
    rounded: "{rounded.none}"
    padding: "22px 28px"
  plate-strip:
    backgroundColor: "{colors.rail}"
    textColor: "#ffffff"
    typography: "{typography.serial}"
    rounded: "{rounded.none}"
    padding: "6px 9px"
    height: "28px"
  plate-strip-ares:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.rail}"
  plate-strip-demo:
    backgroundColor: "{colors.rail-3}"
    textColor: "#ffffff"
  plate-strip-service:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.rail}"
  plate-strip-untagged:
    backgroundColor: "#ffffff"
    textColor: "{colors.amber-ink}"
  panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.none}"
    padding: "22px 24px"
  board-row:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "58px"
  board-row-hover:
    backgroundColor: "{colors.ground}"
  board-row-selected:
    backgroundColor: "{colors.gold-tint}"
  error-notice:
    backgroundColor: "{colors.red-tint}"
    textColor: "#8e1f19"
    rounded: "{rounded.control}"
    padding: "12px 14px"
---

# Design System: Ares Sales

## Overview

**Creative North Star: "Department Signage"**

Ares Sales is navigated the way a hospital is: a colour-coded department blade tells you what kind of customer you are looking at before you read the name. The shell is enamel signage, a charcoal-navy rail with white and gold lettering, and the work ground is warm signage white, so the app reads as a wayfinding board rather than a SaaS dashboard. Every list is a directory board, every detail page opens under a blade in its department colour, and every photo is a fixed plate with a label strip screwed to its bottom edge.

The system is deliberately dense and flat. Surfaces are white panels on a warm ground with one-pixel rules; depth is reserved for the two things that physically stand off the wall, the detail panel and the login blades. Colour carries meaning and nothing else: four department colours for customer type, gold for whatever is live (the primary action, the active blade, selection, focus), amber for a unit that needs service, red for faults. Grey status pills, icon-only sidebars, and gradients on UI are rejected; the only gradient in the product is the metallic gold of the Ares mark itself.

**Key Characteristics:**
- Solid colour blocks with white codes (PATH, HOSP, CLIN, DIST) identify customer type at a glance
- Gold is the single live-state colour; on light ground it is used as a fill, never as text
- Square signage geometry everywhere except interactive controls, which carry a 6px radius
- One typeface (Overpass), tabular figures everywhere, mono reserved for serials and record codes
- One timing law: 240 ms, cubic-bezier(0.16, 1, 0.3, 1), with 140 ms exits and colour changes
- Fixed grids: state restyles a row or plate, it never changes the column widths or the 4:3 frame

## Colors

A signage palette: charcoal enamel, warm white board, one gold, four department colours, and two state colours, each with a single job.

### Primary
- **Ares Gold** (`gold`): the brand band and the only live-state colour. Primary button fill, the active nav blade, row selection tint (via `gold-tint`), the 3px focus ring, text selection, the Ares installed / new install plate strip, the upload progress bar, the GPS fix pip, and native date-field segment focus. Always paired with `rail` charcoal text or borders.
- **Gold Highlight** (`gold-2`): gold button hover and the "fair" GPS accuracy pip.
- **Gold Ink** (`gold-deep`): the only gold permitted as text on the light ground: links and the text caret. Gold itself fails contrast on white and is never set as type there.
- **Gold Tint** (`gold-tint`): selected board row, input focus halo (`0 0 0 3px`), the drop zone while a file is over it, and the halo around the location pip.
- **Gold Shadow** (`gold-shadow`): the 2px inset bottom edge of the gold button, the only thing that gives it a pressed-plate thickness.

### Secondary (department colours)
Customer types are solid blocks with their code in white. They appear as the 84×58 block at the head of a board row, the blade header of a visit record and detail panel, the selected type blade in the form, the legend swatches, and the decorative blades on the login panel.
- **PATH Teal** (`teal`): pathology laboratory.
- **HOSP Blue** (`blue`): hospital.
- **CLIN Green** (`green`): clinic.
- **DIST Plum** (`plum`): distributor.

### Tertiary (state colours)
- **Service Amber** (`amber`): a unit that needs service. The needs-service plate strip (with `rail` text), the dashed top rule of an untagged plate, the "poor" GPS accuracy pip, and the legend swatch.
- **Amber Ink** (`amber-ink`): the text form of amber on light ground: row flags ("1 needs service"), the follow-ups-due counter, and untagged strip lettering.
- **Amber Tint** (`amber-tint`): untagged strip code chip and the poor-fix halo.
- **Fault Red** (`red`): overdue next actions, invalid field borders, and the danger button text.
- **Red Tint** (`red-tint`): error notice background and danger button hover.

### Neutral
- **Ink** (`ink`), **Ink 2** (`ink-2`), **Ink 3** (`ink-3`): body text, secondary text (notes, counters, legend), and tertiary text (labels, column headers, placeholders, hints, empty values, time stamps).
- **Signage White** (`ground`): the page ground, header, and the board row hover tint. **Ground 2** (`ground-2`): skeleton shimmer only.
- **Panel White** (`panel`): tables, cards, inputs, the detail panel, the login card, and ghost button hover.
- **Rule** (`rule`) and **Rule Soft** (`rule-soft`): panel borders, header underline, table header rule, ghost button and input strokes (`rule`); interior row dividers and sub-section separators (`rule-soft`).
- **Rail Charcoal** (`rail`), **Rail 2** (`rail-2`), **Rail 3** (`rail-3`): the navigation rail, login panel, competitor plate strip, default blade and dept block, rail button fill (`rail`); blade dividers and hover (`rail-2`); demo-unit strip, avatar, sign-out border, and scrollbar thumb (`rail-3`).
- **Rail Text** (`rail-text`) and **Rail Muted** (`rail-muted`): lettering on charcoal at rest and secondary rail text (user plate, "LABS").

### Named Rules
**The One Gold Rule.** Gold means live. It is the primary action, the active blade, the selection, the focus ring, and the Ares-installed strip, and nothing else; decorative gold is reserved for the brand mark.

**The Gold-Is-Not-Type Rule.** On the light ground, gold is a fill or a ring, never lettering. Text that must read as gold uses Gold Ink (`gold-deep`).

**The Department Block Rule.** A customer type is always a solid block in its colour with the four-letter code in white, letter-spaced 0.1em. Never a tinted pill, outlined chip, or coloured text.

**The State Colour Rule.** Amber and red carry state and nothing else: amber for needs-service, red for faults, overdue, and invalid input. Neither is used for emphasis or decoration.

## Typography

**Brand Font:** Michroma (with Overpass fallback), wordmark only
**Body Font:** Overpass (with system-ui fallback), weights 400 / 600 / 700 / 800
**Label/Mono Font:** Overpass Mono, weights 500 / 600, for serials and record codes only

**Character:** Overpass is a highway-sign face and is used like one: heavy 800 headings at tight tracking, 700 for names and nav, and small 11px uppercase labels tracked at 0.14em. Tabular figures are set on the body so counts, dates, and times align in columns. The Michroma wordmark is a brand artefact and never appears as UI type. Document language is en-IN.

### Hierarchy
- **Brand** (400, 18px, 0.34em, uppercase Michroma): the "ARES" wordmark; 15px in the compact rail, 30px at 0.36em on the login panel. "SALES"/"LABS" beneath is Overpass 700, 9–12px, tracked 0.46–0.5em.
- **Display** (800, 30px, 1.15): the visit record's blade `h1`. Drops to 24px on phones.
- **Headline** (800, 26px, 1.15): page titles in the 88px header ("Visits", "Customers"); 22px on phones. Also the login tagline (26px, 1.2) and login card title (28px).
- **Blade** (800, 24px, 1.15): the detail panel's blade `h2`, white on the department colour.
- **Title** (800, 18px): form and photo section headings, sitting on a 1px `rule` underline with 10px padding beneath.
- **Entry** (700, 17px, 1.2): the customer name in a board row, with city beneath at 400 12px `ink-3`. Drops to 16px when the detail panel is open or on phones.
- **Body** (400, 15px, 1.45): base text, input text, button labels (800), nav blades (700).
- **Body Small** (400, 14px, 1.5): notes, hints at 13px, counters (600), legend (600 13px), error notices (600).
- **Label** (700, 11px, 0.14em, uppercase, `ink-3`): field labels, table column headers, facts-grid keys.
- **Dept Code** (800, 13px, 0.1em, uppercase, white): the PATH / HOSP / CLIN / DIST code inside a department block; 11px at 0.12em in the form type blade.
- **Serial** (500–600, 11px, 0.04em, uppercase, Overpass Mono): the plate strip label and status code; also the "VISIT 0112" record code at 12–13px inside a blade header.

### Named Rules
**The Mono-For-Serials Rule.** Overpass Mono is set only on serial numbers, instrument codes, and record numbers. Everything else, including numbers in columns, is Overpass with tabular figures.

**The Label Rule.** Every field label, column header, and fact key is the same object: 11px, 700, uppercase, 0.14em, `ink-3`. There is no second label style.

## Layout

The desktop shell is a two-column grid: a sticky 232px charcoal rail (`--rail-w`) and a fluid main column, full viewport height. The rail stacks an 88px brand block, the nav blades, and a user plate pinned to the bottom. The main column opens with a sticky 88px header (`16px 32px` padding, 1px `rule` beneath, ground-coloured) holding the page title, counters separated by 1px rules, and the gold primary action at the far right; filters sit beneath at `18px 32px 0`; content is padded `24px 32px 48px`.

The visits board is a two-column work area: the table plus a 0px column that opens to 400px when a row is selected (the column width itself transitions on the 240 ms law). The detail panel is sticky beneath the header, `calc(100dvh - 88px)` tall, with its own scroll. When open, the board keeps its columns and narrows them by fixed percentages; the row grid never reflows. Record and form pages use a 5:7 or main-plus-300px grid with 28px gutters and `28px 32px 64px` padding; forms are 2-up field grids at `16px 20px`.

Spacing rhythm is tight and even: 6px between a label and its field, 10px between filter controls, 12px inside stacks and photo grids, 16px between fields, 20px column gaps, 22px / 28px panel padding, 32px page gutters. Row height is 58px; nav blade height 54px; control height 44px (36px small, 42px in the filter bar, 48px on the login submit).

Breakpoints: at 1100px the detail/record layouts collapse to one column and optional board columns hide; at 900px the rail becomes a 60px top brand bar plus a fixed 58px bottom blade bar (safe-area padded, `0 -6px 18px rgba(21,25,30,.22)` shadow), gutters drop to 16px, headers lose their minimum height, type-row and tag grids go 2-up, and board rows restack as a `64px / 1fr / 40px` grid with the department block spanning the full entry height at the left edge; at 480px blade labels shrink to 12px.

**The Fixed Column Rule.** State restyles the row (selection tint, flag line, hover) and never the grid. Column widths are set on the table, not by content.

## Elevation & Depth

Flat by default with tonal layering: white panels sit on the warm ground separated by 1px `rule` borders, and the charcoal rail is a solid block with only a 1px inner highlight (`inset -1px 0 0 rgba(255,255,255,.04)`). Shadows appear only where something physically stands off the signage wall.

### Shadow Vocabulary
- **Panel** (`box-shadow: 0 1px 2px rgba(21,25,30,.06), 0 10px 28px rgba(21,25,30,.08)`): the login card.
- **Blade** (`box-shadow: 0 12px 32px rgba(21,25,30,.22), 0 2px 6px rgba(21,25,30,.12)`): the department blades on the login panel.
- **Detail panel** (`box-shadow: -8px 0 24px rgba(21,25,30,.06)`): the open visit panel casting left onto the board.
- **Bottom bar** (`box-shadow: 0 -6px 18px rgba(21,25,30,.22)`): the fixed phone nav bar.
- **Button plate** (`inset 0 -2px 0 {gold-shadow}, 0 2px 6px rgba(21,25,30,.16)`): gold and rail buttons carry a 2px inset bottom edge and a short drop; on press the inset shrinks to 1px and the button moves down 1px.
- **Focus** (`outline: 3px solid {gold}; outline-offset: 2px`): every focusable element; inset (`-3px`) on blades and rows. Inputs instead shift their border to gold and add a `0 0 0 3px {gold-tint}` halo.

### Named Rules
**The Off-The-Wall Rule.** Shadows are for things that stand proud of the signage wall: the login card and blades, the open detail panel, the bottom bar, and the two filled buttons. Tables, cards, inputs, and plates are flat with a 1px rule.

## Shapes

Signage geometry: rectangles with square corners. Department blocks, nav blades, blade headers, plates, plate strips, panels, tables, the avatar, the sign-out button, the close button, and the code chips are all 0px radius. Interactive controls that are typed into or pressed (buttons, inputs, selects, textareas, the error notice) carry the one radius, 6px (`--radius`). The two exceptions are a 2px radius on a focused native date segment and the 8px scrollbar thumb; the GPS pip is a 14px circle. Borders are 1px `rule` on panels and 1.5px `rule` on inputs, ghost buttons, and type blades; the photo drop zone is a 2px dashed `rule` that turns gold on drag-over; an untagged plate strip carries a 2px dashed amber top rule. Photo plates are always a 4:3 frame (`aspect-ratio: 4 / 3`, `#dddcd3` ground, 1px `#cfcec5` border) with the image cover-fitted.

## Components

### Buttons
Pressed enamel plates: heavy type, 6px corners, a 2px inset bottom edge on filled variants.
- **Shape:** gently rounded (6px); 44px tall, `0 20px` padding, 800 weight at 15px, 10px gap to an 18px icon.
- **Gold (primary):** gold fill, charcoal text, `inset 0 -2px 0 gold-shadow` plus `0 2px 6px rgba(21,25,30,.16)`. One per view: "Log a visit", "Save", "Sign in".
- **Rail:** charcoal fill, white text, same plate shadow with `#0d141d` inset; a strong secondary ("Take photo").
- **Ghost:** transparent, ink text, 1.5px `rule` border; hover darkens the border to `ink-3` and fills white.
- **Danger:** transparent, red text; hover fills `red-tint`.
- **Hover / Active:** fill shifts to `gold-2` / `rail-2` in 140 ms; active moves down 1px and halves the inset. Disabled is 55% opacity.
- **Small:** 36px tall, `0 14px`, 14px type.
- **Blade buttons:** inside a coloured blade header, actions are 36px, white text on `rgba(255,255,255,.16)` (hover `.3`), square corners.

### Inputs / Fields
- **Style:** white, 1.5px `rule` stroke, 6px radius, 44px minimum height, `10px 14px` padding; placeholder `ink-3`. Selects hide the native arrow and draw an 18px ink chevron at right 12px. Textareas are 120px minimum with vertical resize.
- **Label:** the Label style above, 6px above the field.
- **Hover / Focus:** border to `ink-3` on hover; on focus the border goes gold with a 3px `gold-tint` halo (no outline).
- **Error / Disabled:** `aria-invalid` sets a red border; the error notice is a `red-tint` block with 600-weight dark-red text and an 18px icon.
- **Native dates:** tabular, ink text, a charcoal calendar glyph; a focused segment is gold with charcoal text; an empty date reads in `ink-3`.
- **Type selector:** a 4-up row of 60px type blades (white, 1.5px rule, 12px 600 text, code chip in the department colour); the chosen blade fills with its department colour and white text.

### Navigation
- **Rail blades:** 54px tall, `0 24px`, 700 at 15px, `rail-text` on `rail`, 1px `rail-2` dividers, an 18px line icon at left and an 18px arrow at the right edge. Hover lifts to `rail-2` and white and nudges the arrow 4px right over 240 ms. The active blade is gold with charcoal text and icon.
- **Phone bar:** fixed to the bottom, 58px tall, blades centred and equal-width with 1px `rail-2` separators, 13px labels, 14px arrows.
- **User plate:** pinned to the rail's foot, 32px square `rail-3` avatar with 800 initials, 14px white name, 12px `rail-muted` role, and a 36px square outlined sign-out button.

### Department Block
The signature primitive. An inline-flex block in the department colour with the code in white (`dept-code` type). As a board cell it is 84×58 and fills the row; on phones it is 64px wide and stretches the full height of the stacked entry (minimum 72px). The default colour is `rail`.

### Blade Title
A page or panel header in the department colour (default `rail`): `22px 28px` padding, white 800 heading at 24px (30px on a full record page), a 92%-opacity sub-line, and a record code chip (`rgba(255,255,255,.16)`, mono) 12px beneath. The blade carries the row's colour straight into the panel, and the panel enters by sliding 40px from the right over 240 ms, exiting 24px in 140 ms.

### Directory Board
- **Table:** white, 1px `rule` border, fixed layout. Header cells are Label style with a 1px `rule` beneath. Rows are 58px, `0 14px` cell padding, `rule-soft` dividers, ellipsised single lines; numbers right-aligned and bold; the name cell is Entry style with the city beneath; the last cell is an 18px `ink-3` arrow.
- **States:** hover tints the row `ground` and nudges the arrow 4px; the selected row (`aria-selected`) is `gold-tint`; focus is the gold ring inset 3px. A needs-service flag is a 12px 700 `amber-ink` line beneath the purpose.
- **Phone:** head and numeric columns hide; each row becomes a stacked entry with the department block down its left edge and the arrow down its right.

### Photo Plate
A fixed 4:3 frame with a label strip across the bottom: 28px minimum, `6px 9px`, mono uppercase at 11px, a status code chip (`rgba(255,255,255,.18)`) then the make, model and serial. Strip colours by instrument status: gold with charcoal text for Ares installed and new install; charcoal for competitor; `rail-3` slate for demo units; amber with charcoal text for needs service; white with `amber-ink` lettering and a 2px dashed amber top rule for untagged, the visibly incomplete record. A synthetic demo image carries a 10px uppercase "Demo image" tag at top-left on 82% charcoal. New plates reveal with a top-to-bottom clip-path over 360 ms; uploads draw a 5px gold progress bar across the top of the frame. Grids are 3-across at 12px gaps in the detail panel.

### Panels / Cards
- **Corner Style:** square.
- **Background:** white.
- **Border:** 1px `rule`.
- **Shadow Strategy:** none at rest (see Elevation).
- **Internal Padding:** `22px 24px` on record cards; `22px 28px` for detail-panel sections; `18px` on the sticky form side panel; `36px 32px` on the login card.
- **Facts grid:** two columns at `16px 20px`, Label keys over 600-weight values; empty values are 400 `ink-3`.

### Login
A 5:6 split: the left panel is `rail` with the gold mark and 30px Michroma wordmark, a stack of 64px department blades (teal, blue, green, plum) carrying the blade shadow and entering 24px from the left on the 240 ms law with 60 ms stagger, and a 26px white tagline; the right side centres the 420px login card. On phones the panel becomes a top band with the blades in a 44px wrapped row and the tagline hidden.

### Motion
One timing law from `lib/motion.ts` and the `--t` / `--ease` properties: 240 ms, `cubic-bezier(0.16, 1, 0.3, 1)` for movement (blade slide, rise, arrow nudge, column open, progress); 140 ms for exits and every colour or border change; plate reveal at 360 ms. Spinners and the skeleton shimmer are linear. Under `prefers-reduced-motion`, every transition and animation collapses to 0.01 ms and the login blades do not animate; state colour changes remain.

## Do's and Don'ts

### Do:
- **Do** identify a customer type with a solid department block and its white four-letter code (PATH teal, HOSP blue, CLIN green, DIST plum), 84×58 in a row and full-height on phones.
- **Do** give every view exactly one gold button and let gold carry every live state: active blade, selected row (`gold-tint`), the 3px gold focus ring, and text selection.
- **Do** keep the primitives square and put the single 6px radius only on buttons, inputs, and the error notice.
- **Do** set every label, column header, and fact key as 11px 700 uppercase at 0.14em in `ink-3`.
- **Do** keep photos in a 4:3 plate with a status-coloured label strip, and show an untagged plate as white with a dashed amber top rule so an incomplete record is visible.
- **Do** run every transition on the one law (240 ms, cubic-bezier(0.16, 1, 0.3, 1); 140 ms for exits and colour) and enter detail panels from the right, the direction the arrow points.
- **Do** keep board columns fixed; let selection, hover, and flags restyle the row only.
- **Do** use Overpass Mono only for serials, instrument codes, and record numbers, and tabular figures for all other numerals.
- **Do** collapse the rail to a fixed 58px bottom blade bar at 900px and stack board rows with the block on the left edge.

### Don't:
- **Don't** set gold as text on the light ground; use Gold Ink (`gold-deep`) for links and the caret.
- **Don't** use gradients on UI surfaces; the metallic gradient lives only inside the Ares mark.
- **Don't** render status as grey or tinted pills, outlined chips, or coloured text; status is a solid block, a solid strip, or an `amber-ink` / `red` flag line.
- **Don't** use amber or red for anything other than needs-service, faults, overdue, and invalid input.
- **Don't** add shadows to tables, cards, inputs, or plates; shadows belong to the login card and blades, the open detail panel, the bottom bar, and the two filled buttons.
- **Don't** introduce a second typeface, a second label style, or icon-only navigation; blades carry an icon, a word, and an arrow.
- **Don't** let the detail panel change the board's row grid, or let a plate leave its 4:3 frame.
