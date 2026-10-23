import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deletePhoto, getPhoto, getVisit, updatePhotoTags } from "@/lib/visits";
import { removeUpload } from "@/lib/uploads";
import type { InstrumentStatus } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

const STATUSES = new Set(["untagged", "ares_installed", "competitor", "demo_unit", "needs_service", "new_install"]);

async function authorise(id: string) {
  const user = await getSession();
  if (!user) return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  const photo = getPhoto(id);
  if (!photo) return { error: NextResponse.json({ error: "Photo not found" }, { status: 404 }) };
  const visit = getVisit(user, photo.visit_id);
  if (!visit) return { error: NextResponse.json({ error: "Photo not found" }, { status: 404 }) };
  if (user.role !== "manager" && visit.rep_id !== user.id) {
    return { error: NextResponse.json({ error: "Only the rep who filed this visit can change its photos." }, { status: 403 }) };
  }
  return { photo };
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const a = await authorise(id);
  if ("error" in a) return a.error;
  const body = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!body) return NextResponse.json({ error: "Send the tags as JSON." }, { status: 400 });
  if (body.instrument_status && !STATUSES.has(body.instrument_status)) {
    return NextResponse.json({ error: "Unknown instrument status." }, { status: 400 });
  }
  const photo = updatePhotoTags(id, {
    instrument_make: body.instrument_make,
    instrument_model: body.instrument_model,
    serial_number: body.serial_number,
    instrument_status: body.instrument_status as InstrumentStatus | undefined,
    caption: body.caption,
  });
  return NextResponse.json({ photo });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const a = await authorise(id);
  if ("error" in a) return a.error;
  const removed = deletePhoto(id);
  if (removed) await removeUpload(removed.file_name);
  return NextResponse.json({ ok: true });
}
