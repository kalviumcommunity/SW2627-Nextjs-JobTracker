import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      icon,
      error,
      helperText,
      rightElement,
      id,
      className = "",
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <div className="flex justify-between items-center">
            <label
              htmlFor={inputId}
              className="block text-xs font-medium text-[#121c28]"
            >
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {rightElement}
          </div>
        )}

        <div className="relative rounded-lg">
          {icon && (
            <div className="absolute inset-y-0 left-0 w-10 pl-3 flex items-center pointer-events-none text-[#777587] z-10">
              <span className="material-symbols-outlined text-[18px] select-none">{icon}</span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            className={`block w-full rounded-lg border bg-white text-[#121c28] text-sm placeholder:text-[#9CA3AF] transition-colors py-2.5 ${
              icon ? "pl-10 pr-3.5" : "px-3.5"
            } ${
              error
                ? "border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]/10"
                : "border-[#c7c4d8] hover:border-[#777587] focus:border-[#3525cd] focus:ring-4 focus:ring-[#3525cd]/10 focus:outline-none"
            } ${className}`}
            {...props}
          />
        </div>

        {error ? (
          <p className="text-xs text-[#ba1a1a] flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-[#464555] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
