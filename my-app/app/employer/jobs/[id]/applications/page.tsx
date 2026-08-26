"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ApplicationsTable, EmployerApplication } from "@/components/employer/ApplicationsTable";

export default function JobApplicants({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;

  const [applications, setApplications] = useState<EmployerApplication[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      // Fetch applications specifically for this job
      const response = await fetch(`/api/applications?jobId=${jobId}`);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in as an employer to view applicants.");
        }
        throw new Error("Failed to load applicants for this job.");
      }

      const data = await response.json();
      const apps = data.applications || [];
      setApplications(apps);

      if (apps.length > 0 && apps[0].job?.title) {
        setJobTitle(apps[0].job.title);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to the server."
      );
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const response = await fetch(`/api/applications?jobId=${jobId}`);
        if (!response.ok) {
          if (response.status === 401) {
            if (!ignore) setError("Please sign in as an employer to view applicants.");
            return;
          }
          if (!ignore) setError("Failed to load applicants for this job.");
          return;
        }
        const data = await response.json();
        if (!ignore) {
          const apps = data.applications || [];
          setApplications(apps);
          if (apps.length > 0 && apps[0].job?.title) {
            setJobTitle(apps[0].job.title);
          }
        }
      } catch {
        if (!ignore) setError("Unable to connect to the server.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [jobId]);

  return (
    <AppShell role="employer">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#575e70]">
          <Link href="/employer" className="hover:text-[#3525cd]">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/employer/jobs" className="hover:text-[#3525cd]">
            Jobs
          </Link>
          <span>/</span>
          <span className="text-[#121c28] font-semibold">
            {jobTitle || "Job Applicants"}
          </span>
        </nav>

        {/* Applications Table Component */}
        <ApplicationsTable
          applications={applications}
          isLoading={isLoading}
          error={error}
          onRefresh={loadApplications}
          jobTitle={jobTitle}
        />
      </div>
    </AppShell>
  );
}