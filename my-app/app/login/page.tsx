"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

export default function Login() {
  const router = useRouter();

  const [roleSelection, setRoleSelection] = useState<
    "employer" | "candidate"
  >("employer");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          role: roleSelection,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      const role = data.user?.role;

      if (role === "candidate") {
        router.push("/candidate");
        router.refresh();
        return;
      }

      if (role === "employer") {
        router.push("/employer");
        router.refresh();
        return;
      }

      setError("Invalid account role.");
      setIsLoading(false);
    } catch {
      setError("Unable to connect to the server. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6 antialiased bg-[#FAFAFA]">
      <div className="w-full max-w-[400px]">
        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#3525cd] text-white font-bold text-xl mb-3 shadow-sm">
            AT
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#3525cd]">
            Apna Tracker
          </h1>

          <p className="text-sm text-[#464555] mt-1.5 font-medium">
            Sign in to your account
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-[#c7c4d8] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          {/* Segmented Control */}
          <SegmentedControl
            className="mb-5"
            ariaLabel="Account type"
            value={roleSelection}
            onChange={(val) =>
              setRoleSelection(val as "employer" | "candidate")
            }
            options={[
              { value: "employer", label: "Employer", icon: "domain" },
              { value: "candidate", label: "Candidate", icon: "person" },
            ]}
          />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <Input
              id="email"
              type="email"
              label="Email address"
              icon="mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                roleSelection === "employer"
                  ? "you@company.com"
                  : "you@example.com"
              }
              required
              autoComplete="email"
            />

            {/* Password Input */}
            <Input
              id="password"
              type="password"
              label="Password"
              icon="lock"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              rightElement={
                <span className="text-xs text-[#3525cd] hover:underline cursor-pointer">
                  Forgot?
                </span>
              }
            />

            {/* Error Alert */}
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Sign in
              </Button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-[#c7c4d8]/40 text-center">
            <p className="text-sm text-[#464555]">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#3525cd] hover:text-[#4f46e5] transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}