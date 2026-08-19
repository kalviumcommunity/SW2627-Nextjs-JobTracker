# Technical Requirements Document (TRD)
## Apna.co Job Application Tracker — Team 07, Squad 124

**Author:** Mayank Sharma
**Reviewer:** Vidit
**Status:** Draft — pending mentor approval
**Related:** PRD (owner: Vidit)

---

## 1. Purpose

This document defines the technical architecture, stack, data model, and API contract for the Job Application Tracker described in the PRD. It exists so that implementation decisions (Phase 4) are made against an agreed structure rather than improvised per-feature.

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend + API | Next.js (App Router) | Single codebase for UI and backend routes — no separate server needed |
| ORM | Prisma | Type-safe DB access, migrations, matches Sprint 1 Track A curriculum |
| Database | PostgreSQL | Relational fit for candidates/employers/applications with clear foreign keys |
| CI/CD | GitHub Actions | Auto-runs checks on every PR before merge |
| Deployment | GCP | Per Track A standard deployment target |

## 3. High-Level Architecture

```
Browser (Candidate / Employer)
        │
        ▼
Next.js Frontend (App Router pages)
        │
        ▼
Next.js API Routes (/app/api/*)
        │
        ▼
Prisma Client
        │
        ▼
PostgreSQL Database
```

Deployment flow: push to `main` → GitHub Actions runs build/test → deploy to GCP.

## 4. Core Entities (Data Model)

- **Candidate** — id, name, email, applications[]
- **Employer** — id, name, email, jobs[]
- **Job** — id, title, employerId, applications[]
- **Application** — id, status (`pending` | `viewed` | `rejected`), candidateId, jobId, createdAt, updatedAt

Relationships: One Employer → many Jobs. One Job → many Applications. One Candidate → many Applications.

## 5. Key Flows

### 5.1 Candidate applies to a job
1. Candidate submits application via frontend form
2. `POST /api/applications` creates a row with `status: pending`
3. Application appears immediately in candidate's dashboard (client re-fetches or optimistic UI update)

### 5.2 Real-time-ish status visibility
No native push mechanism in this stack (no WebSocket server, no Firestore-style listeners). For Sprint 1 scope, we use **polling**: candidate dashboard re-fetches application status every N seconds (e.g. 10–15s) via `GET /api/applications/:candidateId`. This is a scoped, documented trade-off — flagged for mentor awareness, upgradeable to WebSockets/SSE in a later sprint if time allows.

### 5.3 Employer batch status update
1. Employer selects multiple applications via checkboxes on the dashboard
2. Frontend sends array of application IDs + new status to `PATCH /api/applications/batch`
3. Backend runs a single `prisma.application.updateMany()` scoped to those IDs
4. Frontend re-fetches to reflect new state

## 6. API Surface (Draft)

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/applications` | Candidate submits new application |
| GET | `/api/applications/:candidateId` | Fetch a candidate's applications + statuses |
| GET | `/api/applications/employer/:employerId` | Fetch all applications for an employer's jobs |
| PATCH | `/api/applications/batch` | Batch-update status for multiple application IDs |
| GET | `/api/jobs` | List available jobs |
| POST | `/api/jobs` | Employer creates a job posting |

## 7. Non-Functional Requirements

- **Auth:** Role-based (Candidate vs Employer) — scope for Sprint 1 is basic session-based auth, not full OAuth
- **Validation:** All API routes validate input server-side before hitting Prisma
- **Error handling:** Consistent JSON error shape (`{ error: string }`) across all routes
- **Data integrity:** Status field constrained to the three known values at the application layer (Postgres enum optional, can add later)

## 8. Out of Scope for Sprint 1

- True real-time push (WebSockets/SSE) — polling only for now
- Email notifications to candidates on status change
- Advanced search/filtering on job listings
- Resume file uploads (unless PRD confirms this is required for MVP)

## 9. Open Questions (to resolve with mentor / during System Design)

- Do we need auth via NextAuth, or is a simpler session cookie sufficient for MVP?
- Is polling interval acceptable, or does the grading rubric expect true real-time (would push us toward Server-Sent Events)?
- Do employers manage multiple jobs, or is it one employer = one job posting for MVP simplicity?