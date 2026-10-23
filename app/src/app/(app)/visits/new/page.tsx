import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { VisitForm } from "@/components/VisitForm";

export const metadata: Metadata = { title: "Log a visit" };
export const dynamic = "force-dynamic";

export default async function NewVisitPage() {
  await requireSession();
  return (
    <>
      <PageHeader title="Log a visit" />
      <VisitForm />
    </>
  );
}
