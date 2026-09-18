export default async function LiveFeed() {
  // Simulate a 1-second database query (fastest)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2>Live Feed</h2>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}
        >
          <p>Event {i} - Just happened</p>
        </div>
      ))}
    </div>
  );
}
