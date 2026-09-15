import { notFound } from "next/navigation";

const posts: Record<string, { title: string; content: string }> = {
  "my-first-post": {
    title: "My First Post",
    content: "This is the content of my first post.",
  },
  "hello-world": {
    title: "Hello World",
    content: "A classic introduction to blogging.",
  },
  "nextjs-routing": {
    title: "Understanding Next.js Routing",
    content: "Dynamic segments make routing flexible and powerful.",
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = posts[resolvedParams.slug];

  // Call notFound() if the post does not exist
  if (!post) {
    notFound();
  }

  return (
    <article style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
