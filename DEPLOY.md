# Deploying Ares Sales to logs.ares-labs.com

Ares Sales is a Node server (Next.js) with a SQLite database and photo uploads on disk. It needs a machine that runs Node 24 or Docker and keeps a persistent folder. A shared-hosting `public_html` folder (Hostinger "Websites") only serves static files and PHP, so the app cannot run there. Two things that do work:

## Option A: your own server at 122.161.198.159 (the A record you are adding)

1. Keep the DNS record exactly as shown in hPanel: type `A`, name `logs`, value `122.161.198.159`, TTL 14400. Do not create the `logs` subdomain folder under `public_html`; it is not used.
2. On that machine, forward ports 80 and 443 to it if it sits behind a router, install Docker, and run:

```bash
git clone https://github.com/JaskiratOberoi/ares-logs.git
cd ares-logs/app
docker compose up -d --build
```

Caddy (in `docker-compose.yml`) obtains a Let's Encrypt certificate for `logs.ares-labs.com` automatically and proxies to the app. HTTPS matters: browsers only allow GPS capture on secure origins.

3. Open https://logs.ares-labs.com and sign in with a demo account (see `app/README.md`). The database and uploads live in the `ares-data` Docker volume; back that volume up.

Updating later:

```bash
cd ares-logs && git pull && cd app && docker compose up -d --build
```

Without Docker, on the same machine: `npm ci && npm run build && ARES_DATA_DIR=/srv/ares-data PORT=3000 npm start`, then put Caddy or nginx in front for HTTPS.

## Option B: a Node host (Hostinger VPS, Railway, Render, Fly.io)

Point the service at the `app/` folder (or set the root directory to `app`), build with `npm run build`, start with `npm start`, Node 24. Mount a persistent disk and set `ARES_DATA_DIR` to it, otherwise the database and photos are lost on every deploy. Then set the `logs` A record (or a CNAME) to the host's address instead of 122.161.198.159.

Vercel and other serverless hosts are not suitable: they have no persistent disk for the SQLite file and uploads.

## Changing staff accounts

Accounts are seeded on first start from `app/src/lib/seed.ts`. Edit the `USERS` list and the password before the first run on the server, or add rows to the `users` table afterwards.
