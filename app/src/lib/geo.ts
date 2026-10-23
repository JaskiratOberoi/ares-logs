export function accuracyGrade(m: number | null): { label: string; cls: "good" | "fair" | "poor" } {
  if (m == null) return { label: "accuracy unknown", cls: "fair" };
  if (m <= 30) return { label: `±${Math.round(m)} m`, cls: "good" };
  if (m <= 100) return { label: `±${Math.round(m)} m`, cls: "fair" };
  return { label: `±${Math.round(m)} m, weak signal`, cls: "poor" };
}

export function mapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(6)},${lng.toFixed(6)}`;
}
