"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function CandidateProfile() {
  // TODO: fetch real user data from /api/candidate/profile and wire up save
  const [name, setName] = useState("Jane Doe");
  const [email, setEmail] = useState("candidate@example.com");
  const [skills, setSkills] = useState("React, TypeScript, Next.js, Tailwind CSS");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AppShell role="candidate">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28]">
            Candidate Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#464555] mt-1">
            Manage your candidate profile information and job search preferences.
          </p>
        </div>

        {saved && (
          <Alert type="success" message="Profile settings updated successfully." />
        )}

        <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <form onSubmit={handleSave} className="space-y-4">
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#121c28]">
                Skills & Tech Stack
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Node.js, Python, SQL"
                className="block w-full rounded-lg border border-[#c7c4d8] bg-white text-[#121c28] text-xs sm:text-sm px-3.5 py-2.5 focus:border-[#3525cd] focus:ring-4 focus:ring-[#3525cd]/10 outline-none"
              />
              <p className="text-[11px] text-[#777587]">Comma-separated list of skills</p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}