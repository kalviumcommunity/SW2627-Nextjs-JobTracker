"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/login", label: "Login" },
    { href: "/signup", label: "Sign Up" },
    { href: "/candidate", label: "Candidate Hub" },
    { href: "/candidate/jobs", label: "Jobs" },
    { href: "/candidate/applications", label: "My Applications" },
    { href: "/employer", label: "Employer Hub" },
    { href: "/employer/jobs", label: "Manage Jobs" },
    { href: "/employer/jobs/new", label: "Post Job" },
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
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
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

        {/* Demo Quick Jump */}
        <div className="flex items-center gap-2">
          <Link
            href="/candidate/jobs"
            className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-[#c7c4d8] bg-white px-2.5 py-1 text-xs font-medium text-[#121c28] hover:bg-[#f8f9ff] hover:border-[#777587] transition-colors"
          >
            <span className="material-symbols-outlined text-[15px] text-[#3525cd]">work</span>
            Find Jobs
          </Link>
          <Link
            href="/employer/jobs/new"
            className="inline-flex items-center gap-1 rounded-lg bg-[#3525cd] px-3 py-1 text-xs font-medium text-white hover:bg-[#4f46e5] shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            Post a Job
          </Link>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-1.5 gap-1 border-t border-[#c7c4d8]/40 bg-[#f8f9ff] text-xs">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors ${
                isActive
                  ? "bg-[#e5eeff] text-[#3525cd] font-semibold"
                  : "text-[#464555] hover:text-[#121c28]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}