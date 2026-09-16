import Link from "next/link";

export default function ProductsIndexPage() {
  const products = [
    { id: "shoe-001", name: "Running Shoes" },
    { id: "shirt-001", name: "T-Shirt" },
    { id: "hat-001", name: "Baseball Cap" },
  ];

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Products
      </h1>
      <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/products/${p.id}`} style={{ color: "#2563eb", textDecoration: "underline" }}>
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
