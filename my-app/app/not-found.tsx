import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "3rem", margin: "1rem 0" }}>404</h1>
      <h2>Page Not Found</h2>
      <p>
        Sorry, the page you are looking for does not exist. It may have been moved,
        deleted, or the URL may be incorrect.
      </p>
      <nav
        style={{
          marginTop: "2rem",
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
        }}
      >
        <Link href="/">? Go Home</Link>
        <Link href="/blog">Browse Blog</Link>
      </nav>
    </main>
  );
}
