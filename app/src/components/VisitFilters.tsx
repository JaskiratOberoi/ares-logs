"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { CUSTOMER_TYPES, PURPOSES } from "@/lib/types";
import styles from "./Page.module.css";

type Values = { q?: string; rep?: string; type?: string; purpose?: string; from?: string; to?: string; v?: string };

export function VisitFilters({ reps, values }: { reps: { id: string; name: string }[]; values: Values }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(values.q ?? "");

  function push(next: Values) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) p.set(k, v);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Debounced search: only push when the typed text differs from what the URL already says.
  useEffect(() => {
    if (q.trim() === (values.q ?? "")) return;
    const t = setTimeout(() => push({ ...values, q: q.trim() || undefined }), 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = Boolean(values.q || values.rep || values.type || values.purpose || values.from || values.to);

  return (
    <form
      className={styles.filters}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        push({ ...values, q: q.trim() || undefined });
      }}
    >
      <label className={`${styles.search}`} style={{ position: "relative", display: "block" }}>
        <span className="sr-only">Search visits</span>
        <Search
          aria-hidden="true"
          style={{ position: "absolute", left: 12, top: 12, width: 18, height: 18, color: "var(--ink-3)" }}
        />
        <input
          className="input"
          type="search"
          placeholder="Search customer, contact, city or serial"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ paddingLeft: 38 }}
        />
      </label>
      {reps.length > 0 && (
        <select
          className="select"
          aria-label="Rep"
          value={values.rep ?? ""}
          onChange={(e) => push({ ...values, rep: e.target.value || undefined })}
        >
          <option value="">All reps</option>
          {reps.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      )}
      <select
        className="select"
        aria-label="Customer type"
        value={values.type ?? ""}
        onChange={(e) => push({ ...values, type: e.target.value || undefined })}
      >
        <option value="">All types</option>
        {CUSTOMER_TYPES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <select
        className="select"
        aria-label="Purpose"
        value={values.purpose ?? ""}
        onChange={(e) => push({ ...values, purpose: e.target.value || undefined })}
      >
        <option value="">All purposes</option>
        {PURPOSES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <input
        className="input"
        type="date"
        aria-label="From date"
        value={values.from ?? ""}
        onChange={(e) => push({ ...values, from: e.target.value || undefined })}
      />
      <input
        className="input"
        type="date"
        aria-label="To date"
        value={values.to ?? ""}
        onChange={(e) => push({ ...values, to: e.target.value || undefined })}
      />
      {active && (
        <button
          type="button"
          className={`btn btn-ghost btn-sm ${styles.clear}`}
          onClick={() => {
            setQ("");
            push({ v: values.v });
          }}
        >
          <X aria-hidden="true" />
          Clear
        </button>
      )}
    </form>
  );
}
