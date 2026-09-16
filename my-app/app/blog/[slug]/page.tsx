export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // In a real app, you would fetch the post from a database using params.slug
  const posts: Record<string, { title: string; content: string }> = {
    "my-first-post": {
      title: "My First Post",
      content: "This is the content of the first post.",
    },
    "hello-world": {
      title: "Hello World",
      content: "A classic introduction.",
    },
    "nextjs-routing": {
      title: "Understanding Next.js Routing",
      content: "Dynamic routes make building flexible apps easy.",
    },
  };

  const post = posts[slug];

  if (!post) {
    return (
      <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc2626" }}>
          Post not found: {slug}
        </h1>
      </main>
    );
  }

  return (
    <article style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        {post.title}
      </h1>
      <p style={{ color: "#4b5563", fontSize: "1.125rem", lineHeight: "1.75" }}>
        {post.content}
      </p>
    </article>
  );
}
