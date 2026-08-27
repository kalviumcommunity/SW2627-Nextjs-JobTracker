import React from "react";

export interface AlertProps {
  type?: "error" | "success" | "info" | "warning";
  message: string;
  className?: string;
  onClose?: () => void;
}

export function Alert({
  type = "error",
  message,
  className = "",
  onClose,
}: AlertProps) {
  if (!message) return null;

  const styles = {
    error: "bg-[#ffdad6]/70 border-[#ba1a1a]/30 text-[#93000a]",
    success: "bg-[#d1fae5] border-[#065f46]/30 text-[#065f46]",
    info: "bg-[#e5eeff] border-[#3525cd]/30 text-[#3525cd]",
    warning: "bg-[#ffd2be]/70 border-[#a44100]/30 text-[#7e3000]",
  }[type];

  const icons = {
    error: "error",
    success: "check_circle",
    info: "info",
    warning: "warning",
  }[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs sm:text-sm font-medium transition-all ${styles} ${className}`}
    >
      <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
        {icons}
      </span>
      <div className="flex-1 leading-snug">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded"
          aria-label="Dismiss alert"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  );
}
