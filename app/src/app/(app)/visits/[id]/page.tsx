import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getVisit, listPhotos } from "@/lib/visits";
import { customerType, purposeLabel } from "@/lib/types";
import { deptVar, fmtDate, fmtDateTime, fmtTime, isOverdue, visitCode } from "@/lib/format";
import { VisitPhotos } from "@/components/VisitPhotos";
import { DeleteVisit } from "@/components/DeleteVisit";
import { accuracyGrade, mapsUrl } from "@/lib/geo";
import styles from "./visit.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const user = await requireSession();
  const { id } = await params;
  const v = getVisit(user, id);
  return { title: v ? `${v.customer_name} · ${fmtDate(v.visited_at)}` : "Visit" };
}

export default async function VisitPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await params;
  const visit = getVisit(user, id);
  if (!visit) notFound();
  const photos = listPhotos(id);
  const canEdit = user.role === "manager" || visit.rep_id === user.id;
  const ct = customerType(visit.customer_type);
  const grade = visit.lat != null ? accuracyGrade(visit.accuracy_m) : null;

  return (
    <>
      <header className={`blade-title ${styles.blade}`} style={{ ["--dept" as string]: deptVar(visit.customer_type) }}>
        <div className={styles.bladeRow}>
          <Link href="/visits" className={styles.back}>
            <ArrowLeft aria-hidden="true" />
            Visits
          </Link>
          {canEdit && (
            <div className={styles.bladeActions}>
              <Link href={`/visits/${visit.id}/edit`} className={styles.bladeBtn}>
                <Pencil aria-hidden="true" />
                Edit
              </Link>
              <DeleteVisit id={visit.id} customer={visit.customer_name} />
            </div>
          )}
        </div>
        <h1>{visit.customer_name}</h1>
        <p>
          {[visit.address, visit.city].filter(Boolean).join(", ")}
          {visit.address || visit.city ? " · " : ""}
          {fmtDateTime(visit.visited_at)}
        </p>
        <p className="blade-code">
          {ct.label} · {visitCode(visit.seq)}
          {user.role === "manager" ? ` · filed by ${visit.rep_name}` : ""}
        </p>
      </header>

      <div className={styles.body}>
        <div className={styles.facts}>
          <section className={`panel ${styles.card}`}>
            <div className="kv">
              <div>
                <div className="k">Contact</div>
                <div className={`v ${visit.contact_name ? "" : "empty"}`}>
                  {visit.contact_name ? [visit.contact_name, visit.contact_role].filter(Boolean).join(", ") : "Not recorded"}
                </div>
              </div>
              <div>
                <div className="k">Purpose</div>
                <div className="v">{purposeLabel(visit.purpose)}</div>
              </div>
              <div>
                <div className="k">Outcome</div>
                <div className={`v ${visit.outcome ? "" : "empty"}`}>{visit.outcome || "Not recorded"}</div>
              </div>
              <div>
                <div className="k">Next action</div>
                <div className={`v ${visit.next_action ? "" : "empty"}`}>
                  {visit.next_action || "None"}
                  {visit.next_action_due && (
                    <span className={isOverdue(visit.next_action_due) ? styles.overdue : styles.due}>
                      {" "}
                      · {isOverdue(visit.next_action_due) ? "overdue " : "by "}
                      {fmtDate(visit.next_action_due)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {visit.notes ? (
              <>
                <div className="k label" style={{ marginTop: 20 }}>
                  Notes
                </div>
                <p className={styles.notes}>{visit.notes}</p>
              </>
            ) : null}
          </section>

          <section className={`panel ${styles.card}`}>
            <div className="label">Logged from</div>
            {visit.lat != null && visit.lng != null ? (
              <div className={styles.loc}>
                <span className={`${styles.locPin} ${styles[grade!.cls]}`} aria-hidden="true" />
                <div className={styles.locText}>
                  <b>
                    GPS fix {grade!.label}
                    {visit.location_captured_at ? ` · ${fmtTime(visit.location_captured_at)}` : ""}
                  </b>
                  <span className="mono">
                    {visit.lat.toFixed(5)}, {visit.lng.toFixed(5)}
                  </span>
                </div>
                <a className="btn btn-ghost btn-sm" href={mapsUrl(visit.lat, visit.lng)} target="_blank" rel="noreferrer">
                  Open map
                  <ExternalLink aria-hidden="true" />
                </a>
              </div>
            ) : (
              <p className={styles.noLoc}>No position was captured for this visit.</p>
            )}
          </section>
        </div>

        <section className={styles.photos}>
          <h2>
            Instruments on site
            <span>
              {photos.length} {photos.length === 1 ? "photo" : "photos"}
              {photos.some((p) => p.instrument_status === "untagged") && (
                <em className="flag"> · {photos.filter((p) => p.instrument_status === "untagged").length} untagged</em>
              )}
            </span>
          </h2>
          <VisitPhotos visitId={visit.id} photos={photos} canEdit={canEdit} />
        </section>
      </div>
    </>
  );
}
