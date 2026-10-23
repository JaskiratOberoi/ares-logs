import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { seedIfEmpty } from "./seed";

export const DATA_DIR = process.env.ARES_DATA_DIR
  ? path.resolve(process.env.ARES_DATA_DIR)
  : path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('rep','manager')),
  region TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  seq INTEGER NOT NULL,
  rep_id TEXT NOT NULL REFERENCES users(id),
  customer_name TEXT NOT NULL,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('pathology_lab','hospital','clinic','distributor')),
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  visited_at TEXT NOT NULL,
  contact_name TEXT NOT NULL DEFAULT '',
  contact_role TEXT NOT NULL DEFAULT '',
  purpose TEXT NOT NULL CHECK (purpose IN ('demo','follow_up','service','installation','new_lead','stock_review')),
  notes TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL DEFAULT '',
  next_action TEXT NOT NULL DEFAULT '',
  next_action_due TEXT,
  status TEXT NOT NULL DEFAULT 'filed' CHECK (status IN ('draft','filed')),
  lat REAL,
  lng REAL,
  accuracy_m REAL,
  location_captured_at TEXT,
  location_source TEXT NOT NULL DEFAULT 'none',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS visits_rep_idx ON visits(rep_id, visited_at DESC);
CREATE INDEX IF NOT EXISTS visits_customer_idx ON visits(customer_name);
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL DEFAULT '',
  mime TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  instrument_make TEXT NOT NULL DEFAULT '',
  instrument_model TEXT NOT NULL DEFAULT '',
  serial_number TEXT NOT NULL DEFAULT '',
  instrument_status TEXT NOT NULL DEFAULT 'untagged' CHECK (instrument_status IN ('untagged','ares_installed','competitor','demo_unit','needs_service','new_install')),
  caption TEXT NOT NULL DEFAULT '',
  synthetic INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS photos_visit_idx ON photos(visit_id);
`;

declare global {
  var __aresDb: DatabaseSync | undefined;
}

export function getDb(): DatabaseSync {
  if (globalThis.__aresDb) return globalThis.__aresDb;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const db = new DatabaseSync(path.join(DATA_DIR, "ares-sales.db"));
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  migrate(db);
  seedIfEmpty(db, UPLOAD_DIR);
  globalThis.__aresDb = db;
  return db;
}

/** Additive migrations for databases created before a column existed. */
function migrate(db: DatabaseSync) {
  const cols = new Set((db.prepare("PRAGMA table_info(visits)").all() as { name: string }[]).map((c) => c.name));
  const add = (name: string, ddl: string) => {
    if (!cols.has(name)) db.exec(`ALTER TABLE visits ADD COLUMN ${name} ${ddl}`);
  };
  add("lat", "REAL");
  add("lng", "REAL");
  add("accuracy_m", "REAL");
  add("location_captured_at", "TEXT");
  add("location_source", "TEXT NOT NULL DEFAULT 'none'");
}

/** node:sqlite rows have a null prototype; React needs plain objects to pass them to client components. */
export function plain<T>(row: unknown): T | null {
  return row == null ? null : ({ ...(row as object) } as T);
}
export function plainAll<T>(rows: unknown[]): T[] {
  return rows.map((r) => ({ ...(r as object) }) as T);
}

export function newId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}

export function nowIso(): string {
  return new Date().toISOString();
}
