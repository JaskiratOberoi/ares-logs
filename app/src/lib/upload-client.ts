import type { StagedPhoto } from "@/components/PhotoStage";
import type { Photo } from "./types";

/** Uploads one staged photo with its tags, reporting progress 0..1. Uses XHR for upload progress. */
export function uploadPhoto(visitId: string, p: StagedPhoto, onProgress?: (frac: number) => void): Promise<Photo> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", p.file, p.file.name);
    fd.append("instrument_make", p.instrument_make);
    fd.append("instrument_model", p.instrument_model);
    fd.append("serial_number", p.serial_number);
    fd.append("instrument_status", p.instrument_status);
    fd.append("caption", p.caption);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/visits/${visitId}/photos`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as { photo?: Photo; error?: string };
        if (xhr.status >= 200 && xhr.status < 300 && data.photo) resolve(data.photo);
        else reject(new Error(data.error ?? `Upload failed (${xhr.status}).`));
      } catch {
        reject(new Error(`Upload failed (${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed: the server could not be reached."));
    xhr.send(fd);
  });
}
