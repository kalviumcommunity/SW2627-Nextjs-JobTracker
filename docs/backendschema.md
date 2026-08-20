# Backend Schema
## Apna.co Job Application Tracker — Team 07, Squad 124

**Owner:** Mayank Sharma
**Status:** Draft — pending mentor approval
**Stack:** Prisma + PostgreSQL (Supabase)

---

## 1. Entity Overview

Four core models: `Candidate`, `Employer`, `Job`, `Application`.

```
Candidate ──< Application >── Job ──< Employer
```

- One Candidate → many Applications
- One Job → many Applications
- One Employer → many Jobs

---

## 2. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Candidate {
  id           String        @id @default(cuid())
  name         String
  email        String        @unique
  passwordHash String
  applications Application[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Employer {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  jobs         Job[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Job {
  id           String        @id @default(cuid())
  title        String
  description  String
  location     String?
  employerId   String
  employer     Employer      @relation(fields: [employerId], references: [id])
  applications Application[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Application {
  id          String   @id @default(cuid())
  status      String   @default("pending") // pending | viewed | rejected
  candidateId String
  candidate   Candidate @relation(fields: [candidateId], references: [id])
  jobId       String
  job         Job       @relation(fields: [jobId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([candidateId])
  @@index([jobId])
  @@index([status])
}
```

---

## 3. Field Notes

### Candidate
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Required |
| email | String | Unique, used for login |
| passwordHash | String | Never store plaintext — hash with bcrypt |
| applications | Relation | One-to-many with Application |

### Employer
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Company/employer display name |
| email | String | Unique, used for login |
| passwordHash | String | Same as Candidate — bcrypt hashed |
| jobs | Relation | One-to-many with Job |

### Job
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| title | String | Required |
| description | String | Required |
| location | String? | Optional for MVP |
| employerId | String | Foreign key → Employer |
| applications | Relation | One-to-many with Application |

### Application
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| status | String | Constrained at app layer to `pending`, `viewed`, `rejected` — defaults to `pending` |
| candidateId | String | Foreign key → Candidate |
| jobId | String | Foreign key → Job |
| createdAt | DateTime | Set on application submission |
| updatedAt | DateTime | Auto-updates on any change (e.g. status update) |

Indexes added on `candidateId`, `jobId`, and `status` — these are the fields queried most often (candidate dashboard, employer dashboard, batch filtering by status).

---

## 4. Status Field — Why String, Not Enum

Using a plain `String` with app-layer validation instead of a Prisma `enum` for `status`, to keep migrations simpler if the status set changes during the sprint (e.g. adding "shortlisted" later). Validation happens in the API route before writing to the DB. Can be converted to a proper Postgres enum later if the status list is confirmed stable.

---

## 5. Migration Plan

1. `npx prisma migrate dev --name init` — creates all four tables
2. Future migrations named descriptively per change, e.g. `--name add-job-location`, `--name add-application-indexes`
3. No manual SQL — all schema changes go through Prisma migrate to keep history consistent and reviewable in PRs

---

## 6. Open Questions

- Do we need a `Session` or `Token` table for auth, or is this handled via NextAuth's own tables (which would extend this schema)?
- Should `Job` have a `status` field too (open/closed), or is that out of scope for Sprint 1?
- Confirm with Vidit: does the frontend need any denormalized/aggregate fields (e.g. `applicationCount` on Job) or will that always be computed via query?
