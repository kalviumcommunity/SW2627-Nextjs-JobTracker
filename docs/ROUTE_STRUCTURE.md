# Dynamic Routing Structure

This document explains the dynamic route patterns used in this project.

---

## Route Map

### 1. `[slug]` — Single Dynamic Segment (Blog Posts)

**File:** `app/blog/[slug]/page.tsx`

| Pattern | Why chosen | Params received | Example URL | Params value |
|---|---|---|---|---|
| `[slug]` | Each blog post has exactly one URL segment after `/blog/`. A single dynamic segment is the simplest and most precise match. | `{ slug: string }` | `/blog/my-first-post` | `{ slug: "my-first-post" }` |
| | | | `/blog/hello-world` | `{ slug: "hello-world" }` |
| | | | `/blog/nextjs-routing` | `{ slug: "nextjs-routing" }` |

**Why not catch-all?** Blog post URLs are always exactly one segment deep (`/blog/<post>`). Using `[...slug]` would also match `/blog/a/b/c`, which we don't want.

---

### 2. `[...catchAll]` — Catch-All Dynamic Segment (Documentation)

**File:** `app/docs/[...catchAll]/page.tsx`

| Pattern | Why chosen | Params received | Example URL | Params value |
|---|---|---|---|---|
| `[...catchAll]` | Documentation can be nested to any depth (`/docs/api/auth/tokens`). A catch-all segment captures all remaining URL segments as an array. | `{ catchAll: string[] }` | `/docs/getting-started` | `{ catchAll: ["getting-started"] }` |
| | | | `/docs/api/authentication` | `{ catchAll: ["api", "authentication"] }` |
| | | | `/docs/guides/advanced/setup/config` | `{ catchAll: ["guides", "advanced", "setup", "config"] }` |

**Why not single segment?** Docs paths are arbitrarily deep. A single `[slug]` would only match one level; catch-all handles any depth with one file.

---

### 3. `[id]` — Single Dynamic Segment (Products, mixed with static)

**Files:**
- `app/products/page.tsx` — Static index at `/products`
- `app/products/[id]/page.tsx` — Dynamic product detail
- `app/products/[id]/reviews/page.tsx` — Static nested under dynamic

| Pattern | Why chosen | Params received | Example URL | Params value |
|---|---|---|---|---|
| Static index | Products listing page needs a fixed URL. | None | `/products` | — |
| `[id]` | Each product has a unique ID forming one URL segment. | `{ id: string }` | `/products/shoe-001` | `{ id: "shoe-001" }` |
| `[id]` + static `/reviews` | Reviews are a fixed sub-page of each product, not another dynamic segment. | `{ id: string }` | `/products/shoe-001/reviews` | `{ id: "shoe-001" }` |

**Key insight:** Static routes (`page.tsx` at the products root) and dynamic routes (`[id]/page.tsx`) coexist without conflict. Next.js matches the static route first when visiting `/products`, and falls through to the dynamic segment for any `/products/<something>`.

---

## Summary Table

| Route | File Path | Dynamic Type | Params |
|---|---|---|---|
| `/blog` | `app/blog/page.tsx` | Static | — |
| `/blog/:slug` | `app/blog/[slug]/page.tsx` | Single `[slug]` | `{ slug: string }` |
| `/docs/*` | `app/docs/[...catchAll]/page.tsx` | Catch-all `[...catchAll]` | `{ catchAll: string[] }` |
| `/products` | `app/products/page.tsx` | Static | — |
| `/products/:id` | `app/products/[id]/page.tsx` | Single `[id]` | `{ id: string }` |
| `/products/:id/reviews` | `app/products/[id]/reviews/page.tsx` | Static under dynamic | `{ id: string }` |
