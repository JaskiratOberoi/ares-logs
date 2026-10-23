import styles from "./Page.module.css";

export function PageHeader({
  title,
  counters,
  actions,
}: {
  title: React.ReactNode;
  counters?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {counters && <div className={styles.counters}>{counters}</div>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}

export function Counter({ n, label, due }: { n: number; label: string; due?: boolean }) {
  return (
    <span className={due ? styles.due : undefined}>
      <b>{n}</b>
      {label}
    </span>
  );
}

export function PageContent({ children }: { children: React.ReactNode }) {
  return <div className={styles.content}>{children}</div>;
}

export function DeptLegend({ service = false }: { service?: boolean }) {
  return (
    <div className={styles.legend} aria-label="Colour key">
      <span>
        <i style={{ background: "var(--teal)" }} />
        PATH Pathology lab
      </span>
      <span>
        <i style={{ background: "var(--blue)" }} />
        HOSP Hospital
      </span>
      <span>
        <i style={{ background: "var(--green)" }} />
        CLIN Clinic
      </span>
      <span>
        <i style={{ background: "var(--plum)" }} />
        DIST Distributor
      </span>
      {service && (
        <span>
          <i style={{ background: "var(--amber)" }} />
          Needs service on site
        </span>
      )}
    </div>
  );
}
