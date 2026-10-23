import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR, newId } from "./db";

export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export function allowedImage(mime: string) {
  return mime in EXT;
}

export async function storeUpload(visitId: string, file: File): Promise<{ file_name: string; size: number; mime: string }> {
  const ext = EXT[file.type];
  if (!ext) throw new Error(`Unsupported image type: ${file.type || "unknown"}. Use JPEG, PNG or WebP.`);
  if (file.size > MAX_PHOTO_BYTES) throw new Error("Photo is larger than 15 MB.");
  const dir = path.join(UPLOAD_DIR, visitId);
  await fs.mkdir(dir, { recursive: true });
  const name = `${newId()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, name), buf);
  return { file_name: `${visitId}/${name}`, size: buf.length, mime: file.type };
}

export async function removeUpload(fileName: string) {
  const safe = resolveUpload(fileName);
  if (!safe) return;
  await fs.rm(safe, { force: true });
}

export function resolveUpload(fileName: string): string | null {
  const full = path.resolve(UPLOAD_DIR, fileName);
  if (!full.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) return null;
  return full;
}

export function mimeFor(fileName: string) {
  const ext = path.extname(fileName).slice(1).toLowerCase();
  return Object.entries(EXT).find(([, e]) => e === ext)?.[0] ?? "application/octet-stream";
}
