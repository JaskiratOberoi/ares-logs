---
version: 1
slug: "app-src-app-app-visits-page-tsx"
primary_target: "app/src/app/(app)/visits/page.tsx"
related_targets: ["app/src/app/(app)/layout.tsx","app/src/app/login/page.tsx"]
---

---
version: 1
slug: "app-src-app-app-visits-page-tsx"
primary_target: "app/src/app/(app)/visits/page.tsx"
related_targets: ["app/src/app/(app)/layout.tsx","app/src/app/login/page.tsx"]
---

# Surface: Ares Sales authenticated app (visits board, visit form, visit detail, customers, photos, team) and the login screen

Mode: Operate. Audience: Ares Labs field sales reps on a phone in a lab corridor or car, and at a desk in the evening; managers at a desk. Task: file a site visit with tagged instrument photos in under three minutes; find and review any past visit by customer, contact, serial, rep or date. Proof/content: seeded synthetic demo visits labelled as such; real photos come from reps. Constraints: gold is the brand accent and the only live-state colour; Overpass is the face; no public sign-up.

## Direction contract

THESIS: Every visit is filed the way a hospital is navigated: a colour-coded department blade tells you what kind of customer this is before you read the name. It refuses the category default of a grey table with status pills and a dark SaaS sidebar of icons.

OWN-WORLD: Signage panels. Rail and headers are charcoal-navy enamel (#1F2A37) with white and gold reflective lettering; the work ground is warm signage white (#F4F3EE); gold (#D9A520) is the Ares band, the primary button fill, selection and focus, and nothing else is gold. Customer types are solid colour blocks with their code in white: PATH teal #1B8A8F, HOSP blue #2F5FA8, CLIN green #3C8C4F, DIST plum #7A3E8C. Service amber #E07B00 and fault red #C8322B are the only other colours and only carry state. Overpass for everything, Overpass Mono for serial numbers only, tabular figures everywhere. Nav items are blades with an arrow; rows are directory entries with a 58px colour block; photo plates are fixed 4:3 frames with a charcoal label strip. Raises: fixed columns (state restyles the row, never the grid); gold owns every live state; one fixed photo frame on a shared baseline; the gallery repacks in whole cells; one timing law (240 ms, cubic-bezier(0.16,1,0.3,1)) for every transition.

STORY: A rep opens the app and sees their visits as a directory board, knows in one glance which are labs and which are hospitals, and files a new one from the gold button. A manager scans all reps' boards, filters by rep, type or serial, and opens a visit to its blade and photo plates. Photos carry their instrument tags; an untagged plate is visibly incomplete.

FIRST VIEWPORT: 1440 wide. Left: 232px charcoal rail, gold Ares mark and wordmark at top, five blade nav items with arrows (active blade is gold with charcoal text), user plate at bottom. Right: 88px header with page title "Visits", search, month and rep filters, gold "Log a visit" button at the far right. Below, the directory board: a white table with fixed columns (colour block, Customer large with city beneath, Contact, Purpose, Units right-aligned, Visited tabular, arrow), 58px rows. Selecting a row opens a 400px detail panel from the right whose header is a blade in the customer type's colour, with facts grid and 2-across photo plates. (Amended at the finish review on 2026-10-24: the panel was planned at 440px with 3-across plates; at 1440 wide a 440px panel left the seven fixed board columns 689px, which cut customer and contact names, so 40px moved to the board and the panel plates went 2-across so their label strips read in full.) On phones the rail becomes a bottom blade bar and rows stack the colour block on the left edge at full row height.

FORM: Department Signage, candidate 7 of 7 on the ordered grounded list (cap-colour rack, foam demo case, slide tray, accreditation certificate, service register, instrument datasheet, wayfinding signage). seed:16b0936c92282e54

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction and motion grammar

The blade slide: a detail panel or page enters by sliding in along the direction its arrow points (from the right), 240 ms, cubic-bezier(0.16,1,0.3,1); the row's colour block extends into the panel header as the same colour. The nav arrow nudges 4px on hover. Upload: a dropped photo lands as a plate that fills its frame with a clip-path reveal; tagging it flips the label strip from amber "UNTAGGED" to charcoal with the serial. Reduced motion: no slide, opacity only, state colour changes stay.

## Unresolved

User-management UI for managers; SSO; real instrument catalogue.
