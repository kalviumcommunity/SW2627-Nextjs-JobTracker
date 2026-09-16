import Link from "next/link";

export default async function ProductReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <section style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Reviews for {id}
      </h1>
      <p style={{ color: "#4b5563", marginBottom: "1rem" }}>
        No reviews yet. Be the first to review this product!
      </p>
      <Link href={`/products/${id}`} style={{ color: "#2563eb", textDecoration: "underline" }}>
        ← Back to product
      </Link>
    </section>
  );
}
