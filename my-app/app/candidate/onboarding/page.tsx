"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export default function CandidateOnboarding() {
  return (
    <AppShell role="candidate">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#3525cd] text-white font-bold text-xl mb-3">
            AT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28]">
            Candidate Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-[#464555] mt-1">
            Complete your profile to unlock one-click job applications.
          </p>
        </div>

        <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-4 text-center">
          <p className="text-xs sm:text-sm text-[#464555]">
            Your account is set up and ready to browse job listings.
          </p>
          <div className="pt-2">
            <Link
              href="/candidate/jobs"
              className="inline-flex px-6 py-2.5 bg-[#3525cd] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#4f46e5] transition-colors"
            >
              Explore Job Listings
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}