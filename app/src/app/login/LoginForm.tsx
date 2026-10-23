"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { EASE, T } from "@/lib/motion";
import styles from "./form.module.css";

export function LoginForm() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not sign in.");
        setBusy(false);
        return;
      }
      router.replace("/visits");
      router.refresh();
    } catch {
      setError("The server did not respond. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <motion.form
      className={styles.form}
      onSubmit={onSubmit}
      initial={reduce ? false : { y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: T, ease: EASE }}
      noValidate
    >
      <h1 className={styles.title}>Sign in</h1>
      <p className={styles.sub}>Ares Sales is for Ares Labs field staff. Use the login your manager gave you.</p>

      {error && (
        <div className="error" role="alert">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="field">
        <label htmlFor="email">Work email</label>
        <input
          id="email"
          className="input"
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          required
          placeholder="you@areslabs.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          className="input"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? true : undefined}
        />
      </div>

      <button className="btn btn-gold" type="submit" disabled={busy}>
        {busy ? <Loader2 className={styles.spin} aria-hidden="true" /> : null}
        {busy ? "Signing in" : "Sign in"}
        {!busy && <ArrowRight aria-hidden="true" />}
      </button>

      <details className={styles.demo}>
        <summary>Demo accounts</summary>
        <p>
          This install ships with three demo logins, password <b className="mono">ares2026</b>:
        </p>
        <ul>
          <li>
            <b className="mono">priya@areslabs.in</b> · manager, sees every rep
          </li>
          <li>
            <b className="mono">rahul@areslabs.in</b> · rep, Hyderabad
          </li>
          <li>
            <b className="mono">anjali@areslabs.in</b> · rep, Chennai
          </li>
        </ul>
      </details>
    </motion.form>
  );
}
