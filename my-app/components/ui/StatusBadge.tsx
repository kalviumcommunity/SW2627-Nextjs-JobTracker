import React from "react";
import { normalizeStatus } from "@/lib/status";

export type ApplicationStatus = "pending" | "viewed" | "rejected" | string;

export interface StatusBadgeProps {
  status: ApplicationStatus;
  label?: string;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({
  status,
  label,
  className = "",
  dot = false,
}: StatusBadgeProps) {
  const normalized = normalizeStatus(status);

  let styles = "bg-[#e5eeff] text-[#3525cd] border-[#3525cd]/20";
  let dotColor = "bg-[#3525cd]";
  let defaultLabel = "Pending Review";

  if (normalized === "viewed") {
    styles = "bg-[#d1fae5] text-[#065f46] border-[#065f46]/20";
    dotColor = "bg-[#10B981]";
    defaultLabel = "Viewed by Employer";
  } else if (normalized === "rejected") {
    styles = "bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]/20";
    dotColor = "bg-[#EF4444]";
    defaultLabel = "Not Selected";
  }

  const text = label || defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors shrink-0 ${styles} ${className}`}
    >
      {dot && <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />}
      {text}
    </span>
  );
}
