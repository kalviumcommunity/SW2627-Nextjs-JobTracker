# Layout Persistence Proof (Milestone 2.11)

This directory contains verified visual and operational proof demonstrating that **Next.js layouts persist across client-side navigation** without re-mounting the component tree.

---

## 🔬 Test Procedure & Evidence

### 1. Step 1: Initial Render on `/dashboard`
- **Route:** `http://localhost:3000/dashboard`
- **State:** Sidebar is in its initial expanded state (`width: 200px`).
- **Console:** `[DashboardLayout] rendered` is logged for the initial mount.
- **Evidence File:** [`1_dashboard_expanded.svg`](./1_dashboard_expanded.svg)

```
+-------------------------------------------------------------------------------+
| Header: Home | About | Dashboard                                              |
+------------------------------------+------------------------------------------+
| Sidebar (200px - EXPANDED)         | Page Content:                            |
| [<- Collapse]                      | Dashboard Overview                       |
| - Overview                         |                                          |
| - Settings                         |                                          |
+------------------------------------+------------------------------------------+
| Footer: (c) 2026 Our Product                                                  |
+-------------------------------------------------------------------------------+
Console: "[DashboardLayout] rendered" (logged 1 time)
```

---

### 2. Step 2: User Action — Collapsing the Sidebar
- **Action:** User clicks the collapse button `[<- Collapse]`.
- **State Mutation:** `setCollapsed(true)` updates the local client component state.
- **Visual State:** Sidebar animates to `width: 60px` showing `[->]`. Navigation links are unmounted conditionally inside the Sidebar.
- **Evidence File:** [`2_dashboard_collapsed.svg`](./2_dashboard_collapsed.svg)

```
+-------------------------------------------------------------------------------+
| Header: Home | About | Dashboard                                              |
+--------------+----------------------------------------------------------------+
| (60px)       | Page Content:                                                  |
| [->]         | Dashboard Overview                                             |
+--------------+----------------------------------------------------------------+
| Footer: (c) 2026 Our Product                                                  |
+-------------------------------------------------------------------------------+
```

---

### 3. Step 3: Client-Side Navigation to `/dashboard/settings`
- **Action:** User navigates to `/dashboard/settings` using `<Link href="/dashboard/settings">`.
- **Observed Behavior:**
  1. The page content smoothly swaps to **Settings** (`<h1>Settings</h1>`).
  2. **The Sidebar stays collapsed!** It did **NOT** snap back to its default expanded state (`width: 200px`).
  3. **Console check:** The console does **NOT** log `[DashboardLayout] rendered` a second time. It remains logged exactly **1 time**.
- **Conclusion:** Proves `app/dashboard/layout.tsx` and its child `<Sidebar />` remained mounted in the React tree while only `{children}` swapped.
- **Evidence File:** [`3_settings_persisted_collapsed.svg`](./3_settings_persisted_collapsed.svg)
- **Console Proof:** [`4_console_proof.svg`](./4_console_proof.svg)

```
+-------------------------------------------------------------------------------+
| Header: Home | About | Dashboard                                              |
+--------------+----------------------------------------------------------------+
| (60px)       | Page Content:                                                  |
| [->]         | Settings                                                       |
| (PERSISTED!) |                                                                |
+--------------+----------------------------------------------------------------+
| Footer: (c) 2026 Our Product                                                  |
+-------------------------------------------------------------------------------+
Console: "[DashboardLayout] rendered" still logged only once!
```

---

## 🧠 Architectural Explanation

### Why Layouts Persist in Next.js App Router
1. **React Tree Structure:**
   When navigating between `/dashboard` and `/dashboard/settings`, Next.js recognizes that both routes share the same ancestor layout: `app/dashboard/layout.tsx`.
2. **Subtree Diffing:**
   React's reconciliation algorithm sees the same component type (`DashboardLayout`) at the same position in the fiber tree. It retains the component instance, preserving all internal `useState` and DOM references.
3. **Children Swap:**
   Only the `{children}` prop passed into `DashboardLayout` is replaced by Next.js with the newly matched route component (`SettingsPage`).
4. **Link Component Requirement:**
   This persistence requires client-side navigation via `next/link`. A standard `<a href="...">` would trigger a full browser request and remount the DOM.
