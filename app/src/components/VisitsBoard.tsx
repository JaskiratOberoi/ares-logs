"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ExternalLink, Plus, X } from "lucide-react";
import type { Photo, User, Visit } from "@/lib/types";
import { customerType, purposeLabel } from "@/lib/types";
import { deptClass, deptVar, fmtDate, fmtDateTime, fmtTime, isOverdue, visitCode } from "@/lib/format";
import { bladeIn } from "@/lib/motion";
import { PhotoPlate } from "./PhotoPlate";
import { DeptLegend, PageContent } from "./PageHeader";
import styles from "./VisitsBoard.module.css";

export function VisitsBoard({
  visits,
  user,
  filtered,
  initialSelected,
}: {
  visits: Visit[];
  user: User;
  filtered: boolean;
  initialSelected?: string;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string | null>(initialSelected ?? null);
  const [photos, setPhotos] = useState<Record<string, Photo[]>>({});
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1100px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const selected = visits.find((v) => v.id === selectedId) ?? null;

  const loaded = useCallback((id: string) => Boolean(photos[id]), [photos]);

  useEffect(() => {
    if (!selectedId || loaded(selectedId)) return;
    let cancelled = false;
    fetch(`/api/visits/${selectedId}`)
      .then((res) => (res.ok ? (res.json() as Promise<{ photos: Photo[] }>) : null))
      .then((data) => {
        if (!cancelled && data) setPhotos((p) => ({ ...p, [selectedId]: data.photos }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [selectedId, loaded]);

  function open(v: Visit) {
    if (narrow) {
      router.push(`/visits/${v.id}`);
      return;
    }
    setSelectedId((cur) => (cur === v.id ? null : v.id));
  }

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  return (
    <div className={styles.work} data-open={selected && !narrow ? "true" : undefined}>
      <PageContent>
        <DeptLegend service />
        {visits.length === 0 ? (
          <div className="panel empty-state">
            <h3>{filtered ? "No visits match these filters" : "No visits on file yet"}</h3>
            <p>
              {filtered
                ? "Try a broader date range, or clear the filters to see every visit you can view."
                : "Log your first site visit with the customer's details and photos of the instruments on site."}
            </p>
            {!filtered && (
              <Link href="/visits/new" className="btn btn-gold">
                <Plus aria-hidden="true" />
                Log a visit
              </Link>
            )}
          </div>
        ) : (
          <table className="board">
            <colgroup>
              <col style={{ width: 84 }} />
              <col />
              <col className={`${styles.optional} ${styles.contactCol}`} style={{ width: "13%" }} />
              <col className={styles.purposeCol} style={{ width: "15%" }} />
              <col className={styles.optional} style={{ width: 48 }} />
              <col className={styles.visitedCol} style={{ width: 180 }} />
              <col style={{ width: 40 }} />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <span className="sr-only">Customer type</span>
                </th>
                <th>Customer</th>
                <th className={styles.optional}>Contact</th>
                <th>Purpose</th>
                <th className={`num ${styles.optional}`}>Units</th>
                <th>Visited</th>
                <th>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => {
                const ct = customerType(v.customer_type);
                return (
                  <tr
                    key={v.id}
                    tabIndex={0}
                    aria-selected={selectedId === v.id}
                    onClick={() => open(v)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        open(v);
                      }
                    }}
                  >
                    <td className="dept-cell">
                      <span className={`dept ${deptClass(v.customer_type)}`} title={ct.label}>
                        {ct.code}
                      </span>
                    </td>
                    <td title={v.customer_name}>
                      <div className="name">
                        {v.customer_name}
                        <small>
                          {[v.city, user.role === "manager" ? v.rep_name : null].filter(Boolean).join(" · ")}
                        </small>
                      </div>
                    </td>
                    <td className={styles.optional} title={v.contact_name || undefined}>
                      {v.contact_name || <span style={{ color: "var(--ink-3)" }}>No contact</span>}
                    </td>
                    <td title={purposeLabel(v.purpose)}>
                      {purposeLabel(v.purpose)}
                      {v.service_count > 0 && (
                        <small className="flag-line">
                          {v.service_count} needs service
                        </small>
                      )}
                    </td>
                    <td className={`num ${styles.optional}`}>{v.photo_count}</td>
                    <td className={styles.when}>
                      {fmtDate(v.visited_at)} <span className={styles.time}>{fmtTime(v.visited_at)}</span>
                    </td>
                    <td className="arrow-cell">
                      <ArrowRight className="arrow" aria-hidden="true" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </PageContent>

      <AnimatePresence initial={false}>
        {selected && !narrow && (
          <motion.aside
            key={selected.id}
            className={styles.detail}
            aria-label={`${selected.customer_name} visit`}
            {...(reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : bladeIn)}
          >
            <div
              className="blade-title"
              style={{ ["--dept" as string]: deptVar(selected.customer_type) }}
            >
              <div className={styles.bladeTop}>
                <h2>{selected.customer_name}</h2>
                <button
                  type="button"
                  className={styles.close}
                  onClick={() => setSelectedId(null)}
                  aria-label="Close details"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
              <p>
                {[selected.address, selected.city].filter(Boolean).join(", ")}
                {selected.address || selected.city ? " · " : ""}
                {fmtDateTime(selected.visited_at)}
              </p>
              <p className="blade-code">
                <span className="mono">{visitCode(selected.seq)}</span>
                {user.role === "manager" && <span>filed by {selected.rep_name}</span>}
              </p>
            </div>
            <div className={styles.facts}>
              <div className="kv">
                <div>
                  <div className="k">Contact</div>
                  <div className={`v ${selected.contact_name ? "" : "empty"}`}>
                    {selected.contact_name
                      ? [selected.contact_name, selected.contact_role].filter(Boolean).join(", ")
                      : "Not recorded"}
                  </div>
                </div>
                <div>
                  <div className="k">Purpose</div>
                  <div className="v">{purposeLabel(selected.purpose)}</div>
                </div>
                <div>
                  <div className="k">Outcome</div>
                  <div className={`v ${selected.outcome ? "" : "empty"}`}>{selected.outcome || "Not recorded"}</div>
                </div>
                <div>
                  <div className="k">Next action</div>
                  <div className={`v ${selected.next_action ? "" : "empty"}`}>
                    {selected.next_action || "None"}
                    {selected.next_action_due && (
                      <span className={isOverdue(selected.next_action_due) ? styles.overdue : styles.due}>
                        {" "}
                        · {isOverdue(selected.next_action_due) ? "overdue " : "by "}
                        {fmtDate(selected.next_action_due)}
                      </span>
                    )}
                  </div>
                </div>
                {user.role === "manager" && (
                  <div>
                    <div className="k">Filed by</div>
                    <div className="v">{selected.rep_name}</div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.photos}>
              <h3>
                Instruments on site · {selected.photo_count} {selected.photo_count === 1 ? "photo" : "photos"}
                <Link href={`/visits/${selected.id}`}>
                  Open visit
                  <ExternalLink aria-hidden="true" />
                </Link>
              </h3>
              {photos[selected.id] ? (
                photos[selected.id].length > 0 ? (
                  <div className={styles.grid}>
                    {photos[selected.id].slice(0, 6).map((p) => (
                      <PhotoPlate key={p.id} photo={p} />
                    ))}
                  </div>
                ) : (
                  <p className={styles.noPhotos}>No photos on this visit yet.</p>
                )
              ) : (
                <div className={styles.grid} aria-busy="true">
                  <div className="plate skeleton" />
                  <div className="plate skeleton" />
                  <div className="plate skeleton" />
                </div>
              )}
            </div>
            {selected.notes && <p className={styles.notes}>{selected.notes}</p>}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
