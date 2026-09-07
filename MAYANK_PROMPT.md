# Track A: Candidate Core Profile & Onboarding Experience (Mayank)

> **Agent Instructions**: You are working on the repository `kalviumcommunity/SW2627-Nextjs-JobTracker`.
> Your mission is to implement the **Candidate Profile System**, **Candidate Onboarding Flow**, and **Live Profile Management**.
> (Note: AI resume parsing will be added in a future phase after core completion).
> Follow the ponytail lazy-senior-dev principles: minimal diffs, no unnecessary abstractions, edge-case safety, and verify with tests and linting.

---

## 🎯 Objectives

1. **Candidate Profile Database Additions**:
   - In `my-app/prisma/schema.prisma`, add profile fields to the `Candidate` model:
     ```prisma
     headline   String?   // e.g. "Full Stack Developer"
     skills     String?   // Comma-separated list of skills
     bio        String?   // Professional summary
     phone      String?   // Contact phone number
     location   String?   // Candidate city/country
     ```
   - Run `npx prisma db push` to sync with the database.

2. **Candidate Profile API (`/api/candidate/profile`)**:
   - `GET /api/candidate/profile`:
     - Requires candidate role authentication (`requireRole("candidate")`).
     - Returns candidate's profile data (`id`, `name`, `email`, `headline`, `skills`, `bio`, `phone`, `location`).
   - `PATCH /api/candidate/profile`:
     - Requires candidate role authentication (`requireRole("candidate")`).
     - Validates and updates candidate profile fields.

3. **Candidate Profile Page (`app/candidate/profile/page.tsx`)**:
   - Replace the static mock state ("Jane Doe", "candidate@example.com") with real data loaded on mount from `GET /api/candidate/profile`.
   - Wire up the form submission to `PATCH /api/candidate/profile` with success toast alert and error handling.
   - Include editable fields: Full Name, Headline, Contact Phone, Location, Bio, and Skills & Tech Stack.

4. **Candidate Onboarding Flow (`app/candidate/onboarding/page.tsx`)**:
   - Transform the current placeholder page into a clean, intuitive profile setup wizard:
     - Step 1: Professional Headline (e.g. "Frontend Engineer") & Phone Number.
     - Step 2: Key Skills & Tech Stack (interactive comma-separated tags or chips).
     - Step 3: Short Bio / About Me.
     - "Save & Explore Jobs" button that persists data via `PATCH /api/candidate/profile` and redirects to `/candidate/jobs`.

5. **Candidate Dashboard Polish (`app/candidate/page.tsx`)**:
   - Greet candidate with their real name dynamically.
   - If profile is incomplete (e.g. no skills set), display a helpful reminder banner with a link to `/candidate/onboarding` or `/candidate/profile`.

---

## 📁 Files to Create / Modify

- `my-app/prisma/schema.prisma` (Add Candidate profile fields & push)
- `my-app/app/api/candidate/profile/route.ts` (NEW: GET & PATCH candidate profile)
- `my-app/app/candidate/profile/page.tsx` (UPDATE: Connect to real API)
- `my-app/app/candidate/onboarding/page.tsx` (REWRITE: Candidate onboarding wizard)
- `my-app/app/candidate/page.tsx` (UPDATE: Personalize greeting & profile reminder)

---

## 🧪 Verification Checklist

1. `npx prisma db push` — Schema synced.
2. `npx eslint .` — Passes with 0 errors.
3. `npm run build` — All routes compile cleanly.
4. Test: Login as candidate ➔ Onboarding sets headline/skills ➔ Profile page updates and persists changes ➔ Dashboard reflects user data.
5. Create branch: `feat/candidate-profile-and-onboarding` ➔ Push and open PR.
