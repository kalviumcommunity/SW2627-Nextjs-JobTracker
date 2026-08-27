import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e5eeff] text-[#3525cd] border border-[#3525cd]/20 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-pulse" />
          Production-Ready Recruitment Platform
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#121c28]">
          Streamline Your Hiring & Job Tracking with{" "}
          <span className="text-[#3525cd]">Apna Tracker</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#464555] max-w-2xl mx-auto leading-relaxed">
          The high-density SaaS platform for candidates to discover curated roles and employers to manage applicant pipelines with real-time status updates.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-[#3525cd] text-white font-medium text-sm hover:bg-[#4f46e5] shadow-sm transition-all inline-flex items-center gap-2"
          >
            Sign In to Account
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg bg-white border border-[#c7c4d8] text-[#121c28] font-medium text-sm hover:bg-[#f8f9ff] hover:border-[#777587] transition-all inline-flex items-center gap-2"
          >
            Create Free Account
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 text-left max-w-2xl mx-auto">
          <Link
            href="/candidate/jobs"
            className="p-5 rounded-xl bg-white border border-[#c7c4d8] hover:border-[#3525cd] transition-all group shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
          >
            <div className="w-10 h-10 rounded-lg bg-[#e5eeff] text-[#3525cd] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">work</span>
            </div>
            <h3 className="font-semibold text-sm text-[#121c28] group-hover:text-[#3525cd] transition-colors">
              For Candidates
            </h3>
            <p className="text-xs text-[#464555] mt-1">
              Browse listings, submit applications, and track your review status from Pending to Viewed in real time.
            </p>
          </Link>

          <Link
            href="/employer"
            className="p-5 rounded-xl bg-white border border-[#c7c4d8] hover:border-[#3525cd] transition-all group shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
          >
            <div className="w-10 h-10 rounded-lg bg-[#e5eeff] text-[#3525cd] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">domain</span>
            </div>
            <h3 className="font-semibold text-sm text-[#121c28] group-hover:text-[#3525cd] transition-colors">
              For Employers
            </h3>
            <p className="text-xs text-[#464555] mt-1">
              Post new job openings, inspect candidate submissions, and perform batch status updates instantly.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
