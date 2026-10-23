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

## As deployed on the Ares Labs host (24 Oct 2026)

The host already runs Caddy on ports 80/443 for other sites, so Ares Sales does not use the bundled `Caddyfile`/`docker-compose.yml`. It runs from `app/docker-compose.prod.yml`: compose project `ares-sales`, container `ares-sales-app`, bound to `127.0.0.1:3170` only, data in the `ares-sales_ares-sales-data` volume.

```bash
cd app && docker compose -f docker-compose.prod.yml up -d --build   # deploy or update
docker compose -f docker-compose.prod.yml logs -f app                # logs
```

The route was added to the running Caddy through its admin API (route `@id` `ares-sales-logs` on the `:443` server). That is live now but is not in the Caddyfile; to make it survive a Caddy restart, add this block to the Caddyfile Caddy loads and run `caddy reload`:

```caddyfile
logs.ares-labs.com {
	header {
		Referrer-Policy strict-origin-when-cross-origin
		X-Content-Type-Options nosniff
		X-Frame-Options SAMEORIGIN
	}
	reverse_proxy localhost:3170 {
		header_up X-Real-Ip {http.request.remote}
	}
}
```

DNS: `logs.ares-labs.com` must be a single `A` record to `122.161.198.159`. A Hostinger "subdomain" created under Websites adds records that point at Hostinger instead; delete that subdomain if it exists. Caddy obtains the certificate automatically once the name resolves here.
