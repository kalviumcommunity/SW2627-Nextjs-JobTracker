# Implementation Plan
## Apna.co Job Application Tracker — Team 07, Squad 124

**Owner:** Mayank Sharma  
**Status:** In Progress (Backend Core APIs Completed & Verified)  

---

## 1. Scope for Sprint 1

### In scope (MVP)
- Candidate signup/login, browse jobs, apply, view application statuses
- Employer signup/login, post jobs, view applications, batch-update status
- Status flow: `pending → viewed → rejected`
- Status visibility via polling
- Edge-case hardening, duplicate prevention, and standardized error responses

### Out of scope (deferred)
- Email notifications on status change
- Resume file uploads
- Advanced job search/filtering
- True real-time push (WebSockets/SSE)

---

## 2. Backend Task Breakdown by Week

### Week 1 — Foundation
- [x] Repo, branch protection, PR template, CODEOWNERS
- [x] Supabase PostgreSQL database provisioned
- [x] Prisma schema drafted, migrated, and validated
- [x] Health check route working (`/api/health`)
- [x] Auth strategy decided: email/password with bcrypt, Access + Refresh Tokens in HTTP-only cookies

### Week 2 — Auth & Session Infrastructure
- [x] Build auth: signup/login for Candidate and Employer (`/api/auth/signup`, `/api/auth/login`)
- [x] Password hashing with bcrypt (10 rounds) & minimum 8-char validation
- [x] Dual-token JWT session management with SHA-256 refresh token rotation in database
- [x] Role-based access control (RBAC) protecting Candidate vs Employer endpoints
- [x] Logout & token revocation endpoint (`/api/auth/logout`)

### Week 3 — Core Application Flow
- [x] `POST /api/applications` — candidate submits application with instant `pending` status
- [x] `GET /api/applications` — candidate/employer scoped application retrieval with filters
- [x] `GET /api/jobs` — list all jobs with employer metadata (public endpoint)
- [x] `POST /api/jobs` — employer creates a job posting derived strictly from verified token
- [x] Duplicate application prevention (`@@unique([candidateId, jobId])` + 409 Conflict)

### Week 4 — Employer Flow + Batch Update & Hardening
- [x] `PATCH /api/applications/batch` — batch status update scoped to employer's jobs
- [x] Strict status enum validation (`pending`, `viewed`, `rejected`)
- [x] Non-empty array validation for batch requests
- [x] Input sanitization and standardized `{ error: "..." }` responses across all API endpoints

### Week 5 — Hardening & Final Verification
- [x] Edge cases: non-existent jobs (404), unauthenticated access (401), unauthorized roles (403), duplicate entries (409)
- [x] End-to-end local test suite execution and verification
- [x] Full build & TypeScript validation passes with 0 errors
- [ ] Connect with Vidit's frontend components for final end-to-end integration

---

## 3. API Route Checklist

| Route | Method | Purpose | Target Week | Status |
|---|---|---|---|---|
| `/api/health` | GET | Connectivity check | 1 | **Done** |
| `/api/auth/signup` | POST | Candidate/Employer registration | 2 | **Done** |
| `/api/auth/login` | POST | Candidate/Employer login | 2 | **Done** |
| `/api/auth/refresh` | POST | Token rotation and session renewal | 2 | **Done** |
| `/api/auth/logout` | POST | Clear cookies & revoke session | 2 | **Done** |
| `/api/jobs` | GET | List public jobs with applicant count | 3 | **Done** |
| `/api/jobs` | POST | Employer creates job | 3 | **Done** |
| `/api/applications` | POST | Candidate applies (creates `pending`) | 3 | **Done** |
| `/api/applications` | GET | Scoped application list (role-based) | 3 | **Done** |
| `/api/applications/batch` | PATCH | Employer batch status update | 4 | **Done** |

---

## 4. Dependencies on Frontend (Vidit)

- API route shapes verified and aligned:
  - Signup / Login: JSON payloads with HTTP-only cookie issuance.
  - Job creation: `{ title: string }`.
  - Application submission: `{ jobId: string }`.
  - Batch update: `{ applicationIds: string[], newStatus: "viewed" | "rejected" }`.
- Candidate dashboard polling interval (10–15s) configured for application status updates.

---

## 5. Authentication & Security Decisions (Resolved)

- **Authentication:** Custom email/password authentication using bcrypt (10 rounds) for hashing and dual JWT tokens (15-min `accessToken`, 7-day `refreshToken`) stored in HTTP-only `SameSite=Lax` cookies.
- **Session Tracking:** Refresh tokens are stored as SHA-256 hashes in the PostgreSQL `Session` table, enabling server-side revocation and token rotation.
- **Authorization:** Token payload derives user ID and role directly; client-supplied user IDs are strictly ignored.
- **Database Uniqueness:** `Application` table enforces `@@unique([candidateId, jobId])` to guarantee no duplicate submissions.

---

## 6. Definition of Done (per route)

A route is considered done when:
1. Implemented and tested locally against the shared Supabase PostgreSQL DB.
2. Has comprehensive input and edge-case validation.
3. Returns standardized `{ error: "..." }` shape on failure.
4. Passes `npx prisma validate`, `npx tsc --noEmit`, and `npm run build`.
5. PR opened and approved with clear verification evidence.
