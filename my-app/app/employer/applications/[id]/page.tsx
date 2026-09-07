"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { EmployerApplication } from "@/components/employer/ApplicationsTable";
import { normalizeStatus } from "@/lib/status";

export default function ApplicantDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;

  const [application, setApplication] = useState<EmployerApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadApp() {
      try {
        const res = await fetch(`/api/applications/${applicationId}`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setApplication(data.application || null);
        } else {
          if (!ignore) setApplication(null);
        }
      } catch {
        // Silently handle
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadApp();
    return () => {
      ignore = true;
    };
  }, [applicationId]);

  async function handleStatusUpdate(newStatus: "viewed" | "rejected") {
    setIsUpdating(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status.");
      }

      setApplication((prev) => (prev ? { ...prev, status: newStatus } : null));
      setFeedback({
        type: "success",
        message: `Application status updated to ${newStatus === "viewed" ? "Viewed" : "Rejected"}.`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Update failed.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  const canonical = normalizeStatus(application?.status);
  const isPending = canonical === "pending";
  const isViewed = canonical === "viewed";
  const isRejected = canonical === "rejected";

  return (
    <AppShell role="employer">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#575e70]">
          <Link href="/employer" className="hover:text-[#3525cd]">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-[#121c28] font-semibold">
            {application ? application.candidate?.name || "Applicant Profile" : "Applicant"}
          </span>
        </nav>

        {feedback && (
          <Alert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />
        )}

        {isLoading ? (
          <div className="bg-white border border-[#c7c4d8] rounded-xl p-8 animate-pulse space-y-4">
            <div className="w-1/3 h-8 bg-[#dfe9fa] rounded" />
            <div className="w-1/4 h-5 bg-[#dfe9fa] rounded" />
            <div className="w-full h-40 bg-[#dfe9fa] rounded" />
          </div>
        ) : !application ? (
          <div className="bg-white border border-[#c7c4d8] rounded-xl p-8 text-center">
            <h2 className="text-lg font-bold text-[#121c28]">Applicant Not Found</h2>
            <p className="text-xs text-[#464555] mt-1 mb-4">
              This application record may have been removed or you are not authorized to view it.
            </p>
            <Link
              href="/employer"
              className="inline-flex px-4 py-2 bg-[#3525cd] text-white text-xs font-semibold rounded-lg hover:bg-[#4f46e5]"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-6">
            {/* Header Profile */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#c7c4d8]/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#dfe9fa] text-[#3525cd] flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                  {(application.candidate?.name || "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#121c28]">
                    {application.candidate?.name || "Candidate"}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
                    {application.candidate?.email || "No email available"}
                  </p>
                  <p className="text-xs text-[#777587] mt-1">
                    Applied for: <span className="font-semibold text-[#121c28]">{application.job?.title}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={application.status} />
              </div>
            </div>

            {/* State Machine Transition Actions */}
            <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#c7c4d8]/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-xs font-bold text-[#121c28] uppercase tracking-wider">
                  Workflow Action
                </h3>
                <p className="text-xs text-[#464555] mt-0.5">
                  {isRejected
                    ? "Application is in terminal rejected state."
                    : "Update candidate status in compliance with the application state machine."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* pending -> viewed */}
                {isPending && (
                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={isUpdating}
                    onClick={() => handleStatusUpdate("viewed")}
                    icon="visibility"
                  >
                    Mark as Viewed
                  </Button>
                )}

                {/* pending -> rejected OR viewed -> rejected */}
                {(isPending || isViewed) && (
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={isUpdating}
                    onClick={() => handleStatusUpdate("rejected")}
                    icon="cancel"
                  >
                    Reject Application
                  </Button>
                )}

                {isRejected && (
                  <span className="text-xs font-semibold text-[#93000a] bg-[#ffdad6] px-3 py-1.5 rounded-lg border border-[#ba1a1a]/20">
                    Rejected (Terminal)
                  </span>
                )}
              </div>
            </div>

            {/* Attached Resume Document */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#121c28] flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#3525cd]">
                  attach_file
                </span>
                Attached Resume
              </h2>
              {application.resumeFileName ? (
                <div className="p-4 rounded-xl border border-[#c7c4d8] bg-[#f8f9ff]/70 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#e5eeff] text-[#3525cd] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">description</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#121c28]">
                        {application.resumeFileName}
                      </p>
                      <p className="text-xs text-[#777587]">Verified Attachment • PDF/DOCX</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white border border-[#c7c4d8] text-[#121c28] text-xs font-medium rounded-lg shadow-2xs inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#065f46]">check_circle</span>
                    Attached
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[#c7c4d8] bg-white text-center">
                  <p className="text-xs text-[#777587]">No resume file attached with this submission.</p>
                </div>
              )}
            </div>

            {/* Candidate Cover Letter Section */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#121c28] flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#3525cd]">
                  mail
                </span>
                Cover Letter / Introduction
              </h2>
              <div className="bg-[#f8f9ff]/40 p-5 rounded-xl border border-[#c7c4d8]">
                {application.coverLetter ? (
                  <p className="text-sm text-[#121c28] leading-relaxed whitespace-pre-wrap font-sans">
                    {application.coverLetter}
                  </p>
                ) : (
                  <p className="text-xs text-[#777587] italic">
                    Candidate did not provide a cover letter.
                  </p>
                )}
              </div>
            </div>

            {/* Submission Metadata */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#121c28]">Application Metadata</h2>
              <div className="bg-white p-4 rounded-lg border border-[#c7c4d8] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#464555]">Applied Date:</span>
                  <span className="font-semibold text-[#121c28]">
                    {application.createdAt
                      ? new Date(application.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#464555]">Candidate ID:</span>
                  <span className="font-mono text-[#777587]">{application.candidateId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#464555]">Job ID:</span>
                  <span className="font-mono text-[#777587]">{application.jobId}</span>
                </div>
              </div>
            </div>

            {/* Back Action */}
            <div className="pt-4 border-t border-[#c7c4d8]/50 flex justify-between items-center">
              <Link
                href="/employer"
                className="text-xs font-medium text-[#464555] hover:text-[#3525cd] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Back to Applications
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}