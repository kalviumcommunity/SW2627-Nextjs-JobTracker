"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FEEDBACK_FORM_URL } from "@/lib/constants";

export default function Footer() {
  const pathname = usePathname();

  // Portal pages (Candidate & Employer) use AppShell which renders its own embedded footer
  const isDashboardRoute =
    pathname.startsWith("/candidate") || pathname.startsWith("/employer");

  if (isDashboardRoute) {
    return null;
  }

  return (
    <footer className="w-full border-t border-[#c7c4d8] bg-white mt-auto">
      {/* Feedback Banner Section */}
      <div className="bg-[#e5eeff]/60 border-b border-[#c7c4d8]/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3525cd] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">rate_review</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#121c28]">
                Peer Review & Classmate Feedback
              </p>
              <p className="text-[11px] text-[#575e70]">
                Testing our deployed platform? Please take 30 seconds to share your experience and report any bugs!
              </p>
            </div>
          </div>
          <a
            href={FEEDBACK_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#3525cd] text-white text-xs font-semibold hover:bg-[#4f46e5] transition-colors shadow-xs shrink-0"
          >
            <span>Open Feedback Form</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#3525cd] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                AT
              </div>
              <span className="font-bold text-sm text-[#121c28] tracking-tight">
                Apna Tracker
              </span>
            </div>
            <p className="text-xs text-[#575e70] max-w-sm leading-relaxed">
              Full-stack job tracking and recruitment suite. High-density dashboards for candidates to manage job searches and employers to streamline hiring.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f1f5f9] text-[#464555] text-[11px] font-medium border border-[#c7c4d8]/60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                Live Deployment
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold text-[#121c28] uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-[#575e70] hover:text-[#3525cd] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/candidate/jobs" className="text-[#575e70] hover:text-[#3525cd] transition-colors">
                  Explore Jobs
                </Link>
              </li>
              <li>
                <Link href="/role-selection" className="text-[#575e70] hover:text-[#3525cd] transition-colors">
                  Choose Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Feedback & Support */}
          <div>
            <h4 className="text-xs font-bold text-[#121c28] uppercase tracking-wider mb-3">
              Evaluation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={FEEDBACK_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#3525cd] font-semibold hover:underline"
                >
                  <span>Google Feedback Form</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </a>
              </li>
              <li>
                <Link href="/login" className="text-[#575e70] hover:text-[#3525cd] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-[#575e70] hover:text-[#3525cd] transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mt-8 pt-4 border-t border-[#c7c4d8]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#777587]">
          <p>© {new Date().getFullYear()} Apna Tracker. Built for SW2627 Next.js Full-Stack Project.</p>
          <div className="flex items-center gap-4">
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3525cd] font-medium hover:underline inline-flex items-center gap-1"
            >
              Share Feedback ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
