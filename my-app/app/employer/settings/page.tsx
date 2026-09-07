"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function EmployerSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadSettings() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/employer/settings");
        if (response.ok) {
          const data = await response.json();
          if (!ignore && data.employer) {
            setName(data.employer.name || "");
            setEmail(data.employer.email || "");
            setCompanyName(data.employer.companyName || "");
            setWebsite(data.employer.website || "");
            setLocation(data.employer.location || "");
            setBio(data.employer.bio || "");
          }
        } else if (response.status === 401) {
          if (!ignore) {
            setFeedback({
              type: "error",
              message: "Please log in as an employer to manage settings.",
            });
          }
        }
      } catch {
        if (!ignore) {
          setFeedback({
            type: "error",
            message: "Unable to load company settings from server.",
          });
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadSettings();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/employer/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          companyName: companyName.trim(),
          website: website.trim(),
          location: location.trim(),
          bio: bio.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: data.error || "Failed to update company settings.",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: "Organization settings saved successfully.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Network error occurred while saving settings.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell role="employer">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28]">
            Company Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#464555] mt-1">
            Manage your organization profile, hiring details, and company branding.
          </p>
        </div>

        {feedback && (
          <Alert
            type={feedback.type}
            message={feedback.message}
            onClose={() => setFeedback(null)}
          />
        )}

        {isLoading ? (
          <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 animate-pulse space-y-4">
            <div className="w-1/3 h-6 bg-[#dfe9fa] rounded" />
            <div className="w-full h-10 bg-[#dfe9fa] rounded" />
            <div className="w-full h-10 bg-[#dfe9fa] rounded" />
            <div className="w-full h-24 bg-[#dfe9fa] rounded" />
          </div>
        ) : (
          <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Employer / Contact Name"
                icon="person"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                required
              />

              <Input
                label="Account Email"
                type="email"
                icon="mail"
                value={email}
                disabled
                helperText="Email is associated with your login account and cannot be changed."
              />

              <Input
                label="Company / Brand Name"
                icon="domain"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Tech Innovations"
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
                  label="Headquarters / Location"
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
                  About the Company / Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief overview of your company mission, culture, and what you build..."
                  className="block w-full p-3 rounded-lg border border-[#c7c4d8] bg-white text-xs sm:text-sm text-[#121c28] placeholder:text-[#9CA3AF] focus:ring-4 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-all resize-y"
                />
              </div>

              <div className="pt-3 border-t border-[#c7c4d8]/40 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  icon="save"
                >
                  Save Organization Settings
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}