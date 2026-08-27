import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  iconPosition = "left",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "py-1.5 px-3 text-xs",
    md: "py-2.5 px-4 text-xs sm:text-sm",
    lg: "py-3 px-6 text-sm sm:text-base",
  }[size];

  const variantClasses = {
    primary:
      "bg-[#3525cd] text-white hover:bg-[#4f46e5] focus:ring-4 focus:ring-[#3525cd]/15 shadow-xs border border-transparent",
    secondary:
      "bg-white text-[#121c28] border border-[#c7c4d8] hover:bg-[#f8f9ff] hover:border-[#777587] focus:ring-4 focus:ring-[#575e70]/10 shadow-xs",
    outline:
      "bg-transparent text-[#3525cd] border border-[#3525cd]/30 hover:bg-[#3525cd]/5 focus:ring-4 focus:ring-[#3525cd]/10",
    ghost:
      "bg-transparent text-[#464555] hover:text-[#121c28] hover:bg-[#f1f5f9] border border-transparent",
    danger:
      "bg-[#ba1a1a] text-white hover:bg-[#93000a] focus:ring-4 focus:ring-[#ba1a1a]/15 shadow-xs border border-transparent",
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.99] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 gap-2 ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          )}
        </>
      )}
    </button>
  );
}
