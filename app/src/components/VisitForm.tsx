"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { CUSTOMER_TYPES, PURPOSES, type CustomerType, type Purpose, type Visit } from "@/lib/types";
import { deptVar, toLocalInput } from "@/lib/format";
import { LocationCapture, type CapturedLocation } from "./LocationCapture";
import { PhotoStage, type StagedPhoto } from "./PhotoStage";
import { uploadPhoto } from "@/lib/upload-client";
import styles from "./VisitForm.module.css";

type Draft = {
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
  next_action_due: string;
};

function fromVisit(v?: Visit): Draft {
  return {
    customer_name: v?.customer_name ?? "",
    customer_type: v?.customer_type ?? "pathology_lab",
    address: v?.address ?? "",
    city: v?.city ?? "",
    visited_at: toLocalInput(v?.visited_at),
    contact_name: v?.contact_name ?? "",
    contact_role: v?.contact_role ?? "",
    purpose: v?.purpose ?? "follow_up",
    notes: v?.notes ?? "",
    outcome: v?.outcome ?? "",
    next_action: v?.next_action ?? "",
    next_action_due: v?.next_action_due ?? "",
  };
}

function locFromVisit(v?: Visit): CapturedLocation | null {
  if (!v || v.lat == null || v.lng == null) return null;
  return { lat: v.lat, lng: v.lng, accuracy_m: v.accuracy_m, captured_at: v.location_captured_at ?? v.created_at, source: "gps" };
}

export function VisitForm({ visit }: { visit?: Visit }) {
  const router = useRouter();
  const editing = Boolean(visit);
  const [d, setD] = useState<Draft>(() => fromVisit(visit));
  const [location, setLocation] = useState<CapturedLocation | null>(() => locFromVisit(visit));
  const [locationTouched, setLocationTouched] = useState(false);
  const [photos, setPhotos] = useState<StagedPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "saving" | "uploading" | "done">("idle");

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((cur) => ({ ...cur, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!d.customer_name.trim()) return setError("Enter the customer's name.");
    if (!d.visited_at) return setError("Enter when the visit happened.");

    setPhase("saving");
    const body: Record<string, unknown> = {
      ...d,
      next_action_due: d.next_action_due || null,
      status: "filed",
    };
    // Only send a location when the rep captured or cleared one in this session;
    // otherwise an office edit keeps the field capture untouched.
    if (!editing || locationTouched) body.location = location;

    const res = await fetch(editing ? `/api/visits/${visit!.id}` : "/api/visits", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { visit?: Visit; error?: string };
    if (!res.ok || !data.visit) {
      setError(data.error ?? "The visit could not be saved. Try again.");
      setPhase("idle");
      return;
    }
    const id = data.visit.id;

    if (photos.length) {
      setPhase("uploading");
      let failed = 0;
      for (const p of photos) {
        try {
          await uploadPhoto(id, p, (frac) => setPhotos((cur) => cur.map((x) => (x.key === p.key ? { ...x, progress: frac } : x))));
          setPhotos((cur) => cur.map((x) => (x.key === p.key ? { ...x, progress: 1, error: undefined } : x)));
        } catch (err) {
          failed += 1;
          setPhotos((cur) =>
            cur.map((x) => (x.key === p.key ? { ...x, progress: undefined, error: (err as Error).message } : x)),
          );
        }
      }
      if (failed) {
        setError(
          `The visit is saved, but ${failed} photo${failed > 1 ? "s" : ""} did not upload. Fix the ones marked below and submit again, or open the visit to add them later.`,
        );
        setPhotos((cur) => cur.filter((x) => x.error));
        setPhase("idle");
        return;
      }
    }
    setPhase("done");
    router.push(`/visits/${id}`);
    router.refresh();
  }

  const busy = phase !== "idle";

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.section}>
            <h2>Customer</h2>
            <div className={styles.grid}>
              <div className={`field ${styles.span2}`}>
                <label htmlFor="customer_name">Customer name</label>
                <input
                  id="customer_name"
                  className="input"
                  required
                  autoFocus={!editing}
                  placeholder="Apollo Diagnostics"
                  value={d.customer_name}
                  onChange={(e) => set("customer_name", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Customer type</label>
                <div className={styles.typeRow} role="radiogroup" aria-label="Customer type">
                  {CUSTOMER_TYPES.map((c) => (
                    <label
                      key={c.value}
                      className={styles.typeBlade}
                      data-on={d.customer_type === c.value || undefined}
                      style={{ ["--dept" as string]: deptVar(c.value) }}
                    >
                      <input
                        type="radio"
                        name="customer_type"
                        value={c.value}
                        checked={d.customer_type === c.value}
                        onChange={() => set("customer_type", c.value)}
                        className="sr-only"
                      />
                      <span className={styles.code}>{c.code}</span>
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  className="input"
                  placeholder="Jubilee Hills"
                  value={d.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  className="input"
                  placeholder="Hyderabad"
                  value={d.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Visit</h2>
            <div className={styles.grid}>
              <div className="field">
                <label htmlFor="visited_at">Date and time</label>
                <input
                  id="visited_at"
                  className="input"
                  type="datetime-local"
                  required
                  value={d.visited_at}
                  onChange={(e) => set("visited_at", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="purpose">Purpose</label>
                <select
                  id="purpose"
                  className="select"
                  value={d.purpose}
                  onChange={(e) => set("purpose", e.target.value as Purpose)}
                >
                  {PURPOSES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="contact_name">Contact</label>
                <input
                  id="contact_name"
                  className="input"
                  placeholder="Dr. Meera Nair"
                  value={d.contact_name}
                  onChange={(e) => set("contact_name", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="contact_role">Contact&apos;s role</label>
                <input
                  id="contact_role"
                  className="input"
                  placeholder="Lab Director"
                  value={d.contact_role}
                  onChange={(e) => set("contact_role", e.target.value)}
                />
              </div>
              <div className={styles.span2}>
                <LocationCapture
                  value={location}
                  autoStart={!editing}
                  onChange={(loc) => {
                    setLocation(loc);
                    setLocationTouched(true);
                  }}
                />
                {editing && (
                  <p className="hint" style={{ marginTop: 6 }}>
                    Recapture only if you are at the customer site now; otherwise the original field position is kept.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>What happened</h2>
            <div className={styles.grid}>
              <div className={`field ${styles.span2}`}>
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  className="textarea"
                  placeholder="What you saw, what was discussed, throughput, pain points, who else was in the room."
                  value={d.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
              <div className={`field ${styles.span2}`}>
                <label htmlFor="outcome">Outcome</label>
                <input
                  id="outcome"
                  className="input"
                  placeholder="Quote requested"
                  value={d.outcome}
                  onChange={(e) => set("outcome", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="next_action">Next action</label>
                <input
                  id="next_action"
                  className="input"
                  placeholder="Send CL-900 quote with AMC option"
                  value={d.next_action}
                  onChange={(e) => set("next_action", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="next_action_due">Due by</label>
                <input
                  id="next_action_due"
                  className="input"
                  type="date"
                  value={d.next_action_due}
                  onChange={(e) => set("next_action_due", e.target.value)}
                />
              </div>
            </div>
          </section>

          {!editing && (
            <section className={styles.section}>
              <h2>Instruments on site</h2>
              <PhotoStage photos={photos} onChange={setPhotos} disabled={busy} />
            </section>
          )}
        </div>

        <aside className={styles.side}>
          <div className={styles.sticky}>
            {error && (
              <div className="error" role="alert">
                <AlertCircle aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
            <button type="submit" className="btn btn-gold" disabled={busy} style={{ height: 48, width: "100%" }}>
              {busy ? <Loader2 className={styles.spin} aria-hidden="true" /> : <Check aria-hidden="true" />}
              {phase === "saving"
                ? "Saving visit"
                : phase === "uploading"
                  ? `Uploading ${photos.filter((p) => p.progress === 1).length + 1} of ${photos.length}`
                  : phase === "done"
                    ? "Saved"
                    : editing
                      ? "Save changes"
                      : photos.length
                        ? `File visit with ${photos.length} photo${photos.length > 1 ? "s" : ""}`
                        : "File visit"}
            </button>
            <Link href={editing ? `/visits/${visit!.id}` : "/visits"} className="btn btn-ghost" style={{ width: "100%" }}>
              Cancel
            </Link>
            <p className="hint">
              {editing
                ? "Photos are added and tagged on the visit page."
                : "Tag each photo with the instrument's make, model and serial. Untagged photos stay flagged on the record until someone tags them."}
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}
