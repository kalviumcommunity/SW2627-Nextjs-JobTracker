"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");

    console.log({
      name,
      email,
      password,
      role,
    });
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
            Sign up to start using Job Tracker
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300"
            >
              Account Type
            </label>

            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            >
              <option value="candidate">Candidate</option>
              <option value="employer">Employer</option>
            </select>
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
            Create Account
          </button>
        </form>
      </div>
    </main>
  );
}