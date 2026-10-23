import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addPhoto, getVisit } from "@/lib/visits";
import { allowedImage, MAX_PHOTO_BYTES, storeUpload } from "@/lib/uploads";
import type { InstrumentStatus } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await ctx.params;
  const visit = getVisit(user, id);
  if (!visit) return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  if (user.role !== "manager" && visit.rep_id !== user.id) {
    return NextResponse.json({ error: "Only the rep who filed this visit can add photos." }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Attach an image file." }, { status: 400 });
  if (!allowedImage(file.type)) {
    return NextResponse.json({ error: "Use a JPEG, PNG or WebP photo." }, { status: 415 });
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "Photos must be under 15 MB." }, { status: 413 });
  }
  const stored = await storeUpload(id, file);
  const str = (k: string) => {
    const v = form?.get(k);
    return typeof v === "string" ? v : undefined;
  };
  const photo = addPhoto(id, {
    ...stored,
    original_name: file.name,
    instrument_make: str("instrument_make"),
    instrument_model: str("instrument_model"),
    serial_number: str("serial_number"),
    instrument_status: (str("instrument_status") as InstrumentStatus) || "untagged",
    caption: str("caption"),
  });
  return NextResponse.json({ photo }, { status: 201 });
}
