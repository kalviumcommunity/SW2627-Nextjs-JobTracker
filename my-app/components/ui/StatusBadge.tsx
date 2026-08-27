import React from "react";

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
  const normalized = status.toLowerCase();

  let styles = "bg-[#e5eeff] text-[#3525cd] border-[#3525cd]/20";
  let dotColor = "bg-[#3525cd]";
  let defaultLabel = "Pending Review";

  if (normalized === "viewed" || normalized === "viewed by employer" || normalized === "reviewing") {
    styles = "bg-[#d1fae5] text-[#065f46] border-[#065f46]/20";
    dotColor = "bg-[#10B981]";
    defaultLabel = "Viewed by Employer";
  } else if (normalized === "rejected" || normalized === "not selected") {
    styles = "bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]/20";
    dotColor = "bg-[#EF4444]";
    defaultLabel = "Not Selected";
  } else if (normalized === "pending" || normalized === "pending review") {
    styles = "bg-[#e5eeff] text-[#3525cd] border-[#3525cd]/20";
    dotColor = "bg-[#3525cd]";
    defaultLabel = "Pending Review";
  } else {
    styles = "bg-[#d9dff5] text-[#5c6274] border-[#c7c4d8]";
    dotColor = "bg-[#575e70]";
    defaultLabel = status;
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
