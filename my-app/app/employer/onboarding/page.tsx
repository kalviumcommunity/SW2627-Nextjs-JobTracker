"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function EmployerOnboarding() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!companyName.trim()) {
      setError("Please enter your company or organization name.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/employer/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          website: website.trim(),
          location: location.trim(),
          bio: bio.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save company profile.");
        setIsSubmitting(false);
        return;
      }

      router.push("/employer/jobs/new");
    } catch {
      setError("Network error occurred while saving onboarding details.");
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell role="employer">
      <div className="max-w-xl mx-auto space-y-6 py-4">
        {/* Onboarding Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#3525cd] text-white font-bold text-lg mb-3 shadow-sm">
            AT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28]">
            Welcome to Apna Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#464555] mt-1">
            Let&apos;s set up your organization profile before you publish your first opening.
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold">
            <span className="px-2.5 py-0.5 rounded-full bg-[#3525cd] text-white">
              Step 1: Company Profile
            </span>
            <span className="text-[#c7c4d8]">➔</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#777587]">
              Step 2: Post Job
            </span>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError("")} />}

        {/* Setup Wizard Card */}
        <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Company Name"
              icon="domain"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Tech Innovations"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Website"
                type="url"
                icon="language"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
              />

              <Input
                label="Location"
                type="text"
                icon="location_on"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="bio"
                className="block text-xs font-medium text-[#121c28]"
              >
                Company Bio / About
              </label>
              <textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe what your organization does..."
                className="block w-full p-3 rounded-lg border border-[#c7c4d8] bg-white text-xs sm:text-sm text-[#121c28] placeholder:text-[#9CA3AF] focus:ring-4 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-all resize-y"
              />
            </div>

            <div className="pt-4 border-t border-[#c7c4d8]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href="/employer/jobs/new"
                className="text-xs font-medium text-[#777587] hover:text-[#121c28] transition-colors order-2 sm:order-1"
              >
                Skip for now ➔
              </Link>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                icon="arrow_forward"
                iconPosition="right"
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Save & Continue to Post a Job
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}