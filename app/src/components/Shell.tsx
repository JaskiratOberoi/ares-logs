"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Building2, ClipboardList, Images, LogOut, Users } from "lucide-react";
import type { User } from "@/lib/types";
import { initials } from "@/lib/format";
import { AresMark, AresWordmark } from "./Logo";
import styles from "./Shell.module.css";

const NAV = [
  { href: "/visits", label: "Visits", icon: ClipboardList },
  { href: "/customers", label: "Customers", icon: Building2 },
  { href: "/photos", label: "Photos", icon: Images },
  { href: "/team", label: "Team", icon: Users, managerOnly: true },
];

export function Shell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = NAV.filter((n) => !n.managerOnly || user.role === "manager");

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className={styles.app}>
      <aside className={styles.rail}>
        <Link href="/visits" className={styles.brand} aria-label="Ares Sales home">
          <AresMark size={36} />
          <AresWordmark dark />
        </Link>
        <nav aria-label="Main" className={styles.navWrap}>
          <ul className={styles.nav}>
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.blade}
                    aria-current={active ? "page" : undefined}
                    data-active={active || undefined}
                  >
                    <Icon className={styles.icon} aria-hidden="true" />
                    <span>{item.label}</span>
                    <ArrowRight className={styles.arrow} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className={styles.user}>
          <span className={styles.avatar} aria-hidden="true">
            {initials(user.name)}
          </span>
          <span className={styles.who}>
            <b>{user.name}</b>
            {user.role === "manager" ? "Manager" : "Sales rep"} · {user.region}
          </span>
          <button type="button" className={styles.signout} onClick={signOut} title="Sign out" aria-label="Sign out">
            <LogOut aria-hidden="true" />
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
