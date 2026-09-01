"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function PostJob() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdJobTitle, setCreatedJobTitle] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a job title.");
      return;
    }

    if (!location.trim()) {
      setError("Please specify the job location (e.g. Remote, Hybrid, or city).");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          location: location.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError(data.error || "Authentication required. Please log in as an employer.");
        } else {
          setError(data.error || "Failed to create job posting.");
        }
        setIsSubmitting(false);
        return;
      }

      setCreatedJobTitle(title.trim());
      // Reset fields
      setTitle("");
      setLocation("");
      setDescription("");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell role="employer">
      <div className="max-w-2xl mx-auto py-2 sm:py-6">
        {/* Success State Confirmation */}
        {createdJobTitle ? (
          <div className="bg-white border border-[#c7c4d8] rounded-xl p-8 text-center shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#d1fae5] text-[#065f46] flex items-center justify-center mx-auto shadow-2xs">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>

            <div>
              <span className="px-2.5 py-0.5 bg-[#eef4ff] text-[#3525cd] font-semibold text-xs rounded-full">
                Listing Live
              </span>
              <h1 className="text-2xl font-bold text-[#121c28] mt-2">
                Job Posted Successfully!
              </h1>
              <p className="text-xs sm:text-sm text-[#464555] mt-1 max-w-md mx-auto">
                <span className="font-semibold text-[#121c28]">&ldquo;{createdJobTitle}&rdquo;</span> is now active and receiving candidate applications.
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row justify-center items-center gap-3">
              <Link
                href="/employer/jobs"
                className="w-full sm:w-auto px-6 py-2.5 bg-[#3525cd] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#4f46e5] transition-colors shadow-xs"
              >
                View in Job Postings
              </Link>
              <button
                type="button"
                onClick={() => setCreatedJobTitle(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-white border border-[#c7c4d8] text-[#121c28] text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#f8f9ff] hover:border-[#777587] transition-colors"
              >
                Post Another Job
              </button>
            </div>
          </div>
        ) : (
          /* Form Card (Matching Stitch post_a_job_employer) */
          <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Header */}
            <div className="mb-6 pb-4 border-b border-[#c7c4d8]">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28]">
                Post a New Job
              </h1>
              <p className="text-xs sm:text-sm text-[#464555] mt-1">
                Create a new job listing to attract top candidates.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-5">
                <Alert type="error" message={error} onClose={() => setError("")} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Job Title */}
              <Input
                id="job-title"
                label="Job Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                required
                disabled={isSubmitting}
              />

              {/* Location */}
              <div className="space-y-1.5">
                <label
                  htmlFor="location"
                  className="block text-xs font-medium text-[#121c28]"
                >
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-lg">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777587] text-[18px]">
                    location_on
                  </span>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote, San Francisco, CA"
                    required
                    disabled={isSubmitting}
                    className="block w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#c7c4d8] bg-white text-xs sm:text-sm text-[#121c28] placeholder:text-[#9CA3AF] focus:ring-4 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-1.5">
                <label
                  htmlFor="description"
                  className="block text-xs font-medium text-[#121c28]"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the responsibilities, requirements, and benefits..."
                  required
                  disabled={isSubmitting}
                  className="block w-full p-3 rounded-lg border border-[#c7c4d8] bg-white text-xs sm:text-sm text-[#121c28] placeholder:text-[#9CA3AF] focus:ring-4 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-all resize-y"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#c7c4d8] mt-6">
                <button
                  type="button"
                  onClick={() => router.push("/employer/jobs")}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-white border border-[#c7c4d8] text-[#121c28] text-xs sm:text-sm font-medium hover:bg-[#f8f9ff] hover:border-[#777587] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  icon="send"
                  iconPosition="right"
                >
                  Post Job
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}