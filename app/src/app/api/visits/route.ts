import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createVisit, listVisits, validateVisit, type VisitInput } from "@/lib/visits";
import type { CustomerType, Purpose } from "@/lib/types";

export async function GET(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const u = new URL(req.url);
  const visits = listVisits(user, {
    q: u.searchParams.get("q") ?? undefined,
    rep: u.searchParams.get("rep") ?? undefined,
    type: (u.searchParams.get("type") as CustomerType) ?? undefined,
    purpose: (u.searchParams.get("purpose") as Purpose) ?? undefined,
    from: u.searchParams.get("from") ?? undefined,
    to: u.searchParams.get("to") ?? undefined,
  });
  return NextResponse.json({ visits });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const input = (await req.json().catch(() => null)) as VisitInput | null;
  const problem = input ? validateVisit(input) : "Send the visit as JSON.";
  if (problem || !input) return NextResponse.json({ error: problem }, { status: 400 });
  const visit = createVisit(user, input);
  return NextResponse.json({ visit }, { status: 201 });
}
