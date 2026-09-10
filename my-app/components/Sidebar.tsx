"use client";

import { useState } from "react";
import Link from "next/link";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? "60px" : "200px",
        padding: "1rem",
        background: "#f3f4f6",
        transition: "width 0.2s",
        borderRight: "1px solid #e5e7eb",
        minHeight: "calc(100vh - 120px)",
      }}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="px-2 py-1 text-xs font-semibold rounded bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer"
      >
        {collapsed ? "→" : "← Collapse"}
      </button>
      {!collapsed && (
        <nav style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
            Overview
          </Link>
          <Link href="/dashboard/settings" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
            Settings
          </Link>
        </nav>
      )}
    </aside>
  );
}
