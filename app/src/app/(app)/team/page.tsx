import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { Counter, PageContent, PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Team" };
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string;
  region: string;
  visits_month: number;
  visits_total: number;
  photos_total: number;
  untagged: number;
  followups_due: number;
  last_visit: string | null;
};

export default async function TeamPage() {
  const user = await requireSession();
  if (user.role !== "manager") notFound();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const today = new Date().toISOString().slice(0, 10);
  const rows = getDb()
    .prepare(
      `SELECT u.id, u.name, u.region,
        (SELECT COUNT(*) FROM visits v WHERE v.rep_id = u.id AND v.visited_at >= ?) AS visits_month,
        (SELECT COUNT(*) FROM visits v WHERE v.rep_id = u.id) AS visits_total,
        (SELECT COUNT(*) FROM photos p JOIN visits v ON v.id = p.visit_id WHERE v.rep_id = u.id) AS photos_total,
        (SELECT COUNT(*) FROM photos p JOIN visits v ON v.id = p.visit_id WHERE v.rep_id = u.id AND p.instrument_status = 'untagged') AS untagged,
        (SELECT COUNT(*) FROM visits v WHERE v.rep_id = u.id AND v.next_action_due IS NOT NULL AND v.next_action_due <= ?) AS followups_due,
        (SELECT MAX(visited_at) FROM visits v WHERE v.rep_id = u.id) AS last_visit
       FROM users u WHERE u.role = 'rep' ORDER BY u.name`,
    )
    .all(monthStart.toISOString(), today) as unknown as Row[];

  return (
    <>
      <PageHeader
        title="Team"
        counters={
          <>
            <Counter n={rows.length} label="reps" />
            <Counter n={rows.reduce((n, r) => n + r.visits_month, 0)} label="visits this month" />
            <Counter n={rows.reduce((n, r) => n + r.followups_due, 0)} label="follow-ups due" due />
          </>
        }
      />
      <PageContent>
        <table className="board">
          <colgroup>
            <col />
            <col style={{ width: "16%" }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 46 }} />
          </colgroup>
          <thead>
            <tr>
              <th>Rep</th>
              <th>Region</th>
              <th className="num">This month</th>
              <th className="num">All visits</th>
              <th className="num">Photos</th>
              <th className="num">Untagged</th>
              <th>Last visit</th>
              <th>
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/visits?rep=${r.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                    <div className="name">
                      {r.name}
                      <small>{r.followups_due > 0 ? `${r.followups_due} follow-up${r.followups_due > 1 ? "s" : ""} due` : "No follow-ups due"}</small>
                    </div>
                  </Link>
                </td>
                <td>{r.region}</td>
                <td className="num">{r.visits_month}</td>
                <td className="num">{r.visits_total}</td>
                <td className="num">{r.photos_total}</td>
                <td className="num">{r.untagged > 0 ? <span className="flag">{r.untagged}</span> : 0}</td>
                <td style={{ color: "var(--ink-2)" }}>{r.last_visit ? fmtDate(r.last_visit) : "—"}</td>
                <td className="arrow-cell">
                  <Link href={`/visits?rep=${r.id}`} aria-label={`Visits by ${r.name}`}>
                    <ArrowRight className="arrow" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageContent>
    </>
  );
}
