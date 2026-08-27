"use client";

import { useState, use } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function ApplyToJob({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;
  const router = useRouter();

  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!resume) {
      setError("Please upload your resume.");
      return;
    }

    if (!coverLetter.trim()) {
      setError("Please provide a brief cover letter or introduction.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit application.");
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <AppShell role="candidate">
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white border border-[#c7c4d8] rounded-xl p-8 text-center shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#d1fae5] text-[#065f46] flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>

            <h1 className="text-xl font-bold text-[#121c28]">
              Application Submitted
            </h1>

            <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
              Your application has been received and added to your tracker. The employer will review your profile shortly.
            </p>

            <div className="py-3 px-4 bg-[#f8f9ff] rounded-lg border border-[#c7c4d8]/40 flex items-center justify-between">
              <span className="text-xs font-medium text-[#464555]">Initial Status</span>
              <StatusBadge status="pending" />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/candidate/applications"
                className="w-full py-2.5 px-4 bg-[#3525cd] text-white rounded-lg text-xs font-semibold hover:bg-[#4f46e5] transition-colors"
              >
                Go to My Applications
              </Link>
              <Link
                href="/candidate/jobs"
                className="w-full py-2 px-4 text-xs font-medium text-[#464555] hover:text-[#121c28]"
              >
                Browse More Jobs
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="candidate">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#575e70]">
          <Link href="/candidate/jobs" className="hover:text-[#3525cd]">
            Jobs
          </Link>
          <span>/</span>
          <Link href={`/candidate/jobs/${jobId}`} className="hover:text-[#3525cd]">
            Details
          </Link>
          <span>/</span>
          <span className="text-[#121c28] font-semibold">Apply</span>
        </nav>

        {/* Card */}
        <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#121c28]">
              Submit Application
            </h1>
            <p className="text-xs sm:text-sm text-[#464555] mt-1">
              Attach your resume and introduction for the hiring team.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Resume Upload Field */}
            <div className="space-y-1.5">
              <label htmlFor="resume" className="block text-xs font-medium text-[#121c28]">
                Resume / CV <span className="text-red-500">*</span>
              </label>

              <div className="relative border-2 border-dashed border-[#c7c4d8] hover:border-[#3525cd] rounded-xl p-6 text-center transition-colors bg-[#f8f9ff]/50">
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files?.[0] ?? null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-[#e5eeff] text-[#3525cd] flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-[20px]">
                      {resume ? "description" : "upload_file"}
                    </span>
                  </div>
                  {resume ? (
                    <div>
                      <p className="text-xs font-semibold text-[#121c28]">{resume.name}</p>
                      <p className="text-[10px] text-[#777587]">
                        {(resume.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-[#121c28]">
                        Click to upload or drag & drop resume
                      </p>
                      <p className="text-[10px] text-[#777587] mt-0.5">PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="space-y-1.5">
              <label htmlFor="coverLetter" className="block text-xs font-medium text-[#121c28]">
                Cover Letter / Introduction <span className="text-red-500">*</span>
              </label>
              <textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Describe your relevant experience, key achievements, and why you are excited for this opportunity..."
                rows={5}
                required
                className="w-full rounded-lg border border-[#c7c4d8] bg-white p-3 text-xs sm:text-sm text-[#121c28] placeholder:text-[#9CA3AF] focus:ring-4 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-all resize-y"
              />
            </div>

            {/* Error Alert */}
            {error && <Alert type="error" message={error} onClose={() => setError("")} />}

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#c7c4d8]/40">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-xs font-medium text-[#464555] hover:text-[#121c28] rounded-lg hover:bg-[#f1f5f9] transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                icon="send"
              >
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}