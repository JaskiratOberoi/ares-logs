"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, ExternalLink, LocateFixed, MapPinOff, RefreshCw } from "lucide-react";
import { fmtTime } from "@/lib/format";
import { accuracyGrade, mapsUrl } from "@/lib/geo";
import styles from "./LocationCapture.module.css";

export interface CapturedLocation {
  lat: number;
  lng: number;
  accuracy_m: number | null;
  captured_at: string;
  source: "gps";
}

type Status = "idle" | "locating" | "located" | "denied" | "unavailable" | "insecure" | "unsupported";

const SETTLE_MS = 12_000; // keep refining for up to 12 s
const GOOD_ENOUGH_M = 15; // stop early once the fix is this tight

export function LocationCapture({
  value,
  onChange,
  autoStart = true,
  label = "Visit location",
}: {
  value: CapturedLocation | null;
  onChange: (loc: CapturedLocation | null) => void;
  autoStart?: boolean;
  label?: string;
}) {
  const [status, setStatus] = useState<Status>(value ? "located" : "idle");
  const [elapsed, setElapsed] = useState(0);
  const watchId = useRef<number | null>(null);
  const timer = useRef<number | null>(null);
  const best = useRef<CapturedLocation | null>(value);

  const stop = useCallback(() => {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    if (timer.current != null) window.clearTimeout(timer.current);
    watchId.current = null;
    timer.current = null;
  }, []);

  const capture = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    if (!window.isSecureContext) {
      setStatus("insecure");
      return;
    }
    stop();
    best.current = null;
    setStatus("locating");
    setElapsed(0);
    const started = Date.now();
    const tick = window.setInterval(() => setElapsed(Date.now() - started), 250);

    const finish = () => {
      window.clearInterval(tick);
      stop();
      if (best.current) {
        onChange(best.current);
        setStatus("located");
      } else {
        setStatus("unavailable");
      }
    };

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const acc = Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null;
        const cur = best.current;
        if (!cur || (acc != null && (cur.accuracy_m == null || acc < cur.accuracy_m))) {
          best.current = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy_m: acc,
            captured_at: new Date(pos.timestamp || Date.now()).toISOString(),
            source: "gps",
          };
          onChange(best.current);
          setStatus("located");
        }
        if (acc != null && acc <= GOOD_ENOUGH_M) finish();
      },
      (err) => {
        window.clearInterval(tick);
        stop();
        if (best.current) {
          setStatus("located");
          return;
        }
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: SETTLE_MS },
    );
    timer.current = window.setTimeout(finish, SETTLE_MS);
  }, [onChange, stop]);

  useEffect(() => {
    const id = autoStart && !value ? window.setTimeout(capture, 0) : null;
    return () => {
      if (id != null) window.clearTimeout(id);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grade = value ? accuracyGrade(value.accuracy_m) : null;

  return (
    <div className={styles.box} data-status={status}>
      <div className={styles.head}>
        <span className="label">{label}</span>
        {status === "locating" && (
          <span className={styles.refining}>
            refining {Math.min(SETTLE_MS, elapsed) / 1000 < 1 ? "" : `${Math.floor(elapsed / 1000)}s`}
          </span>
        )}
      </div>

      <div className={styles.row}>
        <span className={`${styles.pin} ${grade ? styles[grade.cls] : ""}`} aria-hidden="true">
          {status === "locating" && <Crosshair className={styles.spin} />}
          {status === "located" && <LocateFixed />}
          {(status === "idle" || status === "denied" || status === "unavailable" || status === "insecure" || status === "unsupported") && (
            <MapPinOff />
          )}
        </span>

        <div className={styles.text}>
          {value ? (
            <>
              <b>
                Located {grade?.label}
                {status === "locating" && " · improving"}
              </b>
              <span className="mono">
                {value.lat.toFixed(5)}, {value.lng.toFixed(5)} · captured {fmtTime(value.captured_at)}
              </span>
            </>
          ) : status === "locating" ? (
            <>
              <b>Finding your position</b>
              <span>Hold still for a moment. Stand near a window if you are indoors.</span>
            </>
          ) : status === "denied" ? (
            <>
              <b>Location access is blocked</b>
              <span>Allow location for this site in your browser settings, then capture again.</span>
            </>
          ) : status === "insecure" ? (
            <>
              <b>Location needs a secure connection</b>
              <span>Open the app over HTTPS or on localhost to capture GPS.</span>
            </>
          ) : status === "unsupported" ? (
            <>
              <b>This browser cannot report location</b>
              <span>The visit will be filed without coordinates.</span>
            </>
          ) : status === "unavailable" ? (
            <>
              <b>No GPS fix yet</b>
              <span>Move away from thick walls or try again outside; the visit can still be filed.</span>
            </>
          ) : (
            <>
              <b>Not captured</b>
              <span>Capture the position where you are filing this visit.</span>
            </>
          )}
        </div>

        <div className={styles.actions}>
          {value && (
            <a className="btn btn-ghost btn-sm" href={mapsUrl(value.lat, value.lng)} target="_blank" rel="noreferrer">
              Open map
              <ExternalLink aria-hidden="true" />
            </a>
          )}
          <button type="button" className="btn btn-rail btn-sm" onClick={capture} disabled={status === "locating"}>
            <RefreshCw aria-hidden="true" />
            {value ? "Recapture" : "Capture"}
          </button>
          {value && (
            <button
              type="button"
              className={styles.remove}
              onClick={() => {
                stop();
                best.current = null;
                onChange(null);
                setStatus("idle");
              }}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
