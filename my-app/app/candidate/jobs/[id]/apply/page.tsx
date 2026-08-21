"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export default function ApplyToJob() {
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!resume) {
      setError("Please upload your resume.");
      return;
    }

    if (!coverLetter.trim()) {
      setError("Please enter a cover letter.");
      return;
    }

    setError("");
    setSubmitted(true);

    console.log({
      resume,
      coverLetter,
    });
  }

  if (submitted) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
            Application Submitted
          </h1>

          <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400">
            Your application has been submitted successfully.
          </p>

          <div className="mt-6 rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
            Status: Pending
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Apply to Job
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
            Submit your application for this position.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
        >
          <div>
            <label
              htmlFor="resume"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300"
            >
              Resume
            </label>

            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) =>
                setResume(event.target.files?.[0] ?? null)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
            />
          </div>

          <div>
            <label
              htmlFor="coverLetter"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300"
            >
              Cover Letter
            </label>

            <textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              placeholder="Tell the employer why you are a good fit..."
              rows={6}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-zinc-200"
          >
            Submit Application
          </button>
        </form>
      </div>
    </main>
  );
}