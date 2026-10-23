import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { listReps, listVisits, summary } from "@/lib/visits";
import type { CustomerType, Purpose } from "@/lib/types";
import { Counter, PageHeader } from "@/components/PageHeader";
import { VisitFilters } from "@/components/VisitFilters";
import { VisitsBoard } from "@/components/VisitsBoard";

export const metadata: Metadata = { title: "Visits" };
export const dynamic = "force-dynamic";

type Search = { q?: string; rep?: string; type?: string; purpose?: string; from?: string; to?: string; v?: string };

export default async function VisitsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireSession();
  const sp = await searchParams;
  const filters = {
    q: sp.q?.trim() || undefined,
    rep: sp.rep || undefined,
    type: (sp.type as CustomerType) || undefined,
    purpose: (sp.purpose as Purpose) || undefined,
    from: sp.from || undefined,
    to: sp.to || undefined,
  };
  const visits = listVisits(user, filters);
  const reps = user.role === "manager" ? listReps().filter((r) => r.role === "rep") : [];
  const s = summary(user);
  const filtered = Boolean(filters.q || filters.rep || filters.type || filters.purpose || filters.from || filters.to);

  return (
    <>
      <PageHeader
        title="Visits"
        counters={
          <>
            <Counter n={s.visits_month} label="visits this month" />
            <Counter n={s.customers_month} label="customers" />
            <Counter n={s.photos_month} label="photos" />
            <Counter n={s.followups_due} label="follow-ups due" due={s.followups_due > 0} />
          </>
        }
        actions={
          <Link href="/visits/new" className="btn btn-gold">
            <Plus aria-hidden="true" />
            Log a visit
          </Link>
        }
      />
      <VisitFilters reps={reps} values={{ ...sp }} />
      <VisitsBoard visits={visits} user={user} filtered={filtered} initialSelected={sp.v} />
    </>
  );
}
