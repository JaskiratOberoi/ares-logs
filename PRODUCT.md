# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router, TypeScript) with SQLite via Node's built-in `node:sqlite`, image uploads stored on disk under `data/uploads`. Chosen by the user from a recommendation on 2026-10-24.

## Users

Ares Labs field sales representatives visiting pathology laboratories and hospitals, logging a visit from a phone or laptop in the customer's lobby, car, or back at the office the same evening. A manager role reviews every rep's records.

## Product Purpose

Ares Sales is the internal record of every customer site visit: who was visited, when, what was discussed, which instruments were seen on site, and photos of those instruments. Success is a complete, searchable, photo-backed visit history that managers can trust for follow-up and reps can file in under three minutes.

## Positioning

Instrument photos are first-class records, not attachments: every image is tagged with the instrument it shows (make, model, serial, status) so the company builds an installed-base picture of each customer over time.

## Operating Context

- Reps visit labs and hospitals; visits produce notes, next actions, and photos of analyzers and instruments (installed Ares units, competitor units, demo units, units due for service).
- Logging happens on mobile in the field and on desktop at the office.
- Accounts are seeded by an administrator; there is no public sign-up. Roles: `rep` and `manager`.
- Reps see their own visits; managers see and filter all visits.

## Capabilities and Constraints

- Login with email and password; sessions via signed cookie.
- Create, edit, and view site visits: customer name, customer type (pathology lab / hospital / clinic / distributor), address and city, visit date and time, contact person and role, purpose (demo / follow-up / service / installation / new lead), notes, outcome, next action and due date.
- Attach instrument photos to a visit, each tagged with instrument make, model, serial number, and status (Ares installed / competitor / demo / needs service).
- Capture the rep's GPS position when a visit is logged (high-accuracy fix refined for up to 12 s, stored with accuracy in metres and capture time); shown on the record with a map link. Requested by the user on 2026-10-24. Browsers only allow this over HTTPS or localhost.
- Records dashboard: list and filter visits, per-rep and per-customer views, image gallery per visit.
- Admin management of users is seeded via script; a user-management UI is undecided.
- SSO is not built; auth is structured so it can be added later (undecided).

## Brand Commitments

- Name: Ares Labs. Logo supplied by the user: a gold (yellow-to-amber metallic gradient) mark of three converging chevron blades forming a Y, with "ARES" in wide gold extended capitals and "LABS" letter-spaced beneath. Source image at `public/brand/ares-labs-source.png`.
- Gold is the brand color and must stay the accent.

## Evidence on Hand

- Logo raster (1000×256, white background) supplied in chat. No customer list, no real visit data, no instrument catalog supplied; seed data is synthetic and labelled as such.

## Product Principles

- A visit can be filed one-handed on a phone in the customer's parking lot.
- Photos carry their own metadata; an untagged photo is an incomplete record.
- Managers get a trustworthy, filterable history, not a feed.
- The interface stays out of the way; the brand lives in precise gold details.
- Nothing is invented: no fake customers presented as real, demo data is labelled.
