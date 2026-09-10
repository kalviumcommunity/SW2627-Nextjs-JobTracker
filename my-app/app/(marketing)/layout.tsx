import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header style={{ padding: "1.5rem 2rem", background: "#0f172a", color: "white" }}>
        <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link href="/" style={{ color: "white", fontWeight: 700 }}>
            OurProduct
          </Link>
          <Link href="/about" style={{ color: "white" }}>About</Link>
          <Link href="/pricing" style={{ color: "white" }}>Pricing</Link>
          <Link href="/login" style={{ marginLeft: "auto", color: "white" }}>
            Sign in
          </Link>
        </nav>
      </header>
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        {children}
      </main>
      <footer style={{ padding: "2rem", background: "#f1f5f9", textAlign: "center" }}>
        © 2026 OurProduct
      </footer>
    </div>
  );
}
