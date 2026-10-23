# Ares Sales

Internal field-visit records for Ares Labs sales staff. Reps log site visits to pathology labs and hospitals with the customer's details, a GPS fix taken where the visit is filed, and photos of the instruments on site, each tagged with make, model, serial number and status. Managers see and filter every rep's records.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. The first start creates `data/ares-sales.db` (SQLite, via Node's built-in `node:sqlite`, Node 22.13+ required) and seeds three demo accounts with synthetic visits and demo images. Everything seeded is labelled as demo data in the UI.

| Account | Role | Password |
| --- | --- | --- |
| priya@areslabs.in | Manager, sees every rep | `ares2026` |
| rahul@areslabs.in | Sales rep, Hyderabad | `ares2026` |
| anjali@areslabs.in | Sales rep, Chennai | `ares2026` |

To start clean, stop the server and delete the `data/` folder. To add or change staff accounts, edit the `USERS` list in `src/lib/seed.ts` before first run, or insert rows into the `users` table (passwords are scrypt hashes from `src/lib/password.ts`).

## Production

```bash
npm run build
npm start
```

Set `ARES_DATA_DIR` to put the database and uploads somewhere persistent (defaults to `./data`). Uploads are stored on disk under `<data>/uploads/<visit id>/` and served through `/api/files/...` only to signed-in users. Serve the app over HTTPS: browsers only allow GPS capture on secure origins (and on `localhost`).

## Location capture

When a rep opens "Log a visit", the form asks the browser for a high-accuracy position and keeps refining it for up to 12 seconds, keeping the tightest reading. The visit stores latitude, longitude, the reported accuracy in metres, the capture time and the source. The record page shows the fix with an "Open map" link. Editing a visit later keeps the original field position unless the rep explicitly recaptures.

## Layout

- `src/app/login` sign-in
- `src/app/(app)/visits` board, `new`, `[id]` record, `[id]/edit`
- `src/app/(app)/customers`, `photos`, `team` (managers only)
- `src/app/api/*` JSON and upload routes
- `src/lib/db.ts` schema and migrations, `visits.ts` queries, `auth.ts` sessions, `uploads.ts` file storage, `seed.ts` demo data
- `src/components` UI
