"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ApplicationsTable, EmployerApplication } from "@/components/employer/ApplicationsTable";

async function fetchJobApplicationsPayload(jobId: string): Promise<{
  applications: EmployerApplication[];
  jobTitle: string;
}> {
  const [appsRes, jobRes] = await Promise.all([
    fetch(`/api/applications?jobId=${jobId}`),
    fetch(`/api/jobs/${jobId}`).catch(() => null),
  ]);

  if (!appsRes.ok) {
    if (appsRes.status === 401) {
      throw new Error("Please sign in as an employer to view applicants.");
    }
    throw new Error("Failed to load applicants for this job.");
  }

  const appsData = await appsRes.json();
  let title = "";
  if (jobRes && jobRes.ok) {
    const jobData = await jobRes.json();
    title = jobData.job?.title || jobData.title || "";
  }

  return {
    applications: appsData.applications || [],
    jobTitle: title,
  };
}

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
      const data = await fetchJobApplicationsPayload(jobId);
      setApplications(data.applications);
      if (data.jobTitle) {
        setJobTitle(data.jobTitle);
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
    fetchJobApplicationsPayload(jobId)
      .then((data) => {
        if (!ignore) {
          setApplications(data.applications);
          if (data.jobTitle) {
            setJobTitle(data.jobTitle);
          }
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Unable to connect to the server."
          );
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

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