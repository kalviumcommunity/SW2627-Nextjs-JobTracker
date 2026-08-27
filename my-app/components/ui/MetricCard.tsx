import React from "react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: string;
  iconColor?: "primary" | "emerald" | "amber" | "rose";
  isLoading?: boolean;
}

export function MetricCard({
  label,
  value,
  subtext,
  icon,
  iconColor = "primary",
  isLoading = false,
}: MetricCardProps) {
  const iconStyles = {
    primary: "bg-[#e5eeff] text-[#3525cd]",
    emerald: "bg-[#d1fae5] text-[#065f46]",
    amber: "bg-[#ffd2be] text-[#7e3000]",
    rose: "bg-[#ffdad6] text-[#ba1a1a]",
  }[iconColor];

  const valueStyles = {
    primary: "text-[#3525cd]",
    emerald: "text-[#065f46]",
    amber: "text-[#7e3000]",
    rose: "text-[#ba1a1a]",
  }[iconColor];

  return (
    <div className="bg-white border border-[#c7c4d8] rounded-xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex justify-between items-start">
        <span className="text-xs font-medium text-[#464555]">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconStyles}`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
      </div>

      <p className={`text-2xl font-bold mt-3 ${iconColor === "primary" ? "text-[#121c28]" : valueStyles}`}>
        {isLoading ? "—" : value}
      </p>

      {subtext && (
        <span className="text-[11px] text-[#777587] mt-1 block truncate">
          {subtext}
        </span>
      )}
    </div>
  );
}
