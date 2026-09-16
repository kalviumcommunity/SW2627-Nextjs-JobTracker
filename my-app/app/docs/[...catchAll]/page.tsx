export default async function DocsPage({
  params,
}: {
  params: Promise<{ catchAll: string[] }>;
}) {
  const { catchAll = [] } = await params;
  const path = catchAll.join(" / ");
  const depth = catchAll.length;

  return (
    <section style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Documentation
      </h1>
      <p style={{ marginBottom: "0.5rem", color: "#374151" }}>
        <strong>Current path:</strong> {path}
      </p>
      <p style={{ marginBottom: "1rem", color: "#374151" }}>
        <strong>Depth:</strong> {depth} segments
      </p>
      <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", color: "#4b5563" }}>
        {catchAll.map((segment, index) => (
          <li key={index}>
            Segment {index + 1}: {segment}
          </li>
        ))}
      </ul>
    </section>
  );
}
