"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/ui/MetricCard";
import { ApplicationsTable, EmployerApplication } from "@/components/employer/ApplicationsTable";
import { normalizeStatus } from "@/lib/status";

interface JobItem {
  id: string;
  title: string;
  employerId: string;
  createdAt: string;
  _count?: {
    applications: number;
  };
}

interface EmployerStatsResponse {
  totalJobs?: number;
  totalApplications?: number;
  statusBreakdown?: {
    pending: number;
    viewed: number;
    rejected: number;
  };
  pendingApplications?: number;
  viewedApplications?: number;
  rejectedApplications?: number;
}

interface DashboardPayload {
  applications?: EmployerApplication[];
  jobs?: JobItem[];
  stats?: EmployerStatsResponse | null;
  error?: string;
}

// Single centralized helper to fetch employer dashboard data and stats
async function fetchDashboardPayload(): Promise<DashboardPayload> {
  const [appsRes, jobsRes] = await Promise.all([
    fetch("/api/applications"),
    fetch("/api/jobs?limit=100"),
  ]);

  if (appsRes.status === 401 || jobsRes.status === 401) {
    return { error: "Please log in to your employer account." };
  }

  if (!appsRes.ok || !jobsRes.ok) {
    throw new Error("Failed to load recruitment dashboard data.");
  }

  const [appsData, jobsData] = await Promise.all([
    appsRes.json(),
    jobsRes.json(),
  ]);

  const fetchedApps: EmployerApplication[] = appsData.applications || [];
  const fetchedJobs: JobItem[] = jobsData.jobs || [];

  let fetchedStats: EmployerStatsResponse | null = null;
  const employerId = fetchedJobs[0]?.employerId;

  if (employerId) {
    try {
      const statsRes = await fetch(`/api/employer/${employerId}/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        fetchedStats = statsData.stats || statsData;
      }
    } catch {
      // Graceful fallback to computed stats
    }
  }

  return {
    applications: fetchedApps,
    jobs: fetchedJobs,
    stats: fetchedStats,
  };
}

export default function EmployerDashboard() {
  const [applications, setApplications] = useState<EmployerApplication[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [apiStats, setApiStats] = useState<EmployerStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    fetchDashboardPayload()
      .then((data) => {
        if (ignore) return;
        if (data.error) {
          setError(data.error);
        } else {
          if (data.applications) setApplications(data.applications);
          if (data.jobs) setJobs(data.jobs);
          if (data.stats) setApiStats(data.stats);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Unable to connect to server. Please try again."
          );
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await fetchDashboardPayload();
      if (data.error) {
        setError(data.error);
      } else {
        if (data.applications) setApplications(data.applications);
        if (data.jobs) setJobs(data.jobs);
        if (data.stats) setApiStats(data.stats);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Consolidated statistics combining API payload and live records
  const stats = useMemo(() => {
    if (apiStats) {
      return {
        totalJobs: apiStats.totalJobs ?? jobs.length,
        totalApplications: apiStats.totalApplications ?? applications.length,
        pendingApplications:
          apiStats.statusBreakdown?.pending ?? apiStats.pendingApplications ?? 0,
        viewedApplications:
          apiStats.statusBreakdown?.viewed ?? apiStats.viewedApplications ?? 0,
        rejectedApplications:
          apiStats.statusBreakdown?.rejected ?? apiStats.rejectedApplications ?? 0,
      };
    }

    let pending = 0;
    let viewed = 0;
    let rejected = 0;

    for (const app of applications) {
      const s = normalizeStatus(app.status);
      if (s === "viewed") viewed++;
      else if (s === "rejected") rejected++;
      else pending++;
    }

    return {
      totalJobs: jobs.length,
      totalApplications: applications.length,
      pendingApplications: pending,
      viewedApplications: viewed,
      rejectedApplications: rejected,
    };
  }, [apiStats, applications, jobs]);

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
            value={stats.totalJobs}
            subtext="Live listings attracting talent"
            icon="work"
            iconColor="primary"
            isLoading={isLoading}
          />
          <MetricCard
            label="Total Applications"
            value={stats.totalApplications}
            subtext="Across all posted jobs"
            icon="group"
            iconColor="primary"
            isLoading={isLoading}
          />
          <MetricCard
            label="Pending Applications"
            value={stats.pendingApplications}
            subtext="Awaiting your evaluation"
            icon="schedule"
            iconColor="amber"
            isLoading={isLoading}
          />
          <MetricCard
            label="Viewed Applications"
            value={stats.viewedApplications}
            subtext="Reviewed by hiring team"
            icon="visibility"
            iconColor="emerald"
            isLoading={isLoading}
          />
          <MetricCard
            label="Rejected Applications"
            value={stats.rejectedApplications}
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