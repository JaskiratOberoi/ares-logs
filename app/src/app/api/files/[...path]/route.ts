import fs from "node:fs/promises";
import { getSession } from "@/lib/auth";
import { mimeFor, resolveUpload } from "@/lib/uploads";

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSession();
  if (!user) return new Response("Not signed in", { status: 401 });
  const { path } = await ctx.params;
  const full = resolveUpload(path.join("/"));
  if (!full) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(full);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": mimeFor(full),
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
