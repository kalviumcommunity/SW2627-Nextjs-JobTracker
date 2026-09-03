import React from "react";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

export interface ApplicationData {
  id: string;
  status: "pending" | "viewed" | "rejected" | string;
  candidateId?: string;
  jobId: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  job?: {
    id: string;
    title: string;
    employer?: {
      id: string;
      name: string;
      email?: string;
    };
  };
}

export interface ApplicationCardProps {
  application: ApplicationData;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const jobTitle = application.job?.title || "Job Application";
  const companyName = application.job?.employer?.name || "Verified Employer";
  const appliedDate = application.createdAt
    ? getRelativeTimeString(new Date(application.createdAt))
    : "Recently applied";

  // Initials for company avatar
  const initial = companyName.charAt(0).toUpperCase() || "A";

  const isRejected = (application.status || "").toLowerCase() === "rejected";

  return (
    <div
      className={`bg-white border border-[#c7c4d8] rounded-xl p-5 hover:shadow-[0px_4px_12px_rgba(0,0,0,0.03)] hover:border-[#777587] transition-all duration-200 group ${
        isRejected ? "opacity-85" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        {/* Left Side: Avatar + Details */}
        <div className="flex gap-3.5 sm:gap-4 items-start">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#e5eeff] text-[#3525cd] border border-[#3525cd]/15 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
            {initial}
          </div>

          <div>
            <Link
              href={`/candidate/jobs/${application.jobId}`}
              className="text-base sm:text-lg font-bold text-[#121c28] group-hover:text-[#3525cd] transition-colors leading-tight"
            >
              {jobTitle}
            </Link>

            <p className="text-xs sm:text-sm text-[#464555] mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-[#121c28]">{companyName}</span>
              <span>•</span>
              <span>Remote / Hybrid</span>
            </p>

            <div className="flex items-center text-[#777587] text-xs mt-2.5 gap-1">
              <span className="material-symbols-outlined text-[15px]">schedule</span>
              <span>Applied {appliedDate}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Status Badge + Action Link */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#c7c4d8]/40 w-full sm:w-auto">
          <StatusBadge status={application.status} />

          <Link
            href={`/candidate/jobs/${application.jobId}`}
            className="text-xs text-[#3525cd] hover:underline font-medium sm:mt-1.5 hidden sm:inline-block"
          >
            View Job
          </Link>
        </div>
      </div>
    </div>
  );
}

function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  if (diffDays === 1) return "yesterday";
  if (diffDays > 1) return `${diffDays} days ago`;
  if (diffHours >= 1) return `${diffHours}h ago`;
  if (diffMin >= 1) return `${diffMin}m ago`;
  return "just now";
}
