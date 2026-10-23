import type { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { hashPassword } from "./password";

// Demo data. Every record here is synthetic and labelled as such in the UI
// (visits carry rep accounts that are demo accounts; photos carry synthetic = 1).

export const DEMO_PASSWORD = "ares2026";

const USERS = [
  { id: "u_priya", email: "priya@areslabs.in", name: "Priya Sharma", role: "manager", region: "South India" },
  { id: "u_rahul", email: "rahul@areslabs.in", name: "Rahul Krishnan", role: "rep", region: "Hyderabad" },
  { id: "u_anjali", email: "anjali@areslabs.in", name: "Anjali Menon", role: "rep", region: "Chennai" },
] as const;

type Inst = { make: string; model: string; serial: string; status: string; caption?: string };
type V = {
  rep: string;
  customer: string;
  type: "pathology_lab" | "hospital" | "clinic" | "distributor";
  address: string;
  city: string;
  at: string;
  contact: string;
  role: string;
  purpose: "demo" | "follow_up" | "service" | "installation" | "new_lead" | "stock_review";
  notes: string;
  outcome: string;
  next: string;
  due: string | null;
  photos: Inst[];
  loc?: [number, number, number];
};

const LOC: Record<string, [number, number, number]> = {
  "Qugen Pathlabs": [17.4156, 78.4347, 9],
  "Apollo Diagnostics": [17.4312, 78.4071, 14],
  "KIMS Hospital": [17.4396, 78.4987, 22],
  "Vijaya Diagnostic Centre": [17.4019, 78.4836, 11],
  "Yashoda Hospitals": [17.4248, 78.4591, 18],
  "Dr. Lal's Clinic": [17.4947, 78.3996, 8],
  "MedEquip Traders": [17.4374, 78.4482, 31],
  "Metropolis Healthcare": [17.4443, 78.4668, 12],
  "Sri Ramachandra Medical Centre": [13.0379, 80.1407, 16],
  "Lal PathLabs": [13.0850, 80.2101, 10],
  "Kauvery Hospital": [13.0334, 80.2528, 13],
  "Hitech Diagnostic Centre": [13.0418, 80.2341, 9],
  "Chennai Meenakshi Multispeciality": [13.0343, 80.2676, 20],
  "Bio-Medica Distributors": [13.0067, 80.2206, 27],
};

const VISITS: V[] = [
  {
    rep: "u_rahul", customer: "Qugen Pathlabs", type: "pathology_lab", address: "Road No. 12, Banjara Hills", city: "Hyderabad",
    at: "2026-10-24T10:15", contact: "Dr. S. Reddy", role: "Chief Pathologist", purpose: "follow_up",
    notes: "Reviewed last month's QC logs on the CL-900. Reagent consumption tracking 8% under forecast. Lab adding a second shift from November; asked whether throughput holds at 320 samples/hour sustained.",
    outcome: "AMC renewal agreed in principle", next: "Send AMC renewal quote", due: "2026-10-28",
    photos: [
      { make: "Ares", model: "CL-900", serial: "AR-2291-K", status: "ares_installed", caption: "Main chemistry bench" },
      { make: "Ares", model: "HM-5", serial: "AR-0912-B", status: "ares_installed" },
      { make: "Sysmex", model: "XN-550", serial: "A4821-0098", status: "competitor", caption: "Backup haematology" },
      { make: "Ares", model: "EL-200", serial: "AR-3310-E", status: "needs_service", caption: "Electrolyte unit: probe error 14 on startup" },
    ],
  },
  {
    rep: "u_rahul", customer: "Apollo Diagnostics", type: "pathology_lab", address: "Jubilee Hills", city: "Hyderabad",
    at: "2026-10-22T14:30", contact: "Dr. Meera Nair", role: "Lab Director", purpose: "demo",
    notes: "Lab runs 400 samples/day on a Cobas c311 and has hit its throughput ceiling. Ran the CL-900 demo panel on 40 split samples; correlation shared on the spot. Director keen; asked for AMC pricing alongside the capital quote.",
    outcome: "Quote requested", next: "Send CL-900 quote with AMC option", due: "2026-10-29",
    photos: [
      { make: "Ares", model: "CL-900", serial: "DEMO-CL9-04", status: "demo_unit", caption: "Demo unit on loan" },
      { make: "Roche", model: "Cobas c311", serial: "1178-442", status: "competitor" },
      { make: "Ares", model: "HM-5", serial: "AR-1044-C", status: "ares_installed" },
    ],
  },
  {
    rep: "u_rahul", customer: "KIMS Hospital", type: "hospital", address: "Minister Road", city: "Secunderabad",
    at: "2026-10-21T11:00", contact: "Mr. Anand Rao", role: "Biomedical Engineer", purpose: "service",
    notes: "HM-5 in the emergency lab throwing aspiration fault intermittently. Replaced sample probe and tubing set; ran 20-sample precision check, CV within spec. Second HM-5 in central lab fine.",
    outcome: "Fault cleared on site", next: "Confirm no recurrence by phone", due: "2026-10-27",
    photos: [
      { make: "Ares", model: "HM-5", serial: "AR-0877-B", status: "needs_service", caption: "Before: aspiration fault" },
      { make: "Ares", model: "HM-5", serial: "AR-0878-B", status: "ares_installed", caption: "Central lab unit" },
      { make: "Ares", model: "CL-900", serial: "AR-2105-K", status: "ares_installed" },
      { make: "Mindray", model: "BS-240", serial: "MR-55012", status: "competitor" },
      { make: "Ares", model: "UA-50", serial: "AR-4007-U", status: "ares_installed" },
      { make: "Ares", model: "EL-200", serial: "AR-3290-E", status: "ares_installed" },
    ],
  },
  {
    rep: "u_rahul", customer: "Vijaya Diagnostic Centre", type: "pathology_lab", address: "Himayatnagar", city: "Hyderabad",
    at: "2026-10-20T16:45", contact: "Dr. P. Lakshmi", role: "Lab Manager", purpose: "new_lead",
    notes: "Walk-in referral from Apollo. Currently outsourcing chemistry to a reference lab; wants in-house by Q1. Space for one benchtop analyzer; no LIS yet.",
    outcome: "Interested, needs site survey", next: "Schedule site survey with service team", due: "2026-11-03",
    photos: [
      { make: "Mindray", model: "BC-30", serial: "MR-2201-H", status: "competitor" },
      { make: "", model: "", serial: "", status: "untagged" },
    ],
  },
  {
    rep: "u_rahul", customer: "Yashoda Hospitals", type: "hospital", address: "Somajiguda", city: "Hyderabad",
    at: "2026-10-18T09:30", contact: "Ms. Kavya Iyer", role: "Lab In-charge", purpose: "installation",
    notes: "Installed CL-900 in the new OPD lab. Calibration and three-level QC passed. Trained two technicians; LIS interface pending IT ticket.",
    outcome: "Installed and commissioned", next: "Follow up on LIS interface ticket", due: "2026-10-25",
    photos: [{ make: "Ares", model: "CL-900", serial: "AR-2318-K", status: "new_install", caption: "Commissioned 18 Oct" }],
  },
  {
    rep: "u_rahul", customer: "Dr. Lal's Clinic", type: "clinic", address: "KPHB Colony, Kukatpally", city: "Hyderabad",
    at: "2026-10-17T12:10", contact: "Dr. R. Lal", role: "Owner", purpose: "follow_up",
    notes: "UA-50 running well; reagent order placed for next quarter. Asked about a compact haematology unit for the clinic.",
    outcome: "Reagent order placed", next: "Share HM-3 brochure", due: "2026-10-24",
    photos: [{ make: "Ares", model: "UA-50", serial: "AR-4112-U", status: "ares_installed" }],
  },
  {
    rep: "u_rahul", customer: "MedEquip Traders", type: "distributor", address: "Ameerpet", city: "Hyderabad",
    at: "2026-10-15T15:00", contact: "Mr. Farooq Ahmed", role: "Proprietor", purpose: "stock_review",
    notes: "Stock check: 2 HM-5, 1 UA-50 in warehouse. One HM-5 has been in stock 7 months; suggested a demo placement at Vijaya.",
    outcome: "Stock verified", next: "Arrange demo placement from stock", due: null,
    photos: [
      { make: "Ares", model: "HM-5", serial: "AR-1210-B", status: "demo_unit", caption: "Warehouse stock" },
      { make: "Ares", model: "HM-5", serial: "AR-1211-B", status: "demo_unit", caption: "Warehouse stock" },
      { make: "Ares", model: "UA-50", serial: "AR-4150-U", status: "demo_unit" },
    ],
  },
  {
    rep: "u_rahul", customer: "Metropolis Healthcare", type: "pathology_lab", address: "Begumpet", city: "Hyderabad",
    at: "2026-10-14T10:00", contact: "Dr. T. Menon", role: "Regional Lab Head", purpose: "demo",
    notes: "HM-5 demo against their Sysmex XN-1000 on 60 samples. Differential agreement good; they want flagging comparison on abnormal samples.",
    outcome: "Second demo requested", next: "Book abnormal-sample demo", due: "2026-10-30",
    photos: [
      { make: "Ares", model: "HM-5", serial: "DEMO-HM5-02", status: "demo_unit" },
      { make: "Sysmex", model: "XN-1000", serial: "B2210-0417", status: "competitor" },
    ],
  },
  {
    rep: "u_anjali", customer: "Sri Ramachandra Medical Centre", type: "hospital", address: "Porur", city: "Chennai",
    at: "2026-10-23T11:30", contact: "Dr. V. Rao", role: "HOD Biochemistry", purpose: "follow_up",
    notes: "Quarterly review. Two CL-900s at 92% uptime; one scheduled preventive maintenance overdue. Discussed adding an EL-200 for the ICU satellite lab.",
    outcome: "PM scheduled; EL-200 interest", next: "Send EL-200 proposal", due: "2026-10-31",
    photos: [
      { make: "Ares", model: "CL-900", serial: "AR-1980-K", status: "ares_installed" },
      { make: "Ares", model: "CL-900", serial: "AR-1981-K", status: "needs_service", caption: "PM overdue since Sep" },
      { make: "Ares", model: "HM-5", serial: "AR-0655-B", status: "ares_installed" },
    ],
  },
  {
    rep: "u_anjali", customer: "Lal PathLabs", type: "pathology_lab", address: "Anna Nagar", city: "Chennai",
    at: "2026-10-21T15:15", contact: "Mr. S. Balaji", role: "Centre Manager", purpose: "new_lead",
    notes: "Franchise centre evaluating a benchtop chemistry analyzer; head office approval needed for any non-standard vendor. Collected the approval form.",
    outcome: "Lead qualified", next: "Submit vendor approval form to HO", due: "2026-11-05",
    photos: [{ make: "Beckman Coulter", model: "AU480", serial: "BC-2019-77", status: "competitor" }],
  },
  {
    rep: "u_anjali", customer: "Kauvery Hospital", type: "hospital", address: "Alwarpet", city: "Chennai",
    at: "2026-10-16T09:45", contact: "Ms. Divya Krishnan", role: "Lab Supervisor", purpose: "service",
    notes: "UA-50 strip reader miscounting; cleaned optics and recalibrated. Advised monthly optics cleaning; left a cleaning kit.",
    outcome: "Resolved on site", next: "", due: null,
    photos: [{ make: "Ares", model: "UA-50", serial: "AR-3998-U", status: "ares_installed", caption: "After recalibration" }],
  },
  {
    rep: "u_anjali", customer: "Hitech Diagnostic Centre", type: "pathology_lab", address: "T. Nagar", city: "Chennai",
    at: "2026-10-09T13:00", contact: "Dr. K. Natarajan", role: "Director", purpose: "demo",
    notes: "CL-900 demo on 30 samples against their Erba XL-640. Director impressed by reagent cost per test; wants a reference from a comparable lab.",
    outcome: "Reference requested", next: "Arrange reference call with Qugen Pathlabs", due: "2026-10-26",
    photos: [
      { make: "Erba", model: "XL-640", serial: "EM-7731", status: "competitor" },
      { make: "Ares", model: "CL-900", serial: "DEMO-CL9-07", status: "demo_unit" },
    ],
  },
  {
    rep: "u_anjali", customer: "Chennai Meenakshi Multispeciality", type: "hospital", address: "Luz Church Road", city: "Chennai",
    at: "2026-09-29T10:30", contact: "Dr. A. Pillai", role: "Pathologist", purpose: "installation",
    notes: "HM-5 installed in the main lab. QC and calibration passed. LIS integration done the same day.",
    outcome: "Installed and live", next: "30-day check-in", due: "2026-10-29",
    photos: [{ make: "Ares", model: "HM-5", serial: "AR-1302-B", status: "new_install" }],
  },
  {
    rep: "u_anjali", customer: "Bio-Medica Distributors", type: "distributor", address: "Guindy", city: "Chennai",
    at: "2026-09-25T16:00", contact: "Mr. R. Sundar", role: "Partner", purpose: "stock_review",
    notes: "Reagent stock rotation reviewed; two lots near expiry flagged for return. Discussed Q4 targets.",
    outcome: "Stock plan agreed", next: "Raise return authorisation for near-expiry lots", due: "2026-10-03",
    photos: [],
  },
];

const PALETTE: Record<string, { body: string; panel: string; accent: string }> = {
  Ares: { body: "#E9EAE6", panel: "#CFD3CF", accent: "#D9A520" },
  Roche: { body: "#DCE3EA", panel: "#B9C4CF", accent: "#2F5FA8" },
  Sysmex: { body: "#E4E6EA", panel: "#C2C7D0", accent: "#4A5A6A" },
  Mindray: { body: "#E6E9E6", panel: "#C4CBC4", accent: "#3C8C4F" },
  "Beckman Coulter": { body: "#E9E6E2", panel: "#CFC9C1", accent: "#7A3E8C" },
  Erba: { body: "#E8E4E4", panel: "#CDC3C3", accent: "#A33327" },
  "": { body: "#E6E6E3", panel: "#C8C8C3", accent: "#8A8F98" },
};

type InstClass = "chem" | "floor" | "hema" | "urine" | "electro" | "unknown";

function classify(model: string): InstClass {
  if (!model) return "unknown";
  if (/^(CL|c3|BS|XL)/i.test(model)) return "chem";
  if (/^(AU|XN-1)/i.test(model)) return "floor";
  if (/^(HM|XN|BC)/i.test(model)) return "hema";
  if (/^UA/i.test(model)) return "urine";
  if (/^EL/i.test(model)) return "electro";
  return "unknown";
}

/** One illustration per instrument class, so a chemistry bench, a floor analyzer and a haematology unit read differently at plate size. */
function instrumentSvg(inst: Inst, seed: number): string {
  const p = PALETTE[inst.make] ?? PALETTE[""];
  const label = [inst.make, inst.model].filter(Boolean).join(" ") || "Unidentified instrument";
  const cls = classify(inst.model);
  const shade = `hsl(${200 + ((seed * 13) % 40)}, 8%, ${78 + ((seed * 7) % 8)}%)`;
  const tilt = ((seed * 37) % 5) - 2;
  const bars = (x: number, y: number, w: number, n: number, c: string) =>
    Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * 26}" width="${Math.round(w * (0.45 + ((seed + i) % 4) * 0.13))}" height="10" fill="${c}" opacity=".75"/>`).join("");
  const screen = (x: number, y: number, w: number, h: number) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#1F2A37"/><rect x="${x + 14}" y="${y + 14}" width="${w - 28}" height="18" fill="${p.accent}"/>${bars(x + 14, y + 48, w - 28, Math.max(2, Math.floor((h - 60) / 26)), "#9FB0C3")}`;
  const carousel = (cx: number, cy: number, r: number) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.panel}"/><circle cx="${cx}" cy="${cy}" r="${r - 22}" fill="#F7F7F4" stroke="#B8BDB5" stroke-width="3"/>` +
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      .map((i) => {
        const a = (i / 10) * Math.PI * 2;
        return `<circle cx="${(cx + Math.cos(a) * (r - 44)).toFixed(1)}" cy="${(cy + Math.sin(a) * (r - 44)).toFixed(1)}" r="8" fill="${i % 3 === 0 ? p.accent : "#C9CDC5"}"/>`;
      })
      .join("");
  const plate = (x: number, y: number, w: number) =>
    `<rect x="${x}" y="${y}" width="${w}" height="40" rx="6" fill="${p.panel}" opacity=".85"/><text x="${x + w - 16}" y="${y + 27}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#1F2A37" letter-spacing="2">${label.toUpperCase()}</text>`;
  const row = (n: number, f: (i: number) => string) => Array.from({ length: n }, (_, i) => f(i)).join("");

  let body = "";
  if (cls === "chem") {
    // wide bench-top chemistry analyzer: screen left, reagent carousel right, sample lane along the front
    body = `<g transform="translate(200 250) rotate(${tilt} 400 190)" filter="url(#s)">
      <rect x="0" y="0" width="800" height="390" rx="26" fill="url(#b)" stroke="${p.panel}" stroke-width="3"/>
      <rect x="0" y="0" width="800" height="48" rx="26" fill="${p.panel}"/><rect x="0" y="26" width="800" height="22" fill="${p.panel}"/>
      ${screen(36, 80, 300, 180)}${carousel(630, 170, 100)}
      <rect x="370" y="90" width="200" height="150" rx="10" fill="${p.panel}" opacity=".6"/>
      ${row(6, (i) => `<rect x="${384 + i * 30}" y="104" width="18" height="122" rx="4" fill="#F7F7F4" stroke="#B8BDB5"/>`)}
      <rect x="36" y="300" width="728" height="40" rx="8" fill="${p.panel}" opacity=".8"/>
      ${row(12, (i) => `<circle cx="${60 + i * 32}" cy="320" r="8" fill="${i % 4 === 0 ? p.accent : "#F7F7F4"}" stroke="#B8BDB5"/>`)}
      ${plate(36, 345, 300)}</g>`;
  } else if (cls === "floor") {
    // floor-standing analyzer: tall cabinet, screen on top, rack bay, lower drawers
    body = `<g transform="translate(380 110) rotate(${tilt} 220 300)" filter="url(#s)">
      <rect x="0" y="0" width="440" height="560" rx="22" fill="url(#b)" stroke="${p.panel}" stroke-width="3"/>
      <rect x="0" y="0" width="440" height="40" rx="22" fill="${p.panel}"/><rect x="0" y="20" width="440" height="20" fill="${p.panel}"/>
      <rect x="40" y="80" width="360" height="190" rx="12" fill="${p.panel}" opacity=".55"/>
      ${screen(60, 100, 320, 150)}
      <rect x="40" y="300" width="360" height="110" rx="10" fill="${p.panel}" opacity=".85"/>
      ${row(8, (i) => `<rect x="${56 + i * 44}" y="314" width="28" height="82" rx="5" fill="#F7F7F4" stroke="#B8BDB5"/>`)}
      <rect x="40" y="430" width="360" height="40" rx="6" fill="${p.panel}"/><rect x="40" y="480" width="360" height="40" rx="6" fill="${p.panel}"/>
      <rect x="200" y="446" width="40" height="8" rx="4" fill="#1F2A37" opacity=".5"/><rect x="200" y="496" width="40" height="8" rx="4" fill="#1F2A37" opacity=".5"/>
      ${plate(140, 528, 260)}</g>`;
  } else if (cls === "hema") {
    // compact haematology unit: small screen top-left, sample probe door with a lavender-cap tube, status lamps
    body = `<g transform="translate(300 230) rotate(${tilt} 300 200)" filter="url(#s)">
      <path d="M0 40 Q0 0 40 0 H560 Q600 0 600 40 V400 H0 Z" fill="url(#b)" stroke="${p.panel}" stroke-width="3"/>
      <rect x="0" y="0" width="600" height="36" rx="18" fill="${p.panel}"/><rect x="0" y="18" width="600" height="18" fill="${p.panel}"/>
      ${screen(36, 70, 240, 130)}
      <rect x="320" y="70" width="244" height="260" rx="14" fill="${p.panel}" opacity=".7"/>
      <rect x="400" y="100" width="84" height="200" rx="10" fill="#F7F7F4" stroke="#B8BDB5" stroke-width="3"/>
      <rect x="418" y="120" width="48" height="150" rx="24" fill="#E9D7E3" stroke="#B8BDB5" stroke-width="2"/><rect x="418" y="120" width="48" height="26" rx="10" fill="#8E7CC3"/>
      <circle cx="350" cy="310" r="10" fill="${p.accent}"/><circle cx="380" cy="310" r="10" fill="#C9CDC5"/>
      <rect x="36" y="230" width="240" height="100" rx="10" fill="${p.panel}" opacity=".85"/>
      ${row(4, (i) => `<rect x="${52 + i * 58}" y="246" width="42" height="68" rx="6" fill="#F7F7F4" stroke="#B8BDB5"/>`)}
      ${plate(36, 350, 280)}</g>`;
  } else if (cls === "urine") {
    // flat strip reader: low wide body, strip tray out front, small screen
    body = `<g transform="translate(240 330) rotate(${tilt} 360 110)" filter="url(#s)">
      <rect x="0" y="0" width="720" height="220" rx="22" fill="url(#b)" stroke="${p.panel}" stroke-width="3"/>
      <rect x="0" y="0" width="720" height="30" rx="15" fill="${p.panel}"/><rect x="0" y="15" width="720" height="15" fill="${p.panel}"/>
      ${screen(40, 50, 220, 110)}
      <rect x="300" y="56" width="380" height="100" rx="10" fill="${p.panel}" opacity=".7"/>
      <rect x="320" y="76" width="340" height="60" rx="6" fill="#F7F7F4" stroke="#B8BDB5" stroke-width="2"/>
      ${row(10, (i) => `<rect x="${334 + i * 33}" y="88" width="22" height="36" rx="3" fill="${["#F1CF62", "#8ED462", "#FF705D", "#2BA0FF", "#EBC1FF"][i % 5]}" opacity=".8"/>`)}
      <rect x="40" y="170" width="640" height="30" rx="6" fill="${p.panel}" opacity=".85"/>
      <rect x="300" y="178" width="40" height="14" rx="4" fill="${p.accent}"/>
      ${plate(380, 10, 300)}</g>`;
  } else if (cls === "electro") {
    // small upright electrolyte analyzer: narrow body, reagent pack door, tall screen
    body = `<g transform="translate(460 200) rotate(${tilt} 140 220)" filter="url(#s)">
      <rect x="0" y="0" width="280" height="440" rx="22" fill="url(#b)" stroke="${p.panel}" stroke-width="3"/>
      <rect x="0" y="0" width="280" height="36" rx="18" fill="${p.panel}"/><rect x="0" y="18" width="280" height="18" fill="${p.panel}"/>
      ${screen(30, 60, 220, 150)}
      <rect x="30" y="230" width="220" height="150" rx="12" fill="${p.panel}" opacity=".7"/>
      <rect x="50" y="250" width="180" height="110" rx="10" fill="#F7F7F4" stroke="#B8BDB5" stroke-width="3"/>
      <rect x="70" y="270" width="140" height="70" rx="8" fill="${p.accent}" opacity=".35"/>
      <circle cx="140" cy="400" r="12" fill="${p.accent}"/>
      ${plate(30, 390, 220)}</g>`;
  } else {
    // unidentified: a plain unit with no markings
    body = `<g transform="translate(330 270)" filter="url(#s)">
      <rect x="0" y="0" width="540" height="340" rx="22" fill="url(#b)" stroke="${p.panel}" stroke-width="3"/>
      ${screen(40, 60, 240, 150)}
      <rect x="320" y="60" width="180" height="230" rx="12" fill="${p.panel}" opacity=".6"/>
      <text x="270" y="300" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#5B6472" letter-spacing="3">NO TAG YET</text></g>`;
  }
  const floorY = cls === "floor" ? 690 : 640;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F2EE"/><stop offset="1" stop-color="${shade}"/></linearGradient>
<linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="${p.body}"/></linearGradient>
<filter id="s" x="-10%" y="-10%" width="130%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#1F2A37" flood-opacity=".28"/></filter></defs>
<rect width="1200" height="900" fill="url(#g)"/>
<rect x="0" y="${floorY}" width="1200" height="${900 - floorY}" fill="#D7D9D3"/><rect x="0" y="${floorY}" width="1200" height="6" fill="#BFC2BB"/>
${body}
<rect x="40" y="820" width="430" height="44" rx="6" fill="#1F2A37" opacity=".85"/>
<text x="60" y="849" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#F4F3EE" letter-spacing="2">SYNTHETIC DEMO IMAGE · NOT A REAL PHOTO</text>
</svg>`;
}

export function seedIfEmpty(db: DatabaseSync, uploadDir: string) {
  const count = (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
  if (count > 0) return;

  const insertUser = db.prepare("INSERT INTO users (id, email, name, role, region, password_hash) VALUES (?,?,?,?,?,?)");
  const hash = hashPassword(DEMO_PASSWORD);
  for (const u of USERS) insertUser.run(u.id, u.email, u.name, u.role, u.region, hash);

  const insertVisit = db.prepare(
    `INSERT INTO visits (id, seq, rep_id, customer_name, customer_type, address, city, visited_at, contact_name, contact_role,
      purpose, notes, outcome, next_action, next_action_due, status, created_at, updated_at,
      lat, lng, accuracy_m, location_captured_at, location_source)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'filed',?,?,?,?,?,?,?)`,
  );
  const insertPhoto = db.prepare(
    `INSERT INTO photos (id, visit_id, file_name, original_name, mime, size, instrument_make, instrument_model, serial_number, instrument_status, caption, synthetic, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,1,?)`,
  );

  const sorted = [...VISITS].sort((a, b) => a.at.localeCompare(b.at));
  let seq = 100;
  let n = 0;
  for (const v of sorted) {
    seq += 1;
    const id = `v_${String(seq).padStart(4, "0")}`;
    const at = new Date(v.at).toISOString();
    const loc = LOC[v.customer];
    insertVisit.run(
      id, seq, v.rep, v.customer, v.type, v.address, v.city, at, v.contact, v.role, v.purpose, v.notes, v.outcome, v.next, v.due, at, at,
      loc ? loc[0] : null, loc ? loc[1] : null, loc ? loc[2] : null, loc ? at : null, loc ? "gps" : "none",
    );
    const dir = path.join(uploadDir, id);
    fs.mkdirSync(dir, { recursive: true });
    v.photos.forEach((inst, i) => {
      n += 1;
      const file = `demo-${String(n).padStart(3, "0")}.svg`;
      const svg = instrumentSvg(inst, seq * 10 + i);
      fs.writeFileSync(path.join(dir, file), svg);
      const created = new Date(new Date(at).getTime() + (i + 1) * 60_000).toISOString();
      insertPhoto.run(`p_${String(n).padStart(4, "0")}`, id, `${id}/${file}`, `IMG_${2000 + n}.jpg`, "image/svg+xml", Buffer.byteLength(svg), inst.make, inst.model, inst.serial, inst.status, inst.caption ?? "", created);
    });
  }
}
