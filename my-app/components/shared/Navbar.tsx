import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <Link href="/">Home</Link>{" | "}
      <Link href="/login">Login</Link>{" | "}
      <Link href="/signup">Sign Up</Link>{" | "}
      <Link href="/candidate">Candidate</Link>{" | "}
      <Link href="/candidate/jobs">Jobs</Link>{" | "}
      <Link href="/candidate/applications">
        My Applications
      </Link>{" | "}
      <Link href="/employer">Employer</Link>{" | "}
      <Link href="/employer/jobs">Manage Jobs</Link>{" | "}
      <Link href="/employer/jobs/new">Post Job</Link>{" | "}
      <Link href="/employer/jobs/123/applications">
        View Applicants
      </Link>
    </nav>
  );
}