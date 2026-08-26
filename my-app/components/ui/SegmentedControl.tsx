import React from "react";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
  icon?: string;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = "",
  ariaLabel = "Select option",
}: SegmentedControlProps<T>) {
  return (
    <div
      aria-label={ariaLabel}
      role="group"
      className={`flex p-1 bg-[#dfe9fa] rounded-lg border border-[#c7c4d8]/50 ${className}`}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20 ${
              isActive
                ? "bg-white text-[#121c28] shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-[#c7c4d8] font-semibold"
                : "text-[#464555] hover:text-[#121c28] hover:bg-white/50 border border-transparent"
            }`}
          >
            {option.icon && (
              <span
                className={`material-symbols-outlined text-[16px] ${
                  isActive ? "text-[#3525cd]" : "text-[#777587]"
                }`}
              >
                {option.icon}
              </span>
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
