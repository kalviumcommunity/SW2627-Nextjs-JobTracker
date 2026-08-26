# Backend API & Edge-Case Testing Log
**Project:** Apna.co Job Application Tracker  
**Module:** Backend API Testing & Security Verification  
**Date:** August 26, 2026  
**Environment:** Local Development (`http://localhost:3000`)  
**Database:** PostgreSQL (Supabase) with Prisma ORM  

---

## 1. Executive Summary

This document records the automated and manual verification results for the core application workflow, authorization boundaries, input validations, and atomic state machine transition rules implemented in the backend API routes.

All test suites were executed against live endpoints with fresh candidate and employer test sessions.

---

## 2. Test Execution Matrix

### A. Applications API (`/api/applications`)

| Test Case | Method & Endpoint | Auth State / Payload | Expected Status | Observed Status | Result |
|---|---|---|---|---|---|
| **Valid Application Submission** | `POST /api/applications` | Candidate Token, `{ jobId: "VALID_JOB_ID" }` | `201 Created` (`status: "pending"`) | `201 Created` | **PASS** |
| **Duplicate Application** | `POST /api/applications` | Same Candidate, Same `jobId` | `409 Conflict` (`{ error: "You have already applied to this job" }`) | `409 Conflict` | **PASS** |
| **Invalid / Non-Existent Job ID** | `POST /api/applications` | Candidate Token, `{ jobId: "non_existent_id" }` | `404 Not Found` (`{ error: "Job not found" }`) | `404 Not Found` | **PASS** |
| **Missing Authentication** | `POST /api/applications` | No Token / Unauthenticated | `401 Unauthorized` | `401 Unauthorized` | **PASS** |
| **Employer Applying (Role Mismatch)** | `POST /api/applications` | Employer Token | `403 Forbidden` (`{ error: "Only candidates are authorized to apply to jobs" }`) | `403 Forbidden` | **PASS** |
| **Candidate List Own Applications** | `GET /api/applications` | Candidate Token | `200 OK` (Scoped to candidate's applications) | `200 OK` | **PASS** |

---

### B. Batch Application Updates & State Machine (`/api/applications/batch`)

| Test Case | Method & Endpoint | Auth State / Payload | Expected Status | Observed Status | Result |
|---|---|---|---|---|---|
| **Valid Batch Update (Pending → Viewed)** | `PATCH /api/applications/batch` | Employer Token, `{ applicationIds: ["ID_1"], newStatus: "viewed" }` | `200 OK` (`count: 1, updatedStatus: "viewed"`) | `200 OK` | **PASS** |
| **Valid Batch Update (Viewed → Rejected)** | `PATCH /api/applications/batch` | Employer Token, `{ applicationIds: ["ID_1"], newStatus: "rejected" }` | `200 OK` (`count: 1, updatedStatus: "rejected"`) | `200 OK` | **PASS** |
| **Mixed-Status Atomic Batch Rejection** | `PATCH /api/applications/batch` | Employer Token, `{ applicationIds: [pendingId, rejectedId], newStatus: "viewed" }` | `400 Bad Request` (`{ error: "Invalid status transition: all selected applications must be eligible..." }`) | `400 Bad Request` | **PASS** |
| **Reverting Status to Pending** | `PATCH /api/applications/batch` | Employer Token, `{ applicationIds: ["ID_1"], newStatus: "pending" }` | `400 Bad Request` (`{ error: "Status must be one of: viewed, rejected" }`) | `400 Bad Request` | **PASS** |
| **Transition from Terminal Rejected State** | `PATCH /api/applications/batch` | Employer Token, `{ applicationIds: ["REJECTED_ID"], newStatus: "viewed" }` | `400 Bad Request` (`{ error: "Invalid status transition..." }`) | `400 Bad Request` | **PASS** |
| **Missing / Foreign Application IDs in Batch** | `PATCH /api/applications/batch` | Employer Token, `{ applicationIds: ["VALID_ID", "FOREIGN_ID"], newStatus: "viewed" }` | `404 Not Found` (`{ error: "One or more application IDs were not found..." }`) | `404 Not Found` | **PASS** |
| **Empty Application IDs Array** | `PATCH /api/applications/batch` | Employer Token, `{ applicationIds: [], newStatus: "viewed" }` | `400 Bad Request` (`{ error: "applicationIds must be a non-empty array..." }`) | `400 Bad Request` | **PASS** |
| **Invalid Application Status** | `PATCH /api/applications/batch` | Employer Token, `{ applicationIds: ["ID_1"], newStatus: "hired" }` | `400 Bad Request` (`{ error: "Status must be one of: viewed, rejected" }`) | `400 Bad Request` | **PASS** |
| **Candidate Attempting Batch Update** | `PATCH /api/applications/batch` | Candidate Token | `403 Forbidden` (`{ error: "Only employers are authorized..." }`) | `403 Forbidden` | **PASS** |
| **Foreign Employer Isolation** | `PATCH /api/applications/batch` | Different Employer Token | `404 Not Found` (`{ error: "No matching applications found belonging to your job postings" }`) | `404 Not Found` | **PASS** |

---

### C. Authentication & Session API (`/api/auth/*`)

| Test Case | Endpoint | Payload / Behavior | Observed Status | Result |
|---|---|---|---|---|
| **Candidate Registration** | `POST /api/auth/signup` | Valid details, `password >= 8 chars`, `role: "candidate"` | `201 Created` (Sets `accessToken`, `refreshToken` cookies) | **PASS** |
| **Employer Registration** | `POST /api/auth/signup` | Valid details, `password >= 8 chars`, `role: "employer"` | `201 Created` (Sets `accessToken`, `refreshToken` cookies) | **PASS** |
| **Short Password Rejection** | `POST /api/auth/signup` | `password: "123"` | `400 Bad Request` | **PASS** |
| **Duplicate Email Rejection** | `POST /api/auth/signup` | Existing email | `409 Conflict` | **PASS** |
| **Valid Login** | `POST /api/auth/login` | Correct email & password | `200 OK` (Sets HTTP-only dual cookies) | **PASS** |
| **Invalid Credentials** | `POST /api/auth/login` | Incorrect password | `401 Unauthorized` | **PASS** |
| **Token Refresh Rotation** | `POST /api/auth/refresh` | Valid `refreshToken` cookie | `200 OK` (Rotates token & updates hash in DB) | **PASS** |
| **Logout & Cookie Clearance** | `POST /api/auth/logout` | Session cleanup | `200 OK` (Clears cookies, deletes DB session) | **PASS** |

---

## 3. Project Validation & Build Logs

### 1. Prisma Schema Validation
```text
$ npx prisma validate
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
```

### 2. TypeScript Compilation Check
```text
$ npx tsc --noEmit
Finished TypeScript in 1.8s ...
0 errors
```

### 3. Production Build Compilation
```text
$ npm run build
▲ Next.js 16.3.1 (Turbopack)
✓ Creating an optimized production build
✓ Compiled successfully in 1.1s
✓ Generating static pages using 15 workers (25/25) in 645ms
Route (app)
├ ƒ /api/applications
├ ƒ /api/applications/batch
├ ƒ /api/auth/login
├ ƒ /api/auth/logout
├ ƒ /api/auth/refresh
├ ƒ /api/auth/signup
├ ƒ /api/health
├ ƒ /api/jobs
└ ... 25 routes compiled successfully
```

---

## 4. Standardized Error Response Structure

All backend error responses strictly conform to RFC-compatible single-key format:
```json
{
  "error": "Descriptive human-readable error message"
}
```
Client code reliably handles errors by reading `data.error`.
