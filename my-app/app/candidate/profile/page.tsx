"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface CandidateProfileData {
  name: string;
  email: string;
  headline: string | null;
  skills: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
}

export default function CandidateProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [skills, setSkills] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch("/api/candidate/profile")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load profile details");
        }
        return res.json();
      })
      .then((data: { candidate?: CandidateProfileData }) => {
        if (ignore || !data.candidate) return;
        setName(data.candidate.name || "");
        setEmail(data.candidate.email || "");
        setHeadline(data.candidate.headline || "");
        setSkills(data.candidate.skills || "");
        setPhone(data.candidate.phone || "");
        setLocation(data.candidate.location || "");
        setBio(data.candidate.bio || "");
      })
      .catch((err) => {
        if (ignore) return;
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Unable to load profile information.",
        });
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/candidate/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          headline,
          skills,
          phone,
          location,
          bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile settings.");
      }

      setFeedback({
        type: "success",
        message: "Profile settings updated successfully.",
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "An unexpected error occurred while saving.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell role="candidate">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28]">
            Candidate Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#464555] mt-1">
            Manage your candidate profile information, skills, and contact preferences.
          </p>
        </div>

        {feedback && (
          <Alert
            type={feedback.type}
            message={feedback.message}
            onClose={() => setFeedback(null)}
          />
        )}

        <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#575e70]">
              <span className="material-symbols-outlined text-[32px] animate-spin text-[#3525cd]">
                progress_activity
              </span>
              <p className="text-xs sm:text-sm font-medium">Loading your profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  icon="person"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  icon="mail"
                  value={email}
                  disabled
                  helperText="Registered login email cannot be changed."
                />
              </div>

              <Input
                label="Professional Headline"
                icon="badge"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer | React & Next.js"
                helperText="A short one-line summary displayed to employers."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  icon="call"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />

                <Input
                  label="Location"
                  icon="location_on"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#121c28]">
                  Skills & Tech Stack
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, TypeScript, Next.js, Node.js, Tailwind CSS"
                  className="block w-full rounded-lg border border-[#c7c4d8] bg-white text-[#121c28] text-xs sm:text-sm px-3.5 py-2.5 focus:border-[#3525cd] focus:ring-4 focus:ring-[#3525cd]/10 outline-none transition-all"
                />
                <p className="text-[11px] text-[#777587]">Comma-separated list of your technical skills and tools.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#121c28]">
                  Professional Summary / Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Briefly describe your background, work experience, and what you are looking for..."
                  rows={4}
                  className="block w-full rounded-lg border border-[#c7c4d8] bg-white text-[#121c28] text-xs sm:text-sm p-3 focus:border-[#3525cd] focus:ring-4 focus:ring-[#3525cd]/10 outline-none transition-all resize-y"
                />
              </div>

              <div className="pt-3 border-t border-[#c7c4d8]/40 flex justify-end">
                <Button type="submit" variant="primary" isLoading={isSaving} icon="check">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
