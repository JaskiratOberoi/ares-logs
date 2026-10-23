import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { listCustomers } from "@/lib/visits";
import { customerType } from "@/lib/types";
import { deptClass, fmtDate } from "@/lib/format";
import { Counter, DeptLegend, PageContent, PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const user = await requireSession();
  const customers = listCustomers(user);
  const ares = customers.reduce((n, c) => n + c.ares_units, 0);
  const comp = customers.reduce((n, c) => n + c.competitor_units, 0);
  const svc = customers.reduce((n, c) => n + c.service_flags, 0);

  return (
    <>
      <PageHeader
        title="Customers"
        counters={
          <>
            <Counter n={customers.length} label="customers" />
            <Counter n={ares} label="Ares units on file" />
            <Counter n={comp} label="competitor units" />
            <Counter n={svc} label="need service" due={svc > 0} />
          </>
        }
      />
      <PageContent>
        <DeptLegend />
        {customers.length === 0 ? (
          <div className="panel empty-state">
            <h3>No customers yet</h3>
            <p>Customers appear here as soon as a visit is filed against them.</p>
          </div>
        ) : (
          <table className="board">
            <colgroup>
              <col style={{ width: 84 }} />
              <col />
              <col style={{ width: "18%" }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 46 }} />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <span className="sr-only">Type</span>
                </th>
                <th>Customer</th>
                <th>Last contact</th>
                <th className="num">Visits</th>
                <th className="num">Photos</th>
                <th className="num">Ares</th>
                <th className="num">Comp.</th>
                <th>Last visit</th>
                <th>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const ct = customerType(c.customer_type);
                const href = `/visits?q=${encodeURIComponent(c.customer_name)}`;
                return (
                  <tr key={`${c.customer_name}-${c.customer_type}`}>
                    <td className="dept-cell">
                      <span className={`dept ${deptClass(c.customer_type)}`} title={ct.label}>
                        {ct.code}
                      </span>
                    </td>
                    <td>
                      <Link href={href} style={{ color: "inherit", textDecoration: "none" }}>
                        <div className="name">
                          {c.customer_name}
                          <small>{c.city}</small>
                        </div>
                      </Link>
                    </td>
                    <td className="mob-hide">{c.last_contact || <span style={{ color: "var(--ink-3)" }}>No contact</span>}</td>
                    <td className="num">{c.visit_count}</td>
                    <td className="num">{c.photo_count}</td>
                    <td className="num">{c.ares_units}</td>
                    <td className="num">{c.competitor_units}</td>
                    <td style={{ color: "var(--ink-2)" }}>
                      {fmtDate(c.last_visit)}
                      {c.service_flags > 0 && (
                        <small className="flag-line">
                          {c.service_flags} needs service
                        </small>
                      )}
                    </td>
                    <td className="arrow-cell">
                      <Link href={href} aria-label={`Visits for ${c.customer_name}`}>
                        <ArrowRight className="arrow" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </PageContent>
    </>
  );
}
