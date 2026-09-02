import React from "react";
import Link from "next/link";
import { Button } from "./Button";

export interface JobData {
  id: string;
  title: string;
  employerId?: string;
  createdAt?: string | Date;
  employer?: {
    id: string;
    name: string;
    email?: string;
  };
  _count?: {
    applications: number;
  };
  // Optional extra presentation properties
  location?: string;
  description?: string | null;
  tags?: string[];
  salary?: string;
  isNew?: boolean;
}

export interface JobCardProps {
  job: JobData;
  isApplied?: boolean;
  isApplying?: boolean;
  onApply?: (jobId: string) => void;
}

export function JobCard({
  job,
  isApplied = false,
  isApplying = false,
  onApply,
}: JobCardProps) {
  const companyName = job.employer?.name || "Verified Employer";

  // Derive initial for avatar
  const initial = companyName.charAt(0).toUpperCase() || "J";

  // Derive tags based on title if tags are not provided
  const derivedTags = job.tags || deriveTagsFromTitle(job.title);

  // Derive relative time
  const timeAgo = job.createdAt ? getRelativeTime(new Date(job.createdAt)) : "Recently posted";

  // Derive a pleasant accent color for company avatar
  const avatarBgColors = [
    "bg-[#3525cd] text-white",
    "bg-[#4f46e5] text-white",
    "bg-[#0284c7] text-white",
    "bg-[#0d9488] text-white",
    "bg-[#d97706] text-white",
    "bg-[#7c3aed] text-white",
  ];
  const colorIndex = Math.abs(hashCode(companyName)) % avatarBgColors.length;
  const avatarClass = avatarBgColors[colorIndex];

  return (
    <div className="bg-white border border-[#c7c4d8] rounded-xl p-5 flex flex-col hover:shadow-[0px_4px_12px_rgba(0,0,0,0.03),0px_1px_2px_rgba(0,0,0,0.06)] hover:border-[#777587] transition-all duration-200 group">
      {/* Top row: Avatar + Badge */}
      <div className="flex justify-between items-start mb-3.5">
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm shadow-xs ${avatarClass}`}
        >
          {initial}
        </div>

        {isApplied ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#e5eeff] text-[#3525cd] font-semibold text-xs rounded-full border border-[#3525cd]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd]" />
            Applied
          </span>
        ) : job.isNew !== false ? (
          <span className="px-2 py-0.5 bg-[#eef4ff] text-[#3525cd] font-medium text-xs rounded-full">
            New
          </span>
        ) : null}
      </div>

      {/* Title */}
      <Link
        href={`/candidate/jobs/${job.id}`}
        className="text-base font-bold text-[#121c28] group-hover:text-[#3525cd] transition-colors line-clamp-1 mb-1"
      >
        {job.title}
      </Link>

      {/* Company & Location */}
      <p className="text-xs text-[#464555] mb-3.5 flex items-center gap-1.5">
        <span className="font-medium text-[#121c28]">{companyName}</span>
        <span>•</span>
        <span>{job.location || "Remote / Hybrid"}</span>
      </p>

      {/* Tags */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {derivedTags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-[#d9e3f4]/70 text-[#464555] font-mono text-[11px] rounded-md font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="mt-auto flex justify-between items-center pt-3 border-t border-[#c7c4d8]/40 text-xs">
        <div className="flex flex-col">
          <span className="font-semibold text-[#121c28]">
            {job.salary || "Competitive Salary"}
          </span>
          <span className="text-[11px] text-[#777587]">{timeAgo}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/candidate/jobs/${job.id}`}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#464555] hover:text-[#121c28] hover:bg-[#f1f5f9] transition-colors"
          >
            Details
          </Link>

          {isApplied ? (
            <Link
              href="/candidate/applications"
              className="px-3 py-1.5 rounded-lg bg-[#e5eeff] text-[#3525cd] text-xs font-semibold hover:bg-[#dfe9fa] transition-colors"
            >
              Track Status
            </Link>
          ) : (
            <Button
              size="sm"
              variant="primary"
              isLoading={isApplying}
              onClick={() => onApply && onApply(job.id)}
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function deriveTagsFromTitle(title: string): string[] {
  const lower = title.toLowerCase();
  const tags: string[] = [];

  if (lower.includes("frontend") || lower.includes("front-end")) tags.push("React", "TypeScript", "Tailwind");
  else if (lower.includes("backend") || lower.includes("back-end")) tags.push("Node.js", "PostgreSQL", "API");
  else if (lower.includes("fullstack") || lower.includes("full-stack") || lower.includes("software")) tags.push("Next.js", "Node.js", "Prisma");
  else if (lower.includes("designer") || lower.includes("ui") || lower.includes("ux")) tags.push("Figma", "UI/UX", "Design");
  else if (lower.includes("product") || lower.includes("manager")) tags.push("Agile", "B2B", "Strategy");
  else if (lower.includes("data") || lower.includes("analytics")) tags.push("Python", "SQL", "Analysis");
  else if (lower.includes("devops") || lower.includes("cloud")) tags.push("Docker", "AWS", "CI/CD");
  else tags.push("Full-time", "Engineering", "Remote");

  return tags.slice(0, 3);
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) return `${Math.floor(diffDays / 30)}mo ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "Just now";
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
