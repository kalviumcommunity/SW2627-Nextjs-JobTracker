export default async function AnalyticsChart() {
  // Simulate a 3-second database query (slowest)
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return (
    <div
      style={{
        height: "300px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ fontSize: "1.25rem" }}>📊 Chart loaded (took 3 seconds)</p>
    </div>
  );
}
