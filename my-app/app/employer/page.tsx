"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/ui/MetricCard";
import { ApplicationsTable, EmployerApplication } from "@/components/employer/ApplicationsTable";

interface JobItem {
  id: string;
  title: string;
  employerId: string;
  createdAt: string;
  _count?: {
    applications: number;
  };
}

interface EmployerStatsData {
  totalJobs?: number;
  totalJobsPosted?: number;
  totalApplications?: number;
  pendingApplications?: number;
  pendingCount?: number;
  viewedApplications?: number;
  viewedCount?: number;
  rejectedApplications?: number;
  rejectedCount?: number;
}

export default function EmployerDashboard() {
  const [applications, setApplications] = useState<EmployerApplication[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [apiStats, setApiStats] = useState<EmployerStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [appsRes, jobsRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/jobs"),
      ]);

      let fetchedApps: EmployerApplication[] = [];
      let fetchedJobs: JobItem[] = [];

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        fetchedApps = appsData.applications || [];
        setApplications(fetchedApps);
      } else if (appsRes.status === 401) {
        setError("Please log in to your employer account.");
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        fetchedJobs = jobsData.jobs || [];
        setJobs(fetchedJobs);
      }

      // If an employerId is available, attempt to fetch backend stats API
      const employerId = fetchedJobs[0]?.employerId;
      if (employerId) {
        try {
          const statsRes = await fetch(`/api/employer/${employerId}/stats`);
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setApiStats(statsData.stats || statsData);
          }
        } catch {
          // Fallback to computed statistics from authenticated application/job records
        }
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/jobs"),
        ]);

        let fetchedApps: EmployerApplication[] = [];
        let fetchedJobs: JobItem[] = [];

        if (appsRes.ok) {
          const appsData = await appsRes.json();
          fetchedApps = appsData.applications || [];
          if (!ignore) setApplications(fetchedApps);
        } else if (appsRes.status === 401) {
          if (!ignore) setError("Please log in to your employer account.");
        }

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          fetchedJobs = jobsData.jobs || [];
          if (!ignore) setJobs(fetchedJobs);
        }

        const employerId = fetchedJobs[0]?.employerId;
        if (employerId) {
          try {
            const statsRes = await fetch(`/api/employer/${employerId}/stats`);
            if (statsRes.ok) {
              const statsData = await statsRes.json();
              if (!ignore) setApiStats(statsData.stats || statsData);
            }
          } catch {
            // Silently fallback
          }
        }
      } catch {
        if (!ignore) setError("Unable to connect to server. Please try again.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setError("");
    fetchData();
  }, [fetchData]);

  // Compute stats from live records as primary / fallback
  const computedStats = useMemo(() => {
    let pending = 0;
    let viewed = 0;
    let rejected = 0;

    applications.forEach((a) => {
      const s = (a.status || "").toLowerCase();
      if (s === "viewed" || s === "reviewing" || s === "interviewed") viewed++;
      else if (s === "rejected" || s === "not selected") rejected++;
      else pending++;
    });

    return {
      totalJobs: jobs.length,
      totalApplications: applications.length,
      pendingApplications: pending,
      viewedApplications: viewed,
      rejectedApplications: rejected,
    };
  }, [applications, jobs]);

  // Resolved statistics prioritizing backend API payload when present
  const totalJobsCount =
    apiStats?.totalJobsPosted ?? apiStats?.totalJobs ?? computedStats.totalJobs;
  const totalAppsCount =
    apiStats?.totalApplications ?? computedStats.totalApplications;
  const pendingAppsCount =
    apiStats?.pendingApplications ?? apiStats?.pendingCount ?? computedStats.pendingApplications;
  const viewedAppsCount =
    apiStats?.viewedApplications ?? apiStats?.viewedCount ?? computedStats.viewedApplications;
  const rejectedAppsCount =
    apiStats?.rejectedApplications ?? apiStats?.rejectedCount ?? computedStats.rejectedApplications;

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

        {/* 5 Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricCard
            label="Total Jobs Posted"
            value={totalJobsCount}
            subtext="Live listings attracting talent"
            icon="work"
            iconColor="primary"
            isLoading={isLoading}
          />
          <MetricCard
            label="Total Applications"
            value={totalAppsCount}
            subtext="Across all posted jobs"
            icon="group"
            iconColor="primary"
            isLoading={isLoading}
          />
          <MetricCard
            label="Pending Applications"
            value={pendingAppsCount}
            subtext="Awaiting your evaluation"
            icon="schedule"
            iconColor="amber"
            isLoading={isLoading}
          />
          <MetricCard
            label="Viewed Applications"
            value={viewedAppsCount}
            subtext="Reviewed by hiring team"
            icon="visibility"
            iconColor="emerald"
            isLoading={isLoading}
          />
          <MetricCard
            label="Rejected Applications"
            value={rejectedAppsCount}
            subtext="Not moved forward"
            icon="cancel"
            iconColor="rose"
            isLoading={isLoading}
          />
        </div>

        {/* Applicant Management Table */}
        <ApplicationsTable
          applications={applications}
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefresh}
        />
      </div>
    </AppShell>
  );
}