"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { INSTRUMENT_STATUSES, type InstrumentStatus, type Photo } from "@/lib/types";
import { plateReveal } from "@/lib/motion";
import { uploadPhoto } from "@/lib/upload-client";
import { PhotoPlate } from "./PhotoPlate";
import { PhotoStage, type StagedPhoto } from "./PhotoStage";
import styles from "./VisitPhotos.module.css";

type Tags = Pick<Photo, "instrument_make" | "instrument_model" | "serial_number" | "instrument_status" | "caption">;

export function VisitPhotos({ visitId, photos: initial, canEdit }: { visitId: string; photos: Photo[]; canEdit: boolean }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [photos, setPhotos] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [staged, setStaged] = useState<StagedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveTags(id: string, tags: Tags) {
    const res = await fetch(`/api/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tags),
    });
    const data = (await res.json()) as { photo?: Photo; error?: string };
    if (!res.ok || !data.photo) throw new Error(data.error ?? "Tags could not be saved.");
    setPhotos((cur) => cur.map((p) => (p.id === id ? data.photo! : p)));
    setEditing(null);
    router.refresh();
  }

  async function remove(p: Photo) {
    if (!window.confirm("Remove this photo from the visit?")) return;
    const res = await fetch(`/api/photos/${p.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("The photo could not be removed. Try again.");
      return;
    }
    setPhotos((cur) => cur.filter((x) => x.id !== p.id));
    router.refresh();
  }

  async function uploadStaged() {
    setUploading(true);
    setError(null);
    const remaining: StagedPhoto[] = [];
    for (const s of staged) {
      try {
        const photo = await uploadPhoto(visitId, s, (f) =>
          setStaged((cur) => cur.map((x) => (x.key === s.key ? { ...x, progress: f } : x))),
        );
        setPhotos((cur) => [...cur, photo]);
      } catch (err) {
        remaining.push({ ...s, progress: undefined, error: (err as Error).message });
      }
    }
    setStaged(remaining);
    setUploading(false);
    if (remaining.length) setError(`${remaining.length} photo${remaining.length > 1 ? "s" : ""} did not upload.`);
    router.refresh();
  }

  return (
    <div className={styles.wrap}>
      {photos.length === 0 && staged.length === 0 && (
        <div className="panel empty-state" style={{ padding: "36px 24px" }}>
          <h3>No instrument photos yet</h3>
          <p>
            {canEdit
              ? "Add a photo of each analyzer on site and tag it with make, model and serial so the installed base stays current."
              : "The rep has not added instrument photos to this visit."}
          </p>
        </div>
      )}

      <div className={styles.grid}>
        <AnimatePresence initial={false}>
          {photos.map((p) => (
            <motion.div
              key={p.id}
              className={styles.cell}
              layout={!reduce}
              {...(reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : plateReveal)}
            >
              <PhotoPlate photo={p} priority />
              {p.caption && <p className={styles.caption}>{p.caption}</p>}
              {canEdit && editing !== p.id && (
                <div className={styles.cellActions}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(p.id)}>
                    <Pencil aria-hidden="true" />
                    {p.instrument_status === "untagged" ? "Tag instrument" : "Edit tags"}
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(p)} aria-label="Remove photo">
                    <Trash2 aria-hidden="true" />
                  </button>
                </div>
              )}
              {editing === p.id && <TagEditor photo={p} onCancel={() => setEditing(null)} onSave={(t) => saveTags(p.id, t)} />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {canEdit && (
        <div className={styles.add}>
          <PhotoStage photos={staged} onChange={setStaged} disabled={uploading} />
          {staged.length > 0 && (
            <button type="button" className="btn btn-gold" onClick={uploadStaged} disabled={uploading}>
              {uploading ? <Loader2 className={styles.spin} aria-hidden="true" /> : <Check aria-hidden="true" />}
              {uploading ? "Uploading" : `Save ${staged.length} photo${staged.length > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TagEditor({ photo, onSave, onCancel }: { photo: Photo; onSave: (t: Tags) => Promise<void>; onCancel: () => void }) {
  const [t, setT] = useState<Tags>({
    instrument_make: photo.instrument_make,
    instrument_model: photo.instrument_model,
    serial_number: photo.serial_number,
    instrument_status: photo.instrument_status,
    caption: photo.caption,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const id = photo.id;

  return (
    <form
      className={styles.editor}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr(null);
        try {
          await onSave(t);
        } catch (ex) {
          setErr((ex as Error).message);
          setBusy(false);
        }
      }}
    >
      <div className="field">
        <label htmlFor={`${id}-status`}>Status</label>
        <select
          id={`${id}-status`}
          className="select"
          value={t.instrument_status}
          onChange={(e) => setT({ ...t, instrument_status: e.target.value as InstrumentStatus })}
        >
          {INSTRUMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${id}-make`}>Make</label>
        <input id={`${id}-make`} className="input" value={t.instrument_make} onChange={(e) => setT({ ...t, instrument_make: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor={`${id}-model`}>Model</label>
        <input id={`${id}-model`} className="input" value={t.instrument_model} onChange={(e) => setT({ ...t, instrument_model: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor={`${id}-serial`}>Serial number</label>
        <input
          id={`${id}-serial`}
          className="input mono"
          value={t.serial_number}
          autoCapitalize="characters"
          onChange={(e) => setT({ ...t, serial_number: e.target.value.toUpperCase() })}
        />
      </div>
      <div className="field">
        <label htmlFor={`${id}-caption`}>Caption</label>
        <input id={`${id}-caption`} className="input" value={t.caption} onChange={(e) => setT({ ...t, caption: e.target.value })} />
      </div>
      {err && <div className="error">{err}</div>}
      <div className={styles.editorActions}>
        <button type="submit" className="btn btn-gold btn-sm" disabled={busy}>
          <Check aria-hidden="true" />
          {busy ? "Saving" : "Save tags"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} disabled={busy}>
          <X aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}
