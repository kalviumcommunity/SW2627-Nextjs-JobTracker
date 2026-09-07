# Track B: Application Submissions, Employer Workspace & Job Management (Vidit)

> **Agent Instructions**: You are working on the repository `kalviumcommunity/SW2627-Nextjs-JobTracker`.
> Your mission is to implement **Cover Letter & Resume Application Persistence**, **Rich Applicant Review**, **Live Employer Settings & Onboarding**, and **Job Lifecycle (Closing/Deleting Jobs)**.
> Follow the ponytail lazy-senior-dev principles: minimal diffs, no unnecessary abstractions, edge-case safety, and verify with tests and linting.

---

## 🎯 Objectives

1. **Application & Employer Schema Additions**:
   - In `my-app/prisma/schema.prisma`, add optional fields to `Application`:
     ```prisma
     coverLetter    String?
     resumeFileName String?
     ```
   - In `my-app/prisma/schema.prisma`, add optional fields to `Employer`:
     ```prisma
     companyName    String?
     website        String?
     bio            String?
     location       String?
     ```
   - Run `npx prisma db push` to sync with the database.

2. **Save Cover Letter & Resume in Applications (`POST /api/applications`)**:
   - Update `app/api/applications/route.ts` `POST` handler to accept `coverLetter?: string` and `resumeFileName?: string` from request body and persist them.

3. **Wire Up Application Submission Form (`app/candidate/jobs/[id]/apply/page.tsx`)**:
   - Update `handleSubmit`: Send `coverLetter` and `resume.name` (as `resumeFileName`) in the POST request body to `/api/applications`.
   - Maintain validation (ensuring cover letter and resume file are selected before submitting).

4. **Rich Applicant Review Page (`app/employer/applications/[id]/page.tsx`)**:
   - Enhance the applicant detail view to display:
     - The candidate's submitted **Cover Letter / Introduction** in a clean card.
     - The attached **Resume File Name** with a document badge icon.
     - Candidate details (name, email, submission timestamp).
     - Keep the existing status update workflow (`Viewed` / `Rejected`) working smoothly.

5. **Employer Settings API & Page (`app/api/employer/settings` & `app/employer/settings/page.tsx`)**:
   - Create `GET /api/employer/settings`: Authenticated endpoint returning employer's `name`, `email`, `companyName`, `website`, `bio`, and `location`.
   - Create `PATCH /api/employer/settings`: Authenticated endpoint allowing employer to update their company profile.
   - Update `app/employer/settings/page.tsx` to load real data on mount and save updates via API (removing the hardcoded "Acme Corporation" mock state).

6. **Employer Onboarding Wizard (`app/employer/onboarding/page.tsx`)**:
   - Transform the current placeholder into a step-by-step company profile setup:
     - Company Name, Website, Location, and Short Bio.
     - "Save & Continue to Post a Job" button that saves to `/api/employer/settings` and directs to `/employer/jobs/new`.

7. **Job Closing & Deletion (`DELETE /api/jobs/[id]` & `app/employer/jobs/page.tsx`)**:
   - In `app/api/jobs/[id]/route.ts`:
     - Add a `DELETE` handler requiring employer auth (`requireRole("employer")`).
     - Verify the authenticated employer owns the job before deleting.
   - In `app/employer/jobs/page.tsx`:
     - Add a "Delete / Close Listing" action button with confirmation dialog.
     - Refreshes the jobs table upon deletion.

---

## 📁 Files to Create / Modify

- `my-app/prisma/schema.prisma` (Add Application & Employer fields & push)
- `my-app/app/api/applications/route.ts` (UPDATE: Save coverLetter & resumeFileName)
- `my-app/app/api/employer/settings/route.ts` (NEW: GET & PATCH employer settings)
- `my-app/app/api/jobs/[id]/route.ts` (UPDATE: Add DELETE handler for job deletion)
- `my-app/app/candidate/jobs/[id]/apply/page.tsx` (UPDATE: Send coverLetter & resume name)
- `my-app/app/employer/applications/[id]/page.tsx` (UPDATE: Display cover letter & resume details)
- `my-app/app/employer/settings/page.tsx` (UPDATE: Real company settings integration)
- `my-app/app/employer/onboarding/page.tsx` (REWRITE: Employer onboarding wizard)
- `my-app/app/employer/jobs/page.tsx` (UPDATE: Add delete/close job button)

---

## 🧪 Verification Checklist

1. `npx prisma db push` — Schema synced.
2. `npx eslint .` — Passes with 0 errors.
3. `npm run build` — All routes compile cleanly.
4. Test: Candidate applies with cover letter ➔ Employer views cover letter in applicant details ➔ Employer updates company settings ➔ Employer can delete a job.
5. Create branch: `feat/employer-workspace-and-application-details` ➔ Push and open PR.
