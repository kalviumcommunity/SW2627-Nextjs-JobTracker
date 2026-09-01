"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";

interface EmployerJobItem {
  id: string;
  title: string;
  location?: string | null;
  employerId: string;
  createdAt: string | Date;
  employer?: {
    id: string;
    name: string;
  };
  _count?: {
    applications: number;
  };
}

interface FetchJobsResult {
  jobs?: EmployerJobItem[];
  error?: string;
}

async function fetchEmployerJobsPayload(): Promise<FetchJobsResult> {
  const authRes = await fetch("/api/applications");
  const authData = await authRes.json().catch(() => ({}));
  const sampleJobEmployerId = authData.applications?.[0]?.job?.employer?.id;

  let response;
  if (sampleJobEmployerId) {
    response = await fetch(`/api/employer/${sampleJobEmployerId}/jobs`);
  }

  if (!response || !response.ok) {
    response = await fetch("/api/jobs");
  }

  if (!response.ok) {
    if (response.status === 401) {
      return { error: "Please log in as an employer to view your job postings." };
    }
    throw new Error("Failed to load your job postings.");
  }

  const data = await response.json();
  return { jobs: data.jobs || [] };
}

export default function ManageJobs() {
  const [jobs, setJobs] = useState<EmployerJobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    fetchEmployerJobsPayload()
      .then((res) => {
        if (ignore) return;
        if (res.error) {
          setError(res.error);
        } else if (res.jobs) {
          setJobs(res.jobs);
        }
      })
      .catch((err) => {
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
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetchEmployerJobsPayload();
      if (res.error) {
        setError(res.error);
      } else if (res.jobs) {
        setJobs(res.jobs);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to the server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell role="employer">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28]">
              Manage Job Postings
            </h1>
            <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
              Review your active job openings and track applicant volume.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2 border border-[#c7c4d8] rounded-lg bg-white hover:bg-[#f8f9ff] text-[#464555] hover:text-[#121c28] transition-colors"
              title="Refresh job postings"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </button>

            <Link
              href="/employer/jobs/new"
              className="px-4 py-2.5 bg-[#3525cd] text-white text-xs font-semibold rounded-lg hover:bg-[#4f46e5] transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Post a New Job
            </Link>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError("")} />}

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#c7c4d8] rounded-xl p-5 animate-pulse flex flex-col justify-between h-48"
              >
                <div className="space-y-2">
                  <div className="w-20 h-4 bg-[#dfe9fa] rounded-full" />
                  <div className="w-48 h-5 bg-[#dfe9fa] rounded" />
                  <div className="w-32 h-3.5 bg-[#dfe9fa] rounded" />
                </div>
                <div className="w-full h-8 bg-[#dfe9fa] rounded-lg mt-auto" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon="work_outline"
            title="No Jobs Posted Yet"
            description="Create your first job listing to start receiving candidate applications."
            actionLabel="Post a Job Now"
            actionHref="/employer/jobs/new"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const appCount = job._count?.applications ?? 0;
              const datePosted = job.createdAt
                ? new Date(job.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recently";

              return (
                <div
                  key={job.id}
                  className="bg-white border border-[#c7c4d8] rounded-xl p-5 flex flex-col hover:shadow-[0px_4px_12px_rgba(0,0,0,0.03)] hover:border-[#777587] transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#eef4ff] text-[#3525cd] text-xs font-semibold">
                      Active
                    </span>
                    <span className="text-[11px] text-[#777587]">Posted {datePosted}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#121c28] mb-1 line-clamp-1">
                    {job.title}
                  </h3>

                  <p className="text-xs text-[#464555] mb-4">
                    {job.employer?.name || "Your Company"} • {job.location || "Remote / Hybrid"}
                  </p>

                  <div className="mt-auto pt-3 border-t border-[#c7c4d8]/40 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs text-[#464555]">
                      <span className="material-symbols-outlined text-[16px] text-[#3525cd]">
                        group
                      </span>
                      <span className="font-semibold text-[#121c28]">{appCount}</span> applicant(s)
                    </div>

                    <Link
                      href={`/employer/jobs/${job.id}/applications`}
                      className="px-3 py-1.5 rounded-lg bg-[#3525cd] text-white text-xs font-semibold hover:bg-[#4f46e5] transition-colors"
                    >
                      View Applicants
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}