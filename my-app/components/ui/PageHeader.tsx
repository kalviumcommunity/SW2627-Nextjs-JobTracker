import React from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: "primary" | "emerald" | "amber";
  children?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  badgeColor = "primary",
  children,
  breadcrumbs,
}: PageHeaderProps) {
  const badgeStyles = {
    primary: "bg-[#eef4ff] text-[#3525cd]",
    emerald: "bg-[#d1fae5] text-[#065f46]",
    amber: "bg-[#ffd2be] text-[#7e3000]",
  }[badgeColor];

  return (
    <div className="space-y-3">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-xs text-[#575e70]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                {crumb.href && !isLast ? (
                  <a
                    href={crumb.href}
                    className="hover:text-[#3525cd] transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className={isLast ? "text-[#121c28] font-semibold" : ""}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {badge && (
            <span
              className={`inline-block px-2.5 py-0.5 font-semibold text-xs rounded-full mb-1.5 ${badgeStyles}`}
            >
              {badge}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#464555] mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {children && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
