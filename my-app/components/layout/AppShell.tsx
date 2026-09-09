"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FEEDBACK_FORM_URL } from "@/lib/constants";

export interface AppShellProps {
  role?: "candidate" | "employer";
  children: React.ReactNode;
}

export function AppShell({ role = "candidate", children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const candidateNavItems = [
    { href: "/candidate", label: "Dashboard", icon: "dashboard" },
    { href: "/candidate/jobs", label: "Jobs", icon: "work" },
    { href: "/candidate/applications", label: "My Applications", icon: "group" },
    { href: "/candidate/profile", label: "Profile", icon: "account_circle" },
  ];

  const employerNavItems = [
    { href: "/employer", label: "Dashboard", icon: "dashboard" },
    { href: "/employer/jobs", label: "Jobs", icon: "work" },
    { href: "/employer/jobs/new", label: "Post a Job", icon: "add_circle" },
    { href: "/employer/settings", label: "Settings", icon: "settings" },
  ];

  const navItems = role === "employer" ? employerNavItems : candidateNavItems;

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue to redirect
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] text-[#121c28] font-sans antialiased">
      {/* Desktop Fixed Sidebar (w-60 / 240px) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-[#f8f9ff] border-r border-[#c7c4d8] p-4 z-40">
        {/* Branding */}
        <div className="mb-6 flex flex-col items-center justify-center pt-2 pb-4 text-center">
          <div className="w-11 h-11 rounded-xl bg-[#3525cd] text-white flex items-center justify-center font-bold text-lg mb-2.5 shadow-sm">
            AT
          </div>
          <span className="font-bold text-base text-[#121c28] tracking-tight">
            Apna Tracker
          </span>
          <span className="text-[11px] text-[#575e70] font-medium mt-0.5">
            Recruitment Suite
          </span>
        </div>

        {/* Action Button */}
        {role === "employer" ? (
          <Link
            href="/employer/jobs/new"
            className="w-full bg-[#3525cd] text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#4f46e5] transition-colors shadow-xs mb-4"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Post a Job
          </Link>
        ) : (
          <Link
            href="/candidate/jobs"
            className="w-full bg-[#3525cd] text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#4f46e5] transition-colors shadow-xs mb-4"
          >
            <span className="material-symbols-outlined text-[16px]">search</span>
            Browse Jobs
          </Link>
        )}

        {/* Nav Links */}
        <nav className="flex-1 flex flex-col space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#d9dff5] text-[#121c28] font-bold shadow-xs"
                    : "text-[#464555] hover:bg-[#dfe9fa] hover:text-[#121c28]"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    isActive ? "text-[#3525cd]" : "text-[#777587]"
                  }`}
                  data-weight={isActive ? "fill" : undefined}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Navigation */}
        <div className="mt-auto border-t border-[#c7c4d8] pt-3 space-y-1">
          <a
            href={FEEDBACK_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#3525cd] bg-[#e5eeff] hover:bg-[#d9dff5] border border-[#3525cd]/20 transition-all mb-1"
          >
            <span className="material-symbols-outlined text-[18px]">rate_review</span>
            <span>Feedback Form</span>
            <span className="material-symbols-outlined text-[13px] ml-auto text-[#3525cd]/70">open_in_new</span>
          </a>

          <Link
            href="/role-selection"
            className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-[#464555] hover:bg-[#dfe9fa] hover:text-[#121c28] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-[#777587]">
              swap_horiz
            </span>
            <span>Switch Role</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
            <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile Top Navigation */}
        <header className="w-full top-0 sticky z-30 bg-white border-b border-[#c7c4d8] shadow-xs md:hidden">
          <div className="flex justify-between items-center h-14 px-4">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 -ml-1.5 rounded-lg text-[#464555] hover:bg-[#f1f5f9]"
                aria-label="Toggle navigation menu"
              >
                <span className="material-symbols-outlined text-[22px]">
                  {mobileMenuOpen ? "close" : "menu"}
                </span>
              </button>
              <span className="font-bold text-base text-[#3525cd] tracking-tight">
                Apna Tracker
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={FEEDBACK_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-[#3525cd] hover:bg-[#e5eeff]"
                title="Give Feedback"
              >
                <span className="material-symbols-outlined text-[20px]">rate_review</span>
              </a>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#e5eeff] text-[#3525cd] capitalize">
                {role}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/40"
                title="Log Out"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="p-3 bg-[#f8f9ff] border-t border-[#c7c4d8] space-y-1">
              <a
                href={FEEDBACK_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#3525cd] bg-[#e5eeff] hover:bg-[#d9dff5] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">rate_review</span>
                <span>Give Feedback (Google Form)</span>
                <span className="material-symbols-outlined text-[13px] ml-auto">open_in_new</span>
              </a>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium ${
                      isActive
                        ? "bg-[#d9dff5] text-[#121c28] font-bold"
                        : "text-[#464555] hover:bg-[#dfe9fa]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Mobile Horizontal Tabs */}
          <div className="flex overflow-x-auto px-4 gap-4 border-t border-[#c7c4d8]/50 text-xs">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-2.5 whitespace-nowrap transition-colors border-b-2 font-medium ${
                    isActive
                      ? "text-[#3525cd] border-[#3525cd] font-bold"
                      : "text-[#464555] border-transparent hover:text-[#121c28]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Portal Footer */}
        <footer className="w-full border-t border-[#c7c4d8]/60 bg-[#f8f9ff]/50 py-3 px-4 sm:px-8 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#777587]">
            <span>Apna Tracker • Deployed Preview</span>
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3525cd] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Feedback & Bug Report Form</span>
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
