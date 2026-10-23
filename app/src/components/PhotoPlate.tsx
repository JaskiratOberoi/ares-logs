import type { Photo } from "@/lib/types";
import { statusMeta } from "@/lib/types";

export function plateLabel(p: Pick<Photo, "instrument_make" | "instrument_model" | "serial_number" | "instrument_status">) {
  const name = [p.instrument_make, p.instrument_model].filter(Boolean).join(" ");
  if (p.instrument_status === "untagged" && !name) return "Untagged";
  return [name, p.serial_number].filter(Boolean).join(" · ") || "Untagged";
}

export function PhotoPlate({
  photo,
  priority = false,
  children,
}: {
  photo: Photo;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  const meta = statusMeta(photo.instrument_status);
  return (
    <figure className="plate" style={{ margin: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/files/${photo.file_name}`}
        alt={`${plateLabel(photo)}${photo.caption ? `: ${photo.caption}` : ""}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      {photo.synthetic ? <span className="synthetic-tag">Demo image</span> : null}
      <figcaption className={`plate-strip strip-${photo.instrument_status}`}>
        <span className="code">{meta.short}</span>
        <b>{plateLabel(photo)}</b>
      </figcaption>
      {children}
    </figure>
  );
}
