import Link from "next/link";

export default function BlogIndexPage() {
  const posts = [
    { slug: "my-first-post", title: "My First Post" },
    { slug: "hello-world", title: "Hello World" },
    { slug: "nextjs-routing", title: "Understanding Next.js Routing" },
  ];

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Blog
      </h1>
      <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
