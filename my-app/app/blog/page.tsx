import Link from "next/link";

const posts = [
  {
    slug: "my-first-post",
    title: "My First Post",
    description: "This is the content of my first post.",
  },
  {
    slug: "hello-world",
    title: "Hello World",
    description: "A classic introduction to blogging.",
  },
  {
    slug: "nextjs-routing",
    title: "Understanding Next.js Routing",
    description: "Dynamic segments make routing flexible and powerful.",
  },
];

export default function BlogIndexPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Blog</h1>
      <p>Welcome to the blog. Select an article to read:</p>
      <ul style={{ marginTop: "1.5rem", listStyle: "none", padding: 0 }}>
        {posts.map((post) => (
          <li
            key={post.slug}
            style={{
              marginBottom: "1rem",
              padding: "1rem",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          >
            <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p style={{ margin: 0, color: "#6b7280" }}>{post.description}</p>
          </li>
        ))}
      </ul>
      <nav style={{ marginTop: "2rem" }}>
        <Link href="/">? Go Home</Link>
      </nav>
    </main>
  );
}
