import React from "react";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon = "search_off",
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-xl border border-[#c7c4d8] shadow-[0_4px_12px_rgba(0,0,0,0.03)] max-w-lg mx-auto w-full my-8">
      <div className="w-14 h-14 rounded-full bg-[#e5eeff] text-[#3525cd] flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>

      <h3 className="text-lg font-bold text-[#121c28] mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-[#464555] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <>
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3525cd] text-white text-xs sm:text-sm font-medium hover:bg-[#4f46e5] transition-colors shadow-xs"
            >
              {actionLabel}
            </a>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3525cd] text-white text-xs sm:text-sm font-medium hover:bg-[#4f46e5] transition-colors shadow-xs"
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
