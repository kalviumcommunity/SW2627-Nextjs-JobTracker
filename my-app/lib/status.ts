// ponytail: single source of truth for status normalization.
// DB uses "pending" | "viewed" | "rejected", but legacy display values
// ("reviewing", "interviewed", "not selected", "pending review") still
// appear in some data. This maps them all to the canonical three.

export type CanonicalStatus = "pending" | "viewed" | "rejected";

export function normalizeStatus(raw: string | null | undefined): CanonicalStatus {
  const s = (raw || "").toLowerCase().trim();
  if (s === "viewed" || s === "reviewing" || s === "interviewed" || s === "viewed by employer") return "viewed";
  if (s === "rejected" || s === "not selected") return "rejected";
  return "pending";
}
