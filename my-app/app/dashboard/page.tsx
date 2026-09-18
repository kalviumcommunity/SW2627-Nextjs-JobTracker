import { Suspense } from "react";
import UserStats from "@/components/UserStats";
import AnalyticsChart from "@/components/AnalyticsChart";
import LiveFeed from "@/components/LiveFeed";

export default function DashboardPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "2rem" }}>Dashboard</h1>

      {/* User Stats - 2 second delay */}
      <Suspense
        fallback={
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: "100px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                  animation: "pulse 2s infinite",
                }}
              />
            ))}
          </div>
        }
      >
        <UserStats />
      </Suspense>

      {/* Analytics Chart - 3 second delay (slowest) */}
      <Suspense
        fallback={
          <div
            style={{
              height: "300px",
              backgroundColor: "#f0f0f0",
              borderRadius: "8px",
              marginBottom: "2rem",
              animation: "pulse 2s infinite",
            }}
          />
        }
      >
        <AnalyticsChart />
      </Suspense>

      {/* Live Feed - 1 second delay (fastest) */}
      <Suspense
        fallback={
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: "60px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                  animation: "pulse 2s infinite",
                }}
              />
            ))}
          </div>
        }
      >
        <LiveFeed />
      </Suspense>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}
