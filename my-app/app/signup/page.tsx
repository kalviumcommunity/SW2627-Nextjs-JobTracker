"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccess(`Welcome, ${name.trim()}! Redirecting to your workspace...`);

      // Backend returns auth tokens in cookies, route directly to portal
      setTimeout(() => {
        if (role === "candidate") {
          router.push("/candidate");
        } else {
          router.push("/employer");
        }
        router.refresh();
      }, 1000);
    } catch {
      setError("Unable to connect to the server. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6 antialiased bg-[#FAFAFA]">
      <div className="w-full max-w-[420px]">
        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#3525cd] text-white font-bold text-xl mb-3 shadow-sm">
            AT
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#3525cd]">
            Apna Tracker
          </h1>

          <p className="text-sm text-[#464555] mt-1.5 font-medium">
            Create your account
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          {/* Role Selection */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-[#121c28] mb-1.5">
              I want to join as
            </label>

            <SegmentedControl
              ariaLabel="Select account type"
              value={role}
              onChange={(val) =>
                setRole(val as "candidate" | "employer")
              }
              options={[
                {
                  value: "candidate",
                  label: "Candidate",
                  icon: "person",
                },
                {
                  value: "employer",
                  label: "Employer",
                  icon: "domain",
                },
              ]}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <Input
              id="name"
              type="text"
              label="Full Name"
              icon="badge"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                role === "candidate"
                  ? "Jane Doe"
                  : "Alex Smith (Acme Corp)"
              }
              required
              autoComplete="name"
            />

            {/* Email */}
            <Input
              id="email"
              type="email"
              label="Email address"
              icon="mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                role === "candidate"
                  ? "jane@example.com"
                  : "alex@company.com"
              }
              required
              autoComplete="email"
            />

            {/* Password */}
            <Input
              id="password"
              type="password"
              label="Password"
              icon="lock"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              helperText="Must be at least 8 characters long."
              autoComplete="new-password"
            />

            {/* Alerts */}
            {success && (
              <Alert
                type="success"
                message={success}
              />
            )}

            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-[#c7c4d8]/40 text-center">
            <p className="text-sm text-[#464555]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#3525cd] hover:text-[#4f46e5] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}