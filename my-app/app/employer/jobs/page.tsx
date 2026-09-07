"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

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
  const jobsRes = await fetch("/api/jobs?mine=true&limit=100");
  if (jobsRes.status === 401 || jobsRes.status === 403) {
    return { error: "Please log in as an employer to view your job postings." };
  }
  if (!jobsRes.ok) {
    throw new Error("Failed to load your job postings.");
  }
  const data = await jobsRes.json();
  return { jobs: data.jobs || [] };
}

export default function ManageJobs() {
  const [jobs, setJobs] = useState<EmployerJobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [jobToDelete, setJobToDelete] = useState<EmployerJobItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/jobs/${jobToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: data.error || "Failed to delete job posting.",
        });
        return;
      }

      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
      setFeedback({
        type: "success",
        message: `Job "${jobToDelete.title}" was closed and deleted successfully.`,
      });
      setJobToDelete(null);
    } catch {
      setFeedback({
        type: "error",
        message: "Network error while deleting job posting.",
      });
    } finally {
      setIsDeleting(false);
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
              Review your active job openings, applicant volumes, and manage listing lifecycles.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2 border border-[#c7c4d8] rounded-lg bg-white hover:bg-[#f8f9ff] text-[#464555] hover:text-[#121c28] transition-colors shadow-2xs"
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

        {feedback && (
          <Alert
            type={feedback.type}
            message={feedback.message}
            onClose={() => setFeedback(null)}
          />
        )}

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

                  <div className="mt-auto pt-3 border-t border-[#c7c4d8]/40 flex justify-between items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#464555]">
                      <span className="material-symbols-outlined text-[16px] text-[#3525cd]">
                        group
                      </span>
                      <span className="font-semibold text-[#121c28]">{appCount}</span> applicant(s)
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setJobToDelete(job)}
                        className="p-1.5 text-[#777587] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-colors"
                        title="Delete / Close Listing"
                        aria-label={`Delete ${job.title}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>

                      <Link
                        href={`/employer/jobs/${job.id}/applications`}
                        className="px-3 py-1.5 rounded-lg bg-[#3525cd] text-white text-xs font-semibold hover:bg-[#4f46e5] transition-colors"
                      >
                        Applicants
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {jobToDelete && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 max-w-md w-full shadow-lg space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">warning</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#121c28]">Close Job Listing?</h3>
                  <p className="text-xs text-[#464555]">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                Are you sure you want to delete and close <strong className="text-[#121c28]">&ldquo;{jobToDelete.title}&rdquo;</strong>? All associated applicant submissions for this listing will also be removed.
              </p>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#c7c4d8]/40">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setJobToDelete(null)}
                  className="px-4 py-2 text-xs font-medium text-[#464555] hover:text-[#121c28] rounded-lg hover:bg-[#f1f5f9] transition-colors"
                >
                  Cancel
                </button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={isDeleting}
                  onClick={handleDeleteJob}
                  icon="delete"
                >
                  Delete Listing
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}