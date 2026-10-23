import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { AresMark } from "@/components/Logo";
import styles from "./login.module.css";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect("/visits");

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-hidden="true">
        <div className={styles.brand}>
          <AresMark size={64} />
          <div className={styles.word}>
            <span>ARES</span>
            <small>SALES</small>
          </div>
        </div>
        <div className={styles.blades}>
          <div className={`${styles.blade} ${styles.teal}`}>
            <span>PATH</span>Pathology labs
          </div>
          <div className={`${styles.blade} ${styles.blue}`}>
            <span>HOSP</span>Hospitals
          </div>
          <div className={`${styles.blade} ${styles.green}`}>
            <span>CLIN</span>Clinics
          </div>
          <div className={`${styles.blade} ${styles.plum}`}>
            <span>DIST</span>Distributors
          </div>
        </div>
        <p className={styles.tagline}>
          Ares Labs field visit records.
          <br />
          Every instrument, on file.
        </p>
      </section>
      <section className={styles.formSide}>
        <LoginForm />
      </section>
    </main>
  );
}
