# Implementation Plan
## Apna.co Job Application Tracker — Team 07, Squad 124

**Owner:** Mayank Sharma
**Status:** Draft — pending mentor approval

---

## 1. Scope for Sprint 1

### In scope (MVP)
- Candidate signup/login, browse jobs, apply, view application statuses
- Employer signup/login, post jobs, view applications, batch-update status
- Status flow: `pending → viewed → rejected` (no "accepted" state for MVP unless PRD confirms)
- Status visibility via polling (no true real-time push in Sprint 1 — documented trade-off)

### Out of scope (deferred)
- Email notifications on status change
- Resume file uploads
- Advanced job search/filtering
- True real-time push (WebSockets/SSE)

---

## 2. Backend Task Breakdown by Week

### Week 1 (this week) — Foundation
- [x] Repo, branch protection, PR template, CODEOWNERS
- [x] Supabase database provisioned
- [x] Prisma schema drafted and migrated
- [x] Health check route working
- [ ] Finalize TRD, resolve open questions with mentor
- [ ] Auth strategy decided (session-based vs NextAuth)

### Week 2 — Approvals + Auth Foundation
- [ ] Wait for PRD/System Design approval
- [ ] Build auth: signup/login for Candidate and Employer, password hashing (bcrypt)
- [ ] Session/token handling for protected routes
- [ ] Middleware to distinguish Candidate vs Employer routes

### Week 3 — Core Application Flow
- [ ] `POST /api/applications` — candidate submits application
- [ ] `GET /api/applications/:candidateId` — candidate's application list with statuses
- [ ] `GET /api/jobs` — list all jobs (public)
- [ ] `POST /api/jobs` — employer creates a job
- [ ] Connect with Vidit's frontend Apply flow — verify end-to-end

### Week 4 — Employer Flow + Batch Update
- [ ] `GET /api/applications/employer/:employerId` — all applications across employer's jobs
- [ ] `PATCH /api/applications/batch` — batch status update via `updateMany`
- [ ] Polling endpoint refinement for candidate dashboard auto-refresh
- [ ] Input validation + consistent error responses across all routes

### Week 5 — Hardening + Deploy
- [ ] Edge cases: empty states, invalid IDs, unauthorized access attempts
- [ ] GitHub Actions CI — run build/lint checks on every PR
- [ ] Deploy to GCP
- [ ] Final review of all API routes against PRD requirements

---

## 3. API Route Checklist

| Route | Method | Purpose | Target Week | Status |
|---|---|---|---|---|
| `/api/health` | GET | Connectivity check | 1 | Done |
| `/api/auth/signup` | POST | Candidate/Employer signup | 2 | Pending |
| `/api/auth/login` | POST | Candidate/Employer login | 2 | Pending |
| `/api/jobs` | GET | List jobs | 3 | Pending |
| `/api/jobs` | POST | Employer creates job | 3 | Pending |
| `/api/applications` | POST | Candidate applies | 3 | Pending |
| `/api/applications/:candidateId` | GET | Candidate's applications | 3 | Pending |
| `/api/applications/employer/:employerId` | GET | Employer's received applications | 4 | Pending |
| `/api/applications/batch` | PATCH | Batch status update | 4 | Pending |

---

## 4. Dependencies on Frontend (Vidit)

- API route names/shapes above must match what's used in his fetch calls — confirmed together before building each route
- Candidate dashboard polling interval (10–15s) needs frontend-side implementation to match backend expectations
- Batch update UI (multi-select) sends an array of application IDs — backend expects this exact shape: `{ applicationIds: string[], newStatus: string }`

---

## 5. Risks & Open Questions

- **Auth depth:** Simple session-based vs NextAuth — needs decision before Week 2 starts, blocks everything downstream
- **Real-time expectation:** Confirm with mentor whether polling satisfies the "real-time" requirement in the problem statement, or if SSE is expected
- **Employer job scope:** One job per employer vs multiple — affects Job model relations, should be confirmed with PRD owner (Vidit) this week

---

## 6. Definition of Done (per route)

A route is considered done when:
1. Implemented and tested locally against the shared Supabase DB
2. Has basic input validation
3. Returns consistent error shape on failure
4. PR opened with What/Why/Closes/How to Test filled in
5. Reviewed and approved by Vidit before merge
