"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export function DeleteVisit({ id, customer }: { id: string; customer: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete the ${customer} visit and all its photos? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/visits/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setBusy(false);
      window.alert("The visit could not be deleted. Try again.");
      return;
    }
    router.replace("/visits");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height: 36,
        padding: "0 12px 0 10px",
        color: "#fff",
        background: "rgba(0,0,0,0.22)",
        border: 0,
        fontWeight: 700,
        fontSize: 14,
        cursor: busy ? "wait" : "pointer",
      }}
    >
      <Trash2 aria-hidden="true" style={{ width: 16, height: 16 }} />
      {busy ? "Deleting" : "Delete"}
    </button>
  );
}
