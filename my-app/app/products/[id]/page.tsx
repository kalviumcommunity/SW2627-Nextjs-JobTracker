import Link from "next/link";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const products: Record<string, { name: string; price: number }> = {
    "shoe-001": { name: "Running Shoes", price: 99.99 },
    "shirt-001": { name: "T-Shirt", price: 29.99 },
    "hat-001": { name: "Baseball Cap", price: 19.99 },
  };

  const product = products[id];

  if (!product) {
    return (
      <section style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc2626" }}>
          Product Not Found
        </h1>
        <p style={{ color: "#4b5563" }}>No product with ID: {id}</p>
      </section>
    );
  }

  return (
    <section style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        {product.name}
      </h1>
      <p style={{ color: "#374151", marginBottom: "0.5rem" }}>
        <strong>Product ID:</strong> {id}
      </p>
      <p style={{ color: "#374151", marginBottom: "1rem" }}>
        <strong>Price:</strong> ${product.price}
      </p>
      <Link href={`/products/${id}/reviews`} style={{ color: "#2563eb", textDecoration: "underline" }}>
        View Reviews →
      </Link>
    </section>
  );
}
