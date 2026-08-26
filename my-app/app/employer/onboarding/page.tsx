"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export default function EmployerOnboarding() {
  return (
    <AppShell role="employer">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#3525cd] text-white font-bold text-xl mb-3">
            AT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28]">
            Employer Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-[#464555] mt-1">
            Set up your organization workspace and post your first role.
          </p>
        </div>

        <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-4 text-center">
          <p className="text-xs sm:text-sm text-[#464555]">
            Your employer account is active. Start posting jobs to attract candidate submissions.
          </p>
          <div className="pt-2">
            <Link
              href="/employer/jobs/new"
              className="inline-flex px-6 py-2.5 bg-[#3525cd] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#4f46e5] transition-colors"
            >
              Post Your First Job
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}