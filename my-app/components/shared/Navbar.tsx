"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Hide the marketing navbar on candidate and employer portal routes
  // (Portal pages use AppShell with its own dedicated sidebar and top bar)
  const isDashboardRoute =
    pathname.startsWith("/candidate") || pathname.startsWith("/employer");

  if (isDashboardRoute) {
    return null;
  }

  const links = [
    { href: "/", label: "Home" },
    { href: "/login", label: "Sign In" },
    { href: "/signup", label: "Sign Up" },
    { href: "/role-selection", label: "Portals" },
    { href: "/candidate/jobs", label: "Explore Jobs" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#c7c4d8]/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3525cd] text-white font-bold text-sm shadow-xs transition-transform group-hover:scale-105">
            AT
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-[#121c28] tracking-tight leading-tight">
              Apna Tracker
            </span>
            <span className="text-[10px] text-[#575e70] font-medium leading-none">
              Recruitment Suite
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden sm:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#e5eeff] text-[#3525cd] font-semibold"
                    : "text-[#464555] hover:bg-[#f1f5f9] hover:text-[#121c28]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-lg border border-[#c7c4d8] bg-white text-xs font-medium text-[#121c28] hover:bg-[#f8f9ff] hover:border-[#777587] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1 rounded-lg bg-[#3525cd] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4f46e5] shadow-xs transition-colors"
          >
            Get Started
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </header>
  );
}