"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const POPULAR_SKILLS = [
  "React",
  "TypeScript",
  "Next.js",
  "Node.js",
  "JavaScript",
  "Python",
  "Tailwind CSS",
  "PostgreSQL",
  "MongoDB",
  "GraphQL",
  "Docker",
  "AWS",
];

export default function CandidateOnboarding() {
  const router = useRouter();

  const [headline, setHeadline] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Preload existing profile data if already set
  useEffect(() => {
    let ignore = false;

    fetch("/api/candidate/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (ignore || !data?.candidate) return;
        if (data.candidate.headline) setHeadline(data.candidate.headline);
        if (data.candidate.phone) setPhone(data.candidate.phone);
        if (data.candidate.location) setLocation(data.candidate.location);
        if (data.candidate.bio) setBio(data.candidate.bio);
        if (data.candidate.skills) {
          const parsed = data.candidate.skills
            .split(",")
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
          setSkillsList(parsed);
        }
      })
      .catch(() => {
        // Silently continue with empty form
      });

    return () => {
      ignore = true;
    };
  }, []);

  function toggleSkill(skill: string) {
    if (skillsList.includes(skill)) {
      setSkillsList(skillsList.filter((s) => s !== skill));
    } else {
      setSkillsList([...skillsList, skill]);
    }
  }

  function handleAddCustomSkill(e: React.KeyboardEvent | React.MouseEvent) {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();

    const trimmed = customSkill.trim();
    if (trimmed && !skillsList.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillsList([...skillsList, trimmed]);
      setCustomSkill("");
    }
  }

  function removeSkill(skillToRemove: string) {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/candidate/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          phone,
          location,
          bio,
          skills: skillsList.join(", "),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save profile.");
      }

      router.push("/candidate/jobs");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred while saving."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell role="candidate">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Onboarding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#3525cd] text-white font-bold text-xl shadow-xs">
            AT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28]">
            Set Up Your Candidate Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#464555] max-w-md mx-auto">
            Add your primary headline and technical skills to stand out to employers and unlock tailored job opportunities.
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError("")} />}

        {/* Card Form */}
        <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Headline & Contact */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-[#121c28] flex items-center gap-1.5 border-b border-[#c7c4d8]/40 pb-2">
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">person</span>
                Professional Overview
              </h2>

              <Input
                label="Professional Headline"
                icon="badge"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Full Stack Developer | Next.js & TypeScript"
                required
                helperText="A clear summary title seen by hiring managers."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  icon="location_on"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India or Remote"
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  icon="call"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Skills & Tech Stack */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[#121c28] flex items-center gap-1.5 border-b border-[#c7c4d8]/40 pb-2">
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">psychology</span>
                Key Skills & Technologies
              </h2>

              <p className="text-xs text-[#575e70]">
                Select from popular skills or type your own:
              </p>

              {/* Popular skill pills */}
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.map((skill) => {
                  const isSelected = skillsList.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-[#3525cd] text-white shadow-2xs"
                          : "bg-[#f1f5f9] text-[#464555] hover:bg-[#e2e8f0]"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Custom skill input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={handleAddCustomSkill}
                  placeholder="Type a skill and press Enter..."
                  className="flex-1 rounded-lg border border-[#c7c4d8] bg-white text-[#121c28] text-xs sm:text-sm px-3.5 py-2 focus:border-[#3525cd] focus:ring-4 focus:ring-[#3525cd]/10 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-3.5 py-2 bg-white border border-[#c7c4d8] rounded-lg text-xs font-semibold text-[#121c28] hover:bg-[#f8f9ff] transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Active selected skills badges */}
              {skillsList.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-1.5 p-3 bg-[#f8f9ff] rounded-lg border border-[#c7c4d8]/40">
                  <span className="text-xs font-semibold text-[#3525cd] mr-1">Your Skills:</span>
                  {skillsList.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-[#121c28] border border-[#c7c4d8]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-[#777587] hover:text-[#ba1a1a] text-[14px] leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Professional Summary */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-[#121c28] flex items-center gap-1.5 border-b border-[#c7c4d8]/40 pb-2">
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">description</span>
                About You
              </h2>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a brief summary of your work background, career highlights, and ideal role..."
                rows={3}
                className="block w-full rounded-lg border border-[#c7c4d8] bg-white text-[#121c28] text-xs sm:text-sm p-3 focus:border-[#3525cd] focus:ring-4 focus:ring-[#3525cd]/10 outline-none transition-all resize-y"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#c7c4d8]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href="/candidate/jobs"
                className="text-xs font-medium text-[#575e70] hover:text-[#121c28] transition-colors order-2 sm:order-1"
              >
                Skip for now & browse jobs →
              </Link>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                icon="arrow_forward"
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Save & Explore Job Listings
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
