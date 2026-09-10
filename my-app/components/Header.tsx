import Link from "next/link";

export function Header() {
  return (
    <header style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }} className="bg-white">
      <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link href="/" className="font-bold text-[#3525cd]">Home</Link>
        <Link href="/about" className="text-[#464555] hover:text-[#121c28]">About</Link>
        <Link href="/dashboard" className="text-[#464555] hover:text-[#121c28]">Dashboard</Link>
        <Link href="/candidate/jobs" style={{ marginLeft: "auto" }} className="text-xs text-[#464555] hover:text-[#121c28]">
          Explore Jobs
        </Link>
        <Link href="/role-selection" className="text-xs text-[#3525cd] font-semibold">
          Portals
        </Link>
      </nav>
    </header>
  );
}
