export type Role = "rep" | "manager";

export type CustomerType = "pathology_lab" | "hospital" | "clinic" | "distributor";
export type Purpose = "demo" | "follow_up" | "service" | "installation" | "new_lead" | "stock_review";
export type InstrumentStatus =
  | "untagged"
  | "ares_installed"
  | "competitor"
  | "demo_unit"
  | "needs_service"
  | "new_install";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  region: string;
}

export interface Visit {
  id: string;
  seq: number;
  rep_id: string;
  rep_name: string;
  customer_name: string;
  customer_type: CustomerType;
  address: string;
  city: string;
  visited_at: string;
  contact_name: string;
  contact_role: string;
  purpose: Purpose;
  notes: string;
  outcome: string;
  next_action: string;
  next_action_due: string | null;
  status: "draft" | "filed";
  lat: number | null;
  lng: number | null;
  accuracy_m: number | null;
  location_captured_at: string | null;
  location_source: "none" | "gps" | "manual";
  created_at: string;
  updated_at: string;
  photo_count: number;
  service_count: number;
}

export interface Photo {
  id: string;
  visit_id: string;
  file_name: string;
  original_name: string;
  mime: string;
  size: number;
  instrument_make: string;
  instrument_model: string;
  serial_number: string;
  instrument_status: InstrumentStatus;
  caption: string;
  synthetic: number;
  created_at: string;
}

export const CUSTOMER_TYPES: { value: CustomerType; code: string; label: string }[] = [
  { value: "pathology_lab", code: "PATH", label: "Pathology lab" },
  { value: "hospital", code: "HOSP", label: "Hospital" },
  { value: "clinic", code: "CLIN", label: "Clinic" },
  { value: "distributor", code: "DIST", label: "Distributor" },
];

export const PURPOSES: { value: Purpose; label: string }[] = [
  { value: "demo", label: "Demo" },
  { value: "follow_up", label: "Follow-up" },
  { value: "service", label: "Service" },
  { value: "installation", label: "Installation" },
  { value: "new_lead", label: "New lead" },
  { value: "stock_review", label: "Stock review" },
];

export const INSTRUMENT_STATUSES: { value: InstrumentStatus; label: string; short: string }[] = [
  { value: "ares_installed", label: "Ares installed", short: "ARES" },
  { value: "competitor", label: "Competitor unit", short: "COMP" },
  { value: "demo_unit", label: "Demo unit", short: "DEMO" },
  { value: "new_install", label: "New install", short: "NEW" },
  { value: "needs_service", label: "Needs service", short: "SVC" },
  { value: "untagged", label: "Untagged", short: "—" },
];

export function customerType(v: CustomerType) {
  return CUSTOMER_TYPES.find((c) => c.value === v) ?? CUSTOMER_TYPES[0];
}
export function purposeLabel(v: Purpose) {
  return PURPOSES.find((p) => p.value === v)?.label ?? v;
}
export function statusMeta(v: InstrumentStatus) {
  return INSTRUMENT_STATUSES.find((s) => s.value === v) ?? INSTRUMENT_STATUSES[5];
}
