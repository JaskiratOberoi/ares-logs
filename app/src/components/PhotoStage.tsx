"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { INSTRUMENT_STATUSES, type InstrumentStatus } from "@/lib/types";
import { plateReveal } from "@/lib/motion";
import styles from "./PhotoStage.module.css";

export interface StagedPhoto {
  key: string;
  file: File;
  url: string;
  instrument_make: string;
  instrument_model: string;
  serial_number: string;
  instrument_status: InstrumentStatus;
  caption: string;
  progress?: number; // 0..1 while uploading
  error?: string;
}

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export function stagePhoto(file: File): StagedPhoto {
  return {
    key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
    file,
    url: URL.createObjectURL(file),
    instrument_make: "",
    instrument_model: "",
    serial_number: "",
    instrument_status: "untagged",
    caption: "",
  };
}

export function PhotoStage({
  photos,
  onChange,
  disabled = false,
}: {
  photos: StagedPhoto[];
  onChange: (next: StagedPhoto[]) => void;
  disabled?: boolean;
}) {
  const reduce = useReducedMotion();
  const [over, setOver] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);
  const urls = useMemo(() => photos.map((p) => p.url), [photos]);

  useEffect(() => {
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
    // revoke only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function add(list: FileList | File[]) {
    const files = Array.from(list);
    const ok = files.filter((f) => ACCEPT.includes(f.type));
    const bad = files.filter((f) => !ACCEPT.includes(f.type));
    setRejected(bad.length ? `${bad.length} file${bad.length > 1 ? "s" : ""} skipped: use JPEG, PNG or WebP photos.` : null);
    if (ok.length) onChange([...photos, ...ok.map(stagePhoto)]);
  }

  function update(key: string, patch: Partial<StagedPhoto>) {
    onChange(photos.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }

  function remove(key: string) {
    const p = photos.find((x) => x.key === key);
    if (p) URL.revokeObjectURL(p.url);
    onChange(photos.filter((x) => x.key !== key));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    if (disabled) return;
    add(e.dataTransfer.files);
  }

  return (
    <div className={styles.stage}>
      <div
        className={styles.drop}
        data-over={over || undefined}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => e.target.files && add(e.target.files)}
          tabIndex={-1}
        />
        <input
          ref={filesRef}
          type="file"
          accept={ACCEPT.join(",")}
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && add(e.target.files)}
          tabIndex={-1}
        />
        <div className={styles.dropText}>
          <b>Add instrument photos</b>
          <span>One photo per instrument. Drop files here or use the buttons.</span>
        </div>
        <div className={styles.dropActions}>
          <button type="button" className="btn btn-rail" onClick={() => cameraRef.current?.click()} disabled={disabled}>
            <Camera aria-hidden="true" />
            Take photo
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => filesRef.current?.click()} disabled={disabled}>
            <ImagePlus aria-hidden="true" />
            Choose photos
          </button>
        </div>
      </div>
      {rejected && (
        <p className="hint" role="status">
          {rejected}
        </p>
      )}

      <AnimatePresence initial={false}>
        {photos.map((p) => (
          <motion.div
            key={p.key}
            className={styles.item}
            layout={!reduce}
            {...(reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : plateReveal)}
          >
            <div className={`plate ${styles.preview}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" />
              {p.progress != null && p.progress < 1 && (
                <div className={styles.progress} role="progressbar" aria-valuenow={Math.round(p.progress * 100)}>
                  <i style={{ width: `${Math.round(p.progress * 100)}%` }} />
                </div>
              )}
              <div className={`plate-strip strip-${p.instrument_status}`}>
                <span className="code">{INSTRUMENT_STATUSES.find((s) => s.value === p.instrument_status)?.short}</span>
                <b>
                  {[p.instrument_make, p.instrument_model].filter(Boolean).join(" ") || "Untagged"}
                  {p.serial_number ? ` · ${p.serial_number}` : ""}
                </b>
              </div>
            </div>
            <div className={styles.tags}>
              <div className="field">
                <label htmlFor={`${p.key}-status`}>Status</label>
                <select
                  id={`${p.key}-status`}
                  className="select"
                  value={p.instrument_status}
                  disabled={disabled}
                  onChange={(e) => update(p.key, { instrument_status: e.target.value as InstrumentStatus })}
                >
                  {INSTRUMENT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`${p.key}-make`}>Make</label>
                <input
                  id={`${p.key}-make`}
                  className="input"
                  placeholder="Ares"
                  value={p.instrument_make}
                  disabled={disabled}
                  onChange={(e) => update(p.key, { instrument_make: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor={`${p.key}-model`}>Model</label>
                <input
                  id={`${p.key}-model`}
                  className="input"
                  placeholder="CL-900"
                  value={p.instrument_model}
                  disabled={disabled}
                  onChange={(e) => update(p.key, { instrument_model: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor={`${p.key}-serial`}>Serial number</label>
                <input
                  id={`${p.key}-serial`}
                  className="input mono"
                  placeholder="AR-0000-X"
                  autoCapitalize="characters"
                  value={p.serial_number}
                  disabled={disabled}
                  onChange={(e) => update(p.key, { serial_number: e.target.value.toUpperCase() })}
                />
              </div>
              <div className={`field ${styles.wide}`}>
                <label htmlFor={`${p.key}-caption`}>Caption</label>
                <input
                  id={`${p.key}-caption`}
                  className="input"
                  placeholder="Where it sits, what you noticed"
                  value={p.caption}
                  disabled={disabled}
                  onChange={(e) => update(p.key, { caption: e.target.value })}
                />
              </div>
              {p.error && <div className={`error ${styles.wide}`}>{p.error}</div>}
              <button
                type="button"
                className={`btn btn-danger btn-sm ${styles.remove}`}
                onClick={() => remove(p.key)}
                disabled={disabled}
              >
                <Trash2 aria-hidden="true" />
                Remove
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
