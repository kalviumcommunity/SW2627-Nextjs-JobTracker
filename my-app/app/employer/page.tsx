"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/ui/MetricCard";
import { ApplicationsTable, EmployerApplication } from "@/components/employer/ApplicationsTable";

interface JobItem {
  id: string;
  title: string;
  createdAt: string;
  _count?: {
    applications: number;
  };
}

export default function EmployerDashboard() {
  const [applications, setApplications] = useState<EmployerApplication[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [appsRes, jobsRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/jobs"),
      ]);

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.applications || []);
      } else if (appsRes.status === 401) {
        setError("Please log in to your employer account.");
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/jobs"),
        ]);

        if (appsRes.ok) {
          const appsData = await appsRes.json();
          if (!ignore) setApplications(appsData.applications || []);
        } else if (appsRes.status === 401) {
          if (!ignore) setError("Please log in to your employer account.");
        }

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          if (!ignore) setJobs(jobsData.jobs || []);
        }
      } catch {
        if (!ignore) setError("Unable to connect to server. Please try again.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Compute metrics
  const { pendingCount, viewedCount, rejectedCount } = useMemo(() => {
    let pending = 0;
    let viewed = 0;
    let rejected = 0;

    applications.forEach((a) => {
      const s = (a.status || "").toLowerCase();
      if (s === "viewed" || s === "reviewing" || s === "interviewed") viewed++;
      else if (s === "rejected" || s === "not selected") rejected++;
      else pending++;
    });

    return { pendingCount: pending, viewedCount: viewed, rejectedCount: rejected };
  }, [applications]);

  return (
    <AppShell role="employer">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="px-2.5 py-0.5 bg-[#eef4ff] text-[#3525cd] font-semibold text-xs rounded-full">
              Employer Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28] mt-2">
              Recruitment Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#464555] mt-1">
              Review applicant submissions, update statuses, and post new opportunities.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/employer/jobs/new"
              className="px-4 py-2.5 bg-[#3525cd] text-white text-xs font-semibold rounded-lg hover:bg-[#4f46e5] transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Post a New Job
            </Link>
            <Link
              href="/employer/jobs"
              className="px-4 py-2.5 bg-white border border-[#c7c4d8] text-[#121c28] text-xs font-semibold rounded-lg hover:bg-[#f8f9ff] hover:border-[#777587] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">work</span>
              Manage Jobs ({jobs.length})
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Active Job Postings"
            value={jobs.length}
            subtext="Live listings attracting talent"
            icon="work"
            iconColor="primary"
            isLoading={isLoading}
          />
          <MetricCard
            label="Total Applicants"
            value={applications.length}
            subtext="Across all posted jobs"
            icon="group"
            iconColor="primary"
            isLoading={isLoading}
          />
          <MetricCard
            label="Pending Review"
            value={pendingCount}
            subtext="Awaiting your evaluation"
            icon="schedule"
            iconColor="primary"
            isLoading={isLoading}
          />
          <MetricCard
            label="Reviewed / Actioned"
            value={viewedCount + rejectedCount}
            subtext={`${viewedCount} Viewed • ${rejectedCount} Rejected`}
            icon="done_all"
            iconColor="emerald"
            isLoading={isLoading}
          />
        </div>

        {/* Applicant Management Table */}
        <ApplicationsTable
          applications={applications}
          isLoading={isLoading}
          error={error}
          onRefresh={loadData}
        />
      </div>
    </AppShell>
  );
}