import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty-state" style={{ minHeight: "60dvh", display: "grid", placeContent: "center" }}>
      <h3>That record is not here</h3>
      <p>It may have been deleted, or it belongs to another rep.</p>
      <Link href="/visits" className="btn btn-gold">
        Back to visits
      </Link>
    </div>
  );
}
