"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { ApplicationData } from "@/components/ui/ApplicationCard";
import { JobData } from "@/components/ui/JobCard";
import { normalizeStatus } from "@/lib/status";

export default function CandidateDashboard() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/jobs"),
        ]);

        if (appsRes.ok) {
          const appsData = await appsRes.json();
          if (!ignore) setApplications(appsData.applications || []);
        }

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          if (!ignore) setJobs(jobsData.jobs || []);
        }
      } catch {
        // Silently handle
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  const pendingCount = applications.filter(
    (a) => normalizeStatus(a.status) === "pending"
  ).length;

  const viewedCount = applications.filter(
    (a) => normalizeStatus(a.status) === "viewed"
  ).length;

  return (
    <AppShell role="candidate">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="px-2.5 py-0.5 bg-[#eef4ff] text-[#3525cd] font-semibold text-xs rounded-full">
              Candidate Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28] mt-2">
              Welcome back to Apna Tracker
            </h1>
            <p className="text-xs sm:text-sm text-[#464555] mt-1">
              Explore curated job opportunities and track your application milestones.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/candidate/jobs"
              className="px-4 py-2.5 bg-[#3525cd] text-white text-xs font-semibold rounded-lg hover:bg-[#4f46e5] transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Browse Jobs
            </Link>
            <Link
              href="/candidate/applications"
              className="px-4 py-2.5 bg-white border border-[#c7c4d8] text-[#121c28] text-xs font-semibold rounded-lg hover:bg-[#f8f9ff] hover:border-[#777587] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              My Applications
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Applied"
            value={applications.length}
            subtext="Active applications"
            icon="send"
            iconColor="primary"
            isLoading={isLoading}
          />
          <MetricCard
            label="Pending Review"
            value={pendingCount}
            subtext="Awaiting employer review"
            icon="schedule"
            iconColor="primary"
            isLoading={isLoading}
          />
          <MetricCard
            label="Viewed by Employers"
            value={viewedCount}
            subtext="Employer opened profile"
            icon="visibility"
            iconColor="emerald"
            isLoading={isLoading}
          />
          <MetricCard
            label="Open Listings"
            value={jobs.length}
            subtext="Available positions"
            icon="work"
            iconColor="primary"
            isLoading={isLoading}
          />
        </div>

        {/* Recent Applications Section */}
        <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-[#121c28]">Recent Applications</h2>
              <p className="text-xs text-[#464555] mt-0.5">Your latest submissions and status updates</p>
            </div>
            <Link
              href="/candidate/applications"
              className="text-xs font-semibold text-[#3525cd] hover:underline"
            >
              View All ({applications.length})
            </Link>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-[#777587]">Loading recent applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-[#c7c4d8] rounded-lg">
              <p className="text-xs text-[#464555] mb-2">You haven&apos;t applied to any positions yet.</p>
              <Link
                href="/candidate/jobs"
                className="text-xs font-semibold text-[#3525cd] hover:underline"
              >
                Browse open job listings →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#c7c4d8]/40">
              {applications.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-[#121c28]">
                      {app.job?.title || "Application"}
                    </h3>
                    <p className="text-xs text-[#464555]">
                      {app.job?.employer?.name || "Verified Employer"}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}