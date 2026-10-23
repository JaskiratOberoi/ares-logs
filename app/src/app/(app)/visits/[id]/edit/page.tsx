import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getVisit } from "@/lib/visits";
import { PageHeader } from "@/components/PageHeader";
import { VisitForm } from "@/components/VisitForm";

export const metadata: Metadata = { title: "Edit visit" };
export const dynamic = "force-dynamic";

export default async function EditVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await params;
  const visit = getVisit(user, id);
  if (!visit) notFound();
  if (user.role !== "manager" && visit.rep_id !== user.id) notFound();
  return (
    <>
      <PageHeader title={`Edit · ${visit.customer_name}`} />
      <VisitForm visit={visit} />
    </>
  );
}
