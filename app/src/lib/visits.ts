import "server-only";
import { getDb, newId, nowIso, plain, plainAll } from "./db";
import type { CustomerType, InstrumentStatus, Photo, Purpose, User, Visit } from "./types";

const VISIT_SELECT = `
  SELECT v.*, u.name AS rep_name,
    (SELECT COUNT(*) FROM photos p WHERE p.visit_id = v.id) AS photo_count,
    (SELECT COUNT(*) FROM photos p WHERE p.visit_id = v.id AND p.instrument_status = 'needs_service') AS service_count
  FROM visits v JOIN users u ON u.id = v.rep_id`;

export interface VisitFilters {
  q?: string;
  rep?: string;
  type?: CustomerType | "";
  purpose?: Purpose | "";
  from?: string;
  to?: string;
  limit?: number;
}

function scope(user: User): { where: string; params: string[] } {
  return user.role === "manager" ? { where: "1=1", params: [] } : { where: "v.rep_id = ?", params: [user.id] };
}

export function listVisits(user: User, f: VisitFilters = {}): Visit[] {
  const s = scope(user);
  const where = [s.where];
  const params: (string | number)[] = [...s.params];
  if (f.q) {
    where.push(
      `(v.customer_name LIKE ? OR v.contact_name LIKE ? OR v.city LIKE ? OR EXISTS (SELECT 1 FROM photos p WHERE p.visit_id = v.id AND (p.serial_number LIKE ? OR p.instrument_model LIKE ?)))`,
    );
    const like = `%${f.q}%`;
    params.push(like, like, like, like, like);
  }
  if (f.rep && user.role === "manager") {
    where.push("v.rep_id = ?");
    params.push(f.rep);
  }
  if (f.type) {
    where.push("v.customer_type = ?");
    params.push(f.type);
  }
  if (f.purpose) {
    where.push("v.purpose = ?");
    params.push(f.purpose);
  }
  if (f.from) {
    where.push("v.visited_at >= ?");
    params.push(f.from);
  }
  if (f.to) {
    where.push("v.visited_at <= ?");
    params.push(f.to + "T23:59:59");
  }
  const limit = Math.min(f.limit ?? 200, 500);
  const rows = getDb()
    .prepare(`${VISIT_SELECT} WHERE ${where.join(" AND ")} ORDER BY v.visited_at DESC LIMIT ${limit}`)
    .all(...params);
  return plainAll<Visit>(rows);
}

export function getVisit(user: User, id: string): Visit | null {
  const s = scope(user);
  return plain<Visit>(getDb().prepare(`${VISIT_SELECT} WHERE v.id = ? AND ${s.where}`).get(id, ...s.params));
}

export function listPhotos(visitId: string): Photo[] {
  return plainAll<Photo>(getDb().prepare("SELECT * FROM photos WHERE visit_id = ? ORDER BY created_at ASC").all(visitId));
}

export function listAllPhotos(user: User, limit = 120): (Photo & { customer_name: string; visited_at: string; rep_name: string })[] {
  const s = scope(user);
  const rows = getDb()
    .prepare(
      `SELECT p.*, v.customer_name, v.visited_at, u.name AS rep_name FROM photos p
       JOIN visits v ON v.id = p.visit_id JOIN users u ON u.id = v.rep_id
       WHERE ${s.where} ORDER BY p.created_at DESC LIMIT ?`,
    )
    .all(...s.params, limit);
  return plainAll(rows) as never;
}

export interface VisitInput {
  customer_name: string;
  customer_type: CustomerType;
  address?: string;
  city?: string;
  visited_at: string;
  contact_name?: string;
  contact_role?: string;
  purpose: Purpose;
  notes?: string;
  outcome?: string;
  next_action?: string;
  next_action_due?: string | null;
  status?: "draft" | "filed";
  location?: { lat: number; lng: number; accuracy_m?: number | null; captured_at?: string; source?: "gps" | "manual" } | null;
}

function locationColumns(loc: VisitInput["location"]) {
  if (!loc) return { lat: null, lng: null, accuracy_m: null, captured_at: null, source: "none" as const };
  return {
    lat: loc.lat,
    lng: loc.lng,
    accuracy_m: loc.accuracy_m ?? null,
    captured_at: loc.captured_at ?? nowIso(),
    source: loc.source ?? ("gps" as const),
  };
}

const CUSTOMER_TYPES = new Set(["pathology_lab", "hospital", "clinic", "distributor"]);
const PURPOSES = new Set(["demo", "follow_up", "service", "installation", "new_lead", "stock_review"]);

export function validateVisit(input: Partial<VisitInput>): string | null {
  if (!input.customer_name?.trim()) return "Customer name is required.";
  if (!input.customer_type || !CUSTOMER_TYPES.has(input.customer_type)) return "Choose a customer type.";
  if (!input.visited_at || Number.isNaN(Date.parse(input.visited_at))) return "Enter the visit date and time.";
  if (!input.purpose || !PURPOSES.has(input.purpose)) return "Choose a purpose for the visit.";
  if (input.location) {
    const { lat, lng } = input.location;
    if (typeof lat !== "number" || typeof lng !== "number" || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return "The captured location is not valid. Capture it again.";
    }
  }
  return null;
}

export function createVisit(user: User, input: VisitInput): Visit {
  const db = getDb();
  const id = newId();
  const seq = (db.prepare("SELECT COALESCE(MAX(seq), 100) + 1 AS n FROM visits").get() as { n: number }).n;
  const loc = locationColumns(input.location);
  db.prepare(
    `INSERT INTO visits (id, seq, rep_id, customer_name, customer_type, address, city, visited_at, contact_name, contact_role,
      purpose, notes, outcome, next_action, next_action_due, status, lat, lng, accuracy_m, location_captured_at, location_source)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    id,
    seq,
    user.id,
    input.customer_name.trim(),
    input.customer_type,
    input.address?.trim() ?? "",
    input.city?.trim() ?? "",
    new Date(input.visited_at).toISOString(),
    input.contact_name?.trim() ?? "",
    input.contact_role?.trim() ?? "",
    input.purpose,
    input.notes ?? "",
    input.outcome ?? "",
    input.next_action ?? "",
    input.next_action_due || null,
    input.status ?? "filed",
    loc.lat,
    loc.lng,
    loc.accuracy_m,
    loc.captured_at,
    loc.source,
  );
  return getVisit(user, id)!;
}

export function updateVisit(user: User, id: string, input: VisitInput): Visit | null {
  const existing = getVisit(user, id);
  if (!existing) return null;
  if (user.role !== "manager" && existing.rep_id !== user.id) return null;
  // Location is only rewritten when the client sends one; an edit from the office keeps the field capture.
  const keep = input.location === undefined;
  const loc = keep
    ? {
        lat: existing.lat,
        lng: existing.lng,
        accuracy_m: existing.accuracy_m,
        captured_at: existing.location_captured_at,
        source: existing.location_source,
      }
    : locationColumns(input.location);
  getDb()
    .prepare(
      `UPDATE visits SET customer_name=?, customer_type=?, address=?, city=?, visited_at=?, contact_name=?, contact_role=?,
        purpose=?, notes=?, outcome=?, next_action=?, next_action_due=?, status=?, updated_at=?,
        lat=?, lng=?, accuracy_m=?, location_captured_at=?, location_source=? WHERE id=?`,
    )
    .run(
      input.customer_name.trim(),
      input.customer_type,
      input.address?.trim() ?? "",
      input.city?.trim() ?? "",
      new Date(input.visited_at).toISOString(),
      input.contact_name?.trim() ?? "",
      input.contact_role?.trim() ?? "",
      input.purpose,
      input.notes ?? "",
      input.outcome ?? "",
      input.next_action ?? "",
      input.next_action_due || null,
      input.status ?? existing.status,
      nowIso(),
      loc.lat,
      loc.lng,
      loc.accuracy_m,
      loc.captured_at,
      loc.source,
      id,
    );
  return getVisit(user, id);
}

export function deleteVisit(user: User, id: string): boolean {
  const existing = getVisit(user, id);
  if (!existing) return false;
  if (user.role !== "manager" && existing.rep_id !== user.id) return false;
  getDb().prepare("DELETE FROM visits WHERE id = ?").run(id);
  return true;
}

export interface PhotoInput {
  file_name: string;
  original_name: string;
  mime: string;
  size: number;
  instrument_make?: string;
  instrument_model?: string;
  serial_number?: string;
  instrument_status?: InstrumentStatus;
  caption?: string;
  synthetic?: boolean;
}

export function addPhoto(visitId: string, input: PhotoInput): Photo {
  const id = newId();
  getDb()
    .prepare(
      `INSERT INTO photos (id, visit_id, file_name, original_name, mime, size, instrument_make, instrument_model, serial_number, instrument_status, caption, synthetic)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      id,
      visitId,
      input.file_name,
      input.original_name,
      input.mime,
      input.size,
      input.instrument_make?.trim() ?? "",
      input.instrument_model?.trim() ?? "",
      input.serial_number?.trim() ?? "",
      input.instrument_status ?? "untagged",
      input.caption?.trim() ?? "",
      input.synthetic ? 1 : 0,
    );
  getDb().prepare("UPDATE visits SET updated_at = ? WHERE id = ?").run(nowIso(), visitId);
  return plain<Photo>(getDb().prepare("SELECT * FROM photos WHERE id = ?").get(id))!;
}

export function updatePhotoTags(
  photoId: string,
  tags: Pick<PhotoInput, "instrument_make" | "instrument_model" | "serial_number" | "instrument_status" | "caption">,
): Photo | null {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM photos WHERE id = ?").get(photoId) as unknown as Photo | undefined;
  if (!existing) return null;
  db.prepare(
    `UPDATE photos SET instrument_make=?, instrument_model=?, serial_number=?, instrument_status=?, caption=? WHERE id=?`,
  ).run(
    tags.instrument_make?.trim() ?? existing.instrument_make,
    tags.instrument_model?.trim() ?? existing.instrument_model,
    tags.serial_number?.trim() ?? existing.serial_number,
    tags.instrument_status ?? existing.instrument_status,
    tags.caption?.trim() ?? existing.caption,
    photoId,
  );
  db.prepare("UPDATE visits SET updated_at = ? WHERE id = ?").run(nowIso(), existing.visit_id);
  return plain<Photo>(db.prepare("SELECT * FROM photos WHERE id = ?").get(photoId));
}

export function getPhoto(photoId: string): Photo | null {
  return plain<Photo>(getDb().prepare("SELECT * FROM photos WHERE id = ?").get(photoId));
}

export function deletePhoto(photoId: string): Photo | null {
  const p = getPhoto(photoId);
  if (!p) return null;
  getDb().prepare("DELETE FROM photos WHERE id = ?").run(photoId);
  return p;
}

export function listReps(): { id: string; name: string; region: string; role: string }[] {
  return plainAll(getDb().prepare("SELECT id, name, region, role FROM users ORDER BY name").all()) as never;
}

export interface Summary {
  visits_month: number;
  customers_month: number;
  photos_month: number;
  followups_due: number;
  service_flags: number;
}

export function summary(user: User): Summary {
  const s = scope(user);
  const db = getDb();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const m = monthStart.toISOString();
  const today = new Date().toISOString().slice(0, 10);
  const one = (sql: string, ...p: (string | number)[]) => (db.prepare(sql).get(...p) as { n: number }).n;
  return {
    visits_month: one(`SELECT COUNT(*) AS n FROM visits v WHERE ${s.where} AND v.visited_at >= ?`, ...s.params, m),
    customers_month: one(
      `SELECT COUNT(DISTINCT v.customer_name) AS n FROM visits v WHERE ${s.where} AND v.visited_at >= ?`,
      ...s.params,
      m,
    ),
    photos_month: one(
      `SELECT COUNT(*) AS n FROM photos p JOIN visits v ON v.id = p.visit_id WHERE ${s.where} AND v.visited_at >= ?`,
      ...s.params,
      m,
    ),
    followups_due: one(
      `SELECT COUNT(*) AS n FROM visits v WHERE ${s.where} AND v.next_action_due IS NOT NULL AND v.next_action_due <= ?`,
      ...s.params,
      today,
    ),
    service_flags: one(
      `SELECT COUNT(*) AS n FROM photos p JOIN visits v ON v.id = p.visit_id WHERE ${s.where} AND p.instrument_status = 'needs_service'`,
      ...s.params,
    ),
  };
}

export interface CustomerSummary {
  customer_name: string;
  customer_type: CustomerType;
  city: string;
  visit_count: number;
  photo_count: number;
  last_visit: string;
  last_contact: string;
  ares_units: number;
  competitor_units: number;
  service_flags: number;
}

export function listCustomers(user: User): CustomerSummary[] {
  const s = scope(user);
  const rows = getDb()
    .prepare(
      `SELECT v.customer_name, v.customer_type, MAX(v.city) AS city, COUNT(*) AS visit_count,
        (SELECT COUNT(*) FROM photos p JOIN visits v2 ON v2.id = p.visit_id WHERE v2.customer_name = v.customer_name) AS photo_count,
        MAX(v.visited_at) AS last_visit,
        (SELECT contact_name FROM visits v3 WHERE v3.customer_name = v.customer_name ORDER BY visited_at DESC LIMIT 1) AS last_contact,
        (SELECT COUNT(*) FROM photos p JOIN visits v2 ON v2.id = p.visit_id WHERE v2.customer_name = v.customer_name AND p.instrument_status IN ('ares_installed','new_install')) AS ares_units,
        (SELECT COUNT(*) FROM photos p JOIN visits v2 ON v2.id = p.visit_id WHERE v2.customer_name = v.customer_name AND p.instrument_status = 'competitor') AS competitor_units,
        (SELECT COUNT(*) FROM photos p JOIN visits v2 ON v2.id = p.visit_id WHERE v2.customer_name = v.customer_name AND p.instrument_status = 'needs_service') AS service_flags
       FROM visits v WHERE ${s.where} GROUP BY v.customer_name, v.customer_type ORDER BY last_visit DESC`,
    )
    .all(...s.params);
  return plainAll(rows) as never;
}
