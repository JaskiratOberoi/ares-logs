import type { CSSProperties } from "react";

/** The Ares Labs mark: three gold blades meeting in a Y. Vector redraw of the supplied logo. */
export function AresMark({ size = 40, style }: { size?: number; style?: CSSProperties }) {
  const id = "ares-gold";
  return (
    <svg
      width={size}
      height={(size * 230) / 200}
      viewBox="0 0 200 230"
      aria-hidden="true"
      style={style}
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3d26b" />
          <stop offset="0.55" stopColor="#dca622" />
          <stop offset="1" stopColor="#b8860b" />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7df85" />
          <stop offset="0.5" stopColor="#e3b02e" />
          <stop offset="1" stopColor="#a97a0a" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c9941a" />
          <stop offset="0.5" stopColor="#f1cf62" />
          <stop offset="1" stopColor="#b98612" />
        </linearGradient>
      </defs>
      <polygon points="0,0 68,0 100,54 100,120 72,120 72,104 0,42" fill={`url(#${id}-l)`} />
      <polygon points="200,0 132,0 100,54 100,120 128,120 128,104 200,42" fill={`url(#${id}-r)`} />
      <polygon points="72,104 100,122 128,104 128,200 100,230 72,200" fill={`url(#${id}-s)`} />
      <polygon points="72,104 100,122 128,104 128,120 100,138 72,120" fill="#8f6608" opacity="0.55" />
    </svg>
  );
}

export function AresWordmark({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        lineHeight: 1,
        fontFamily: "var(--font-brand)",
        color: "var(--gold)",
      }}
    >
      <span style={{ fontSize: compact ? 15 : 18, letterSpacing: "0.34em", fontWeight: 400 }}>ARES</span>
      <span
        style={{
          marginTop: 6,
          fontFamily: "var(--font-sans)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.46em",
          color: dark ? "var(--rail-muted)" : "var(--ink-3)",
        }}
      >
        SALES
      </span>
    </span>
  );
}
