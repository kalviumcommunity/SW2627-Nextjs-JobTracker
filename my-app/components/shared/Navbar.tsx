import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 shadow-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-medium text-slate-400 dark:text-zinc-600">
        <Link
          href="/"
          className="rounded-md px-2.5 py-1 text-slate-700 dark:text-zinc-200 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
        >
          Home
        </Link>
        {" | "}
        <Link
          href="/login"
          className="rounded-md px-2.5 py-1 text-slate-700 dark:text-zinc-200 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
        >
          Login
        </Link>
        {" | "}
        <Link
          href="/signup"
          className="rounded-md px-2.5 py-1 text-slate-700 dark:text-zinc-200 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
        >
          Sign Up
        </Link>
        {" | "}
        <Link
          href="/candidate"
          className="rounded-md px-2.5 py-1 text-slate-700 dark:text-zinc-200 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
        >
          Candidate
        </Link>
        {" | "}
        <Link
          href="/candidate/jobs"
          className="rounded-md px-2.5 py-1 text-slate-700 dark:text-zinc-200 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
        >
          Jobs
        </Link>
        {" | "}
        <Link
          href="/candidate/applications"
          className="rounded-md px-2.5 py-1 text-slate-700 dark:text-zinc-200 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
        >
          My Applications
        </Link>
        {" | "}
        <Link
          href="/employer"
          className="rounded-md px-2.5 py-1 text-slate-700 dark:text-zinc-200 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
        >
          Employer
        </Link>
        {" | "}
        <Link
          href="/employer/jobs"
          className="rounded-md px-2.5 py-1 text-slate-700 dark:text-zinc-200 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
        >
          Manage Jobs
        </Link>
        {" | "}
        <Link
          href="/employer/jobs/new"
          className="rounded-md px-2.5 py-1 text-slate-700 dark:text-zinc-200 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
        >
          Post Job
        </Link>
        {" | "}
        <Link
          href="/employer/jobs/123/applications"
          className="rounded-md px-2.5 py-1 text-slate-700 dark:text-zinc-200 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
        >
          View Applicants
        </Link>
      </div>
    </nav>
  );
}