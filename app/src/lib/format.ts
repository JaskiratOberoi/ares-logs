import type { CustomerType } from "./types";

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
const shortFmt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" });

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return "";
  return dateFmt.format(new Date(iso));
}
export function fmtTime(iso: string) {
  return timeFmt.format(new Date(iso));
}
export function fmtDateTime(iso: string) {
  return `${fmtDate(iso)} · ${fmtTime(iso)}`;
}
export function fmtShort(iso: string) {
  return shortFmt.format(new Date(iso));
}

/** Value for a datetime-local input, in local time. */
export function toLocalInput(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function deptClass(t: CustomerType) {
  return { pathology_lab: "dept-teal", hospital: "dept-blue", clinic: "dept-green", distributor: "dept-plum" }[t];
}

export function deptVar(t: CustomerType) {
  return { pathology_lab: "var(--teal)", hospital: "var(--blue)", clinic: "var(--green)", distributor: "var(--plum)" }[t];
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function visitCode(seq: number) {
  return `VISIT ${String(seq).padStart(4, "0")}`;
}

export function isOverdue(due: string | null) {
  if (!due) return false;
  return due < new Date().toISOString().slice(0, 10);
}
