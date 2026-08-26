"use client";

import Link from "next/link";

export default function RoleSelection() {
  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6 antialiased bg-[#FAFAFA]">
      <div className="w-full max-w-lg">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#3525cd] text-white font-bold text-xl mb-3 shadow-sm">
            AT
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#3525cd]">
            Choose Your Portal
          </h1>
          <p className="text-sm text-[#464555] mt-1.5 font-medium">
            Select how you would like to use Apna Tracker
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Candidate Card */}
          <Link
            href="/candidate"
            className="group bg-white border border-[#c7c4d8] hover:border-[#3525cd] rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#e5eeff] text-[#3525cd] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[28px]">person</span>
            </div>
            <h2 className="text-lg font-bold text-[#121c28] group-hover:text-[#3525cd] transition-colors">
              Candidate
            </h2>
            <p className="text-xs text-[#464555] mt-2 mb-4 leading-relaxed">
              Explore job opportunities, apply with one click, and track your application statuses in real time.
            </p>
            <span className="mt-auto text-xs font-semibold text-[#3525cd] flex items-center gap-1 group-hover:gap-2 transition-all">
              Go to Candidate Portal <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </Link>

          {/* Employer Card */}
          <Link
            href="/employer"
            className="group bg-white border border-[#c7c4d8] hover:border-[#3525cd] rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#e5eeff] text-[#3525cd] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[28px]">domain</span>
            </div>
            <h2 className="text-lg font-bold text-[#121c28] group-hover:text-[#3525cd] transition-colors">
              Employer
            </h2>
            <p className="text-xs text-[#464555] mt-2 mb-4 leading-relaxed">
              Post job listings, manage applicant pipelines, and batch-update candidate review statuses.
            </p>
            <span className="mt-auto text-xs font-semibold text-[#3525cd] flex items-center gap-1 group-hover:gap-2 transition-all">
              Go to Employer Portal <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-xs font-medium text-[#464555] hover:text-[#3525cd] transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}