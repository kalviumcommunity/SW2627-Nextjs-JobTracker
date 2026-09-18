# Environment Variables (Local & Production)

This document outlines the environment variable configuration and validation rules implemented for **Milestone 2.16**.

---

## 1. Environment Variable Architecture

| Variable | Scope | Prefix | Description | Safe for Client? |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Server-only | None | PostgreSQL connection string | ❌ NO (Secret) |
| `API_SECRET_KEY` | Server-only | None | Third-party service API secret key | ❌ NO (Secret) |
| `JWT_SECRET` | Server-only | None | Token signing secret | ❌ NO (Secret) |
| `STRIPE_SECRET_KEY` | Server-only | None | Stripe payment processing secret | ❌ NO (Secret) |
| `NEXT_PUBLIC_API_URL` | Public / Client | `NEXT_PUBLIC_` | Public base URL for client API requests | ✅ YES |
| `NEXT_PUBLIC_APP_NAME` | Public / Client | `NEXT_PUBLIC_` | Public application name | ✅ YES |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public / Client | `NEXT_PUBLIC_` | Stripe checkout public key | ✅ YES |
| `NEXT_PUBLIC_ANALYTICS_ID` | Public / Client | `NEXT_PUBLIC_` | Analytics tracking measurement ID | ✅ YES |

---

## 2. File Organization
- **`.env.local`**: Holds local secrets for development on individual machines. Never committed (ignored via `.gitignore`).
- **`.env.example`**: Committed template containing all required keys with descriptive placeholder values for onboarding.
- **`lib/env.ts`**: Strict validation module using `requireEnv()` to throw clear exceptions on startup if any required secret is missing.
- **`components/Analytics.tsx`**: Client component safely consuming client-facing `NEXT_PUBLIC_ANALYTICS_ID`.
- **`app/api/test/route.ts`**: Verification route demonstrating server-side access to validated secrets without leaking credentials.
