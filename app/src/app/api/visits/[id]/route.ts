import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteVisit, getVisit, listPhotos, updateVisit, validateVisit, type VisitInput } from "@/lib/visits";
import { removeUpload } from "@/lib/uploads";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await ctx.params;
  const visit = getVisit(user, id);
  if (!visit) return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  return NextResponse.json({ visit, photos: listPhotos(id) });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await ctx.params;
  const input = (await req.json().catch(() => null)) as VisitInput | null;
  const problem = input ? validateVisit(input) : "Send the visit as JSON.";
  if (problem || !input) return NextResponse.json({ error: problem }, { status: 400 });
  const visit = updateVisit(user, id, input);
  if (!visit) return NextResponse.json({ error: "Visit not found or not yours to edit" }, { status: 404 });
  return NextResponse.json({ visit });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await ctx.params;
  const photos = listPhotos(id);
  const ok = deleteVisit(user, id);
  if (!ok) return NextResponse.json({ error: "Visit not found or not yours to delete" }, { status: 404 });
  await Promise.all(photos.map((p) => removeUpload(p.file_name)));
  return NextResponse.json({ ok: true });
}
