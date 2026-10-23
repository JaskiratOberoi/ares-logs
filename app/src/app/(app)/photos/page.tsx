import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { listAllPhotos } from "@/lib/visits";
import { INSTRUMENT_STATUSES } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { PhotoPlate } from "@/components/PhotoPlate";
import { Counter, PageContent, PageHeader } from "@/components/PageHeader";
import styles from "./photos.module.css";

export const metadata: Metadata = { title: "Photos" };
export const dynamic = "force-dynamic";

export default async function PhotosPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireSession();
  const { status } = await searchParams;
  const all = listAllPhotos(user, 240);
  const photos = status ? all.filter((p) => p.instrument_status === status) : all;
  const untagged = all.filter((p) => p.instrument_status === "untagged").length;

  return (
    <>
      <PageHeader
        title="Photos"
        counters={
          <>
            <Counter n={all.length} label="photos" />
            <Counter n={all.filter((p) => p.instrument_status === "ares_installed" || p.instrument_status === "new_install").length} label="Ares units" />
            <Counter n={all.filter((p) => p.instrument_status === "competitor").length} label="competitor" />
            <Counter n={untagged} label="untagged" due={untagged > 0} />
          </>
        }
      />
      <PageContent>
        <nav className={styles.tabs} aria-label="Instrument status">
          <Link href="/photos" aria-current={!status ? "page" : undefined}>
            All
          </Link>
          {INSTRUMENT_STATUSES.map((s) => (
            <Link key={s.value} href={`/photos?status=${s.value}`} aria-current={status === s.value ? "page" : undefined}>
              {s.label}
            </Link>
          ))}
        </nav>
        {photos.length === 0 ? (
          <div className="panel empty-state">
            <h3>{status ? "No photos with this status" : "No instrument photos yet"}</h3>
            <p>Photos added to visits appear here, each in its own frame with the instrument tag.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {photos.map((p) => (
              <Link key={p.id} href={`/visits/${p.visit_id}`} className={styles.cell}>
                <PhotoPlate photo={p} />
                <span className={styles.meta}>
                  <b>{p.customer_name}</b>
                  {fmtDate(p.visited_at)}
                  {user.role === "manager" ? ` · ${p.rep_name}` : ""}
                </span>
              </Link>
            ))}
          </div>
        )}
      </PageContent>
    </>
  );
}
