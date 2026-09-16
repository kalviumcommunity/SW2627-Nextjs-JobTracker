import Link from "next/link";

export default function BlogIndexPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Blog
      </h1>
      <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <li>
          <Link href="/blog/getting-started" style={{ color: "#2563eb", textDecoration: "underline" }}>
            Getting Started
          </Link>
        </li>
        <li>
          <Link href="/blog/announcing-our-launch" style={{ color: "#2563eb", textDecoration: "underline" }}>
            Announcing Our Launch
          </Link>
        </li>
      </ul>
    </main>
  );
}
