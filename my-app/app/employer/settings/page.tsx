"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function EmployerSettings() {
  // TODO: fetch real company data from /api/employer/settings and wire up save
  const [companyName, setCompanyName] = useState("Acme Corporation");
  const [email, setEmail] = useState("employer@company.com");
  const [website, setWebsite] = useState("https://example.com");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AppShell role="employer">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28]">
            Company Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#464555] mt-1">
            Manage your organization profile, hiring team preferences, and notification defaults.
          </p>
        </div>

        {saved && (
          <Alert type="success" message="Organization settings saved successfully." />
        )}

        <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Company Name"
              icon="domain"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />

            <Input
              label="Employer Email"
              type="email"
              icon="mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Company Website"
              type="url"
              icon="language"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary">
                Save Organization Settings
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}