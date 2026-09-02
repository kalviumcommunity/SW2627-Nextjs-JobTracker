"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { JobData } from "@/components/ui/JobCard";

export default function JobDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;

  const [job, setJob] = useState<JobData | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadJob() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setJob(data.job || null);
        } else {
          if (!ignore) setJob(null);
        }

        // Check if already applied
        const appRes = await fetch("/api/applications");
        if (appRes.ok) {
          const appData = await appRes.json();
          const hasApplied = (appData.applications || []).some(
            (app: { jobId: string }) => app.jobId === jobId
          );
          if (!ignore) setIsApplied(hasApplied);
        }
      } catch {
        // Handle error silently
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadJob();
    return () => {
      ignore = true;
    };
  }, [jobId]);

  async function handleApply() {
    setIsApplying(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFeedback({
          type: "error",
          message: data.error || "Failed to apply for this position.",
        });
        return;
      }
      setIsApplied(true);
      setFeedback({
        type: "success",
        message: "Application submitted successfully! Track your status in My Applications.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <AppShell role="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[#575e70]">
          <Link href="/candidate/jobs" className="hover:text-[#3525cd] transition-colors">
            Jobs
          </Link>
          <span>/</span>
          <span className="text-[#121c28] font-semibold truncate max-w-xs">
            {job ? job.title : "Job Details"}
          </span>
        </nav>

        {feedback && (
          <Alert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />
        )}

        {isLoading ? (
          <div className="bg-white border border-[#c7c4d8] rounded-xl p-8 animate-pulse space-y-4">
            <div className="w-1/3 h-8 bg-[#dfe9fa] rounded" />
            <div className="w-1/4 h-5 bg-[#dfe9fa] rounded" />
            <div className="w-full h-32 bg-[#dfe9fa] rounded" />
          </div>
        ) : !job ? (
          <div className="bg-white border border-[#c7c4d8] rounded-xl p-8 text-center">
            <h2 className="text-lg font-bold text-[#121c28]">Job Not Found</h2>
            <p className="text-xs text-[#464555] mt-1 mb-4">
              The job posting you are looking for does not exist or has been removed.
            </p>
            <Link
              href="/candidate/jobs"
              className="inline-flex px-4 py-2 bg-[#3525cd] text-white text-xs font-semibold rounded-lg hover:bg-[#4f46e5]"
            >
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#c7c4d8]/50">
              <div>
                <span className="px-2.5 py-0.5 bg-[#eef4ff] text-[#3525cd] font-semibold text-xs rounded-full">
                  Verified Opening
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#121c28] mt-2">
                  {job.title}
                </h1>
                <p className="text-sm text-[#464555] mt-1 flex items-center gap-2">
                  <span className="font-semibold text-[#121c28]">
                    {job.employer?.name || "Hiring Company"}
                  </span>
                  <span>•</span>
                  <span>{job.location || "Remote / Hybrid"}</span>
                  <span>•</span>
                  <span>Full-time</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isApplied ? (
                  <Link
                    href="/candidate/applications"
                    className="px-4 py-2.5 bg-[#e5eeff] text-[#3525cd] text-xs font-semibold rounded-lg hover:bg-[#dfe9fa] transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Track Application
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isApplying}
                    onClick={handleApply}
                    icon="send"
                  >
                    Apply for Position
                  </Button>
                )}
              </div>
            </div>

            {/* Role Overview */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#121c28]">About this role</h2>
              <p className="text-sm text-[#464555] leading-relaxed whitespace-pre-line">
                {job.description ||
                  `Join ${job.employer?.name || "our team"} to work on impactful projects with cutting-edge engineering standards. We are looking for talented candidates who want to build high-performance, accessible, and scalable applications.`}
              </p>
            </div>

            {/* Key Responsibilities */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#121c28]">Key Responsibilities</h2>
              <ul className="list-disc pl-5 text-sm text-[#464555] space-y-1.5 leading-relaxed">
                <li>Collaborate with cross-functional product and engineering teams.</li>
                <li>Design, develop, and test modular, high-performance features.</li>
                <li>Maintain code quality, continuous integration, and engineering excellence.</li>
                <li>Participate in agile sprint ceremonies, code reviews, and architecture discussions.</li>
              </ul>
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#121c28]">Requirements</h2>
              <ul className="list-disc pl-5 text-sm text-[#464555] space-y-1.5 leading-relaxed">
                <li>Demonstrated proficiency in modern software engineering principles.</li>
                <li>Experience working with Git, component design, and REST/Next.js APIs.</li>
                <li>Strong problem-solving and communication skills.</li>
              </ul>
            </div>

            {/* Footer Action */}
            <div className="pt-6 border-t border-[#c7c4d8]/50 flex justify-between items-center">
              <Link
                href="/candidate/jobs"
                className="text-xs font-medium text-[#464555] hover:text-[#3525cd] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Back to all jobs
              </Link>

              {!isApplied && (
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isApplying}
                  onClick={handleApply}
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}